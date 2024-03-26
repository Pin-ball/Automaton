export function lerpColorHex(colorA, colorB, factor) {
  // Parse hexadecimal color values into RGB components
  const rA = parseInt(colorA.slice(1, 3), 16);
  const gA = parseInt(colorA.slice(3, 5), 16);
  const bA = parseInt(colorA.slice(5, 7), 16);

  const rB = parseInt(colorB.slice(1, 3), 16);
  const gB = parseInt(colorB.slice(3, 5), 16);
  const bB = parseInt(colorB.slice(5, 7), 16);

  // Interpolate each RGB component separately
  const r = Math.round(rA + (rB - rA) * factor);
  const g = Math.round(gA + (gB - gA) * factor);
  const b = Math.round(bA + (bB - bA) * factor);

  // Convert back to hexadecimal representation
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');

  // Return the interpolated color
  return `#${hexR}${hexG}${hexB}`;
}

export function lerpColorRGB(colorA, colorB, factor) {
  const [rA, gA, bA] = colorA
  const [rB, gB, bB] = colorB

  const r = Math.round(rA + (rB - rA) * (1 - factor));
  const g = Math.round(gA + (gB - gA) * (1 - factor));
  const b = Math.round(bA + (bB - bA) * (1 - factor));

  return `rgb(${r},${g},${b})`
  // return [r, g, b]
}

