const STORAGE_KEY = 'ezs-docs.localeChosen';

export function hasLocaleChoice(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markLocaleChosen(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // private mode / quota
  }
}
