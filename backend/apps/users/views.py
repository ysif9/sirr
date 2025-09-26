from datetime import timedelta

import pyotp
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.cache import cache
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.http import Http404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.exceptions import (
    APIException,
    AuthenticationFailed,
    NotFound,
    PermissionDenied,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken, UntypedToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import OnboardingInvitation, User
from .serializers import (
    CaseworkerPublicKeySerializer,
    UserPublicKeyBundleSerializer,
    UserRegistrationSerializer,
)


class SystemInboxPublicKeyView(APIView):
    """
    A public, read-only endpoint to fetch the public key bundle for the
    system's designated admin inbox.
    """

    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        """Return the public key of the first active superuser."""
        admin_user = (
            User.objects.filter(is_superuser=True, is_active=True, public_key_bundle__isnull=False)
            .order_by("date_joined")
            .first()
        )

        if not admin_user:
            raise NotFound(detail="System inbox public key is not configured or available.")

        serializer = CaseworkerPublicKeySerializer(admin_user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CaseworkerPublicKeysView(generics.ListAPIView):
    """
    A public, read-only endpoint to fetch the public key bundles for all active,
    designated caseworkers.
    """

    permission_classes = [AllowAny]
    serializer_class = CaseworkerPublicKeySerializer
    queryset = User.objects.filter(
        is_caseworker=True, is_active=True, public_key_bundle__isnull=False
    ).only("id", "username", "public_key_bundle")


class UserPublicKeyBundleView(APIView):
    """
    An authenticated endpoint for a user to upload and update their public key bundle.
    """

    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        """
        Validate and update the authenticated user's public key bundle.
        """
        user = request.user
        serializer = UserPublicKeyBundleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user.public_key_bundle = serializer.validated_data["public_key_bundle"]
        user.save(update_fields=["public_key_bundle"])

        # Return the newly saved public key bundle for confirmation
        response_serializer = CaseworkerPublicKeySerializer(user)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class UserRegistrationView(generics.CreateAPIView):
    User = get_user_model()
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = []


# --- Onboarding Logic ---


class InvitationGone(APIException):
    status_code = 410
    default_detail = "This invitation has expired or has already been used."
    default_code = "invitation_gone"


def get_valid_onboarding_invitation(token: str) -> OnboardingInvitation:
    """
    Queries for a valid OnboardingInvitation matching the token.
    - Checks if it exists.
    - Checks if it has been used (used_at is NULL).
    - Checks if it has not expired (expires_at > now()).
    Raises Http404 if not found, or a custom 410 Gone exception if invalid.
    Returns the OnboardingInvitation object on success.
    """
    try:
        invitation = OnboardingInvitation.objects.select_related("user").get(token=token)
    except OnboardingInvitation.DoesNotExist:
        raise Http404("Invitation not found.")

    if invitation.used_at is not None or invitation.is_expired():
        raise InvitationGone()

    if invitation.user.is_active or invitation.user.onboarding_complete:
        raise InvitationGone()

    return invitation


class OnboardingTokenVerifyView(APIView):
    """
    Allows the frontend to verify if an invitation token is valid before
    displaying the password creation form.
    GET /api/onboarding/verify/{token}/
    """

    permission_classes = [AllowAny]

    def get(self, request, token, *args, **kwargs):
        """
        Verifies the token and returns non-sensitive user data if valid.
        """
        invitation = get_valid_onboarding_invitation(token)
        return Response(
            {
                "email": invitation.user.email,
                "username": invitation.user.username,
                "expires_at": invitation.expires_at,
            },
            status=status.HTTP_200_OK,
        )


class OnboardingCompleteStep1View(APIView):
    """
    Handles the first step of onboarding: setting a password, uploading a
    public key bundle, and generating a TOTP secret.
    POST /api/onboarding/complete-step-1/
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Accepts: { "token": "...", "password": "...", "public_key_bundle": {...} }
        """
        token = request.data.get("token")
        password = request.data.get("password")
        public_key_bundle = request.data.get("public_key_bundle")

        if not all([token, password, public_key_bundle]):
            return Response(
                {"error": "Fields 'token', 'password', and 'public_key_bundle' are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        invitation = get_valid_onboarding_invitation(token)
        user = invitation.user

        # 1. Validate Password
        try:
            validate_password(password, user)
        except DjangoValidationError as e:
            return Response({"password_errors": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        # Use the existing serializer to validate the key bundle
        pk_serializer = UserPublicKeyBundleSerializer(data={"public_key_bundle": public_key_bundle})
        pk_serializer.is_valid(raise_exception=True)

        # 2. Update User Account
        user.set_password(password)
        user.public_key_bundle = pk_serializer.validated_data["public_key_bundle"]

        # 3. Generate and Store TOTP Secret
        totp_secret = pyotp.random_base32()
        user.totp_secret = totp_secret
        user.save()

        # 4. Generate Provisioning URI
        totp = pyotp.TOTP(totp_secret)
        provisioning_uri = totp.provisioning_uri(name=user.email, issuer_name="SIRR")

        # 5. Response
        return Response(
            {
                "provisioning_uri": provisioning_uri,
                "totp_secret": totp_secret,
            },
            status=status.HTTP_200_OK,
        )


class OnboardingCompleteStep2View(APIView):
    """
    Finalizes onboarding: verifies TOTP, activates the account, and logs the user in.
    POST /api/onboarding/complete-step-2/
    """

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Accepts: { "token": "...", "totp_code": "123456" }
        """
        token = request.data.get("token")
        totp_code = request.data.get("totp_code")

        if not all([token, totp_code]):
            return Response(
                {"error": "Fields 'token' and 'totp_code' are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # 1. Verify token and retrieve user
            invitation = get_valid_onboarding_invitation(token)
            user = invitation.user

            if not user.totp_secret:
                return Response(
                    {"error": "TOTP secret not found. Please complete step 1 first."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 2. Validate TOTP Code
            totp = pyotp.TOTP(user.totp_secret)
            if not totp.verify(totp_code, valid_window=1):
                return Response(
                    {"error": "Incorrect TOTP code, please try again."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # 3. Activate account and mark onboarding as complete
            user.is_active = True
            user.onboarding_complete = True
            user.save(update_fields=["is_active", "onboarding_complete"])

            # 4. Mark invitation as used
            invitation.used_at = timezone.now()
            invitation.save(update_fields=["used_at"])

            # 5. Generate auth tokens to log the user in
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                status=status.HTTP_200_OK,
            )


# --- Login with 2FA Logic ---

class TFAToken(RefreshToken):
    """
    Custom token for the 2FA authentication step. This token is short-lived
    and has a specific 'token_type' claim to distinguish it from a standard
    refresh token.
    """
    token_type = "tfa"

# --- Brute-Force Mitigation Constants ---
LOGIN_FAILURE_LIMIT_PER_IP = 5
LOGIN_FAILURE_LIMIT_PER_USER = 5
LOGIN_FAILURE_WINDOW = 15 * 60  # 15 minutes in seconds
ACCOUNT_LOCKOUT_THRESHOLD = 10


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        """
        Handles username/password validation with integrated brute-force protection.
        - Rate limiting per IP and per user.
        - Account lockout after a high number of failures.
        - Uses generic error messages to prevent user enumeration.
        """
        generic_error = AuthenticationFailed("Invalid username or password.")
        request = self.context["request"]
        ip_address = request.META.get("REMOTE_ADDR")
        username = attrs.get(self.username_field)

        # 1. IP-based Rate Limiting Check
        ip_cache_key = f"login_attempts:ip:{ip_address}"
        ip_attempts = cache.get(ip_cache_key, 0)
        if ip_attempts >= LOGIN_FAILURE_LIMIT_PER_IP:
            raise generic_error

        user = User.objects.filter(username=username).first()

        if user:
            # 2. Account Lockout Check
            if user.is_locked:
                raise generic_error

            # 3. User-based Rate Limiting Check
            user_cache_key = f"login_attempts:user:{user.username}"
            user_attempts = cache.get(user_cache_key, 0)
            if user_attempts >= LOGIN_FAILURE_LIMIT_PER_USER:
                raise generic_error

        try:
            data = super().validate(attrs)

            # --- SUCCESSFUL LOGIN ---
            # self.user is now set by the parent class.
            if self.user.failed_login_attempts > 0 or self.user.is_locked:
                self.user.failed_login_attempts = 0
                self.user.is_locked = False
                self.user.save(update_fields=["failed_login_attempts", "is_locked"])

            # Clear rate-limiting counters on success
            cache.delete(ip_cache_key)
            if user:
                cache.delete(f"login_attempts:user:{user.username}")

            # Continue with 2FA logic if user is a caseworker
            if self.user.is_caseworker:
                tfa_token = TFAToken.for_user(self.user)
                tfa_token.set_exp(lifetime=timedelta(minutes=5))
                return {"tfa_required": True, "tfa_token": str(tfa_token)}

            return data

        except AuthenticationFailed:
            # --- FAILED LOGIN ---
            # Increment IP-based counter
            cache.set(ip_cache_key, ip_attempts + 1, LOGIN_FAILURE_WINDOW)

            if user:
                # Increment user-based counters if the user exists
                user_cache_key = f"login_attempts:user:{user.username}"
                user_attempts = cache.get(user_cache_key, 0)
                cache.set(user_cache_key, user_attempts + 1, LOGIN_FAILURE_WINDOW)

                user.failed_login_attempts += 1
                if user.failed_login_attempts >= ACCOUNT_LOCKOUT_THRESHOLD:
                    user.is_locked = True
                user.save(update_fields=["failed_login_attempts", "is_locked"])

            raise generic_error


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view that handles the 2FA check.
    If the user is a caseworker, it returns a temporary token instead of the final JWTs.
    """

    serializer_class = CustomTokenObtainPairSerializer


class VerifyTOTPView(APIView):
    """
    Validates the TOTP code provided by the user and, if correct,
    returns the final access and refresh tokens. This view expects the
    temporary TFA token in the request body, aligning with the onboarding flow.
    POST /api/token/verify-totp/
    """

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request, *args, **kwargs):
        tfa_token = request.data.get("tfa_token")
        totp_code = request.data.get("totp_code")
        generic_error = Response({"detail": "Incorrect TOTP code, please try again."}, status=status.HTTP_400_BAD_REQUEST)

        if not tfa_token:
            raise AuthenticationFailed("TFA token is missing from the request body.")
        if not totp_code:
            return Response({"detail": "TOTP code is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Decode the temporary TFA token
            untyped_token = UntypedToken(tfa_token)
            if untyped_token.get("token_type") != "tfa":
                raise InvalidToken("Not a valid TFA token.")

            user_id = untyped_token[api_settings.USER_ID_CLAIM]
            
            # --- TOTP Rate Limiting ---
            totp_cache_key = f"totp_attempts:user:{user_id}"
            totp_attempts = cache.get(totp_cache_key, 0)
            if totp_attempts >= 5: # Limit to 5 attempts per 5 minutes
                raise PermissionDenied("Too many failed TOTP attempts. Please try again later.")

            user = User.objects.get(id=user_id)

            # 2. Verify the TOTP code and prevent replay attacks
            if not user.totp_secret:
                return Response({"detail": "TOTP is not configured for this account."}, status=status.HTTP_400_BAD_REQUEST)

            totp = pyotp.TOTP(user.totp_secret)
            now = timezone.now()
            matched_counter = None

            # Check current and previous time windows to account for clock skew
            for time_step in [now, now - timedelta(seconds=30)]:
                if totp.verify(totp_code, for_time=time_step, valid_window=0):
                    matched_counter = totp.timecode(time_step)
                    break
            
            if matched_counter is None:
                cache.set(totp_cache_key, totp_attempts + 1, 5 * 60)
                return generic_error
            
            if user.last_totp_timestamp and matched_counter <= user.last_totp_timestamp:
                cache.set(totp_cache_key, totp_attempts + 1, 5 * 60)
                return generic_error # Replay attack detected

            # 3. On success, update timestamp and generate final tokens
            with transaction.atomic():
                user.last_totp_timestamp = matched_counter
                user.save(update_fields=["last_totp_timestamp"])

                cache.delete(totp_cache_key) # Clear failure counter

                refresh = RefreshToken.for_user(user)
                return Response(
                    {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                    status=status.HTTP_200_OK,
                )

        except (TokenError, User.DoesNotExist):
            raise AuthenticationFailed("Invalid or expired token.")
        except PermissionDenied as e:
            return Response({"detail": str(e)}, status=status.HTTP_429_TOO_MANY_REQUESTS)