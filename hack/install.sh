#!/usr/bin/env bash

#
# This script is meant for quick & easy install via command line
#

if [[ $(id -u) -ne 0 ]]; then
    echo "Permission denied: run installer as root user"
    exit 1
fi

echo "Farmer installation"
echo "==================="
echo ""

HOME="/etc/farmer"
mkdir -p $HOME
touch $CONFIG_FILE
chmod -Rf 644 $CONFIG_FILE

echo -n "Listening on Port: "
read port

echo -n "docker api (http://192.168.1.1:4243): "
read docker_api

echo -n "Greenhouse volume (absolute path): "
read greenhouse_volume

echo -n "Farmland volume (absolute path): "
read farmland_volume


CONFIG="
LISTEN "$port"
DOCKER_API "$docker_api"
GREENHOUSE_VOLUME "$greenhouse_volume"
FARMLAND_VOLUME "$farmland_volume

# save/overwrite general config
echo "$CONFIG" > $CONFIG_FILE

echo ""
echo "Successfully installed"
echo ""