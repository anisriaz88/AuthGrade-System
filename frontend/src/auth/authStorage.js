const AUTH_KEY = 'authgrade.auth';

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return true;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export function getStoredAuth() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    if (!parsed?.accessToken || !parsed?.user) return null;

    if (isTokenExpired(parsed.accessToken)) {
      clearStoredAuth();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function setStoredAuth(auth) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function getStoredAccessToken() {
  return getStoredAuth()?.accessToken || null;
}

