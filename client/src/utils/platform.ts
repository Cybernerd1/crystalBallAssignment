/** Platform-aware shortcut labels (display only). */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform);
}

export function commandKeyLabel(): string {
  return isMacPlatform() ? '⌘' : 'Ctrl';
}

export function commandShortcutLabel(): string {
  return isMacPlatform() ? '⌘K' : 'Ctrl K';
}
