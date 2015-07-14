#!/usr/bin/env bash

#
# execute this script by main terminal context (. hack/start.sh)
#

# set system config as enviroment variables
IFS=' ' read -a CONFIG_FILE_ARRAY <<< $(cat /etc/farmer/farmer.cfg)
arrayLen=${#CONFIG_FILE_ARRAY[@]}

for (( i=0; i<${arrayLen}; i+=2 ));
do
    export ${CONFIG_FILE_ARRAY[$i]}"="${CONFIG_FILE_ARRAY[$i+1]}
done

echo "Application Env set"

go run $(pwd)"/main.go"