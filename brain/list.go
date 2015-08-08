package brain
import (
	"github.com/farmer-project/farmer/db/models"
	"github.com/farmer-project/farmer/db"
)

type boxInspect struct {
	Name string

}

func List() ([]models.Box, error) {
	db.Connect()
	boxes := []models.Box{}
	db := db.DbConnection.Find(&boxes)

	return boxes, db.Error
}
