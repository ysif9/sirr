import base64
import json
import secrets

# PyNaCl is used to simulate the client-side cryptography
import nacl.secret
import nacl.utils
from nacl.public import PrivateKey, Box

from rest_framework import status
from rest_framework.test import APITestCase

from apps.users.models import User
from apps.reports.models import Report

# NOTE: This test simulates the "classical-only" key wrapping using X25519
# as described in the plan. The backend supports the hybrid scheme, but this
# is sufficient to test the API data flow.

class EncryptedReportSubmissionAPITest(APITestCase):
    def setUp(self):
        """
        Set up the test environment. This runs before each test.
        1. Generate a key pair for a caseworker.
        2. Create the caseworker user object with their public key bundle.
        """
        # 1. Generate caseworker's long-term X25519 key pair
        self.caseworker_private_key = PrivateKey.generate()
        caseworker_public_key_bytes = self.caseworker_private_key.public_key.__bytes__()

        # For simplicity, we use a placeholder for the Kyber key.
        # The backend's validation requires it to be present and have the correct length.
        kyber_placeholder = base64.b64encode(b'\x00' * 1568).decode('utf-8')
        
        # 2. Create the caseworker user in the test database
        self.caseworker = User.objects.create_user(
            username="testcaseworker",
            is_caseworker=True,
            is_active=True,
            public_key_bundle={
                "identity_key_x25519": base64.b64encode(caseworker_public_key_bytes).decode('utf-8'),
                "kem_key_kyber": kyber_placeholder,
            }
        )
    
    def test_successful_encrypted_report_submission(self):
        """
        Tests the entire E2EE submission flow from the perspective of a client.
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
        nonce = nacl.utils.random(nacl.secret.SecretBox.NONCE_SIZE) # 24-byte nonce
        encrypted_body_bytes = box.encrypt(json.dumps(plaintext_report_body).encode('utf-8'), nonce)
        
        # ===================================================================
        # 2. SIMULATE KEY WRAPPING (ENVELOPE ENCRYPTION)
        # ===================================================================
        
        # Reporter client generates an ephemeral key pair for this submission
        reporter_ephemeral_private_key = PrivateKey.generate()
        reporter_ephemeral_public_key_bytes = reporter_ephemeral_private_key.public_key.__bytes__()
        
        # Create a "Box" to perform authenticated encryption using ECDH (X25519)
        # This derives a shared secret to encrypt K_report.
        caseworker_public_key = self.caseworker_private_key.public_key
        key_wrapping_box = Box(reporter_ephemeral_private_key, caseworker_public_key)
        
        # Encrypt (wrap) K_report. A random nonce is generated automatically.
        wrapped_k_report_with_nonce = key_wrapping_box.encrypt(k_report)
        
        # The key envelope contains everything the caseworker needs to unwrap K_report
        key_envelope = {
            "reporter_ephemeral_public_key": base64.b64encode(reporter_ephemeral_public_key_bytes).decode('utf-8'),
            "wrapped_report_key": base64.b64encode(wrapped_k_report_with_nonce).decode('utf-8'),
            "scheme": "x25519-xchacha20poly1305"
        }
        
        # ===================================================================
        # 3. PREPARE AND SEND THE API PAYLOAD
        # ===================================================================
        
        api_payload = {
            "recipient_id": str(self.caseworker.id),
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
        
        # Verify that the encrypted data was stored correctly (after decoding from Base64)
        self.assertEqual(created_report.encrypted_body, encrypted_body_bytes)
        self.assertEqual(created_report.body_nonce, nonce)
        self.assertEqual(created_report.key_envelope, key_envelope)
        self.assertEqual(created_report.associated_data["report_type"], "CONFIDENTIAL_V1")
