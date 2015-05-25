module.exports = {
    PORT: '8080',
    LOG_DIR: '/xx/xxx/xxx',
    STORAGE: '/xxx',
    DOMAIN: 'xxxx.xx',
    DB_USERNAME: 'xxxx',
    DB_PASSWORD: 'xxxxx',
    DB_NAME: 'farmer',
    DB_HOST: 'xxx.xxx.xxx.xxx',
    DB_DIALECT: 'mysql',
    DB_PORT: '3306',
    CONTAINER: {
        types: ['docker'],
        default: 'docker'
    },
    RABBITMQ_CONFIG: {
        host: 'amqp://xxx.xxx.xxx.xxx:5657',
        login: 'xxxx',
        password: 'xxxxx'
    },
    SSH_CONFIG: {
        privateKey: '/PRIVATE/KEY/FILE/ADDRESS',
        username: 'xxxx',
        port: 22,
        passphrase: 'xxxxx'
    },
    REVERSE_PROXY: {
        rootConfig: 'REVERSE PROXY conf.d FOLDER ADDRESS',
        containerID: 'REVERSE_PROXY_CONTAINER_ID',
        server: 'SERVER_TAG'
    },
    SERVERS: {
        SERVER_TAG: {
            docker_api: 'http://xxxx:xxx',
            ip: 'xxx.xxx.xxx.xxx'
        }
    }
};
