import base64
import json

from apps.users.models import User
from django.core.management.base import BaseCommand, CommandParser
from django.db import transaction
from nacl.public import PrivateKey


class Command(BaseCommand):
    """
    A custom Django management command to automate the creation of a superuser
    with an associated cryptographic key pair.
    """
    help = "Creates a new superuser, generates a key pair, associates the public key, and outputs the private key."

    def add_arguments(self, parser: CommandParser):
        """Adds command-line arguments for username, email, and password."""
        parser.add_argument("--username", required=True, help="The username for the new superuser.")
        parser.add_argument("--email", required=True, help="The email address for the new superuser.")
        parser.add_argument("--password", required=True, help="The password for the new superuser.")

    @transaction.atomic
    def handle(self, *args, **options):
        """The main logic of the command."""
        username = options["username"]
        email = options["email"]
        password = options["password"]

        # --- 1. Check if user already exists ---
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f"Error: User '{username}' already exists."))
            return

        # --- 2. Generate new cryptographic key pair ---
        self.stdout.write("Generating a new X25519 key pair...")
        private_key = PrivateKey.generate()
        public_key = private_key.public_key

        b64_private_key = base64.b64encode(bytes(private_key)).decode('utf-8')
        b64_public_key = base64.b64encode(bytes(public_key)).decode('utf-8')

        # Create a placeholder for the Kyber KEM key to match the expected model structure
        kyber_placeholder = base64.b64encode(b'\x00' * 1568).decode('utf-8')

        public_key_bundle = {
            "identity_key_x25519": b64_public_key,
            "kem_key_kyber": kyber_placeholder,
        }

        # --- 3. Create the superuser with the public key bundle ---
        self.stdout.write(f"Creating superuser '{username}'...")
        try:
            User.objects.create_superuser(
                username=username,
                email=email,
                password=password,
                public_key_bundle=public_key_bundle,
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"An error occurred while creating the superuser: {e}"))
            return

        # --- 4. Provide clear output for the developer ---
        self.stdout.write(self.style.SUCCESS("-" * 70))
        self.stdout.write(self.style.SUCCESS(f"Superuser '{username}' created successfully!"))
        self.stdout.write(self.style.SUCCESS("-" * 70))

        self.stdout.write("\n" + self.style.WARNING("IMPORTANT: Copy this private key to your .env file:"))
        self.stdout.write(f"\nADMIN_PRIVATE_KEY={b64_private_key}\n")

        self.stdout.write("\n" + self.style.NOTICE("The following public key bundle was saved to the user's profile:"))
        self.stdout.write(json.dumps(public_key_bundle, indent=2))
        self.stdout.write(self.style.SUCCESS("-" * 70))
