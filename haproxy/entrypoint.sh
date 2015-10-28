#!/bin/bash

set -eo pipefail

until confd -onetime -node ${ETCD_NODE}; do
    echo "[nginx] waiting for confd to create initial nginx configuration..."
    sleep 5
done

# Start the Nginx service using the generated config
echo "[nginx] starting nginx service..."
service nginx start

echo "[nginx] confd is now monitoring etcd for changes..."
exec confd -interval 10 -node ${ETCD_NODE} "$@"