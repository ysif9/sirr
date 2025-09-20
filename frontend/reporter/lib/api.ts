import { EncryptedPayload, UnassignedEncryptedPayload } from "./crypto-utils";

// Hardcode the API URL as per the refactoring instructions to ensure consistency.
const API_BASE_URL = "http://localhost:8000";

// Define the shape of the caseworker object we expect from the API
export interface Caseworker {
  id: string;
  username: string;
  public_key_bundle: {
    identity_key_x25519: string; // This is a Base64 encoded public key
    kem_key_kyber: string;
  };
}

/**
 * Fetches the list of active caseworkers and returns the first one, or null if none are available.
 * @returns {Promise<Caseworker | null>} The first available caseworker or null.
 * @throws {Error} If the API request fails.
 */
export async function getFirstCaseworker(): Promise<Caseworker | null> {
  const response = await fetch(`${API_BASE_URL}/api/recipients/public-keys/`);

  if (!response.ok) {
    throw new Error(`Failed to fetch recipients: ${response.statusText}`);
  }

  const caseworkers: Caseworker[] = await response.json();

  if (!caseworkers || caseworkers.length === 0) {
    return null; // Return null if no recipients are found
  }

  // For simplicity, we'll use the first caseworker in the list
  return caseworkers[0];
}

/**
 * Submits the encrypted report payload to the backend.
 * @param {EncryptedPayload | UnassignedEncryptedPayload} payload The encrypted data and metadata.
 * @returns {Promise<{ access_key: string }>} The submission result containing the access key.
 * @throws {Error} If the submission fails.
 */
export async function submitReport(
  payload: EncryptedPayload | UnassignedEncryptedPayload
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