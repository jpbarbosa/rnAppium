# rnAppium

React Native Testing Tutorial

[![CircleCI](https://circleci.com/gh/jpbarbosa/rnAppium/tree/main.svg?style=svg)](https://circleci.com/gh/jpbarbosa/rnAppium/tree/main)

## Stack

* React Native
* Appium
* CircleCI

## Steps

Obs.: Replace rnAppium with your app name in each step.

### Create new React Native app

```bash
npx react-native init rnAppium
```

### Enter into the app directory

```bash
cd rnAppium
```

### Add dependences

```bash
yarn add react-native-testid
```

### Cleanup App.js

```bash
code ./App.js
```

```js
import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet, Text, View} from 'react-native';
import testID from 'react-native-testid';

const App = () => {
  return (
    <SafeAreaView>
      <StatusBar />
      <View {...testID('app-root')}>
        <Text {...testID('text')} style={styles.text}>
          This is a sample project.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  text: {
    textAlign: 'center',
    marginTop: 96,
    fontSize: 24,
  },
});

export default App;
```

### Create test

```bash
code ./test/specs/App.test.js
```

```js
const {expect} = require('chai');

describe('Running a sample test', () => {
  beforeEach(() => {
    $('~app-root').waitForDisplayed(11000, false);
  });

  it('Text is correct', () => {
    const text = $('~text').getText();
    console.log({text});
    expect(text).to.equal('This is a sample project.');
  });
});
```

### Add dev dependences

```bash
yarn add --dev \
     @wdio/appium-service \
     @wdio/cli \
     @wdio/local-runner \
     @wdio/mocha-framework \
     @wdio/spec-reporter \
     @wdio/sync \
     appium \
     chai
```

### Create script to build Android

```bash
code ./scripts/build-android.sh
```

```bash
mkdir -p ./android/app/src/main/assets
react-native bundle \
             --platform android \
             --dev false \
             --entry-file index.js \
             --bundle-output ./android/app/src/main/assets/index.android.bundle \
             --assets-dest ./android/app/src/main/res
cd android
./gradlew assembleDebug
echo 'File should be generated: android/app/build/outputs/apk/debug/app-debug.apk'
```

### Ensure to .gitignore Android bundle

```bash
echo "android/app/src/main/assets/index.android.bundle" >> .gitignore
```

### Create script to build iOS

```bash
code ./scripts/build-ios.sh
```

```bash
xcodebuild -workspace ./ios/rnAppium.xcworkspace \
           -configuration Release \
           -scheme rnAppium \
           -sdk iphonesimulator \
           -derivedDataPath ./ios/build
```

### Add scripts to package.json

```bash
code ./package.json
```

```json
...
  "scripts": {
    ...
    "test:build:android": "bash scripts/build-android.sh",
    "test:build:ios": "bash scripts/build-ios.sh",
    "test:android": "wdio wdio.conf.android.js",
    "test:ios": "wdio wdio.conf.ios.js",
    ...
  },
...
```

### Create WebDriver configuration for Android

```bash
code ./wdio.conf.android.js
```

```js
exports.config = {
  runner: 'local',
  port: 4723,
  specs: ['./test/specs/**/*.js'],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      platformName: 'Android',
      //platformVersion: '10',
      deviceName: 'emulator-5554',
      app: './android/app/build/outputs/apk/debug/app-debug.apk',
      automationName: 'UiAutomator2',
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
```

### Create WebDriver configuration for iOS

```bash
code ./wdio.conf.ios.js
```

```js
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
      app: './ios/build/Build/Products/Release-iphonesimulator/rnAppium.app',
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
```

### Run tests locally for Android

```bash
yarn test:build:android
emulator -avd Pixel_3a_API_30_x86 &
yarn test:android
```

### Run tests locally for iOS

```bash
yarn test:build:ios
# npx react-native run-ios --configuration Release # alternatively
yarn test:ios
```

### Create CircleCI configuration

```bash
code ./.circleci/config.yml
```

```yml
version: 2.1

orbs:
  android: circleci/android@1.0.3

jobs:
  build-and-test-android:
    executor:
      name: android/android-machine

    steps:
      - checkout

      - run:
          name: Node 14 Repo
          command: 'curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -'

      - run:
          name: Install Node
          command: 'sudo apt-get install -y nodejs'

      - run:
          name: Install Yarn
          command: 'sudo npm install -g yarn'

      - restore_cache:
          key: dependency-cache-{{ checksum "yarn.lock" }}

      - run:
          name: Install Dependencies
          command: yarn

      - save_cache:
          key: dependency-cache-{{ checksum "yarn.lock" }}
          paths:
            - ./node_modules

      - run:
          name: Create Build
          command: yarn test:build:android

      - android/accept-licenses

      - android/create-avd:
          avd-name: emulator-5554
          install: true
          system-image: system-images;android-29;default;x86_64

      - android/start-emulator:
          avd-name: emulator-5554
          post-emulator-launch-assemble-command: ''

      - android/run-tests:
          test-command: yarn test:android

  build-and-test-ios:
    macos:
      xcode: 12.4.0

    steps:
      - checkout

      - run:
          name: Install Yarn
          command: brew install yarn

      - restore_cache:
          key: dependency-cache-ios-{{ checksum "yarn.lock" }}

      - run:
          name: Install Dependencies
          command: yarn

      - save_cache:
          key: dependency-cache-ios-{{ checksum "yarn.lock" }}
          paths:
            - ./node_modules

      - restore_cache:
          key: dependency-cache-ios-pods-{{ checksum "./ios/Podfile.lock" }}

      - run:
          name: Pod Install
          command: cd ios && pod install

      - save_cache:
          key: dependency-cache-ios-pods-{{ checksum "./ios/Podfile.lock" }}
          paths:
            - ./ios/Pods

      - run:
          name: Create Build
          command: yarn test:build:ios

      - run:
          name: Run Tests
          command: yarn test:ios

workflows:
  sample:
    jobs:
      - build-and-test-android
      - build-and-test-ios # require CircleCI paid plan
```

### Add files to Git

```bash
git init
git add .
git commit -m "Basic config to run tests"
```

### Create GitHub repo and push the code

```bash
git remote add origin git@github.com:jpbarbosa/rnAppium.git
git push -u origin main
```

### Setup CircleCI project

* Go to https://circleci.com/
* Create a free account using GitHub SSO
* Select "Projects" (on the left menu)
* Filter by the repo name
* Click "Set Up Project"
* Select already have ".circleci/config.yml"
* Select the branch (main)
* Click "Let's Go"

The test will start running and should be successfully completed in about 10 minutes.

### Screenshots

https://github.com/jpbarbosa/rnAppium/wiki/Screenshots

### More Info

Based on previous studies by [@carlosvini](https://github.com/carlosvini) and [@Dugo03](https://github.com/Dugo03).
