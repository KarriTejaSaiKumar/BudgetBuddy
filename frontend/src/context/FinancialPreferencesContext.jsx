import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getPreferences, updatePreferences as patchPreferences } from '../services/profile';
import { useTheme } from './ThemeContext';

const FinancialPreferencesContext = createContext();

/**
 * Account preferences.
 *
 * Currency, language, timezone, theme and the four notification switches live
 * on the server (/api/profile/preferences/). Date and number formatting are
 * presentation-only choices with no backend column, so they stay on device.
 */
export const FinancialPreferencesProvider = ({ children }) => {
  const { themeMode, setThemeMode } = useTheme();

  const [currency, setCurrencyState] = useState(() => localStorage.getItem('bb_currency') || 'INR');
  const [language, setLanguageState] = useState(() => localStorage.getItem('bb_language') || 'English');
  const [timezone, setTimezoneState] = useState(() => localStorage.getItem('bb_timezone') || 'Asia/Kolkata');
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    budget_notifications: true,
    savings_notifications: true,
    report_notifications: true,
  });

  // Device-only display preferences (no backend field exists for these).
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('bb_date_format') || 'DD/MM/YYYY');
  const [numberFormat, setNumberFormat] = useState(
    () => localStorage.getItem('bb_number_format') || 'international',
  );

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const applyServer = useCallback(
    (data, { syncTheme = true } = {}) => {
      if (!data || typeof data !== 'object') return;
      if (data.preferred_currency) setCurrencyState(data.preferred_currency.toUpperCase());
      if (data.language) setLanguageState(data.language);
      if (data.timezone) setTimezoneState(data.timezone);
      setNotifications((prev) => ({
        email_notifications: data.email_notifications ?? prev.email_notifications,
        budget_notifications: data.budget_notifications ?? prev.budget_notifications,
        savings_notifications: data.savings_notifications ?? prev.savings_notifications,
        report_notifications: data.report_notifications ?? prev.report_notifications,
      }));
      if (syncTheme && data.theme_preference) setThemeMode(data.theme_preference);
    },
    [setThemeMode],
  );

  /** Hydrate from the account as soon as a session exists. */
  const refresh = useCallback(async () => {
    if (!localStorage.getItem('access_token')) {
      setLoaded(true);
      return;
    }
    try {
      applyServer(await getPreferences());
    } catch {
      /* offline or unauthenticated — keep the last known values */
    } finally {
      setLoaded(true);
    }
  }, [applyServer]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => localStorage.setItem('bb_currency', currency), [currency]);
  useEffect(() => localStorage.setItem('bb_language', language), [language]);
  useEffect(() => localStorage.setItem('bb_timezone', timezone), [timezone]);
  useEffect(() => localStorage.setItem('bb_date_format', dateFormat), [dateFormat]);
  useEffect(() => localStorage.setItem('bb_number_format', numberFormat), [numberFormat]);

  /**
   * Persist server-backed preferences. Accepts the API field names so callers
   * stay honest about what the backend actually stores.
   */
  const savePreferences = useCallback(
    async (patch) => {
      setSaving(true);
      try {
        const data = await patchPreferences(patch);
        applyServer(data, { syncTheme: false });
        if (patch.theme_preference) setThemeMode(patch.theme_preference);
        return { ok: true, data };
      } catch (err) {
        const detail = err?.response?.data;
        const message =
          (detail && Object.values(detail).flat()[0]) || 'We could not save your preferences.';
        return { ok: false, error: String(message) };
      } finally {
        setSaving(false);
      }
    },
    [applyServer, setThemeMode],
  );

  const setCurrency = useCallback(
    (value) => savePreferences({ preferred_currency: String(value).toUpperCase() }),
    [savePreferences],
  );
  const setLanguage = useCallback((value) => savePreferences({ language: value }), [savePreferences]);
  const setTimezone = useCallback((value) => savePreferences({ timezone: value }), [savePreferences]);

  return (
    <FinancialPreferencesContext.Provider
      value={{
        currency,
        setCurrency,
        language,
        setLanguage,
        timezone,
        setTimezone,
        notifications,
        themeMode,
        dateFormat,
        setDateFormat,
        numberFormat,
        setNumberFormat,
        savePreferences,
        refreshPreferences: refresh,
        loaded,
        saving,
      }}
    >
      {children}
    </FinancialPreferencesContext.Provider>
  );
};

export const useFinancialPreferences = () => {
  const context = useContext(FinancialPreferencesContext);
  if (!context) {
    throw new Error('useFinancialPreferences must be used within a FinancialPreferencesProvider');
  }
  return context;
};
