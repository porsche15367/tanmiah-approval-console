import { createContext, useContext, useMemo, useState } from 'react';
import { translations, t } from '../i18n';

const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try {
      return localStorage.getItem('approval-poc-locale') || 'ar';
    } catch {
      return 'ar';
    }
  });

  const value = useMemo(() => ({
    locale,
    setLocale,
    dir: locale === 'ar' ? 'rtl' : 'ltr',
    t: (key, params = {}) => t(key, locale, params),
    labels: translations[locale] || translations.en,
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}