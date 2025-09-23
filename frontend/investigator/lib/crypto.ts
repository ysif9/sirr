import nacl from "tweetnacl";
import { decodeBase64, encodeUTF8 } from "tweetnacl-util";

interface KeyEnvelope {
  sender_ephemeral_public_key: string; // base64
  wrapped_key_bundle: string; // base64
  // optional: if the API returns the nonce separately
  wrapped_key_nonce?: string; // base64 (optional)
}

/**
 * Decrypts a report body using the investigator's private key.
 *
 * @param privateKeyB64 The investigator's base64-encoded private key.
 * @param keyEnvelope The key envelope from the API containing the sender's public key and the wrapped bundle.
 * @param encryptedBodyB64 The base64-encoded encrypted report body.
 * @param nonceB64 The base64-encoded nonce for the report body.
 * @returns The decrypted report data as a JavaScript object, or null on failure.
 */
export const decryptReport = (
  privateKeyB64: string,
  keyEnvelope: KeyEnvelope,
  encryptedBodyB64: string,
  nonceB64: string
): object | null => {
  try {
    // 1. Decode all base64 inputs
    const privateKey = decodeBase64(privateKeyB64); // Uint8Array
    const senderPublicKey = decodeBase64(keyEnvelope.sender_ephemeral_public_key); // Uint8Array
    const wrappedKeyBundle = decodeBase64(keyEnvelope.wrapped_key_bundle); // Uint8Array
    const encryptedBody = decodeBase64(encryptedBodyB64); // Uint8Array
    const bodyNonce = decodeBase64(nonceB64); // Uint8Array

    // 2. Extract nonce + ciphertext for the wrapped bundle.
    //    Many systems either return the nonce separately or prefix nonce (24 bytes) to the ciphertext.
    const BOX_NONCE_LENGTH = 24; // nacl.box nonce length
    let wrappedNonce: Uint8Array;
    let wrappedCiphertext: Uint8Array;

    if (keyEnvelope.wrapped_key_nonce) {
      // API supplied the nonce separately
      wrappedNonce = decodeBase64(keyEnvelope.wrapped_key_nonce);
      wrappedCiphertext = wrappedKeyBundle;
    } else if (wrappedKeyBundle.length > BOX_NONCE_LENGTH) {
      // Assume nonce is prefixed to the wrapped bundle
      wrappedNonce = wrappedKeyBundle.slice(0, BOX_NONCE_LENGTH);
      wrappedCiphertext = wrappedKeyBundle.slice(BOX_NONCE_LENGTH);
    } else {
      throw new Error("Wrapped key bundle does not contain a discernible nonce. Provide wrapped_key_nonce or prefix a 24-byte nonce to wrapped_key_bundle.");
    }

    // 3. Decrypt the key bundle using the asymmetric box
    // nacl.box.open(ciphertext, nonce, publicKey, secretKey)
    const decryptedBundleBytes = nacl.box.open(
      wrappedCiphertext,
      wrappedNonce,
      senderPublicKey,
      privateKey
    );

    if (!decryptedBundleBytes) {
      throw new Error("Failed to decrypt the key bundle. Key mismatch or corruption.");
    }

    // 4. Parse the bundle to get the symmetric report key.
    // decryptedBundleBytes is a Uint8Array -> convert to string with encodeUTF8
    const bundleJsonStr = encodeUTF8(decryptedBundleBytes);
    const keyBundle = JSON.parse(bundleJsonStr);
    if (!keyBundle.report_key || typeof keyBundle.report_key !== "string") {
      throw new Error("Malformed key bundle: missing report_key.");
    }
    const reportKey = decodeBase64(keyBundle.report_key); // Uint8Array

    // 5. Decrypt the main report body using secretbox
    const decryptedBodyBytes = nacl.secretbox.open(encryptedBody, bodyNonce, reportKey);
    if (!decryptedBodyBytes) {
      throw new Error("Failed to decrypt the report body. Data may be corrupt or key/nonce is wrong.");
    }

    // 6. Return the final parsed object
    const bodyJsonStr = encodeUTF8(decryptedBodyBytes);
    return JSON.parse(bodyJsonStr);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};
