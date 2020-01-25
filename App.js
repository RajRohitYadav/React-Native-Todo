
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  Platform
} from 'react-native';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import HomeScreen from './src/HomeScreen/index';
import NoteScreen from './src/NoteScreen/index';

const AppNavigator = createStackNavigator({
  'Todo List': {
    screen: HomeScreen,
  },
  'Todo Details':{
    screen: NoteScreen
  }
});

const AppNavigatorContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
  render(){
    return (
      <>
        {Platform.OS === 'ios'?
          <StatusBar barStyle="dark-content" />
        :
          <StatusBar barStyle="light-content" />
        }
        <SafeAreaView style={{flex:1}}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={{flexGrow: 1}}
            style={styles.scrollView}>
              <AppNavigatorContainer/>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'red',
    flex:1
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: 'white',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: 'black',
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: 'black',
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});
