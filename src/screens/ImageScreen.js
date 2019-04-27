import React from "react";
import {Text, View, TouchableOpacity, StyleSheet} from "react-native";
import { Camera, Permissions } from 'expo';
import { Entypo } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import Loader from "../utils/Loader";
var AWS = require('aws-sdk');

export default class ImageScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            camera: null,
            isLoading: false,
        };

        this.snap = this.snap.bind(this);

        // setup aws config
        // TODO: accessKeyId, and secretAccessKey need to be encrypted.
        AWS.config.update({
            "accessKeyId": "***REMOVED***",
            "secretAccessKey": "***REMOVED***",
            "region": "us-east-2"
        });

        this.rekognitionClient = new AWS.Rekognition();
    };

    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    };

    async snap() {
        if (this.camera) {

            this.camera.takePictureAsync({ quality: 0.5, base64: true })
            .then(photo => {
                let buffer = new Buffer(photo.base64, 'base64');

                let params = {
                    Image: {
                        Bytes: buffer
                    }
                };

                this.rekognitionClient.detectText(params, function(err, data) {
                    if (err) {
                        console.log("Bad Call");
                        console.log(err);
                    } else {
                        console.log("Good Call");
                        // console.log(data);

                        data.TextDetections.forEach(function(textDetections) {
                           console.log(textDetections.DetectedText);
                        });

                    }
                });

                this.setState({
                    isLoading: false,
                })

                // TODO:
                // 1. Need to change screen to the picture that was taken
                // 2. Add button on screen to go back to picture taking
                // 3. Need to parse response from detectText
                // 4. Need to highlight the text in the saved picture
                // 5. Need to get definitions of each word (only supporting english)


            }); // want to do catch here for error handling

            // should do loading
            this.setState({
                isLoading: true,
            })

        }
    };

    render() {

        // Loading
        if (this.state.isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <Loader />
                </View>
            );
        }


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

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
});


