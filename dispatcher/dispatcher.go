package dispatcher

var listeners map[string][]func(interface{})

func init() {
	listeners = make(map[string][]func(interface{}))
}

func Trigger(eventName string, payload interface{}) {
	for _, listener := range listeners[eventName] {
		listener(payload)
	}
}

func On(eventName string, listener func(interface{})) {
	listeners[eventName] = append(listeners[eventName], listener)
}
