import Helper from "../utils/Helper.js";

export class Request {

    _token = '';
    _payload = null;

    constructor(request) {

        this.token = request.token;
        this.payload = request.payload;

    }

    set token(token) {
        if(Helper::validateToken(token)) {
            this._token = token;
        }
    }

    get token() {
        return this._token;
    }


    get payload() {
        return this._payload;
    }

    set payload(value) {
        this._payload = value;
    }
}