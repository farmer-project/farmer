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
        privateKey: '/xxx/xxx/xxx/xxx',
        username: 'xxxx',
        port: 22,
        passphrase: 'xxxxx'
    },
    DB_USERNAME: 'xxxx',
    DB_PASSWORD: 'xxxxx',
    DB_NAME: 'farmer',
    DB_HOST: 'xxxx.xxxx.xxxx.xxxx',
    DB_DIALECT: 'mysql',
    DB_PORT: '3306'
};
