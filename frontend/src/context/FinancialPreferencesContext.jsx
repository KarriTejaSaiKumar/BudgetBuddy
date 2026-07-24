import React, { createContext, useContext, useState, useEffect } from 'react';

const FinancialPreferencesContext = createContext();

export const FinancialPreferencesProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('bb_currency') || 'USD';
  });

  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem('bb_date_format') || 'DD/MM/YYYY';
  });

  const [numberFormat, setNumberFormat] = useState(() => {
    return localStorage.getItem('bb_number_format') || 'international';
  });

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('bb_language') || 'English';
  });

  useEffect(() => {
    localStorage.setItem('bb_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('bb_date_format', dateFormat);
  }, [dateFormat]);

  useEffect(() => {
    localStorage.setItem('bb_number_format', numberFormat);
  }, [numberFormat]);

  useEffect(() => {
    localStorage.setItem('bb_language', language);
  }, [language]);

  const updatePreferences = (newPrefs) => {
    if (newPrefs.currency) setCurrency(newPrefs.currency.toUpperCase());
    if (newPrefs.dateFormat) setDateFormat(newPrefs.dateFormat);
    if (newPrefs.numberFormat) setNumberFormat(newPrefs.numberFormat);
    if (newPrefs.language) setLanguage(newPrefs.language);
  };

  return (
    <FinancialPreferencesContext.Provider
      value={{
        currency,
        setCurrency,
        dateFormat,
        setDateFormat,
        numberFormat,
        setNumberFormat,
        language,
        setLanguage,
        updatePreferences,
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
