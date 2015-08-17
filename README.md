# Farmer
Farmer is a PaaS that offers a simple API to create, deploy and manage small SaaS projects.

## Getting Started
Farmer comes with a installer script with will bring a complete Farmer up in a few minutes.  
You only need an **Ubuntu 14.04** and **git** client installed.

### Quick Installation
As simple as running commands below:
```sh
cd ~
git clone https://github.com/farmer-project/farmer.git
sudo hack/install
```

### Farmer Client
To access and manage your Farmer server you need to run our command-line program.  
Visit [**farmer-cli**](https://github.com/farmer-project/farmer-cli) for installation intructions.

# Known Issues
* Currently farmer API (default on port `5549`) is accessible by **everyone**. Please protect this port (e.g. Using an `iptables` rule) if you want to use Farmer in production environment.

# Roadmap

- [X] [**v0.1**](farmer-project/farmer#3) Basic box management API with domain management.
- [ ] **v0.2** Admin UI (with AngularJS).
- [ ] **v0.3** Box backups.
- [ ] **v0.4** Statistics.
- [ ] **v0.5** Load balancing and multi-server support.
 
## License
Visit our **[MIT License](LICENSE)**.
