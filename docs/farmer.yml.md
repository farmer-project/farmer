# .farmer.yml
A file that exists in root of a project repository, describing how should Farmer create a container for that project and what scripts to run after creation or new version deployment of that project. (e.g. `create.sh`, `deploy.sh`)

Below is a full example of how `.farmer.yml` looks like:
```yml
image: farmer/base-lemp
ports:
 - 22/tcp
 - 80/tcp
env:
 - foo=bar
 - baz=qux
scripts:
 create: "devops/create.sh"
 deploy: "devops/deploy.sh"
```

### image
Tells farmer to use which image to use when creating a Docker contianer for your instance.

### ports
Defines which ports you want to expose when creating the Docker container.

### env
Environment variables you want to pass to your box instance.

### scripts
Tell farmer to run some scripts on specific events:
* **create** After a box has been create and project code is cloned successfully. Usually useful for initialization of your project. (e.g. php `composer install`)
* **deploy** After a project code has been updated with a new branch or version tag. Usually useful for clean up and running migrations. (e.g. symfony `php app/console cache:clear`)
