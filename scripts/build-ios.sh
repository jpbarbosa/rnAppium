xcodebuild -workspace ./ios/rnAppium.xcworkspace \
           -configuration Release \
           -scheme rnAppium \
           -sdk iphonesimulator \
           -derivedDataPath ./ios/build
