/** Public VAPID key from backend (base64url). Set when push API is ready. */
export const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY ?? "";

export const PUSH_SW_SCOPE = "/";
