import React from "react";
import {Text, View, TouchableOpacity, StyleSheet} from "react-native";
import { Camera, Permissions } from 'expo';
import { Entypo } from '@expo/vector-icons';
import Amplify, { API } from "aws-amplify";
import aws_config from "../../aws-exports";
var AWS = require('aws-sdk');


Amplify.configure({
    API: {
        endpoints: [
            {
                name: "rekognition",
                endpoint: "https://rekognition.us-west-2.amazonaws.com",
                service: "rekognition",
                region: "us-west-2"
            }
        ]
    }
});

export default class ImageScreen extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            camera: null,
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

            let photo = await this.camera.takePictureAsync({ quality: 0.5, base64: true });

            console.log("PHOTO DATA");
            console.log(photo.base64);
            const bytes = photo.base64;

            // ----------------------------------

            const apiName = "rekognition";
            const path = "/detect-text";
            const body = { Image: { Bytes: bytes } };

            const headers = {
                "X-Amz-Target": "RekognitionService.DetectText",
                "Content-Type": "application/x-amz-json-1.1"
            };

            const init = {
                body: body,
                headers: headers
            };

            return await API.post(apiName, path, init);


            // ----------------------------------

            // TODO: Below logic is not good. Photo size is too big. Need to scale size down
            // or investigate upload to s3
            // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Rekognition.html#detectText-property
            // https://docs.expo.io/versions/latest/sdk/camera/
            // https://aws.amazon.com/rekognition/faqs/
            // let is 5MB for Bytes, 15MB for s3

            // resize image to 5MB -
            // https://stackoverflow.com/questions/50257879/expo-camera-takepictureasync-imagemanipulator

            // let params = {
            //   Image: {
            //       S3Object: {
            //           Bucket: 'images-for-dictionary-image-app',
            //           Name: 'nike_picture.jpg'
            //       }
            //   }
            // };

            let params = {
                Image: {
                    Bytes: photo.base64
                }
            };

            // TODO
            // 1. Try to get image directly from file system and try.
            // 2. if that fails, then try uploading to s3 and then doing the call.

            // this.rekognitionClient.detectText(params, function(err, data) {
            //     if (err) {
            //         console.log("Bad Call");
            //         console.log(err);
            //     } else {
            //         console.log("Good Call");
            //         console.log(data);
            //     }
            // });


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


