package station

import (
	"github.com/streadway/amqp"
)

type rabbitmq struct {
	url			string
	username	string
	password	string
}

func (r *rabbitmq) install() {

}

func (r *rabbitmq) uninstall() {

}

func (r *rabbitmq) push(string) {

}

func (r *rabbitmq) close() {

}