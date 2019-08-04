
import Amplify, { API, graphqlOperation } from "aws-amplify";
import aws_config from '../../aws-exports';
import * as queries from "../graphql/queries"

Amplify.configure(aws_config);

export default class DictionaryClient {

    async getWordDefinition(word) {
        try {
            const response = await API.graphql(graphqlOperation(queries.getSingleWord, {word: word}));
            return response.data.getSingleWord.definition;
        } catch(err) {
            return "";
        }
    }

}