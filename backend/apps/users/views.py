from rest_framework import generics, status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework import generics
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer

from .models import User
from .serializers import CaseworkerPublicKeySerializer, UserPublicKeyBundleSerializer


class SystemInboxPublicKeyView(APIView):
    """
    A public, read-only endpoint to fetch the public key bundle for the
    system's designated admin inbox.
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        """Return the public key of the first active superuser."""
        admin_user = User.objects.filter(
            is_superuser=True,
            is_active=True,
            public_key_bundle__isnull=False
        ).order_by('date_joined').first()

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
        is_caseworker=True,
        is_active=True,
        public_key_bundle__isnull=False
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
    
User = get_user_model()

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = []      