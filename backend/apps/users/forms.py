from django import forms
from django.core.exceptions import ValidationError

from apps.users.models import User


class InvestigatorInvitationForm(forms.Form):
    """
    A form for creating a new investigator invitation.

    Validates that the email is unique before attempting to create the user.
    """
    email = forms.EmailField(
        label="Email Address",
        required=True,
        help_text="A valid email address for the investigator.",
    )
    first_name = forms.CharField(label="First Name", max_length=150, required=False)
    last_name = forms.CharField(label="Last Name", max_length=150, required=False)

    def clean_email(self):
        """Ensure the email is not already in use."""
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with this email address already exists.")
        # Also check username, since it will be populated from email
        if User.objects.filter(username=email).exists():
            raise ValidationError("A user with this username (derived from email) already exists.")
        return email