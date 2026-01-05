import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Lấy API URL từ environment variables hoặc logic development
const getApiUrl = () => {
  // Ưu tiên environment variable (dùng cho production builds)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    console.log('Using ENV API URL:', envApiUrl);
    return envApiUrl;
  }

  // Development mode - tự động detect
  // Nếu chạy trên web, dùng localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api';
  }
  
  // Lấy IP từ Expo debugger (khi dùng Expo Go)
  const expoDebuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();

  if (expoDebuggerHost) {
    console.log('Using Expo Debugger Host:', expoDebuggerHost);
    return `http://${expoDebuggerHost}:4000/api`;
  }

  // Fallback for Android Emulator
  // 10.0.2.2 is the special alias to your host loopback interface (127.0.0.1)
  console.log('Using Android Emulator Fallback: 10.0.2.2');
  return 'http://10.0.2.2:4000/api';
};

// API Configuration
const apiUrl = getApiUrl();
const env = process.env.EXPO_PUBLIC_ENV || 'development';
console.log('API_URL_CONFIGURED:', apiUrl);
console.log('ENVIRONMENT:', env);

export const API_CONFIG = {
  BASE_URL: apiUrl,
  UPLOADS_URL: apiUrl.replace('/api', '/uploads'),

  // Timeout cho request (ms)
  TIMEOUT: 10000,

  // Headers mặc định
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Đi Chợ Tiện Lợi',
  VERSION: '1.0.0',
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
};
