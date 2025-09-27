from django.contrib import admin, messages
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.shortcuts import redirect
from django.template.response import TemplateResponse
from django.urls import path, reverse
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from apps.users.forms import InvestigatorInvitationForm
from apps.users.models import OnboardingInvitation, User
from apps.users.services import create_investigator_invitation


@admin.register(OnboardingInvitation)
class OnboardingInvitationAdmin(admin.ModelAdmin):
    """
    Admin interface for managing Onboarding Invitations.
    Provides a read-only view into the status of invitations.
    """
    list_display = ('user', 'is_used', 'is_expired', 'created_at', 'expires_at', 'used_at')
    list_filter = ('created_at', 'expires_at', 'used_at')
    search_fields = ('user__email',)
    readonly_fields = ('user', 'token', 'created_at', 'updated_at', 'expires_at', 'used_at')

    @admin.display(boolean=True, description="Used?")
    def is_used(self, obj):
        return obj.used_at is not None

    @admin.display(boolean=True, description="Expired?")
    def is_expired(self, obj):
        return obj.is_expired()

    def has_add_permission(self, request):
        # Invitations should only be created via the User admin interface
        return False

    def has_change_permission(self, request, obj=None):
        # Make invitations immutable from the admin
        return False


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Customized User admin to display caseworker status, public key bundle,
    and add a custom action to invite a new investigator.
    """
    list_display = (
        "email",
        "username",
        "first_name",
        "last_name",
        "is_staff",
        "is_caseworker",
        "is_superuser",
        "is_active",
        "is_locked",
    )
    list_filter = ("is_staff", "is_superuser", "is_active", "groups", "is_caseworker", "is_locked")
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("email",)

    readonly_fields = ('failed_login_attempts', 'last_login', 'date_joined')

    fieldsets = BaseUserAdmin.fieldsets + (  # type: ignore
        (_("Custom Properties"), {"fields": ("is_caseworker", "public_key_bundle")}),
        (_("Security Status"), {"fields": ("is_locked", "failed_login_attempts")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (_("Custom Properties"), {"fields": ("is_caseworker",)}),
    )

    def get_urls(self):
        """Add the custom URL for the invitation view."""
        urls = super().get_urls()
        custom_urls = [
            path(
                "invite-investigator/",
                self.admin_site.admin_view(self.invite_investigator_view),
                name="users_user_invite_investigator",
            )
        ]
        return custom_urls + urls

    def changelist_view(self, request, extra_context=None):
        """Override the changelist view to add a custom button."""
        extra_context = extra_context or {}
        # The URL for our custom view
        invite_url = reverse("admin:users_user_invite_investigator")
        # Use format_html to mark the string as safe for rendering
        extra_context["invite_button"] = format_html(
            '<a href="{}" class="button">Invite Investigator</a>', invite_url
        )
        return super().changelist_view(request, extra_context=extra_context)

    def invite_investigator_view(self, request):
        """
        Admin view to render and process the investigator invitation form.
        """
        if request.method == "POST":
            form = InvestigatorInvitationForm(request.POST)
            if form.is_valid():
                try:
                    onboarding_url = create_investigator_invitation(**form.cleaned_data)

                    # Success message with embedded HTML and JavaScript for a "Copy" button
                    success_message = format_html(
                        """
                        <strong>SUCCESS:</strong> Invitation created for {email}.
                        <div style="margin-top: 1rem;">
                            <strong>Onboarding Link:</strong>
                            <div style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem;">
                                <pre id="onboarding-link" style="margin: 0; padding: 0.5rem; border: 1px solid var(--hairline-color); background-color: var(--body-bg); white-space: pre-wrap; word-break: break-all;">{onboarding_url}</pre>
                                <button type="button" id="copy-link-button" class="button">Copy</button>
                            </div>
                            <p style="margin-top: 0.5rem;">
                                <em>Securely deliver this single-use link to the investigator.</em>
                            </p>
                        </div>
                        <script>
                            document.addEventListener('DOMContentLoaded', function() {{
                                const copyButton = document.getElementById('copy-link-button');
                                const linkElement = document.getElementById('onboarding-link');
                                if (copyButton && linkElement) {{
                                    copyButton.addEventListener('click', function() {{
                                        navigator.clipboard.writeText(linkElement.innerText).then(function() {{
                                            copyButton.textContent = 'Copied!';
                                            copyButton.disabled = true;
                                            setTimeout(function() {{
                                                copyButton.textContent = 'Copy';
                                                copyButton.disabled = false;
                                            }}, 2000);
                                        }}).catch(function(err) {{
                                            console.error('Failed to copy text: ', err);
                                            copyButton.textContent = 'Error';
                                        }});
                                    }});
                                }}
                            }});
                        </script>
                        """,
                        email=form.cleaned_data["email"],
                        onboarding_url=onboarding_url,
                    )
                    self.message_user(request, success_message, messages.SUCCESS)

                    return redirect("admin:users_user_changelist")
                except ValueError as e:
                    self.message_user(request, f"Error: {e}", messages.ERROR)
        else:
            form = InvestigatorInvitationForm()

        context = {
            **self.admin_site.each_context(request),
            "title": "Invite New Investigator",
            "form": form,
            "opts": self.model._meta,
        }
        return TemplateResponse(
            request, "admin/users/user/create_invitation.html", context
        )