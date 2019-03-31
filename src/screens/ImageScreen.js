import React from "react";
import {Text, Button, View, TouchableOpacity, StyleSheet} from "react-native";
import { Camera, Permissions } from 'expo';
import { Entypo } from '@expo/vector-icons';

export default class ImageScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            camera: null,
        };

        this.snap = this.snap.bind(this);
    };

    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    };

    async snap() {
        if (this.camera) {
            let photo = await this.camera.takePictureAsync();
            alert('Took a picture!')
        }
    };

    render() {
        const { hasCameraPermission } = this.state;

        if (hasCameraPermission === null) {
            return (<View />);
        } else if (hasCameraPermission === false) {
            return (<Text>No access to camera</Text>);
        } else {
            return (
                <View style={{flex: 1,}}>
                    <Camera
                        style={{flex: 1,}}
                        type={this.state.type}
                        ref={ref => { this.camera = ref; }}>
                        <View style={{flex: 9,}}></View>
                        <TouchableOpacity
                            style={{
                                alignItems:'center',
                                flex: 1,
                            }}
                            onPress={this.snap}
                        >
                            <Entypo name="circle" size={64} color="white" />
                        </TouchableOpacity>
                    </Camera>
                </View>
            )
        }
    };
};

// TODO: Not in use
const styles = StyleSheet.create({
    fullScreenFlex: {
        flex: 1,
    },
});


