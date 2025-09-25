import secrets
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from apps.users.models import OnboardingInvitation, User


@transaction.atomic
def create_investigator_invitation(
    *, username: str, email: str, first_name: str = "", last_name: str = ""
) -> str:
    """
    Creates an inactive investigator user and a secure, single-use onboarding invitation.

    This function is atomic, ensuring that both the user and their invitation
    are created successfully, or neither is.

    Args:
        username: The username for the new investigator.
        email: The email address for the new investigator.
        first_name: Optional first name.
        last_name: Optional last name.

    Returns:
        The full, single-use onboarding URL for the new investigator.

    Raises:
        ValueError: If a user with the given username or email already exists.
    """
    if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
        raise ValueError(f"A user with username '{username}' or email '{email}' already exists.")

    # 1. Create an inactive user with an unusable password.
    user = User.objects.create(
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

    # 2. Generate a secure, URL-safe token and an expiration date.
    token = secrets.token_urlsafe(32)
    expires_at = timezone.now() + timedelta(days=7)

    OnboardingInvitation.objects.create(
        user=user,
        token=token,
        expires_at=expires_at,
    )

    # 3. Construct the full onboarding URL.
    # TODO: This should ideally come from Django settings or site configuration.
    frontend_base_url = "http://localhost:3000"
    onboarding_url = f"{frontend_base_url}/onboard/{token}"

    return onboarding_url