package farmer

import "errors"

type Domain struct {
	ID    uint   `gorm:"primary_key" json:"-"`
	BoxID int    `sql:"index" json:"-"`
	Url   string `sql:"type:varchar(255);" json:"url"`
	Port  string `sql:"type:varchar(8);" json:"port"`
}

func (box *Box) AddDomain(url string, port string) error {
	if !box.Production.openPort(port) {
		return errors.New("Port number '" + port + "' is not open on box '" + box.Name + "' so you cannot assign a domain to it")
	}

	if box.domainExist(url) {
		return errors.New("Domain '" + url + "' is already assigned to box '" + box.Name + "'")
	}

	box.Domains = append(box.Domains, Domain{
		BoxID: box.ID,
		Url:   url,
		Port:  port,
	})

	return nil
}

func (box *Box) DeleteDomain(url string) error {
	if !box.domainExist(url) {
		return errors.New("Domain '" + url + "' is not assigned to box '" + box.Name + "'")
	}

	var domains []Domain
	for _, d := range box.Domains {
		if d.Url != url {
			domains = append(domains, d)
		}
	}

	box.Domains = domains
	return nil
}

func (r *Release) openPort(port string) bool {
	for _, p := range r.Ports {
		if p == port+"/udp" || p == port+"/tcp" {
			return true
		}
	}

	return false
}

func (box *Box) domainExist(domain string) bool {
	for _, d := range box.Domains {
		if d.Url == domain {
			return true
		}
	}

	return false
}
