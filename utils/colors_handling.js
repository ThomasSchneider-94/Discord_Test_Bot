/// Colors handling utilities
export function hexToRgb(hex) {
  const bigint = parseInt(hex.slice(1), 16);
  return {
	r: (bigint >> 16) & 255,
	g: (bigint >> 8) & 255,
	b: bigint & 255,
  };
}

export function rgbToHex(rgb) {
  return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
}