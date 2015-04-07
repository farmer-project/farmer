require 'yaml'

Vagrant.require_version '>= 1.5'

Vagrant.configure("2") do |config|

    if File.exists?(File.join(File.dirname(__FILE__), 'deployment/vars.yml'))
        _vars = YAML.load(
            File.open(
                File.join(File.dirname(__FILE__), 'deployment/vars.yml'),
                File::RDONLY
            ).read
        )
    else
        _vars = YAML.load(
            File.open(
                File.join(File.dirname(__FILE__), 'deployment/vars.default.yml'),
                File::RDONLY
            ).read
        )
    end

    # Configure the box to use
    config.vm.box       = 'trusty64'
    config.vm.box_url   = 'http://files.vagrantup.com/trusty64.box'
    config.vm.hostname  = _vars["domain"]

    # config.vm.provider :virtualbox do |vb|
    #  vb.gui = true
    # end

    # Configure the network interfaces
    config.vm.network   :private_network, ip: "192.168.33.105"
    config.ssh.forward_agent = true

    # Configure shared folders
    config.vm.synced_folder ".", "/var/www", id: "application",  :nfs => true, :linux__nfs_options => ["rw", "no_root_squash", "async"]

    # Configure VirtualBox environment
    config.vm.provider :virtualbox do |v|
        v.name = _vars['domain']
        v.customize [ "modifyvm", :id, "--memory", 512 ]
        v.customize [ "modifyvm", :id, "--natdnshostresolver1", "on" ]
        v.customize [ "modifyvm", :id, "--natdnsproxy1", "on" ]
    end

    # Update host OS /etc/hosts
    if Vagrant.has_plugin?('vagrant-hostsupdater')
        config.hostsupdater.remove_on_suspend = true
        config.hostsupdater.aliases = ['phpmyadmin.' + _vars['domain']]
    end

    # Provision the box
    config.vm.provision :ansible do |ansible|
        ansible.verbose = "vv"
        ansible.playbook = "deployment/ansible/site.yml"
    end
end
