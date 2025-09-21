import nacl from "tweetnacl";
import { AdminPublicKey } from "./api";

// Helper to convert Uint8Array to Base64 string
const uint8ArrayToBase64 = (array: Uint8Array): string => {
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
};

// Helper to convert Base64 string to Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Define the shape of the payload for the report submission API.
// The recipient_id is no longer needed as all reports go to the admin inbox.
export interface AdminEncryptedPayload {
  encrypted_body: string; // Base64
  body_nonce: string; // Base64
  key_envelope: {
    reporter_ephemeral_public_key: string; // Base64
    wrapped_report_key: string; // Base64
    scheme: string;
  };
  associated_data: Record<string, any>;
}

/**
 * Encrypts the report data for the system admin according to the end-to-end encryption spec.
 * @param {object} reportData The plaintext report data (form values).
 * @param {AdminPublicKey} adminKey The system admin public key object.
 * @returns {Omit<AdminEncryptedPayload, "associated_data">} The encrypted parts of the payload.
 */
export function encryptReportPayload(
  reportData: object,
  adminKey: AdminPublicKey
): Omit<AdminEncryptedPayload, "associated_data"> {
  // 1. Decode admin's public key from Base64
  const adminPublicKey = base64ToUint8Array(adminKey.public_key_bundle.identity_key_x25519);

  // 2. Generate a per-report symmetric key (K_report)
  const reportKey = nacl.randomBytes(nacl.secretbox.keyLength);

  // 3. Encrypt the report body with K_report using XChaCha20-Poly1305
  const reportBodyString = JSON.stringify(reportData);
  const reportBodyBytes = new TextEncoder().encode(reportBodyString);
  const bodyNonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const encryptedBody = nacl.secretbox(reportBodyBytes, bodyNonce, reportKey);

  // 4. Generate reporter's ephemeral key pair for key wrapping (X25519)
  const reporterEphemeralKeyPair = nacl.box.keyPair();

  // 5. Wrap K_report using the admin's public key and our ephemeral private key
  const keyWrapNonce = nacl.randomBytes(nacl.box.nonceLength);
  const encryptedReportKey = nacl.box(
    reportKey,
    keyWrapNonce,
    adminPublicKey,
    reporterEphemeralKeyPair.secretKey
  );

  // Prepend the nonce to the encrypted key, as expected by some decryption libraries/implementations
  const wrappedReportKeyWithNonce = new Uint8Array(keyWrapNonce.length + encryptedReportKey.length);
  wrappedReportKeyWithNonce.set(keyWrapNonce);
  wrappedReportKeyWithNonce.set(encryptedReportKey, keyWrapNonce.length);

  // 6. Construct the payload with Base64 encoded values, omitting recipient_id
  const payload = {
    encrypted_body: uint8ArrayToBase64(encryptedBody),
    body_nonce: uint8ArrayToBase64(bodyNonce),
    key_envelope: {
      reporter_ephemeral_public_key: uint8ArrayToBase64(reporterEphemeralKeyPair.publicKey),
      wrapped_report_key: uint8ArrayToBase64(wrappedReportKeyWithNonce),
      scheme: "x25519-xchacha20poly1305",
    },
  };

  return payload;
}