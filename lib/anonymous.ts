const DEVICE_KEY = 'echo:anonymous-device-id';
const WRITES_KEY = 'echo:recent-writes';

export function ensureAnonymousId() {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(DEVICE_KEY, id);
  return id;
}

export function canWriteNow() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  const recent = readRecentWrites().filter((time) => time > cutoff);
  localStorage.setItem(WRITES_KEY, JSON.stringify(recent));
  return recent.length < 3;
}

export function recordLocalWrite() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  const recent = readRecentWrites().filter((time) => time > cutoff);
  recent.push(Date.now());
  localStorage.setItem(WRITES_KEY, JSON.stringify(recent));
}

function readRecentWrites(): number[] {
  try {
    const value = JSON.parse(localStorage.getItem(WRITES_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter((item) => typeof item === 'number') : [];
  } catch {
    return [];
  }
}

export function containsBlockedContact(text: string) {
  const url = /(?:https?:\/\/|www\.|\.(?:com|cn|net|org)\b)/i;
  const contact = /(?:微信|vx|v信|qq|电话|手机号)\s*[:：]?\s*[a-z0-9_-]{5,}/i;
  return url.test(text) || contact.test(text);
}
