package station

type station interface {
	install()
	uninstall()
	push(string)
	close()
}
