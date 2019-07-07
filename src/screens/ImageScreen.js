import React from "react";
import Dimensions from 'Dimensions';
import { Alert, Text, View, TouchableOpacity, Image, Button, ImageBackground, StyleSheet} from "react-native";
import { Camera, Permissions, Svg } from 'expo';
import { Entypo } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import Loader from "../utils/Loader";
import Word from "../utils/Word";

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
            wordsLoaded: false,
            words: null,
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

        // get width and height of this element
        this.setState({
            dimensions: {
                width: Dimensions.get('window').width,
                height: Dimensions.get('window').height,
            },
        });
    };

    resetCamera = () => {
        console.log("reset camera");
        this.setState({
            cameraReadyPosition: true,
            isLoading: false,
            wordsLoaded: false,
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
                        console.log(data);

                        data.TextDetections.forEach(function(textDetection) {
                           console.log(textDetection.DetectedText);
                        });

                        // filter for type Word, then transform into new object
                        const words = data.TextDetections
                            .filter(textDetection => textDetection.Type === 'WORD')
                            .map((textDetection, index) =>
                                new Word({
                                    id: index,
                                    word: textDetection.DetectedText,
                                    x: textDetection.Geometry.BoundingBox.Left * this.state.dimensions.width,
                                    y: textDetection.Geometry.BoundingBox.Top * (this.state.dimensions.height * 0.9),
                                    width: textDetection.Geometry.BoundingBox.Width * this.state.dimensions.width,
                                    height: textDetection.Geometry.BoundingBox.Height * this.state.dimensions.height
                                }));

                        this.setState({
                            isLoading: false,
                            words: words,
                            wordsLoaded: true,
                            cameraReadyPosition: false,
                            imageTaken: photo.uri,
                        });

                    }
                }.bind(this));

                // TODO:
                // 1. Need to get definitions of each word (only supporting english)
                // 2. Rewind SVG drawing
                // 3. hide accessKeys

            })
            .catch(() => {
                Alert.alert("Oops, try again!");

                this.setState({
                    isLoading: false,
                    cameraReadyPosition: true,
                    imageTaken: null,
                });
            });

            // should do loading. This is being done before async is done
            this.setState({
                isLoading: true,
            })

        }
    };

    render() {
        const {navigate} = this.props.navigation;

        // is Loading
        if (this.state.isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <Loader />
                </View>
            );
        }

        // if picture taken
        if (this.state.imageTaken && !this.state.cameraReadyPosition && this.state.wordsLoaded) {

            return (
                <View>
                    <ImageBackground source={{uri: this.state.imageTaken}} style={{width: '100%', height: '100%'}}>

                        <Svg key={this.state.id} height="100%" width="100%">
                            {this.state.words.map(word => word.render())}
                        </Svg>

                        {/* Need rewind button */}

                    </ImageBackground>
                </View>


            )
        }
        // if camera is ready for picture taken
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

