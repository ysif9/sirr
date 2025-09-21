import base64
import json

import nacl.secret
import nacl.utils
from nacl.public import Box, PrivateKey
from rest_framework import status
from rest_framework.test import APITestCase

from apps.reports.models import Report
from apps.users.models import User

# NOTE: This test simulates the "classical-only" key wrapping using X25519
# as described in the plan. The backend supports the hybrid scheme, but this
# is sufficient to test the API data flow.

class EncryptedReportSubmissionAPITest(APITestCase):
    def setUp(self):
        """
        Set up the test environment. This runs before each test.
        1. Generate a key pair for a system admin.
        2. Create the admin user object with their public key bundle.
        """
        # 1. Generate admin's long-term X25519 key pair
        self.admin_private_key = PrivateKey.generate()
        admin_public_key_bytes = self.admin_private_key.public_key.__bytes__()

        # For simplicity, we use a placeholder for the Kyber key.
        # The backend's validation requires it to be present and have the correct length.
        kyber_placeholder = base64.b64encode(b'\x00' * 1568).decode('utf-8')

        # 2. Create the admin user in the test database
        self.admin_user = User.objects.create_user(
            username="testadmin",
            is_superuser=True,
            is_active=True,
            public_key_bundle={
                "identity_key_x25519": base64.b64encode(admin_public_key_bytes).decode('utf-8'),
                "kem_key_kyber": kyber_placeholder,
            }
        )

    def test_successful_encrypted_report_submission(self):
        """
        Tests the entire E2EE submission flow from the perspective of a client
        submitting to the system inbox.
        """
        # ===================================================================
        # 1. SIMULATE CLIENT-SIDE ENCRYPTION
        # ===================================================================

        # Reporter client generates a fresh per-report symmetric key (K_report)
        k_report = nacl.utils.random(nacl.secret.SecretBox.KEY_SIZE)  # 256-bit key

        # Define the report body (plaintext)
        plaintext_report_body = {
            "title": "Confidential Report",
            "details": "This is a secret message that the server should not be able to read.",
            "location": "classified"
        }

        # Encrypt the report body with K_report using XChaCha20-Poly1305
        box = nacl.secret.SecretBox(k_report)
        nonce = nacl.utils.random(nacl.secret.SecretBox.NONCE_SIZE)  # 24-byte nonce
        encrypted_body_bytes = box.encrypt(json.dumps(plaintext_report_body).encode('utf-8'), nonce)

        # ===================================================================
        # 2. SIMULATE KEY WRAPPING (ENVELOPE ENCRYPTION)
        # ===================================================================

        # Reporter client generates an ephemeral key pair for this submission
        reporter_ephemeral_private_key = PrivateKey.generate()
        reporter_ephemeral_public_key_bytes = reporter_ephemeral_private_key.public_key.__bytes__()

        # Create a "Box" to perform authenticated encryption using ECDH (X25519)
        # This derives a shared secret to encrypt K_report.
        admin_public_key = self.admin_private_key.public_key
        key_wrapping_box = Box(reporter_ephemeral_private_key, admin_public_key)

        # Encrypt (wrap) K_report. A random nonce is generated automatically.
        wrapped_k_report_with_nonce = key_wrapping_box.encrypt(k_report)

        # The key envelope contains everything the admin needs to unwrap K_report
        key_envelope = {
            "reporter_ephemeral_public_key": base64.b64encode(reporter_ephemeral_public_key_bytes).decode('utf-8'),
            "wrapped_report_key": base64.b64encode(wrapped_k_report_with_nonce).decode('utf-8'),
            "scheme": "x25519-xchacha20poly1305"
        }

        # ===================================================================
        # 3. PREPARE AND SEND THE API PAYLOAD
        # ===================================================================

        api_payload = {
            "encrypted_body": base64.b64encode(encrypted_body_bytes).decode('utf-8'),
            "body_nonce": base64.b64encode(nonce).decode('utf-8'),
            "key_envelope": key_envelope,
            "associated_data": {
                "report_type": "CONFIDENTIAL_V1",
                "timestamp_bucket": "2025-Q4"
            }
        }

        # Make the API call to the report submission endpoint
        response = self.client.post("/api/reports/", api_payload, format='json')

        # ===================================================================
        # 4. ASSERT THE RESULTS
        # ===================================================================

        # Assert that the request was successful (HTTP 201 CREATED)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Assert that the response contains the reporter's access_key
        self.assertIn("access_key", response.data)
        self.assertIsNotNone(response.data["access_key"])

        # Assert that a Report object was actually created in the database
        self.assertEqual(Report.objects.count(), 1)

        # Fetch the created report from the database to verify its contents
        created_report = Report.objects.first()
        self.assertIsNotNone(created_report)
        assert created_report is not None  # for mypy

        # Verify that the encrypted data was stored correctly (after decoding from Base64)
        self.assertEqual(created_report.encrypted_body, encrypted_body_bytes)
        self.assertEqual(created_report.body_nonce, nonce)
        self.assertEqual(created_report.key_envelope, key_envelope)
        self.assertEqual(created_report.associated_data["report_type"], "CONFIDENTIAL_V1")
