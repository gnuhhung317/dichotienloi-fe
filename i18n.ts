import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import vi from './locales/vi.json';

const LANGUAGE_STORAGE_KEY = '@app_language';

// Get device language
const getDeviceLanguage = () => {
  const locales = getLocales();
  const locale = locales[0]?.languageCode || 'en';
  // If device is set to Vietnamese, use 'vi', otherwise default to 'en'
  return locale.startsWith('vi') ? 'vi' : 'en';
};

// Get stored language or device language
const getInitialLanguage = async () => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage || getDeviceLanguage();
  } catch (error) {
    console.error('Error getting stored language:', error);
    return getDeviceLanguage();
  }
};

// Initialize i18n
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4', // For React Native
      resources: {
        en: { translation: en },
        vi: { translation: vi },
      },
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false, // Disable suspense for React Native
      },
    });
};

// Initialize i18n on app start
initI18n();

// Function to change language and persist it
export const changeLanguage = async (language: 'en' | 'vi') => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export default i18n;
