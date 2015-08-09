package db

import (
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
	"os"
)

var DB gorm.DB

func Connect() {
	cs := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True",
		os.Getenv("FARMER_DB_USERNAME"),
		os.Getenv("FARMER_DB_PASSWORD"),
		os.Getenv("FARMER_DB_HOST"),
		os.Getenv("FARMER_DB_PORT"),
		os.Getenv("FARMER_DB_NAME"),
	)

	DB, _ = gorm.Open("mysql", cs)
	DB.LogMode(os.Getenv("FARMER_DEBUG") == "true")
}

func Close() error {
	if err := DB.Close(); err != nil {
		return err
	}
	return nil
}
