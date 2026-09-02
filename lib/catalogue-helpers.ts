/**
 * Presentation helpers for masters created by the catalogue scanner.
 */

const MASTER_COLORS = [
  '#6366f1', '#ec4899', '#10b981', '#f59e0b',
  '#8b5cf6', '#3b82f6', '#ef4444',
];

export function randomColor(): string {
  return MASTER_COLORS[Math.floor(Math.random() * MASTER_COLORS.length)];
}

/**
 * Icon for a master, matched to the kind of measurement its column holds.
 * Masters render `icon` directly, so this returns the glyph itself.
 */
export function inferIcon(masterName: string): string {
  const name = masterName.toLowerCase();
  if (/dia|ø|\bod\b|\bid\b/.test(name)) return '⭕';
  if (/length|pitch|\bl\b/.test(name)) return '📏';
  if (/weight|kgs?\b|n\.?w/.test(name)) return '⚖️';
  if (/force|load/.test(name)) return '💪';
  if (/thread|size|slot/.test(name)) return '🔩';
  if (/material/.test(name)) return '🔧';
  if (/hardness/.test(name)) return '💎';
  if (/range/.test(name)) return '↔️';
  return '📐';
}
