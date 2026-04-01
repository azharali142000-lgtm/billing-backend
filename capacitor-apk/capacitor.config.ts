import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.billr.apk",
  appName: "Billr",
  webDir: "www",
  server: {
    url: "https://app.billr.example",
    cleartext: false,
    androidScheme: "https"
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true
    }
  }
};

export default config;
