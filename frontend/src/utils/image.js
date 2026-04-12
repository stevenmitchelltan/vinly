const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function getImageUrl(imageUrl) {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
}

export function isCloudinary(url) {
  return /res\.cloudinary\.com/.test(url || '');
}

export function buildCloudinarySrcSet(url) {
  const widths = [320, 480, 640, 768, 1024, 1280];
  return widths.map((w) => url.replace('/upload/', `/upload/w_${w}/`) + ` ${w}w`).join(', ');
}
