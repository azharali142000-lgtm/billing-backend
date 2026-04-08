import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.billr.apk",
  appName: "Billr",
  webDir: "dist",
  plugins: {
    SplashScreen: {
      launchAutoHide: true
    }
  }
};

export default config;
