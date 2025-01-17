export const ApiConfig = {

        isSecure: true,
        endpoint: '/api/v1/',
        host: process.env.NODE_ENV === 'development' ? 'wbt-2021.ddev.site' : 'www.wir-bewegen-tirol.at',
        token: 'amfOdBqCIsvOvgHnCTsqNobznVC8Q5HH9ah3JOdV2lk2iQMiYtQfdsytB6iVBtHV',
        endpoints: {
            getDeviceConfig:  'configurations',
            checkPermission:  'user',
            checkin:  'userCheckin',
        }
    };
