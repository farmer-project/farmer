#!/usr/bin/env bash

HOME="/etc/farmer"
CONFIG_FILE=$HOME/farmer.yml

mkdir -p $HOME
touch $CONFIG_FILE
chmod -Rf 644 $CONFIG_FILE

echo -n "Listening on Port: "
read port

echo -n "docker api (http://192.168.1.1:4243): "
read docker_api

echo -n "Greenhouse volume (absolute path): "
read greenhouse_vol

echo -n "Farmland volume (absolute path): "
read farmland_vol


CONFIG="
port: "$port"
docker_api: "$docker_api"
greenhouse_vol: "$greenhouse_vol"
farmland_vol: "$farmland_vol

# save/overwrite general config
echo "$CONFIG" > $CONFIG_FILE