export const API =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:4000`
    : process.env.API_INTERNAL_URL || 'http://0.0.0.0:4000');
