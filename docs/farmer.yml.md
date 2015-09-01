# .farmer.yml
A file that exists in root of a project repository, describing how should Farmer create a container for that project and what scripts to run after creation or new version deployment of that project. (e.g. `create.sh`, `deploy.sh`)

Below is a full example of how `.farmer.yml` looks like:
```yml
image: myorg/myapp:tag # Docker image name, available locally on server OR on hub.docker.io.
home: /app # Default: /app (Should be an absolute path)
ports:
 - 22/tcp
 - 80/tcp
 - 4435/udp
env:
 - FOO=bar
 - BAZ=qux
shared:
 - app/config/parameters.yml
 - app/Resources/settings.yml
 - web/media
scripts:
 create: "devops/create.sh"
 deploy: "devops/deploy.sh"
 test: "devops/test.sh"
```

### image
Tells farmer which image to use when creating a Docker container for your instance.

### home
Directory to put your project source code inside the container.

### ports
Defines which ports you want to expose when creating the Docker container.

### env
Environment variables you want to pass to the Docker container.

### shared
An array of files and directories (which should exists after code is cloned and `create` script is ran) which you want keep between your app deploys (revisions). e.g. Configuration files, user uploaded content.

### scripts
Tells farmer to run some scripts on specific events:
* **create** After a box has been create and project code is cloned successfully. Usually useful for initialization of your project. (e.g. php `composer install`)
* **deploy** After a project code has been updated by a new branch or version tag. Usually useful for running migrations and cleaning up. (e.g. symfony `php app/console cache:clear`)
* **test** Before deploying on the real production box farmer tries to dry-run deployment on a cloned box (which is exactly a copy of the real box) then it runs `test` script inside that cloned box, this script can exit with `0` code or any other code if any error happens. If this script exits with `0` code farmer assumes deployment was successful, so it replaces real production box with the cloned one and marks it as a new revision.

**NOTE** Box source code in under home directory (e.g `/app`) in the container. A `create` script can look like this:

```sh
# devops/farmer/create.sh

#!/bin/bash
cd /app
composer.phar install -v
```
