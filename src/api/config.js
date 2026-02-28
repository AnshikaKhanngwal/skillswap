export const API_URL = import.meta.env.VITE_API_URL;

// This ensures that if the env variable is missing, your app doesn't just crash silently
if (!API_URL) {
  console.warn("Warning: VITE_API_URL is not defined in your .env file!");
}