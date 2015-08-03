package tables

import "github.com/jinzhu/gorm"

type Box struct {
	gorm.Model

	Name        string    `sql:"not null;unique"`
	Repo        string    `sql:"type:varchar(255);"`
	Pathspec    string    `sql:"type:varchar(255);not null"`
	Container   Container // One-To-One relationship (has one)
	ContainerID string
}
