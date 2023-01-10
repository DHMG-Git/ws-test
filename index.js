import DeviceController from "./controllers/device-controller.js";
import ApiService from "./services/ApiService.js";
import WebsocketServer from "./services/WebsocketServer.js";

const wss = WebsocketServer.makeInstance();
