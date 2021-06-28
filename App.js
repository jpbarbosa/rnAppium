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
