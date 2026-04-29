/**
 * Helper functions for catalogue parsing
 */

export function randomColor(): string {
  const colors = [
    '#6366f1',
    '#ec4899',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#3b82f6',
    '#ef4444'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function inferIcon(masterName: string): string {
  const name = masterName.toLowerCase();
  if (name.includes('dia') || name.includes('ø') || name.includes('d1') || name.includes('d2')) return '⭕';
  if (name.includes('length') || name.includes(' l') || name === 'l') return '📏';
  if (name.includes('weight')) return '⚖️';
  if (name.includes('force') || name.includes('load')) return '💪';
  if (name.includes('thread') || name.includes('size')) return '🔩';
  if (name.includes('material')) return '🔧';
  if (name.includes('hardness')) return '💎';
  return '📐';
}

export function generateSKU(productName: string, categoryId: string): string {
  const prefix = productName.replace(/[^A-Z0-9]/gi, '-').toUpperCase().slice(0, 20);
  const suffix = Date.now().toString(36).toUpperCase();
  return `${prefix}-${suffix}`;
}
