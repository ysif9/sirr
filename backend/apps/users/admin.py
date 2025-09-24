from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from apps.users.models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Customized User admin to display caseworker status and public key bundle,
    and enable searching, which is crucial for the report assignment interface.
    """
    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "is_caseworker",
        "is_superuser",
    )
    list_filter = ("is_staff", "is_superuser", "is_active", "groups", "is_caseworker")
    search_fields = ("username", "first_name", "last_name", "email")
    ordering = ("username",)

    # Add custom fields to the fieldsets for the user detail view
    fieldsets = BaseUserAdmin.fieldsets + (  # type: ignore
        (_("Custom Properties"), {"fields": ("is_caseworker", "public_key_bundle")}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (_("Custom Properties"), {"fields": ("is_caseworker",)}),
    )
