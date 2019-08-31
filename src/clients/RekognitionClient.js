import Word from "../utils/Word";
import awsRekognitionInfo from "./aws-rekognition-info";

var AWS = require('aws-sdk');

export default class RekognitionClient {

    constructor() {
        AWS.config.update(awsRekognitionInfo);
        this.rekognitionClient = new AWS.Rekognition();
    }

    detectTexts(params, width, height) {

        return this.rekognitionClient.detectText(params).promise()
            .then(function(data) {
                // filter for type Word, then transform into new object
                const words = data.TextDetections
                    .filter(textDetection => textDetection.Type === 'WORD')
                    .map((textDetection, index) => {

                        return new Word({
                            id: index,
                            word: textDetection.DetectedText,
                            x: textDetection.Geometry.BoundingBox.Left * width,
                            y: textDetection.Geometry.BoundingBox.Top * (height * 0.9),
                            width: textDetection.Geometry.BoundingBox.Width * width,
                            height: textDetection.Geometry.BoundingBox.Height * height
                        })});

                return words;
            }).
            catch(function(err) {
                console.log(err);
            });
    }

}