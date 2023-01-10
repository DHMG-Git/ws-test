import WebSocket, {WebSocketServer} from 'ws';
import MessageHelper from "../utils/Message-Helper.js";

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
        if(type === 'device_handler') {
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

        Wss.instance = new WebSocketServer({
            port: 8080,
            host: 'localhost',
            clientTracking: true
        });

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
        if(isBinary) {
            throw new Error('got Binary Data, pleas implement the handling');
        }
        const message = data.toString();
        this.messageHelper.updateMessage(message);
        switch (this.messageHelper.cmd) {
            case 'userEntry':
                const openMessage = this.messageHelper.createMessage('user_entry');
                Wss.notifyDeviceHandler(JSON.stringify(openMessage));
                break;
            case 'WhoIAm':
                Wss.addToClientList(ws, this.messageHelper.clientType)

        }

        //todo implement token check
        // if(Helper.validateToken(message.token)) {
        //
        //
        // } else {
        //     throw new Error('Authentication Failed');
        // }




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
