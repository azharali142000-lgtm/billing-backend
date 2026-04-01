import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.billr.apk",
  appName: "Billr",
  webDir: "www",
  server: {
    url: "https://billing-backend-2v0w.onrender.com",
    cleartext: true,
    androidScheme: "https"
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true
    }
  }
};

export default config;
