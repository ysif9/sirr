import base64
import json
import logging
from binascii import Error as BinasciiError
from typing import Any

from django.conf import settings
from django.contrib import admin, messages
from django.utils.html import format_html
from nacl.exceptions import CryptoError
from nacl.public import Box, PrivateKey, PublicKey
from nacl.secret import SecretBox

from apps.reports.models import AIAnalysis, Report, ReportAssignment
from apps.reports.tasks import generate_analysis_task
from apps.users.models import User  # Import the User model

logger = logging.getLogger(__name__)


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
        reporter_ephem_pk = PublicKey(base64.b64decode(envelope["reporter_ephemeral_public_key"]))  # type: ignore
        # Handle both possible key names for backward compatibility or variations
        wrapped_report_key_b64 = envelope.get("wrapped_report_key")  # type: ignore
        wrapped_report_key = base64.b64decode(wrapped_report_key_b64)

        reporter_to_admin_box = Box(admin_private_key, reporter_ephem_pk)
        k_report = reporter_to_admin_box.decrypt(wrapped_report_key)

        # 4. Decrypt the main report body using the unwrapped symmetric key.
        secret_box = SecretBox(k_report)
        decrypted_json = secret_box.decrypt(report.encrypted_body, nonce=report.body_nonce)  # type: ignore

        return json.loads(decrypted_json)

    except (BinasciiError, KeyError, TypeError, ValueError) as e:
        return f"Error: Invalid cryptographic data format. The key envelope may be corrupt. Details: {e}"
    except CryptoError:
        return "Error: Decryption failed. This might be due to a key mismatch or data corruption."
    except Exception as e:
        return f"An unexpected error occurred during decryption: {e}"


