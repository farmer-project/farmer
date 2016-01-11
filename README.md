# Farmer
## This project is abondoned in favor of [ravaj-group/farmer](https://github.com/ravaj-group/farmer)
Farmer is a PaaS that offers a simple API to create, deploy and manage small SaaS projects.   

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/farmer-project/farmer)
[![Build Status](http://ci.ravaj.ir/buildStatus/icon?job=farmer-integration-tests&style=plastic)](http://ci.ravaj.ir/job/farmer-integration-tests)
[![Join the chat at https://gitter.im/farmer-project/farmer](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/farmer-project/farmer?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

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
4. Your web app is up and running.

You can repeat this process for as many projects and as many boxes as you like. That's why it can be used as a small PaaS for your SaaS :)

### Farmer Client
To access and manage your Farmer server you need to run our command-line program.  
Visit [**farmer-cli**](https://github.com/farmer-project/farmer-cli) for installation intructions.

## Known Issues
* Currently farmer API (default on port `5549`) is accessible by **everyone**. Please protect this port (e.g. Using an `iptables` rule) if you want to use Farmer in production environment.

## Roadmap

- [X] [**v0.1**](https://github.com/farmer-project/farmer/issues/16) Basic box management API with domain management.
- [X] [**v0.2**](https://github.com/farmer-project/farmer/issues/17) Fail-safe Staging feature, Farmer integration tests.
- [ ] **v0.3** Rollback to older releases
- [ ] **v0.4** Admin UI in AngularJS
- [ ] **v0.5** Statistics
- [ ] **v0.6** Load balancing and multi-server support

## License
Visit our **[MIT License](LICENSE)**.
