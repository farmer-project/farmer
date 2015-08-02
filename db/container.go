package db

import "github.com/jinzhu/gorm"

type Container struct {
	gorm.Model
	Cid     string `sql:"not null;unique"`
	Volumes string `sql:"type:varchar(255);not null"`
	Ports   string `sql:"type:varchar(255);not null"`
	Image   string `sql:"type:varchar(255);not null"`
	Status  string `sql:"type:varchar(255);not null"`
	Config  string `sql:"not null"`
}
