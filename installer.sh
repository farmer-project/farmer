#!/usr/bin/env bash

if [[ $(id -u) -ne 0 ]]; then
    echo "Permission denied: run installer as root user"
    exit 1
fi

echo "Farmer installation"
echo "==================="
echo ""

. installation/scripts/install.sh

echo ""
echo "Successfully installed"
echo ""