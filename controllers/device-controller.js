import {Device} from "../models/device.js";

export default class DeviceController {

    static devices = [];


    static removeDevice(device) {
        const tidToRemove = device.gid();
        const indexToRemove = Device.devices.findIndex(device => {
            return device.gid() === tidToRemove;
        })
        DeviceController.devices.splice(indexToRemove, 1);
    }

    static findDeviceByGid(gid) {
        return DeviceController.devices.find(device => {
            return gid === device.gid;
        })
    }

    static logAllDevices() {
        DeviceController.devices.forEach(device => {
            device.print();
        })
    }


    static addDevice(deviceConfig) {

        const device = new Device(deviceConfig);
        DeviceController.devices.push(device);
        console.info('Device ||| %s ||| added to controller', device.name);
    }


    constructor(deviceConfigs) {
        this.init(deviceConfigs);
    }

    init(deviceConfigs) {

        console.info(`Fetched ${deviceConfigs.length} device configs`);

        deviceConfigs.forEach(config => {
            DeviceController.addDevice(config);
        })

        console.info('DeviceController init all fetched devices');
    }

}