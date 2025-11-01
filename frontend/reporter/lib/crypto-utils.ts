// FILE: lib/crypto-utils.ts
import nacl from "tweetnacl"
import { AdminPublicKey } from "./api"
import { uuidv4 } from "./uuid"

// Helper to convert a Base64 string to a Uint8Array
export const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

// Helper to convert a Uint8Array to a Base64 string
export const uint8ArrayToBase64 = (array: Uint8Array): string => {
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
}

// Helper to read a File object into a Uint8Array, ready for encryption
const fileToUint8Array = (file: File): Promise<Uint8Array> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

// Defines the structure for a single attachment's metadata within the payload.
export interface EncryptedAttachmentMetadata {
  id: string
  nonce: string
  key_envelope: object
  checksum?: string
}

// Defines the structure of the main JSON payload sent to the backend.
export interface EncryptedJsonPayload {
  encrypted_body: string
  body_nonce: string
  key_envelope: object
  attachments: EncryptedAttachmentMetadata[]
  associated_data: Record<string, any>
}

// Defines the structure of an encrypted attachment ready for FormData
export interface EncryptedAttachment {
  id: string
  blob: Blob
  filename: string
}

interface FormIdentifier {
  reportTypeKey: string
  categoryKey: string
  formKey: string
}

/**
 * Orchestrates the end-to-end encryption of a report and its attachments.
 * @param reportData The plaintext report data object.
 * @param attachments A FileList or array of Files of attachments.
 * @param adminKey The admin's public key object from the API.
 * @param formIdentifier The keys identifying the form template.
 * @param formTitle The display title of the form.
 * @returns An object containing the encrypted JSON payload and an array of encrypted attachment blobs.
 */
export async function encryptReportAndAttachments(
  reportData: object,
  attachments: File[] | FileList | null,
  adminKey: AdminPublicKey,
  formIdentifier: FormIdentifier,
  formTitle: string
): Promise<{
  encryptedPayload: EncryptedJsonPayload
  encryptedAttachments: EncryptedAttachment[]
}> {
  const adminPublicKey = base64ToUint8Array(adminKey.public_key_bundle.identity_key_x25519)
  const reporterEphemeralKeyPair = nacl.box.keyPair()

  // 1. Encrypt the Report Body
  const reportKey = nacl.randomBytes(nacl.secretbox.keyLength)
  const bodyNonce = nacl.randomBytes(nacl.secretbox.nonceLength)
  const reportBodyBytes = new TextEncoder().encode(JSON.stringify(reportData))
  const encryptedBody = nacl.secretbox(reportBodyBytes, bodyNonce, reportKey)

  // 2. Wrap the Report Key (K_report)
  const keyWrapNonce = nacl.randomBytes(nacl.box.nonceLength)
  const encryptedReportKey = nacl.box(reportKey, keyWrapNonce, adminPublicKey, reporterEphemeralKeyPair.secretKey)
  const wrappedReportKeyWithNonce = new Uint8Array(keyWrapNonce.length + encryptedReportKey.length)
  wrappedReportKeyWithNonce.set(keyWrapNonce)
  wrappedReportKeyWithNonce.set(encryptedReportKey, keyWrapNonce.length)

  const encryptedAttachments: EncryptedAttachment[] = []
  const attachmentsMetadata: EncryptedAttachmentMetadata[] = []

  // 3. Encrypt Each Attachment
  if (attachments) {
    for (const file of Array.from(attachments)) {
      // Add a guard to ensure we are only processing valid File objects
      if (!(file instanceof File)) {
        console.warn("Skipping an invalid item in attachments array:", file);
        continue;
      }

      const attachmentId = uuidv4()
      const attachmentKey = nacl.randomBytes(nacl.secretbox.keyLength)
      const attachmentNonce = nacl.randomBytes(nacl.secretbox.nonceLength)
      const fileBytes = await fileToUint8Array(file)

      const encryptedFileBytes = nacl.secretbox(fileBytes, attachmentNonce, attachmentKey)

      // FIX: The `Blob` constructor is strict about the buffer type.
      // Explicitly creating a `new Uint8Array()` from the result of `nacl.secretbox`
      // ensures TypeScript provides a compatible type that satisfies the `BlobPart` requirement.
      const encryptedFileBlob = new Blob([new Uint8Array(encryptedFileBytes)], { type: file.type })

      encryptedAttachments.push({ id: attachmentId, blob: encryptedFileBlob, filename: file.name })

      // Wrap the Attachment Key (K_attach_i)
      const attachKeyWrapNonce = nacl.randomBytes(nacl.box.nonceLength)
      const encryptedAttachmentKey = nacl.box(
        attachmentKey,
        attachKeyWrapNonce,
        adminPublicKey,
        reporterEphemeralKeyPair.secretKey
      )
      const wrappedAttachmentKeyWithNonce = new Uint8Array(
        attachKeyWrapNonce.length + encryptedAttachmentKey.length
      )
      wrappedAttachmentKeyWithNonce.set(attachKeyWrapNonce)
      wrappedAttachmentKeyWithNonce.set(encryptedAttachmentKey, attachKeyWrapNonce.length)

      attachmentsMetadata.push({
        id: attachmentId,
        nonce: uint8ArrayToBase64(attachmentNonce),
        key_envelope: {
          wrapped_key: uint8ArrayToBase64(wrappedAttachmentKeyWithNonce),
          scheme: "x25519-xchacha20poly1305",
        },
      })
    }
  }

  // 4. Assemble the final JSON payload
  const encryptedPayload: EncryptedJsonPayload = {
    encrypted_body: uint8ArrayToBase64(encryptedBody),
    body_nonce: uint8ArrayToBase64(bodyNonce),
    key_envelope: {
      reporter_ephemeral_public_key: uint8ArrayToBase64(reporterEphemeralKeyPair.publicKey),
      wrapped_report_key: uint8ArrayToBase64(wrappedReportKeyWithNonce),
      scheme: "x25519-xchacha20poly1305",
    },
    attachments: attachmentsMetadata,
    associated_data: {
      formTitle: formTitle,
      formIdentifier: formIdentifier,
      timestamp: new Date().toISOString(),
    },
  }

  return { encryptedPayload, encryptedAttachments }
}

/**
 * Decrypts an encrypted attachment file.
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
    const key = base64ToUint8Array(keyB64)
    const nonce = base64ToUint8Array(nonceB64)

    const response = await fetch(encryptedFileUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch encrypted file: ${response.statusText}`)
    }
    const encryptedFileBytes = new Uint8Array(await response.arrayBuffer())

    const decryptedBytes = nacl.secretbox.open(encryptedFileBytes, nonce, key)

    if (!decryptedBytes) {
      throw new Error(
        "Attachment decryption failed. Check key, nonce, and ciphertext integrity."
      )
    }

    const uint8 = new Uint8Array(decryptedBytes)
    return new Blob([uint8])
  } catch (error) {
    console.error("Attachment decryption process error:", error)
    return null
  }
}
