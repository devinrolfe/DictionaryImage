import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import DictionaryTextScreen from "./src/screens/DictionaryTextScreen";
import ImageScreen from "./src/screens/ImageScreen";

const MainNavigator = createStackNavigator({
    Home: {screen: DictionaryTextScreen},
    Image: {screen: ImageScreen}
});

const App = createAppContainer(MainNavigator);

export default App;
