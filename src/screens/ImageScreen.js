import React from "react";
import { Alert, Text, View, TouchableOpacity, Image, Button, ImageBackground, StyleSheet} from "react-native";
import { Camera, Permissions } from 'expo';
import { Entypo } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import Loader from "../utils/Loader";
var AWS = require('aws-sdk');

export default class ImageScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: 'Image Screen',
            headerRight: (
                <Button
                    onPress={() => navigation.getParam('resetCamera').call()}
                    title="Reset"
                    color="#000"
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            camera: null,
            isLoading: false,
            cameraReadyPosition: true,
            imageTaken: null,
        };

        this.snap = this.snap.bind(this);
        this.resetCamera = this.resetCamera.bind(this);

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
        this.props.navigation.setParams({ resetCamera: this.resetCamera });
    };

    resetCamera = () => {
        console.log("I Did it");
        this.setState({
            cameraReadyPosition: true,
        }, function() {
            console.log(this.state.cameraReadyPosition);
        });
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
                    cameraReadyPosition: false,
                    imageTaken: photo.uri,
                });

                // TODO:
                // 1. Fix "Unhandled promise rejection: Error: Camera view had been unmounted before image has been captured" (Done)
                // 2. Need to parse response from detectText
                // 3. Need to highlight the text in the saved picture
                // 4. Need to get definitions of each word (only supporting english)
                // 5. hide accessKeys

            })
            .catch(() => {
                Alert.alert("Oops, try again!");

                this.setState({
                    isLoading: false,
                    cameraReadyPosition: true,
                    imageTaken: null,
                });
            });

            // should do loading
            this.setState({
                isLoading: true,
            })

        }
    };

    render() {
        const {navigate} = this.props.navigation;

        // Loading
        if (this.state.isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <Loader />
                </View>
            );
        }

        // if picture taken
        if (this.state.imageTaken && !this.state.cameraReadyPosition) {
            return (
                <ImageBackground source={{uri: this.state.imageTaken}} style={{width: '100%', height: '100%'}}>
                    <View style={{flex: 9,}}></View>
                    <TouchableOpacity
                        style={{
                            alignItems:'center',
                            flex: 1,
                        }}
                        onPress={this.resetCamera}
                    >
                        <Entypo name="ccw" size={64} color="white" />
                    </TouchableOpacity>
                    <View style={{flex: 0.2,}}></View>
                </ImageBackground>
            )
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
                        <View style={{flex: 0.2,}}></View>
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
    resetScreenButton: {
        marginRight:40,
        marginLeft:40,
        marginTop:10,
        paddingTop:10,
        paddingBottom:10,
        backgroundColor:'#000',
        borderRadius:10,
        borderWidth: 1,
        borderColor: '#fff'
    },
    resetText: {
        color:'#fff',
        textAlign:'center',
        paddingLeft : 10,
        paddingRight : 10
    },

});


/*

[Unhandled promise rejection: Error: Camera view had been unmounted before image has been captured]
- node_modules/react-native/Libraries/BatchedBridge/NativeModules.js:146:41 in createErrorFromErrorData
- node_modules/react-native/Libraries/BatchedBridge/NativeModules.js:95:55 in <unknown>
- ... 5 more stack frames from framework internals

 */


