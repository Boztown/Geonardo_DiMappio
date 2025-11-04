export const configDefaults = {
  serverPort: 1235,
  telnetHost: "127.0.0.1",
  telnetPort: "5554",
  androidAuthCode: "3Y3NFY89DIIDK5DB",
};

export const config = {
  serverPort: process.env.SERVER_PORT || configDefaults.serverPort,
  telnetHost: process.env.TELNET_HOST || configDefaults.telnetHost,
  telnetPort: process.env.TELNET_PORT || configDefaults.telnetPort,
  androidAuthCode:
    process.env.ANDROID_AUTH_CODE || configDefaults.androidAuthCode,
};
