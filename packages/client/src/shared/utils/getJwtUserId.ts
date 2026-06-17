export const getJwtUserId = (token: string): string | null => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
      data?: { id?: string | number };
    };

    return payload.data?.id != null ? String(payload.data.id) : null;
  } catch {
    return null;
  }
};
