import React from 'react';
import {createStackNavigator, createAppContainer} from 'react-navigation';
import DictionaryTextScreen from "./src/screens/DictionaryTextScreen";

const MainNavigator = createStackNavigator({
    Home: {screen: DictionaryTextScreen},
});

const App = createAppContainer(MainNavigator);

export default App;
