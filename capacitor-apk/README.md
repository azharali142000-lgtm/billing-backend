# Billr Capacitor APK

This shell is intended to package the live hosted Billr frontend into an Android APK.

Architecture:

- APK shell: Capacitor Android WebView
- Frontend: Vercel
- Backend API: Render
- Database: Supabase PostgreSQL
- OTP auth: Firebase Phone Authentication

Important:

- The APK loads a live URL from `capacitor.config.ts`
- Do not point this to `localhost`
- Frontend/API changes can go live without rebuilding the APK
- Rebuild the APK only when native features or Capacitor plugins change

Expected production URL:

- `https://app.billr.example`

Basic flow:

1. Install dependencies
2. Add Android platform
3. Run `npm run sync`
4. Open Android Studio with `npm run open:android`
5. Build signed APK / AAB from Android Studio
