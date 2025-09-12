from apps.users.models import User

from django.contrib import admin


# Register your models here.
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """User admin registration."""
    pass
