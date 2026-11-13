import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPkrPrice, isValidEmail, validatePasswordChange, filterDevicesList } from './pricing';
import { DeviceSession } from '../types';

test('formatPkrPrice formats numbers with commas and decimals', () => {
  assert.equal(formatPkrPrice(1950.52), 'Rs 1,950.52');
  assert.equal(formatPkrPrice(5015.63), 'Rs 5,015.63');
});

test('isValidEmail validates email format strictly', () => {
  assert.equal(isValidEmail('test@example.com'), true);
  assert.equal(isValidEmail('invalid-email'), false);
  assert.equal(isValidEmail(''), false);
});

test('validatePasswordChange enforces minimum 8 chars, distinct passwords and confirmation match', () => {
  assert.equal(validatePasswordChange('', 'newPass123', 'newPass123').valid, false);
  assert.equal(validatePasswordChange('oldPass123', 'short', 'short').valid, false);
  assert.equal(validatePasswordChange('oldPass123', 'oldPass123', 'oldPass123').valid, false);
  assert.equal(validatePasswordChange('oldPass123', 'newPass123', 'differentPass').valid, false);
  assert.equal(validatePasswordChange('oldPass123', 'newPass123', 'newPass123').valid, true);
});

test('filterDevicesList prioritizes current device and filters by status and query', () => {
  const sample: DeviceSession[] = [
    {
      id: '1',
      browser: 'Chrome 120',
      os: 'Windows 11',
      location: 'Karachi, PK',
      ip: '192.168.1.1',
      lastActive: 'Active now',
      status: 'trusted',
      current: false,
      kind: 'desktop'
    },
    {
      id: '2',
      browser: 'Firefox 120',
      os: 'Linux',
      location: 'Lahore, PK',
      ip: '192.168.1.2',
      lastActive: 'Active now',
      status: 'trusted',
      current: true,
      kind: 'desktop'
    },
    {
      id: '3',
      browser: 'Safari',
      os: 'iOS',
      location: 'Islamabad, PK',
      ip: '192.168.1.3',
      lastActive: 'Yesterday',
      status: 'blocked',
      current: false,
      kind: 'phone'
    }
  ];

  const filtered = filterDevicesList(sample, 'trusted', '');
  assert.equal(filtered.length, 2);
  assert.equal(filtered[0].current, true, 'Current device must be sorted first');

  const searched = filterDevicesList(sample, 'all', 'Safari');
  assert.equal(searched.length, 1);
  assert.equal(searched[0].id, '3');
});
