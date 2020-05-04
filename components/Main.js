import React, { Component } from 'react';
import {View, Platform} from 'react-native';
import Menu from './Menu';
import DishDetail from './DishDetail';
import { DISHES } from '../shared/dishes';
import { createStackNavigator} from 'react-navigation';

const MenuNavigator = createStackNavigator({
  Menu: { screen: Menu },
  DishDetail: { screen: DishDetail}
}, {
  initialRouteName: 'Menu',
  navigationOptions: {
    headerStyle: {
      backgroundColor: '#512da8'
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      color: '#fff'
    },
  }
})

class Main extends Component {
  render() {
    return (
      <View style={{ flex: 1, paddingTop: Platform.OS === 'ios' ? 0 : Expo.Constants.statusBarHeight }}>
        <MenuNavigator /> 
      </View>
    );
  }
}
  
export default Main;