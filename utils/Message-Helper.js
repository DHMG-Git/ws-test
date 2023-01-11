export default class MessageHelper {


    static command = Object.freeze({
        LOGIN: "Login",
        HEARTBEAT: "Heartbeat",
        INFO: "GetDeviceInfo",
        REGISTER_EVENT: "RegisterEvent",
        UNLOCK: "App.StartUnlockProcess",
        UNLOCK_PERMANENT: "App.StartUnlockProcess",
        SET_APPSTATE: "App.SetAppState",
        DENY_ENTRY: "App.StartDenyProcess",
        USER_ENTRY: "userEntry",
    });

    static method = Object.freeze({
        REQUEST: "Req",
        RESPONSE: "Rsp",
        EVENT: "Evt",
    })


    constructor(deviceConfig) {
        this.deviceConfig = deviceConfig;
    }


    updateMessage(message) {

        const data = JSON.parse(message);

        if(data.payload) {
            this._token = data.token;
            this._message = data.payload;
        }

        if(data.Cmd === MessageHelper.command.HEARTBEAT) {
            this._token = null;
            this._message = JSON.parse(message);
            return;
        }

        if(data.Cmd) {
            this._message = JSON.parse(message);
            this._token = this.message.Data.token;
        }

    }

    get message() {
        return this._message;
    }

    get token() {
        return this._token;
    }

    get clientType() {

        if( this.message.Data.device) {
            return this.message.Data.device;
        } else {
            return 'native_app';
        }
    }

    get cmd() {

        if(this.message.cmd) {
            return this.message.cmd;
        }

        if(this.message.Cmd) {
            return this.message.Cmd;
        }

        return null;
    }

    get location() {
        return this.message.location;
    }

    get device_type() {
        return this.message.device_type;
    }

    get user() {
        return this.message.user;
    }

    createMessage(type, payload) {

        let cmd;
        let mt;
        let data;

        type = type.toLowerCase();

        switch (type) {
            case 'login':
                cmd = MessageHelper.command.LOGIN;
                mt = MessageHelper.method.REQUEST;
                data = {
                    User: this.deviceConfig.user,
                    Password: this.deviceConfig.password
                };
                break;
            case 'heartbeat':
                cmd = MessageHelper.command.HEARTBEAT;
                mt = MessageHelper.method.REQUEST;
                break;
            case 'info':
                cmd = MessageHelper.command.INFO;
                mt = MessageHelper.method.REQUEST;
                break;
            case 'events':
                cmd = MessageHelper.command.REGISTER_EVENT;
                mt = MessageHelper.method.REQUEST;
                data = {Event: "App.*"}
                break;
            case 'unlock':
                cmd = MessageHelper.command.UNLOCK;
                mt = MessageHelper.method.REQUEST;
                data = {
                    DisplayText: `Hallo, ${payload.userName}!<br>Schön, dass du da bist!`,
                    IconName: "arrow-up",
                    Device: "INTERNAL"
                }
                break;
            case 'unlock_permanent':
                cmd = MessageHelper.command.SET_APPSTATE;
                mt = MessageHelper.method.REQUEST;
                data = {
                    Device: "INTERNAL",
                    AppState: "IDLE",
                    DisplayText: "Tritt herein, bring Glück herein",
                    IconName: "user-slash"
                }
                break;
            case 'deny_entry':
                cmd = MessageHelper.command.DENY_ENTRY;
                mt = MessageHelper.method.REQUEST;
                data = {
                    "DisplayText": "Keine Berechtigung! <br><small>Bei Fragen kannst du dich an das WBT-Team wenden.</small>",
                    "Timeout_ms": 5000,
                    "IconName": "frown",
                    "Device": "INTERNAL"
                };
                break;
            case 'user_entry':
                cmd = MessageHelper.command.USER_ENTRY;
                mt = MessageHelper.method.REQUEST;
                data = {
                    "location": this.location,
                    "device_type": this.device_type,
                    "user": this.user,
                };
                break;
            default:
                console.error('Unknown Message Type');
        }

        let MessageObject = {};
        MessageObject.Cmd = cmd;
        MessageObject.MT = mt;
        MessageObject.GID = this.deviceConfig.gid;
        data ? MessageObject.Data = data : '';

        return MessageObject;
    }

    send(message) {

    }


    heartbeat() {
        console.info(`Device with GUID: ${this.deviceConfig.gid} got a heartbeat`)
        return JSON.stringify((this.createMessage('heartbeat')))
    }

    login() {
        let message = this.createMessage('login');
        return JSON.stringify(message);
    }

    getDeviceInfo() {
        console.log('getting device Info');
        let message = this.createMessage('info');
        return JSON.stringify(message);
    }

    registerToEvents() {
        console.log('register to events');
        let message = this.createMessage('events');
        return JSON.stringify(message);
    }

    unlock(userName) {
        console.log('unlocking!');
        let message = this.createMessage('unlock', {userName: userName});
        return JSON.stringify(message);
    }

    unlockPermanent() {
        let message = this.createMessage('unlock_permanent');
        return JSON.stringify(message);
    }

    denyEntry() {
        console.log('Entry denied!');
        let message = this.createMessage('deny_entry');
        return JSON.stringify(message);
    }

    generateMessage(action) {
        let message = this.createMessage(action);
        return JSON.stringify(message);
    }
}