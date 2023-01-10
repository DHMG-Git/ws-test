import AbstractDeviceService from "./AbstractDeviceService.js";
import ApiService from "./ApiService.js";
import LoggerService from "./LoggerService.js";

export default class CheckinDeviceService extends AbstractDeviceService{


    constructor(device) {
        super(device);
        this.api = ApiService.makeInstance();
    }


    wsOnOpen(e) {
        console.log(`Connected to device ${this.device.gid}`);
        if(e.type === 'open') {
            this.login();
        }
    }

    wsOnMessage(e) {
        this.messageHandler.updateMessage(e)

        switch (this.messageHandler.cmd) {
            case 'Login':
                this.registerForEvent();
                break;
            case 'Heartbeat':
                LoggerService.writeLog(this.messageHandler.cmd);
                break;
            case 'App.CardIdent':
                LoggerService.writeLog(`Card ${this.messageHandler.CardUid} is trying to unlock`);
                this.tryToCheckInUser(this.messageHandler.CardUid);
                break;
            case 'GetDeviceInfo':
            case 'App.StartDenyProcess':
            case 'App.AppStateChanged':
            case 'RegisterEvent':
                break;
            default:
                console.log(this.messageHandler.message);
        }
    }

    login() {
        console.log('Trying to log in');
        this.wsConnection.send(this.messageHandler.login());
    }

    tryToCheckInUser(accessUid) {
        this.api.checkInUser({accessUid: accessUid, location: this.device.location}).then(resp => {
            const respObject = JSON.parse(resp[0]);

            console.log(respObject);

            //todo implement sercure token check;
            if(respObject.state) {
                this.welcomeUserToCourse(respObject);
            } else {
                this.informUserAboutError(respObject);
            }


        }).catch(error => {
            console.log(error);
        });
    }
}