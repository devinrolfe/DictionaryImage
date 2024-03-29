import React from "react";
import {Svg} from "expo";

export default class Word extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            id: props.id,
            word: props.word,
            definition: props.definition || "",
            x: props.x,
            y: props.y,
            width: props.width,
            height: props.height,
        };
        this.updateCurrentWordAndCurrentDefinition = props.updateCurrentWordAndCurrentDefinition;

        this.callUpdateCurrentWordAndCurrentDefinition = this.callUpdateCurrentWordAndCurrentDefinition.bind(this);
    };


    callUpdateCurrentWordAndCurrentDefinition() {
        this.updateCurrentWordAndCurrentDefinition(this.state.word, this.state.definition);
    }

    render() {
        return(
            <Svg.Rect
                key={this.state.id}
                x={this.state.x}
                y={this.state.y}
                width={this.state.width}
                height={this.state.height}
                stroke="black"
                strokeWidth="1"
                fill="#14de54"
                fillOpacity="0.3"
                onPress={() => this.callUpdateCurrentWordAndCurrentDefinition()}
            />

        );
    }

}