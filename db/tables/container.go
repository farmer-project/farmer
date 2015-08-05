package tables

import (
	"time"
)

type Container struct {
	ID        string `gorm:"primary_key" sql:"type:varchar(64)"`
	CreatedAt time.Time
	UpdatedAt time.Time
	DeletedAt *time.Time

	Image  string `sql:"type:varchar(255);not null"`
	Status string `sql:"type:varchar(255);not null"`
}
