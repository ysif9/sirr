import base64
import json

import nacl.secret
import nacl.utils
from django.test import override_settings
from nacl.public import Box, PrivateKey, PublicKey
from rest_framework import status
from rest_framework.test import APITestCase

from apps.reports.models import Report, ReportAssignment
from apps.users.models import User


class EncryptedReportSubmissionAPITest(APITestCase):
    # This test class is unchanged and should be passing.
    def setUp(self):
        self.admin_private_key = PrivateKey.generate()
        admin_public_key_bytes = self.admin_private_key.public_key.__bytes__()
        kyber_placeholder = base64.b64encode(b'\x00' * 1568).decode('utf-8')
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
        k_report = nacl.utils.random(nacl.secret.SecretBox.KEY_SIZE)
        plaintext_report_body = {"title": "Confidential Report"}
        box = nacl.secret.SecretBox(k_report)
        nonce = nacl.utils.random(nacl.secret.SecretBox.NONCE_SIZE)
        encrypted_body_bytes = box.encrypt(json.dumps(plaintext_report_body).encode('utf-8'), nonce)
        reporter_ephemeral_private_key = PrivateKey.generate()
        key_wrapping_box = Box(reporter_ephemeral_private_key, self.admin_private_key.public_key)
        wrapped_k_report_with_nonce = key_wrapping_box.encrypt(k_report)
        key_envelope = {
            "reporter_ephemeral_public_key": base64.b64encode(bytes(reporter_ephemeral_private_key.public_key)).decode('utf-8'),
            "wrapped_key": base64.b64encode(wrapped_k_report_with_nonce).decode('utf-8'),
            "scheme": "x25519-xchacha20poly1305"
        }
        api_payload = {
            "encrypted_body": base64.b64encode(encrypted_body_bytes).decode('utf-8'),
            "body_nonce": base64.b64encode(nonce).decode('utf-8'),
            "key_envelope": key_envelope
        }
        post_data = {"payload": json.dumps(api_payload)}
        response = self.client.post("/api/reports/", post_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Report.objects.count(), 1)


