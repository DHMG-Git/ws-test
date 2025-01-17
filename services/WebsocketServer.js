import WebSocket, {WebSocketServer} from 'ws';
import MessageHelper from "../utils/Message-Helper.js";
import Helper from "../utils/Helper.js";
import {ServerConfig} from "../config/server-config.js";
import {ApiConfig} from "../config/api-config.js";
import {v4 as uuid} from 'uuid';


export default class Wss {

    static instance = null;
    static displayClients = [];

    static makeInstance() {
        if (Wss.instance === null) {
            return new Wss();
        } else {
            return this.instance;
        }
    }

    static addToClientList(client, type, location) {
        if (type === 'device_handler') {
            Wss.deviceHandlerClients.push(client);
        }
        if (type === 'display') {
            if(Wss.displayClients[location]) {
                Wss.displayClients[location].push(client);
            } else {
                Wss.displayClients[location] = [];
                Wss.displayClients[location].push(client);
            }
        }
    }

    static notifyDeviceHandler(jsonMessage) {
        Wss.deviceHandlerClients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(jsonMessage);
            }
        });
    }

    static notifyDisplays(location) {
        if(Wss.displayClients[location]) {
            Wss.displayClients[location].forEach(function each(client) {
                if (client.readyState === WebSocket.OPEN) {

                    const updateObject = {
                        token: ApiConfig.token,
                        payload: {
                            location: location
                        }
                    }

                    client.send(JSON.stringify(updateObject));
                }
            });
        }


    }

    // we save the declared devicehandlers, to push EventMessages on Loginevents.
    static deviceHandlerClients = [];

    constructor() {

        Wss.instance = new WebSocketServer({
            port: ServerConfig.port,
            host: ServerConfig.host,
            clientTracking: true
        });

        console.log(`Server up and running. Listening at Port ${ServerConfig.port}`)

        this.messageHelper = new MessageHelper({});
        this.registerEventHandlers();

    }

    registerEventHandlers() {
        console.log('Registered Event handlers');

        Wss.instance.on('connection', (ws) => {
            this.wssOnConnection(ws);
        });
    }

    wssOnConnection(ws) {
        console.log('New Client Connected');
        ws.on('message', (data, isBinary) => {
            this.createUniqueIdForClient(ws);
            this.handleMessage(data, isBinary, ws);
        });
    }

    createUniqueIdForClient(ws) {
        ws.clientId = uuid();
    }

    handleMessage(data, isBinary, ws) {
        if (isBinary) {
            throw new Error('got Binary Data, pleas implement the handling');
        }
        const message = data.toString();

        this.messageHelper.updateMessage(message);

        if (Helper.validateToken(this.messageHelper.token)) {
            switch (this.messageHelper.cmd) {
                case 'userEntry':
                    const openMessage = this.messageHelper.createMessage('user_entry', null, ws.clientId);
                    console.log(openMessage);
                    Wss.notifyDeviceHandler(JSON.stringify(openMessage));
                    break;
                case 'WhoIAm':
                    Wss.addToClientList(ws, this.messageHelper.clientType, this.messageHelper.location);
                    break;
                case 'new_check_in':
                    Wss.notifyDisplays(this.messageHelper.location);
                    break;
                case 'notifyApp':
                    this.notifyClient();
            }
        } else {
            if(this.messageHelper.cmd !== 'Heartbeat') {
                console.log('401 - Missing Token in Request');
            }
        }


    }

    notifyClient() {

        Wss.instance.clients.forEach( client => {
           if(client.clientId === this.messageHelper.clientId) {
               client.send(this.messageHelper.appResponseMessage);
           }
        })
    }

    wsOnOpen(e) {
        throw new Error('wsOnOpen has to be implemented');
    }

    wsOnError(e) {
        console.error('An Error occured!');
        console.log(e);
    }

    wsOnMessage(e) {
        throw new Error('wsOnMessage has to be implemented');
    }

    wsOnClose(e) {
        console.info('Connection closed! Goodbye!')
    }

}
