package db

import (
	"fmt"

	"github.com/fsouza/go-dockerclient"
	_ "github.com/go-sql-driver/mysql"
	"github.com/jinzhu/gorm"
)

const DB_TYPE = "mysql"

var (
	DbConnection gorm.DB
	DbServer     *docker.Container
)

func Connect() (gorm.DB, error) {
	cs := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local",
		username,
		password,
		DbServer.NetworkSettings.IPAddress,
		"3306",
		db_name,
	)

	var err error
	DbConnection, err = gorm.Open(DB_TYPE, cs)
	return DbConnection, err
}

func Sync() {
	DbConnection.CreateTable(&Box{})
	DbConnection.CreateTable(&Container{})
	DbConnection.AutoMigrate(&Box{}, &Container{})
}

func Close() error {
	if err := DbConnection.Close(); err != nil {
		return err
	}
	return nil
}
