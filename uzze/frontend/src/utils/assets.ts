export function assetUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const base = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api')
    .replace(/\/api\/?$/, '');

  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}
