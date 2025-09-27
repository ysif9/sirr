from django import forms
from django.core.exceptions import ValidationError

from apps.users.models import User


class InvestigatorInvitationForm(forms.Form):
    """
    A form for creating a new investigator invitation.

    Validates that the username and email are unique before attempting to create the user.
    """
    username = forms.CharField(
        label="Username",
        max_length=150,
        required=True,
        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
    )
    email = forms.EmailField(
        label="Email Address",
        required=True,
        help_text="A valid email address for the investigator.",
    )
    first_name = forms.CharField(label="First Name", max_length=150, required=False)
    last_name = forms.CharField(label="Last Name", max_length=150, required=False)

    def clean_username(self):
        """Ensure the username is not already taken."""
        username = self.cleaned_data.get("username")
        if User.objects.filter(username=username).exists():
            raise ValidationError("A user with this username already exists.")
        return username

    def clean_email(self):
        """Ensure the email is not already in use."""
        email = self.cleaned_data.get("email")
        if User.objects.filter(email=email).exists():
            raise ValidationError("A user with this email address already exists.")
        return email