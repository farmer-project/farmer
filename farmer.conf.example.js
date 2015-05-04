module.exports =
{
    /**
     * Core Options
     */
    "domain": "ravaj.ir",
    "port": "8080",

    "station_server": "http://station.dev",
    "docker_server": "http://localhost:4242",

    "log_dir": "/var/www/logs",
    "greenhouse": "/code/stages",
    "production": "/code/productions",

    "database_username": "root",
    "database_password": null,
    "database_name": "farmer",
    "database_host": "127.0.0.1",
    "database_dialect": "mysql",

    /**
     * Plugin: Shell
     */
    "container_private_key": "/home/vagrant/bare/key/mykey"
};