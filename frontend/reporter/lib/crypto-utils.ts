// FILE: lib/crypto-utils.ts
import nacl from "tweetnacl"
import { AdminPublicKey } from "./api"
import { uuidv4 } from "./uuid"

// Helper to convert a Base64 string to a Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

// Helper to convert a Uint8Array to a Base64 string
const uint8ArrayToBase64 = (array: Uint8Array): string => {
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
 * @param attachments A FileList of attachments.
 * @param adminKey The admin's public key object from the API.
 * @param formIdentifier The keys identifying the form template.
 * @param formTitle The display title of the form.
 * @returns An object containing the encrypted JSON payload and an array of encrypted attachment blobs.
 */
export async function encryptReportAndAttachments(
  reportData: object,
  attachments: FileList | null,
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
          scheme: "x25519-xchacha20poly1035",
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