/** Profile + preferences API. */
import api from './api';

export const PROFILE_CURRENCIES = [
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'AED', label: 'UAE Dirham (AED)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
];

export const THEME_CHOICES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Match my system' },
];

export const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Hindi'];

export const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Europe/London',
  'Europe/Berlin',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
  'UTC',
];

export async function getPreferences() {
  const { data } = await api.get('/profile/preferences/');
  return data || {};
}

export async function updatePreferences(patch) {
  const { data } = await api.patch('/profile/preferences/', patch);
  return data || {};
}

export async function getAccount() {
  const { data } = await api.get('/auth/protected/');
  return data?.user || {};
}
