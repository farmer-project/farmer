package farmer

import "errors"

type Domain struct {
	ID    uint   `gorm:"primary_key" json:"-"`
	BoxId uint   `sql:"index" json:"-"`
	Url   string `sql:"type:varchar(255);" json:"url"`
	Port  string `sql:"type:varchar(8);" json:"port"`
}

func (box *Box) AddDomain(url string, port string) error {
	if !box.openPort(port) {
		return errors.New("Invalid port number")
	}

	if !box.duplicateDomain(url) {
		return errors.New("Duplicate domain name")
	}

	domain := Domain{
		BoxId: box.ID,
		Url:   url,
		Port:  port,
	}

	box.Domains = append(box.Domains, domain)
	return nil
}

func (box *Box) openPort(port string) bool {
	for _, p := range box.Ports {
		if p == port+"/udp" || p == port+"/tcp" {
			return true
		}
	}

	return false
}

func (box *Box) duplicateDomain(domain string) bool {
	for _, d := range box.Domains {
		if d.Url == domain {
			return false
		}
	}

	return true
}
