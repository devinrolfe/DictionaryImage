import React from "react";
import {Button, StyleSheet, Text, TextInput, View} from "react-native";

import Amplify, { API, graphqlOperation } from "aws-amplify";
import aws_config from '../../aws-exports';
import * as queries from "../graphql/queries"

Amplify.configure(aws_config);

export default class DictionaryTextScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            text: '',
            definition: ''
        };
    }

    async getWordDefinition() {
        const response = await API.graphql(graphqlOperation(queries.getSingleWord, { word: this.state.text }));
        console.log(response);
        this.setState({definition: response.data.getSingleWord.definition});
    }


    render() {
        return (
            <View style={styles.container}>
                <TextInput
                    style={{height: 40, width:100}}
                    placeholder="Type in word"
                    onChangeText={(text) => this.setState({text})}
                />
                <Button title="Get Definition" onPress={this.getWordDefinition.bind(this)} />
                <Text>{this.state.definition}</Text>
            </View>
        );
    }
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});