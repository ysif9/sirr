import nacl from "tweetnacl";
import { decodeBase64, encodeUTF8 } from "tweetnacl-util";

interface KeyEnvelope {
  sender_ephemeral_public_key: string; // base64
  wrapped_key_bundle: string; // base64
  wrapped_key_nonce?: string; // base64 (optional)
}

interface DecryptedBundle {
  reportBody: object;
  attachmentKeys: { [attachmentId: string]: string }; // Storing keys as base64 strings
}

/**
 * Decrypts the key bundle from the API to retrieve the report body's content
 * and the symmetric keys for all associated attachments.
 *
 * @param privateKeyB64 The investigator's base64-encoded private key.
 * @param keyEnvelope The key envelope from the API.
 * @param encryptedBodyB64 The base64-encoded encrypted report body.
 * @param nonceB64 The base64-encoded nonce for the report body.
 * @returns An object containing the decrypted report body and a map of attachment keys, or null on failure.
 */
export const decryptReport = (
  privateKeyB64: string,
  keyEnvelope: KeyEnvelope,
  encryptedBodyB64: string,
  nonceB64: string
): DecryptedBundle | null => {
  try {
    const privateKey = decodeBase64(privateKeyB64);
    const senderPublicKey = decodeBase64(keyEnvelope.sender_ephemeral_public_key);
    const wrappedKeyBundle = decodeBase64(keyEnvelope.wrapped_key_bundle);
    const encryptedBody = decodeBase64(encryptedBodyB64);
    const bodyNonce = decodeBase64(nonceB64);

    const BOX_NONCE_LENGTH = 24;
    let wrappedNonce: Uint8Array;
    let wrappedCiphertext: Uint8Array;

    if (keyEnvelope.wrapped_key_nonce) {
      wrappedNonce = decodeBase64(keyEnvelope.wrapped_key_nonce);
      wrappedCiphertext = wrappedKeyBundle;
    } else if (wrappedKeyBundle.length > BOX_NONCE_LENGTH) {
      wrappedNonce = wrappedKeyBundle.slice(0, BOX_NONCE_LENGTH);
      wrappedCiphertext = wrappedKeyBundle.slice(BOX_NONCE_LENGTH);
    } else {
      throw new Error("Wrapped key bundle does not contain a discernible nonce.");
    }

    const decryptedBundleBytes = nacl.box.open(
      wrappedCiphertext,
      wrappedNonce,
      senderPublicKey,
      privateKey
    );

    if (!decryptedBundleBytes) {
      throw new Error("Failed to decrypt the key bundle. Key mismatch or corruption.");
    }

    const bundleJsonStr = encodeUTF8(decryptedBundleBytes);
    const keyBundle = JSON.parse(bundleJsonStr);
    if (!keyBundle.report_key || typeof keyBundle.report_key !== "string") {
      throw new Error("Malformed key bundle: missing report_key.");
    }
    const reportKey = decodeBase64(keyBundle.report_key);

    const decryptedBodyBytes = nacl.secretbox.open(encryptedBody, bodyNonce, reportKey);
    if (!decryptedBodyBytes) {
      throw new Error("Failed to decrypt the report body. Data may be corrupt or key/nonce is wrong.");
    }

    const bodyJsonStr = encodeUTF8(decryptedBodyBytes);
    return {
      reportBody: JSON.parse(bodyJsonStr),
      attachmentKeys: keyBundle.attachment_keys || {},
    };
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};

/**
 * Fetches an encrypted attachment, decrypts it, and returns it as a Blob.
 *
 * @param encryptedFileUrl The URL to the encrypted file content.
 * @param keyB64 The base64-encoded symmetric key for this attachment.
 * @param nonceB64 The base64-encoded nonce for this attachment.
 * @returns A Blob of the decrypted file, or null on failure.
 */
export const decryptAttachment = async (
  encryptedFileUrl: string,
  keyB64: string,
  nonceB64: string
): Promise<Blob | null> => {
  try {
    const key = decodeBase64(keyB64);
    const nonce = decodeBase64(nonceB64);

    // Include credentials to ensure authentication cookies are sent with the request
    const response = await fetch(encryptedFileUrl, {
      credentials: 'include',
      cache: 'no-cache' // Prevent caching issues that might cause 403 errors on subsequent requests
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch encrypted file: ${response.statusText}`);
    }
    const encryptedFileBytes = new Uint8Array(await response.arrayBuffer());

    const decryptedBytes = nacl.secretbox.open(encryptedFileBytes, nonce, key);

    if (!decryptedBytes) {
      throw new Error(
        "Attachment decryption failed. Check key, nonce, and ciphertext integrity."
      );
    }

    // Ensure we pass a BlobPart that TS accepts
    const uint8 = new Uint8Array(decryptedBytes);

    return new Blob([uint8]); // <- now type safe
  } catch (error) {
    console.error("Attachment decryption process error:", error);
    return null;
  }
};
