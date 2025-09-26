import secrets
from datetime import timedelta

from django.core.management.base import BaseCommand, CommandParser
from django.db import transaction
from django.utils import timezone

from apps.users.models import OnboardingInvitation, User


class Command(BaseCommand):
    """
    Creates an inactive investigator and generates a single-use onboarding
    invitation link for them to set up their account.
    """
    help = "Creates an inactive investigator and generates a single-use onboarding invitation link."

    def add_arguments(self, parser: CommandParser):
        """Adds command-line arguments for the new user's details."""
        parser.add_argument("--email", required=True, help="The email address for the new investigator.")
        parser.add_argument("--username", required=True, help="The username for the new investigator.")
        parser.add_argument("--first_name", help="Optional first name for the new investigator.", default="")
        parser.add_argument("--last_name", help="Optional last name for the new investigator.", default="")

    @transaction.atomic
    def handle(self, *args, **options):
        """
        Orchestrates the creation of the inactive user and the secure invitation link.
        """
        email = options["email"]
        username = options["username"]
        first_name = options["first_name"]
        last_name = options["last_name"]

        # 1. Validate that the user does not already exist
        if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
            self.stdout.write(self.style.ERROR(f"Error: A user with username '{username}' or email '{email}' already exists."))
            return

        # 2. Create Inactive User
        self.stdout.write(f"Creating inactive user for {username}...")
        user = User(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_active=False,
            is_caseworker=True,
            onboarding_complete=False,
        )
        user.set_unusable_password()
        user.save()

        # 3. Generate Invitation
        self.stdout.write("Generating secure onboarding invitation...")
        token = secrets.token_urlsafe(32)
        # Set invitation to expire in 7 days
        expires_at = timezone.now() + timedelta(days=7)

        OnboardingInvitation.objects.create(
            user=user,
            token=token,
            expires_at=expires_at,
        )

        # 4. Output Onboarding Link
        # This URL should match the frontend route for user onboarding.
        frontend_base_url = "http://localhost:3000"
        onboarding_url = f"{frontend_base_url}/onboard/{token}"

        self.stdout.write(self.style.SUCCESS(f"\nSuccessfully created investigator and invitation for {username}."))
        self.stdout.write("\nOnboarding Link:")
        self.stdout.write(self.style.SUCCESS(onboarding_url))
        self.stdout.write(self.style.WARNING("\nIMPORTANT: Securely deliver this single-use onboarding link to the investigator. DO NOT send it over unencrypted email or insecure channels."))