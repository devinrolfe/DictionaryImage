import React from "react";
import {Text, Button, View} from "react-native";

export default class ImageScreen extends React.Component {

    static navigationOptions = {
        title: 'ImageScreen',
    };

    render() {
        const {navigate} = this.props.navigation;
        return (
            <View>
                <Text>Image Screen</Text>
                <Button
                    title="Go to Text Screen"
                    onPress={() => navigate('Home', {name: 'Text'})}
                />
            </View>
        );
    }
};


