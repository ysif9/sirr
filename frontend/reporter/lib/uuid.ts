/**
 * Generates a simple, cryptographically-secure UUID v4.
 * This is used to create a unique client-side ID for each attachment,
 * linking the metadata in the JSON payload to the file blob in the multipart request.
 * @returns {string} A new UUID v4 string.
 */
export function uuidv4(): string {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
  );
}