package models

import "time"

type Box struct {
	ID        uint       `gorm:"primary_key" json:"-"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`

	Name     string `sql:"not null;unique" json:"name"`
	Repo     string `sql:"type:varchar(255);" json:"repo_url"`
	Pathspec string `sql:"type:varchar(255);not null" json:"pathspec"`

	ContainerID string `sql:"type:char(64);not null" json:"container_id"`
	Image       string `sql:"type:varchar(255);not null" json:"image"`
	Status      string `sql:"type:varchar(255);not null" json:"status"`
}
