// TODO: any config value fetch from gruop vars
module.exports = {
    // ### Production environment
    "production": {
        "port": "80",
        "docker_server": "http://localhost:4242",
        "log_dir": "/var/www/logs",
        "greenhouse": "/code/stages",
        "production": "/code/productions",
        "packages_path": "/packages",
        "git_private_key": "/home/vagrant/.ssh/id_rsa",
        "database_username": "root",
        "database_password": "v3&d0raR@v@j^hmad",
        "database_name": "farmer",
        "database_host": "127.0.0.1",
        "database_dialect": "mysql"
    },

    "staging": {
        "port": "80",
        "docker_server": "http://localhost:4242",
        "log_dir": "/var/www/logs",
        "greenhouse": "/code/stages",
        "production": "/code/productions",
        "packages_path": "/packages",
        "git_private_key": "/home/vagrant/.ssh/id_rsa",
        "database_username": "root",
        "database_password": "vendoraRavajAram",
        "database_name": "farmer_staging",
        "database_host": "127.0.0.1",
        "database_dialect": "mysql"
    },

    // ### Development **(default)**
    "development": {
        "port": "8080",
        "docker_server": "http://localhost:4242",
        "log_dir": "/var/www/logs",
        "greenhouse": "/code/stages",
        "production": "/code/productions",
        "packages_path": "/packages",
        "git_private_key": "/home/vagrant/.ssh/id_rsa",
        "database_username": "root",
        "database_password": null,
        "database_name": "farmer_development",
        "database_host": "127.0.0.1",
        "database_dialect": "mysql"
    }
};
