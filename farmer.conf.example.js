module.exports = {
    // ### Production environment
    "production": {
        "port": 80,
        "docker_server": "http://localhost:4242",
        "log_dir": "/path/to/log/folder",
        "database_username": "XXXXXX",
        "database_password": "XXXXXXXXXX",
        "database_name": "XXXXXXXX",
        "database_host": "127.0.0.1",
        "database_dialect": "mysql"
    },

    "staging": {
        "port": 80,
        "docker_server": "http://localhost:4242",
        "log_dir": "/path/to/log/folder",
        "database_username": "XXXXXXXXX",
        "database_password": "XXXXXXXXXXXXXXX",
        "database_name": "XXXXXXXXXXXXX",
        "database_host": "127.0.0.1",
        "database_dialect": "mysql"
    },

    // ### Development **(default)**
    "development": {
        "port": 8080,
        "docker_server": "http://localhost:4242",
        "log_dir": "/path/to/log/folder",
        "database_username": "XXXXXXXXXXXXXXXXXX",
        "database_password": "XXXXXXXXXXXXX",
        "database_name": "XXXXXXXXXXXXXXXXXXX",
        "database_host": "127.0.0.1",
        "database_dialect": "mysql"
    }
};
