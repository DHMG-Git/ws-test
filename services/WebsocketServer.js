import WebSocket, {WebSocketServer} from 'ws';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import MessageHelper from "../utils/Message-Helper.js";
import Helper from "../utils/Helper.js";
import {ServerConfig} from "../config/server-config.js";

export default class Wss {

    static instance = null;

    static makeInstance() {
        if (Wss.instance === null) {
            return new Wss();
        } else {
            return this.instance;
        }
    }

    static addToClientList(client, type) {
        if (type === 'device_handler') {
            Wss.deviceHandlerClients.push(client);
        }
    }

    static notifyDeviceHandler(jsonMessage) {
        Wss.deviceHandlerClients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(jsonMessage);
            }
        });
    }

    // we save the declared devicehandlers, to push EventMessages on Loginevents.
    static deviceHandlerClients = [];

    constructor() {

        const server = createServer({

        });
        Wss.instance = new WebSocketServer({
            server: server,
            clientTracking: true
        });

        server.listen(3666)

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
            this.handleMessage(data, isBinary, ws);
        });
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
                    const openMessage = this.messageHelper.createMessage('user_entry');
                    Wss.notifyDeviceHandler(JSON.stringify(openMessage));
                    break;
                case 'WhoIAm':
                    Wss.addToClientList(ws, this.messageHelper.clientType)

            }
        } else {
            console.log('401');
        }


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
