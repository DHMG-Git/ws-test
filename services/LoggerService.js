import fs from 'fs';

export default class LoggerService {


    static writeLog(message) {

        const content = `${new Date().toLocaleString()} ${message} \n`


        fs.appendFile('log/file.log', content, err => {
            if (err) {
                console.error(err);
            }
            // done!
        });
    }



}