exports.config = {
  runner: 'local',
  port: 4723,
  specs: ['./test/specs/**/*.js'],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      browserName: 'iOS',
      appiumVersion: '1.21.0',
      platformName: 'iOS',
      //platformVersion: '14.3',
      deviceName: 'iPhone 12',
      app: '/Users/jp/Library/Developer/Xcode/DerivedData/rnAppium-eyfombhxagcaxvbasncufnpyxhts/Build/Products/Release-iphonesimulator/rnAppium.app',
      automationName: 'XCUITest',
      acceptInsecureCerts: true,
    },
  ],
  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ['appium'],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
};