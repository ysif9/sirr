import { AdminEncryptedPayload } from "./crypto-utils";

// Hardcode the API URL as per the refactoring instructions to ensure consistency.
const API_BASE_URL = "http://localhost:8000";

// Define the shape of the system's public key object we expect from the API.
// This matches the structure returned by the SystemInboxPublicKeyView.
export interface AdminPublicKey {
  id: string;
  username: string;
  public_key_bundle: {
    identity_key_x25519: string; // This is a Base64 encoded public key
    kem_key_kyber: string;
  };
}

/**
 * Fetches the system-wide admin public key.
 * @returns {Promise<AdminPublicKey>} The system's public key.
 * @throws {Error} If the API request fails.
 */
export async function getAdminPublicKey(): Promise<AdminPublicKey> {
  // This endpoint fetches the single key for the system admin inbox.
  const response = await fetch(`${API_BASE_URL}/api/system/public-key/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch system public key: ${response.statusText}`);
  }

  const adminKey: AdminPublicKey = await response.json();
  return adminKey;
}

/**
 * Submits the encrypted report payload to the backend.
 * All reports are now sent to the admin inbox, so no recipient_id is needed.
 * @param {AdminEncryptedPayload} payload The encrypted data and metadata.
 * @returns {Promise<{ access_key: string }>} The submission result containing the access key.
 * @throws {Error} If the submission fails.
 */
export async function submitReport(
  payload: AdminEncryptedPayload
): Promise<{ access_key: string }> {
  const response = await fetch(`${API_BASE_URL}/api/reports/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred." }));
    const errorMessage = Object.values(errorData).flat().join(" ") || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return response.json();
}