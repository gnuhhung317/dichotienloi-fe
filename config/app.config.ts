import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Lấy IP từ Expo hoặc dùng giá trị mặc định
const getApiUrl = () => {
  // Nếu chạy trên web, dùng localhost
  if (Platform.OS === 'web') {
    return 'http://localhost:4000/api';
  }
  
  // Lấy IP từ Expo debugger (khi dùng Expo Go)
  const expoDebuggerHost = Constants.expoConfig?.hostUri?.split(':').shift();
  
  if (expoDebuggerHost) {
    return `http://${expoDebuggerHost}:4000/api`;
  }
  
  // Fallback: Thay YOUR_LOCAL_IP bằng IP thực của máy bạn
  // Tìm IP: Windows → ipconfig, Mac/Linux → ifconfig
  return 'http://192.168.1.7:4000/api'; // ✅ IP của máy bạn
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiUrl(),
  
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
