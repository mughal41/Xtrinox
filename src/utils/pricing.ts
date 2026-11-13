import { DeviceSession, DeviceStatus } from '../types';

export function formatPkrPrice(amount: number): string {
  return `Rs ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function filterDevicesList(
  devices: DeviceSession[],
  statusFilter: string,
  searchQuery: string
): DeviceSession[] {
  let list = [...devices];

  if (statusFilter !== 'all') {
    list = list.filter((d) => d.status === statusFilter);
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(
      (d) =>
        d.browser.toLowerCase().includes(q) ||
        d.os.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.ip.includes(q)
    );
  }

  return list.sort((a, b) => Number(b.current) - Number(a.current));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validatePasswordChange(
  current: string,
  next: string,
  confirm: string
): { valid: boolean; error?: string; field?: 'current' | 'next' | 'confirm' } {
  if (!current) {
    return { valid: false, error: 'Enter your current password.', field: 'current' };
  }
  if (next.length < 8) {
    return { valid: false, error: 'Use at least 8 characters.', field: 'next' };
  }
  if (next === current) {
    return { valid: false, error: 'Choose a password different from the current one.', field: 'next' };
  }
  if (next !== confirm) {
    return { valid: false, error: 'Passwords do not match.', field: 'confirm' };
  }
  return { valid: true };
}
