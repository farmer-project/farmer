# Farmer Features
Here is a complete list of features farmer offers to its users.

## Glossary
Before you can start using farmer you need to know some terms.

### Box
A single container representing a full-stack single app with one or multiple domains assigned to it. You can host a wordpress blog on a box, and a Sylius e-commerce instance on another box, with different domains and fully isolated environments.

### .farmer.yml
This is heart of the Farmer. A simple file you place inside your project source code and farmer behaves based on configuration written in this file. [**Read more** about .farmer.yml here](farmer.yml.md).

### Scripts
Here is a list of scripts you can define in your [`.farmer.yml` file](farmer.yml.md)

#### create script
Runs once after code is cloned and box is created successfully. An example could be getting application dependecies. e.g. `composer install` for php apps or `npm install` for nodejs apps.

#### deploy script
Runs everytime you issue a `deploy` command (from API or farmer-cli). When the new code is fetched this script (which is included in the source code) will run. Some examples could be clearing the apps cache or rebuilding the web assets. e.g. `php app/console cache:clear` for Symfony2 apps.

#### status script
Before deploying on the real production box farmer tries to dry-run deployment on a cloned box (which is exactly a copy of the real box) then it runs `status` script inside that cloned box, this script can exit with `0` code or any other code if any error happens. If this script exits with `0` code farmer assumes deployment was successful, so it replaces real production box with the cloned one and marks it as a new revision.

## Features

### Create
TODO

### Deploy
TODO

### Domain
TODO

### Destroy
TODO

### List
TODO
