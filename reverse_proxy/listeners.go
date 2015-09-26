package reverse_proxy

import (
	"github.com/farmer-project/farmer/dispatcher"
	"github.com/farmer-project/farmer/farmer"
)

func init() {
	dispatcher.On("new_release", func(payload interface{}) {
		if box, ok := payload.(*farmer.Box); ok {
			ConfigureDomains(box)
			Restart()
		}
	})
}
