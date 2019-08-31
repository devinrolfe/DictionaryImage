import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import ImageScreen from "./src/screens/ImageScreen";

const MainNavigator = createStackNavigator({
    Home: {screen: ImageScreen}
});

const App = createAppContainer(MainNavigator);

export default App;
