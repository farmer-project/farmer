# .farmer.yml
A file that exists in root of a project repository, describing how should Farmer create a container for that project and what scripts to run after creation or new version deployment of that project. (e.g. `create.sh`, `deploy.sh`)

Below is a full example of how `.farmer.yml` looks like:
```yml
image: myorg/myapp:tag # Docker image name, available locally on server OR on hub.docker.io.
ports:
 - 22/tcp
 - 80/tcp
 - 4435/udp
env:
 - FOO=bar
 - BAZ=qux
scripts:
 create: "devops/create.sh"
 deploy: "devops/deploy.sh"
```

### image
Tells farmer which image to use when creating a Docker container for your instance.

### ports
Defines which ports you want to expose when creating the Docker container.

### env
Environment variables you want to pass to the Docker container.

### scripts
Tells farmer to run some scripts on specific events:
* **create** After a box has been create and project code is cloned successfully. Usually useful for initialization of your project. (e.g. php `composer install`)
* **deploy** After a project code has been updated by a new branch or version tag. Usually useful for running migrations and cleaning up. (e.g. symfony `php app/console cache:clear`)

**NOTE** Box source code in under `/app` directory in the container. A `create` can look like this:

```sh
# devops/farmer/create.sh

#!/bin/bash
cd /app
composer.phar install -v
```

