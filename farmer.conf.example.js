module.exports = {
    PORT: '8080',
    CONTAINER_SERVER_API: 'http://xxxxxxx:4242',
    RABBITMQ_CONFIG: {
        host: 'amqp://localhost:5657',
        login: 'xxxx',
        password: 'xxxxx'
    },
    LOG_DIR: '/xx/xxx/xxx',
    STORAGE: '/xxx',
    DOMAIN: 'xxxx.xx',
    SSH_CONFIG: {
        privateKey: '/PRIVATE/KEY/FILE/ADDRESS',
        username: 'xxxx',
        port: 22,
        passphrase: 'xxxxx'
    },
    REVERSE_PROXY: {
        rootConfig: 'REVERSE PROXY conf.d FOLDER ADDRESS',
        containerID: 'REVERSE_PROXY_CONTAINER_ID',
        destination_server_ip: 'xxx.xxx.xxx.xxx'
    },
    DB_USERNAME: 'xxxx',
    DB_PASSWORD: 'xxxxx',
    DB_NAME: 'farmer',
    DB_HOST: 'xxx.xxx.xxx.xxx',
    DB_DIALECT: 'mysql',
    DB_PORT: '3306'
};
