import base64
from binascii import Error as BinasciiError

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from .models import User

# Define expected byte lengths for cryptographic keys
X25519_PUBLIC_KEY_BYTES = 32
KYBER1024_PUBLIC_KEY_BYTES = 1568


class CaseworkerPublicKeySerializer(serializers.ModelSerializer):
    """
    Serializer for publicly exposing a caseworker's ID, username, and public key bundle.
    """

    class Meta:
        model = User
        fields = ["id", "username", "public_key_bundle"]


class UserPublicKeyBundleSerializer(serializers.Serializer):
    """
    Serializer for validating and updating a user's public key bundle.

    Performs strict validation on the bundle's structure, format (Base64),
    and the byte length of the decoded cryptographic keys.
    """
    public_key_bundle = serializers.JSONField()

    def validate_public_key_bundle(self, value):
        """
        Validate the format and cryptographic soundness of the submitted key bundle.
        - Structure: Must be a dict with 'identity_key_x25519' and 'kem_key_kyber'.
        - Format: Key values must be valid Base64 strings.
        - Length: Decoded keys must have the correct byte length.
        """
        if not isinstance(value, dict):
            raise ValidationError("Public key bundle must be a JSON object.")

        expected_keys = {
            "identity_key_x25519": X25519_PUBLIC_KEY_BYTES,
            "kem_key_kyber": KYBER1024_PUBLIC_KEY_BYTES,
        }

        for key, expected_length in expected_keys.items():
            # Validate presence
            if key not in value:
                raise ValidationError(f"Public key bundle is missing required key: '{key}'.")

            key_value = value[key]

            if not isinstance(key_value, str):
                raise ValidationError(f"Key '{key}' must be a Base64-encoded string.")

            # Validate Base64 format and byte length
            try:
                decoded_key = base64.b64decode(key_value, validate=True)
                if len(decoded_key) != expected_length:
                    raise ValidationError(
                        f"Decoded key '{key}' has an incorrect length. "
                        f"Expected {expected_length} bytes, but got {len(decoded_key)}."
                    )
            except BinasciiError:
                raise ValidationError(f"Key '{key}' is not a valid Base64-encoded string.")

        return value

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={"input_type": "password"}
    )
    password2 = serializers.CharField(write_only=True, required=True,style={"input_type": "password"})

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "password2", "is_caseworker"]
        extra_kwargs = {"is_caseworker": {"default": True}}

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")
        user = User(
            username=validated_data["username"],
            email=validated_data.get("email"),
            is_caseworker=validated_data.get("is_caseworker", False),
        )
        user.set_password(validated_data["password"])  # runs validators + hashing
        user.save()
        return user    