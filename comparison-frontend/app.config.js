const appJson = require("./app.json");

module.exports = {
  ...appJson.expo,
  experiments: {
    ...appJson.expo.experiments,
    baseUrl: process.env.EXPO_BASE_URL ?? "",
  },
};
