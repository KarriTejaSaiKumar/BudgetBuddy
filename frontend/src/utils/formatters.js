/**
 * BudgetBuddy Enterprise Financial Formatting & Currency Utilities
 * ISO Currency Codes: INR, USD, EUR, GBP, JPY, CAD, AUD, SGD
 * Date Formats: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
 * Number Formats: Indian (1,00,000.00) | International (100,000.00)
 */

export const SUPPORTED_CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

export const CURRENCY_MAP = SUPPORTED_CURRENCIES.reduce((acc, curr) => {
  acc[curr.code] = curr.symbol;
  return acc;
}, {});

/**
 * Gets localized symbol for an ISO currency code
 */
export const getCurrencySymbol = (currencyCode = 'USD') => {
  const code = (currencyCode || 'USD').toUpperCase();
  return CURRENCY_MAP[code] || '$';
};

/**
 * Enterprise Currency Formatter
 * @param {number|string} amount
 * @param {string} currencyCode ISO code (INR, USD, EUR, etc.)
 * @param {string} numberFormatStyle 'indian' | 'international'
 */
export const formatCurrency = (amount, currencyCode = 'USD', numberFormatStyle = 'international') => {
  const num = parseFloat(amount || 0);
  const symbol = getCurrencySymbol(currencyCode);
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  let formattedNum = '';

  if (numberFormatStyle === 'indian') {
    formattedNum = absNum.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else {
    formattedNum = absNum.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return `${isNegative ? '-' : ''}${symbol}${formattedNum}`;
};

/**
 * Enterprise Date Formatter
 * @param {string} dateString YYYY-MM-DD or ISO string
 * @param {string} dateFormat 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
 */
export const formatDate = (dateString, dateFormat = 'DD/MM/YYYY') => {
  if (!dateString) return '';
  const dateObj = new Date(dateString);
  if (isNaN(dateObj.getTime())) return dateString;

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  switch (dateFormat) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Future-Ready Architecture Placeholders
 * Ready for real-time exchange rates, i18n localization, and timezones
 */
export const exchangeRates = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.78,
  INR: 83.5,
  JPY: 155.2,
  CAD: 1.36,
  AUD: 1.51,
  SGD: 1.34,
};

export const convertCurrency = (amount, fromCurrency = 'USD', toCurrency = 'USD') => {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = exchangeRates[fromCurrency] || 1.0;
  const toRate = exchangeRates[toCurrency] || 1.0;
  const amountInUSD = amount / fromRate;
  return amountInUSD * toRate;
};
