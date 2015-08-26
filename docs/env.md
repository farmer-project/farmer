# Farmer Enviroment Variables
```toml
FARMER_DEBUG = true
FARMER_API_PORT = 5594
FARMER_DOCKER_API = "tcp://172.17.0.1:4243"
FARMER_BOX_DATA_LOCATION = "/var/farmer/box"
FARMER_CONSUMER_AMQP_URI = "amqp://farmer:farmer@172.17.0.1:5672/"
FARMER_ADMIN_AMQP_URI = "amqp://admin:admin@172.17.0.1:5672/"
FARMER_DB_USERNAME = "root"
FARMER_DB_PASSWORD = ""
FARMER_DB_HOST = "172.17.0.1"
FARMER_DB_PORT = 3306
FARMER_DB_NAME = "farmer"
FARMER_REVERSE_PROXY_CONTAINER_ID = "farmer-nginx"
FARMER_REVERSE_PROXY_LOCATION = "/etc/nginx/farmer"
FARMER_GIT_SSH = "/etc/nginx/farmer"
FARMER_TEMP_DATA_LOCATION = "/var/farmer/temp"
```