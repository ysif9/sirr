import base64
import json
from binascii import Error as BinasciiError

from django.conf import settings
from django.contrib import admin
from django.utils.html import format_html
from nacl.exceptions import CryptoError
from nacl.public import Box, PrivateKey, PublicKey
from nacl.secret import SecretBox

from apps.reports.models import Report, ReportAssignment


def decrypt_report_body(report: Report) -> dict | str:
    """
    Decrypts the body of a report using the ADMIN_PRIVATE_KEY from settings.

    This function is designed to be called from the admin interface and includes
    robust error handling to provide clear feedback if decryption fails.

    Args:
        report: The Report instance to decrypt.

    Returns:
        A dictionary containing the decrypted report data or a string
        with an error message.
    """
    try:
        # 1. Load the server's admin private key from Django settings.
        admin_b64_key = getattr(settings, "ADMIN_PRIVATE_KEY", None)
        if not admin_b64_key:
            return "Error: ADMIN_PRIVATE_KEY is not configured on the server."
        admin_private_key = PrivateKey(base64.b64decode(admin_b64_key))

        # 2. Validate that the report has all necessary cryptographic components.
        if not all([report.key_envelope, report.encrypted_body, report.body_nonce]):
            return "Error: Report is missing necessary cryptographic data (envelope, body, or nonce)."

        # 3. Unwrap the symmetric report key (K_report) using the asymmetric key envelope.
        envelope = report.key_envelope
        reporter_ephem_pk = PublicKey(base64.b64decode(envelope["reporter_ephemeral_public_key"]))
        wrapped_report_key = base64.b64decode(envelope["wrapped_report_key"])

        reporter_to_admin_box = Box(admin_private_key, reporter_ephem_pk)
        k_report = reporter_to_admin_box.decrypt(wrapped_report_key)

        # 4. Decrypt the main report body using the unwrapped symmetric key.
        secret_box = SecretBox(k_report)
        decrypted_json = secret_box.decrypt(report.encrypted_body, nonce=report.body_nonce)

        return json.loads(decrypted_json)

    except (BinasciiError, KeyError, TypeError) as e:
        return f"Error: Invalid cryptographic data format. The key envelope may be corrupt. Details: {e}"
    except CryptoError:
        return "Error: Decryption failed. This might be due to a key mismatch or data corruption."
    except Exception as e:
        return f"An unexpected error occurred during decryption: {e}"


class ReportAssignmentInline(admin.TabularInline):
    """
    Allows managing report assignments directly within the Report admin detail view.
    """
    model = ReportAssignment
    extra = 0
    autocomplete_fields = ['assignee']
    readonly_fields = ('assigned_at', 'last_access')
    fields = ('assignee', 'assigned_at', 'last_access')
    verbose_name = "Assignment"
    verbose_name_plural = "Assignments"


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """
    Custom admin view for the Report model, providing a secure and informative interface.
    """
    list_display = (
        'id',
        'get_report_title',
        'status',
        'priority',
        'created_at',
    )
    list_filter = ('status', 'priority', 'created_at')
    search_fields = ('id__startswith',)
    ordering = ('-created_at',)

    inlines = [ReportAssignmentInline]

    fieldsets = (
        ('Report Metadata', {
            'fields': ('id', 'status', 'priority', 'template', 'created_at', 'updated_at')
        }),
        ('Decrypted Content', {
            'fields': ('display_decrypted_content',),
            'description': 'The encrypted report content is decrypted on-demand for viewing below.'
        }),
        ('Cryptographic Details (Read-Only)', {
            'classes': ('collapse',),
            'fields': ('access_key', 'associated_data', 'key_envelope'),
        }),
    )

    readonly_fields = (
        'id', 'template', 'created_at', 'updated_at', 'access_key',
        'associated_data', 'key_envelope', 'display_decrypted_content'
    )

    def get_queryset(self, request):
        """
        Customizes the queryset based on user role:
        - Superusers can view all reports.
        - Staff/caseworkers can only view reports explicitly assigned to them.
        """
        qs = super().get_queryset(request).prefetch_related('assignments__assignee')
        if request.user.is_superuser:
            return qs
        # For caseworkers, only show reports they are assigned to
        return qs.filter(assignments__assignee=request.user).distinct()

    @admin.display(description="Report Type/Title")
    def get_report_title(self, obj: Report) -> str:
        """
        Safely extracts the report title from the unencrypted associated_data field.
        Assumes the frontend provides a 'formTitle' key.
        """
        if isinstance(obj.associated_data, dict):
            return obj.associated_data.get('formTitle', 'Unknown Type')
        return 'N/A'

    @admin.display(description="Decrypted Report Body")
    def display_decrypted_content(self, obj: Report):
        """
        Calls the decryption utility and formats the output for the admin panel.
        Displays pretty-printed JSON on success or a formatted error on failure.
        """
        decrypted_data = decrypt_report_body(obj)

        if isinstance(decrypted_data, dict):
            # Pretty-print the JSON inside a <pre> tag for readability
            pretty_json = json.dumps(decrypted_data, indent=2)
            return format_html('<pre style="white-space: pre-wrap; word-break: break-all;">{}</pre>', pretty_json)
        else:
            # Display the error message in a distinct, user-friendly format
            return format_html('<p style="color: red; font-weight: bold;">{}</p>', decrypted_data)


@admin.register(ReportAssignment)
class ReportAssignmentAdmin(admin.ModelAdmin):
    """
    A standalone admin view for Report Assignments, useful for auditing.
    """
    list_display = ('report', 'assignee', 'assigned_at', 'last_access')
    search_fields = ('report__id__startswith', 'assignee__username')
    autocomplete_fields = ['report', 'assignee']