class InvestigatorAssignmentE2EFlowTest(APITestCase):
    """
    Test suite for the end-to-end workflow of assigning a report to an
    investigator and ensuring proper E2EE decryption and access control.
    """

    def setUp(self):
        """
        Set up a complete test environment for the assignment workflow.
        """
        kyber_placeholder = base64.b64encode(b'\x00' * 1568).decode('utf-8')
        # --- Create Admin User ---
        self.admin_private_key = PrivateKey.generate()
        admin_public_key_b64 = base64.b64encode(bytes(self.admin_private_key.public_key)).decode('utf-8')
        self.admin_private_key_b64 = base64.b64encode(bytes(self.admin_private_key)).decode('utf-8')
        self.admin_user = User.objects.create_superuser(
            username="test_admin", email="admin@test.com", password="password123",
            public_key_bundle={"identity_key_x25519": admin_public_key_b64, "kem_key_kyber": kyber_placeholder}
        )

        # --- Create Investigator Users ---
        self.investigator_private_key = PrivateKey.generate()
        investigator_public_key_b64 = base64.b64encode(bytes(self.investigator_private_key.public_key)).decode('utf-8')
        self.investigator_user = User.objects.create_user(
            username="test_investigator", email="investigator@test.com", password="password123",
            is_caseworker=True, is_staff=True,
            public_key_bundle={"identity_key_x25519": investigator_public_key_b64, "kem_key_kyber": kyber_placeholder}
        )
        self.other_investigator_user = User.objects.create_user(
            username="other_investigator", email="other@test.com", password="password123",
            is_caseworker=True, is_staff=True,
            public_key_bundle={"identity_key_x25519": base64.b64encode(bytes(PrivateKey.generate().public_key)).decode('utf-8'), "kem_key_kyber": kyber_placeholder}
        )

        # --- Encrypt Report and Store Originals for Verification ---
        self.k_report = nacl.utils.random(nacl.secret.SecretBox.KEY_SIZE)
        self.plaintext_report_body = {"title": "Initial Unassigned Report", "details": "This report will be assigned."}
        
        box = nacl.secret.SecretBox(self.k_report)
        
        # Store original nonce and ciphertext as instance variables to verify their integrity later
        self.original_nonce_bytes = nacl.utils.random(nacl.secret.SecretBox.NONCE_SIZE)
        self.original_encrypted_body_bytes = box.encrypt(json.dumps(self.plaintext_report_body).encode('utf-8'), self.original_nonce_bytes)
        
        reporter_ephemeral_pk = PrivateKey.generate()
        key_wrapping_box = Box(reporter_ephemeral_pk, self.admin_private_key.public_key)
        wrapped_k_report = key_wrapping_box.encrypt(self.k_report)

        key_envelope = {
            "reporter_ephemeral_public_key": base64.b64encode(bytes(reporter_ephemeral_pk.public_key)).decode('utf-8'),
            "wrapped_key": base64.b64encode(wrapped_k_report).decode('utf-8'),
            "scheme": "x25519-xchacha20poly1305"
        }

        report_payload = {
            "encrypted_body": base64.b64encode(self.original_encrypted_body_bytes).decode('utf-8'),
            "body_nonce": base64.b64encode(self.original_nonce_bytes).decode('utf-8'),
            "key_envelope": key_envelope
        }
        
        post_data = {"payload": json.dumps(report_payload)}
        response = self.client.post("/api/reports/", post_data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, f"Report submission failed in setUp: {response.content}")
        self.report = Report.objects.first()

    def test_full_assignment_and_decryption_workflow(self):
        """
        Validates the full end-to-end workflow as specified.
        """
        # --- Admin assigns the report ---
        self.client.force_authenticate(user=self.admin_user)
        assignment_url = f"/api/reports/{self.report.id}/assign/"
        assignment_payload = {"assignee_id": str(self.investigator_user.id)}
        with self.settings(ADMIN_PRIVATE_KEY=self.admin_private_key_b64):
            response = self.client.post(assignment_url, assignment_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # --- Investigator fetches the report ---
        self.client.force_authenticate(user=self.investigator_user)
        report_detail_url = f"/api/reports/{self.report.id}/"
        response = self.client.get(report_detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        report_data_from_api = response.data

        # --- Decrypt the key (this part was already working) ---
        assignment_key_envelope = report_data_from_api.get("key_envelope")
        admin_ephemeral_pk = PublicKey(base64.b64decode(assignment_key_envelope["sender_ephemeral_public_key"]))
        investigator_box = Box(self.investigator_private_key, admin_ephemeral_pk)
        decrypted_bundle_json = investigator_box.decrypt(base64.b64decode(assignment_key_envelope["wrapped_key_bundle"]))
        decrypted_bundle = json.loads(decrypted_bundle_json)
        decrypted_k_report = base64.b64decode(decrypted_bundle["report_key"])
        self.assertEqual(decrypted_k_report, self.k_report)

        # --- Decrypt the report body using data from the API response ---
        encrypted_body_from_api_bytes = base64.b64decode(report_data_from_api.get("encrypted_body"))
        body_nonce_from_api_bytes = base64.b64decode(report_data_from_api.get("body_nonce"))

        # *** CRUCIAL VERIFICATION STEP ***
        # This asserts that the data retrieved from the API is identical to the data originally created.
        # If this fails, the problem lies in the DB storage or serialization.
        self.assertEqual(body_nonce_from_api_bytes, self.original_nonce_bytes, "FATAL: Nonce from API does not match original nonce!")
        self.assertEqual(encrypted_body_from_api_bytes, self.original_encrypted_body_bytes, "FATAL: Encrypted body from API does not match original!")

        # Now, attempt decryption with the verified data
        report_body_box = nacl.secret.SecretBox(decrypted_k_report)
        decrypted_body_json = report_body_box.decrypt(encrypted_body_from_api_bytes, nonce=body_nonce_from_api_bytes)
        
        decrypted_body = json.loads(decrypted_body_json)
        self.assertEqual(decrypted_body, self.plaintext_report_body, "Decrypted report content must match original.")

        # --- Confirm other investigator has no access ---
        self.client.force_authenticate(user=self.other_investigator_user)
        response = self.client.get(report_detail_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)