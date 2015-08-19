
# Farmer [![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/farmer-project/farmer)    
Farmer is a PaaS that offers a simple API to create, deploy and manage small SaaS projects.

## Getting Started
Farmer comes with a installer script with will bring a complete Farmer up in a few minutes.  
You only need an **Ubuntu 14.04** and **git** client installed on your server.

### Quick Installation
As simple as running commands below:
```sh
git clone https://github.com/farmer-project/farmer.git
sudo hack/install
```

### How does it work?
Farmer works very simple for almost any small project.

1. You put a [`.farmer.yml`](docs/farmer.yml.md) in root of your git-hosted project. (Read more about [`.farmer.yml`](docs/farmer.yml.md))
2. You use [`farmer-cli`](https://github.com/farmer-project/farmer-cli) to [create a single instance](https://github.com/farmer-project/farmer-cli#create-a-box) of your project with a unique name.
3. You [assign a domain](https://github.com/farmer-project/farmer-cli#assign-a-domain-to-a-box) to you box using farmer-cli.
4. Your web app in online.

You can repeat this process for as many projects and as many boxes as you like. That's why it can be used as a small PaaS for your SaaS :)

### Farmer Client
To access and manage your Farmer server you need to run our command-line program.  
Visit [**farmer-cli**](https://github.com/farmer-project/farmer-cli) for installation intructions.

## Known Issues
* Currently farmer API (default on port `5549`) is accessible by **everyone**. Please protect this port (e.g. Using an `iptables` rule) if you want to use Farmer in production environment.
* You need to manually grant access to `farmer` user in your farmer-hub RabbitMQ container. You can login using admin credentials provided after server setup. (e.g. `http://xx.xx.xx.xx:15672/`). Easily go to `admin` section and click on **farmer** user then [grant access to `/` vhost](http://i.stack.imgur.com/NSnyR.png). 

## Roadmap

- [X] [**v0.1**](https://github.com/farmer-project/farmer/issues/16) Basic box management API with domain management.
- [ ] **v0.2** Admin UI (with AngularJS).
- [ ] **v0.3** Box backups.
- [ ] **v0.4** Statistics.
- [ ] **v0.5** Load balancing and multi-server support.
 
## License
Visit our **[MIT License](LICENSE)**.
