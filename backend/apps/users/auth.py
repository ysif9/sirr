"""Custom authentication classes for the users app. (should add the totp to this later)"""

from django.conf import settings
from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """
    An authentication plugin that authenticates requests through a JSON web
    token provided in a cookie.
    """

    def authenticate(self, request):
        """
        Extracts the JWT from a cookie and validates it.

        Overrides the default behavior to look for the token in an HttpOnly
        cookie instead of the 'Authorization' header. If the header is present,
        it will be used as a fallback for compatibility.
        """
        cookie_name = getattr(settings, "SIMPLE_JWT", {}).get(
            "AUTH_COOKIE", "access_token"
        )
        header = self.get_header(request)

        if header is None:
            raw_token = request.COOKIES.get(cookie_name)
        else:
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token