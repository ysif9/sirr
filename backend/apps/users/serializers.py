from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import User


class CaseworkerPublicKeySerializer(serializers.ModelSerializer):
    """
    Serializer for publicly exposing a caseworker's ID and public key bundle.
    """

    class Meta:
        model = User
        fields = ["id", "public_key_bundle"]


class UserPublicKeyBundleSerializer(serializers.Serializer):
    """
    Serializer for validating and updating a user's public key bundle.
    """
    public_key_bundle = serializers.JSONField()

    def validate_public_key_bundle(self, value):
        """
        Validate the format and cryptographic soundness of the submitted key bundle.
        - Must be a dictionary.
        - More specific checks for keys, formats, etc. should be added here.
        """
        if not isinstance(value, dict):
            raise ValidationError("Public key bundle must be a JSON object.")
        if not value:
            raise ValidationError("Public key bundle cannot be empty.")

        # A real-world application would add extensive cryptographic validation,
        # checking key formats (e.g., base64 encoded), curve types, signatures, etc.
        # This basic check ensures the expected structure is present.
        required_keys = ["identity_key", "signed_prekey", "signature"]
        for key in required_keys:
            if key not in value:
                raise ValidationError(f"Public key bundle is missing required key: '{key}'.")

        return value