import {ApiConfig} from "../config/api-config.js";

export default class Helper {

    static validateToken(token) {
        return token === ApiConfig.token;
    }

}