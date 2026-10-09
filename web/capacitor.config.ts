import type { CapacitorConfig } from "@capacitor/cli";

// Native wrapper: the app opens the live site (all ordering, payments and
// data live online). An internet connection is required.
const config: CapacitorConfig = {
  appId: "com.alabadorf.outlet",
  appName: "Alaba Dorf Outlet",
  webDir: "cap-wrap",
  server: {
    url: "https://alabadorf.netlify.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