class ReportAssignmentInline(admin.TabularInline):
    """
    Allows managing report assignments directly within the Report admin detail view.
    The key re-encryption logic is handled by ReportAdmin.save_formset.
    """
    model = ReportAssignment
    extra = 1  # Allow adding at least one new assignment
    autocomplete_fields = ['assignee']
    readonly_fields = ('assigned_at', 'last_access', 'has_key_envelope')
    fields = ('assignee', 'has_key_envelope', 'assigned_at', 'last_access')
    verbose_name = "Assignment"
    verbose_name_plural = "Assignments"

    @admin.display(description="Key Re-Encrypted", boolean=True)
    def has_key_envelope(self, obj):
        """Show a checkmark if the key envelope was successfully generated."""
        return obj.key_envelope is not None

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        """
        Filter the 'assignee' dropdown to only show active caseworkers
        who have a public key, preventing assignment errors.
        """
        if db_field.name == "assignee":
            kwargs["queryset"] = User.objects.filter(
                is_caseworker=True,
                is_active=True,
                public_key_bundle__isnull=False
            ).order_by('username')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)


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
        qs = super().get_queryset(request).prefetch_related('assignments__assignee', 'attachments')
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

        if not hasattr(obj, "analysis"):
            logger.info(f"Running analysis task for report {obj.id}")
            generate_analysis_task.delay(decrypted_data, str(obj.id))

        if isinstance(decrypted_data, dict):
            # Pretty-print the JSON inside a <pre> tag for readability
            pretty_json = json.dumps(decrypted_data, indent=2)
            return format_html('<pre style="white-space: pre-wrap; word-break: break-all;">{}</pre>', pretty_json)
        else:
            # Display the error message in a distinct, user-friendly format
            return format_html('<p style="color: red; font-weight: bold;">{}</p>', decrypted_data)

    def save_formset(self, request, form, formset, change):
        """
        This is the core of the admin-based assignment. It intercepts new assignments
        and performs the key re-encryption before they are saved.
        """
        report = formset.instance
        # Get instances that are being added via the inline form
        newly_added_assignments = [
            f.instance for f in formset.forms if f.instance.pk is None and not f.cleaned_data.get('DELETE', False)
        ]

        if not newly_added_assignments:
            super().save_formset(request, form, formset, change)
            return

        try:
            admin_b64_key = getattr(settings, "ADMIN_PRIVATE_KEY", None)
            if not admin_b64_key:
                raise ValueError("ADMIN_PRIVATE_KEY is not configured on the server.")
            admin_private_key = PrivateKey(base64.b64decode(admin_b64_key))
        except Exception as e:
            messages.error(request, f"Server Error: Could not load admin key. Assignments not saved. Details: {e}")
            formset.new_objects = []  # Prevent saving invalid assignments
            super().save_formset(request, form, formset, change)
            return

        successful_assignments = []
        failed_assignments = []

        for assignment in newly_added_assignments:
            try:
                assignee = assignment.assignee
                # STEP B: Decrypt all original keys
                report_envelope = report.key_envelope
                if not report_envelope:
                    raise ValueError("Report is missing its key envelope.")

                reporter_ephem_pk_b64 = report_envelope["reporter_ephemeral_public_key"]
                wrapped_key_b64 = report_envelope.get("wrapped_report_key") or report_envelope.get("wrapped_key")

                reporter_ephem_pk = PublicKey(base64.b64decode(reporter_ephem_pk_b64))
                reporter_to_admin_box = Box(admin_private_key, reporter_ephem_pk)
                k_report = reporter_to_admin_box.decrypt(base64.b64decode(wrapped_key_b64))

                key_bundle: dict[str, Any] = {
                    "report_key": base64.b64encode(k_report).decode("utf-8"),
                    "attachment_keys": {},
                }

                for attachment in report.attachments.all():
                    if not attachment.key_envelope:
                        continue
                    wrapped_attach_key_b64 = attachment.key_envelope.get("wrapped_key")
                    if not wrapped_attach_key_b64:
                        continue
                    k_attach = reporter_to_admin_box.decrypt(base64.b64decode(wrapped_attach_key_b64))
                    key_bundle["attachment_keys"][str(attachment.id)] = base64.b64encode(k_attach).decode("utf-8")

                if not key_bundle["attachment_keys"]:
                    del key_bundle["attachment_keys"]

                # STEP C: Re-encrypt the bundle for the caseworker
                caseworker_pk_b64 = assignee.public_key_bundle["identity_key_x25519"]
                caseworker_pk = PublicKey(base64.b64decode(caseworker_pk_b64))
                admin_ephemeral_private_key = PrivateKey.generate()
                admin_to_caseworker_box = Box(admin_ephemeral_private_key, caseworker_pk)

                key_bundle_json = json.dumps(key_bundle).encode("utf-8")
                encrypted_bundle = admin_to_caseworker_box.encrypt(key_bundle_json)

                new_key_envelope = {
                    "sender_ephemeral_public_key": base64.b64encode(
                        bytes(admin_ephemeral_private_key.public_key)).decode("utf-8"),
                    "wrapped_key_bundle": base64.b64encode(encrypted_bundle).decode("utf-8"),
                    "scheme": "x25519-xchacha20poly1305",
                }

                # STEP D: Store the result on the assignment instance
                assignment.key_envelope = new_key_envelope
                successful_assignments.append(assignment)
                messages.success(request, f"Report successfully assigned to caseworker '{assignee}'.")

            except (KeyError, ValueError, BinasciiError, CryptoError) as e:
                messages.error(request, f"CRYPTOGRAPHY ERROR assigning to '{assignee}': {e}. Assignment failed.")
                failed_assignments.append(assignment)

        # Filter the formset's new objects to only include successful ones
        formset.new_objects = [a for a in newly_added_assignments if a not in failed_assignments]

        # Finally, call the parent method to save the formset
        super().save_formset(request, form, formset, change)


@admin.register(ReportAssignment)
class ReportAssignmentAdmin(admin.ModelAdmin):
    """
    A standalone admin view for Report Assignments, useful for auditing.
    """
    list_display = ('report', 'assignee', 'assigned_at', 'last_access')
    search_fields = ('report__id__startswith', 'assignee__username')
    autocomplete_fields = ['report', 'assignee']


@admin.register(AIAnalysis)
class AIAnalysisAdmin(admin.ModelAdmin):
    pass
