package station

import (
	"github.com/streadway/amqp"
	"math/rand"
	"os"
	"strconv"
	"time"
)

type Stream struct {
	server     string
	connection *amqp.Connection
	channel    *amqp.Channel
	Queue      amqp.Queue
}

func CreateStream() (*Stream, error) {
	stream := &Stream{}

	conn, err := amqp.Dial(os.Getenv(AMDIN_AMQP_SERVER))
	if err != nil {
		return stream, err
	}

	stream.connection = conn

	ch, err := conn.Channel()
	if err != nil {
		return stream, err
	}

	stream.channel = ch

	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	queueName := "farmer" + strconv.Itoa(int(time.Now().Unix())) + strconv.Itoa(r.Int())

	q, err := ch.QueueDeclare(
		queueName, // name
		false,  // durable
		true,   // delete when unused
		false,  // exclusive
		false,  // no-wait
		nil,    // arguments
	)

	stream.Queue = q

	return stream, err
}

func (s *Stream) Write(b []byte) (n int, err error) {
	return len(b), s.channel.Publish(
		"",             // exchange
		s.Queue.Name, // routing key
		false,          // mandatory
		false,          // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        b,
		})
}

func (s *Stream) Close() error {
	return s.connection.Close()
}

func (s *Stream) AmpqURI() string {
	return "amqp://guest:guest@" + os.Getenv(AMQP_SERVER_IP)
}
