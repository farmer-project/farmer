package station

import (
	"github.com/streadway/amqp"
	"math/rand"
	"os"
	"time"
	"strconv"
)

type Hub struct {
	server     string
	connection *amqp.Connection
	channel    *amqp.Channel
	Queue      amqp.Queue
}

func (hub *Hub) CreateConnection() (*Hub, error) {
	conn, err := amqp.Dial(os.Getenv("AMPQ_SERVER"))
	if err != nil {
		return hub, err
	}

	hub.connection = conn

	ch, err := conn.Channel()
	hub.channel = ch

	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	roomID := "room" + strconv.Itoa(int(time.Now().Unix())) + strconv.Itoa(r.Int())

	q, err := ch.QueueDeclare(
		roomID, // name
		false,  // durable
		true,   // delete when unused
		false,  // exclusive
		false,  // no-wait
		nil,    // arguments
	)

	hub.Queue = q

	return hub, err
}

func (hub *Hub) Write(b []byte) (n int, err error) {
	return len(b), hub.channel.Publish(
		"",             // exchange
		hub.Queue.Name, // routing key
		false,          // mandatory
		false,          // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        b,
		})
}

func (hub *Hub) Close() error {
	return hub.connection.Close()
}
