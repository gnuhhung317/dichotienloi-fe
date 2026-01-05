# Hướng dẫn Build APK cho Đi Chợ Tiện Lợi

## ⚠️ Fix Network Error khi đăng nhập trong APK

### Vấn đề
Khi build APK, app bị **Network Error** khi đăng nhập vì code đang sử dụng localhost thay vì API production.

### Giải pháp (ĐÃ FIX)
✅ Đã tạo file `.env` để cấu hình API URL  
✅ Đã cập nhật code để đọc từ environment variables  
✅ Đã cấu hình `eas.json` với API URL production  

### Cấu hình API
File `.env` (production):
```env
EXPO_PUBLIC_API_URL=http://54.251.156.243/api
EXPO_PUBLIC_ENV=production
```

File `.env.local` (development - không commit):
```env
EXPO_PUBLIC_API_URL=http://localhost:4000/api
EXPO_PUBLIC_ENV=development
```

---

## Phương pháp 1: Build APK với EAS Build (Khuyến nghị - Dễ nhất)

### Bước 1: Cài đặt EAS CLI
```bash
npm install -g eas-cli
```

### Bước 2: Login vào Expo
```bash
cd dichotienloi-fe
eas login
```
- Nếu chưa có tài khoản Expo, tạo tại: https://expo.dev/signup

### Bước 3: Build APK
```bash
eas build -p android --profile preview
```

### Bước 4: Tải APK
- Sau khi build xong, EAS sẽ cung cấp link tải APK
- Hoặc vào https://expo.dev/accounts/[your-username]/projects/dichotienloi-fe/builds để tải

### Build APK Local (Không upload lên Expo server)
```bash
eas build -p android --profile preview --local
```
⚠️ Cần cài đặt Android SDK và có cấu hình tốt

---

## Phương pháp 2: Build với npx expo build (Cũ hơn)

### Build APK trực tiếp
```bash
cd dichotienloi-fe
npx expo build:android -t apk
```

### Build AAB (Android App Bundle) cho Google Play Store
```bash
npx expo build:android -t app-bundle
```

---

## Phương pháp 3: Export và Build Local với Android Studio

### Bước 1: Prebuild
```bash
cd dichotienloi-fe
npx expo prebuild
```

### Bước 2: Build APK
```bash
cd android
./gradlew assembleRelease
```

APK sẽ nằm tại: `android/app/build/outputs/apk/release/app-release.apk`

---

## Debug & Troubleshooting

### 1. Check API URL đang được sử dụng
Mở app và xem console logs (Metro bundler):
```
API_URL_CONFIGURED: http://54.251.156.243/api
ENVIRONMENT: production
```

### 2. Network Error khi đăng nhập
**Nguyên nhân:** APK đang dùng localhost  
**Giải pháp:**
- Kiểm tra file `.env` có `EXPO_PUBLIC_API_URL=http://54.251.156.243/api`
- Build lại với `eas build --profile preview --platform android`

### 3. Test API từ điện thoại
Mở browser trên điện thoại và truy cập:
```
http://54.251.156.243/api
```
Phải thấy response từ server.

### 4. Xem logs APK
```bash
# Kết nối điện thoại qua USB và bật USB debugging
adb logcat | grep -i "API_URL_CONFIGURED\|ReactNativeJS"
```

---

## Lưu ý quan trọng

### 1. Cập nhật API URL
Trước khi build, đảm bảo `dichotienloi-fe/config/app.config.ts` có URL production đúng:
```typescript
UPLOADS_URL: 'http://54.251.156.243/uploads'
```

### 2. Cấu hình đã được thêm
- ✅ Package name: `com.dichotienloi.app`
- ✅ Version code: 1
- ✅ EAS config: `eas.json`

### 3. Yêu cầu hệ thống
- Node.js >= 18
- npm hoặc yarn
- Tài khoản Expo (cho EAS Build)
- Android SDK (cho build local)

### 4. Kiểm tra trước khi build
```bash
cd dichotienloi-fe
npm install
npx expo start
```

---

## Khuyến nghị

**Cho người mới:** Dùng **Phương pháp 1 (EAS Build)** - Đơn giản nhất, không cần setup Android SDK

**Cho production:** Dùng AAB thay vì APK khi upload lên Google Play Store

**Cho test nhanh:** Dùng Expo Go app và QR code từ `npx expo start`
