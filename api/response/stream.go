package response

type StreamResponse struct {
	AmqpURI   string `json:"amqp_uri"`
	QueueName string `json:"queue_name"`
}
