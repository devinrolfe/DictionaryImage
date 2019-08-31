import React from "react";
import Dimensions from 'Dimensions';
import { Alert, Text, View, TouchableOpacity, Image, Button, ImageBackground, StyleSheet} from "react-native";
import { Camera, Permissions, Svg } from 'expo';
import { Entypo } from '@expo/vector-icons';
import { Buffer } from 'buffer';
import Loader from "../utils/Loader";
import RekognitionClient from "../clients/RekognitionClient";
import DictionaryClient from "../clients/DictionaryClient";
import Word from "../utils/Word";
import Overlay from 'react-native-modal-overlay';

export default class ImageScreen extends React.Component {

    static navigationOptions = ({ navigation }) => {
        return {
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
            currentWord: null,
            currentWordDefinition: null,
            modalVisible: false
        };

        this.rekognitionClient = new RekognitionClient();
        this.dictionaryClient = new DictionaryClient();

        this.snap = this.snap.bind(this);
        this.updateCurrentWordAndCurrentDefinitionAndShowModal = this.updateCurrentWordAndCurrentDefinitionAndShowModal.bind(this);
        this.setModalVisible = this.setModalVisible.bind(this);
        this.resetCamera = this.resetCamera.bind(this);

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

    updateCurrentWordAndCurrentDefinitionAndShowModal(word, definition) {
        this.setState({
            currentWord: word,
            currentWordDefinition: definition,
            modalVisible: true,
        });
    }

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

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

    async loadDefinitionsOfWords() {
        if (this.state.words) {

            const updateCurrentWordAndCurrentDefinitionAndShowModal = this.updateCurrentWordAndCurrentDefinitionAndShowModal;

            const updatedWords = await Promise.all(this.state.words.map(async (word, index) => {
                let definitionOfWord = await this.dictionaryClient.getWordDefinition(word.state.word);

                return new Word({
                    id: index,
                    word: word.state.word,
                    definition: definitionOfWord,
                    x: word.state.x,
                    y: word.state.y,
                    width: word.state.width,
                    height: word.state.height,
                    updateCurrentWordAndCurrentDefinition: updateCurrentWordAndCurrentDefinitionAndShowModal,
                });
            }));

            this.setState({words: updatedWords});
        }
    }

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

                const detectedTexts = this.rekognitionClient.detectTexts(params, this.state.dimensions.width, this.state.dimensions.height);

                detectedTexts.then(function(words) {

                    this.setState({
                        isLoading: false,
                        words: words,
                        wordsLoaded: true,
                        cameraReadyPosition: false,
                        imageTaken: photo.uri,
                    }, this.loadDefinitionsOfWords);

                }.bind(this));

                // TODO:
                // 1. clean up code

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
                        <Svg height="100%" width="100%">
                            {this.state.words.map(word => word.render())}
                        </Svg>
                    </ImageBackground>

                    <Overlay visible={this.state.modalVisible} onClose={() => this.setModalVisible(false)} closeOnTouchOutside>
                        <Text h1>{this.state.currentWord}</Text>
                        <Text>{this.state.currentWordDefinition}</Text>
                    </Overlay>
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
    }
});

