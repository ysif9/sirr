import { encryptReportAndAttachments } from "./crypto-utils"

const API_BASE_URL = "http://localhost:8000"

// Define the shape of the system's public key object we expect from the API.
export interface AdminPublicKey {
  id: string
  username: string
  public_key_bundle: {
    identity_key_x25519: string // Base64 encoded public key
    kem_key_kyber: string // Base64 encoded Kyber key
  }
}

interface FormIdentifier {
  reportTypeKey: string
  categoryKey: string
  formKey: string
}

/**
 * Fetches the system-wide admin public key required for encryption.
 * @returns {Promise<AdminPublicKey>} The system's public key.
 * @throws {Error} If the API request fails.
 */
export async function getAdminPublicKey(): Promise<AdminPublicKey> {
  const response = await fetch(`${API_BASE_URL}/api/system/public-key/`)
  if (!response.ok) {
    throw new Error(`Failed to fetch system public key: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Fully encrypts and submits the report and attachments using multipart/form-data.
 * @param {object} reportData The plaintext report data.
 * @param {File[] | FileList | null} attachments The files to upload.
 * @param {FormIdentifier} formIdentifier The keys identifying the form template.
 * @param {string} formTitle The display title of the form.
 * @returns {Promise<{ access_key: string }>} The submission result with the access key.
 * @throws {Error} If submission fails.
 */
export async function submitReport(
  reportData: object,
  attachments: File[] | FileList | null,
  formIdentifier: FormIdentifier,
  formTitle: string
): Promise<{ access_key: string }> {
  // 1. Fetch the admin's public key
  const adminKey = await getAdminPublicKey()

  // 2. Encrypt the entire report payload and all attachments.
  const { encryptedPayload, encryptedAttachments } = await encryptReportAndAttachments(
    reportData,
    attachments,
    adminKey,
    formIdentifier,
    formTitle
  )

  // 3. Prepare the multipart form data for submission
  const formData = new FormData()

  // The backend expects all cryptographic info in a single JSON string field named "payload".
  formData.append("payload", JSON.stringify(encryptedPayload))

  // Append each encrypted attachment as a file blob.
  // The key used here (`attachment.id`) MUST match the `id` in the payload's attachment metadata.
  if (encryptedAttachments) {
    encryptedAttachments.forEach((attachment) => {
      formData.append(attachment.id, attachment.blob, attachment.filename)
    })
  }

  // 4. Send the encrypted data to the backend
  const response = await fetch(`${API_BASE_URL}/api/reports/`, {
    method: "POST",
    body: formData, // The browser will set the Content-Type to multipart/form-data automatically
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred." }))
    const errorMessage = Object.values(errorData).flat().join(" ") || `Request failed with status ${response.status}`
    throw new Error(errorMessage)
  }

  return response.json()
}