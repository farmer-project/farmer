package reverse_proxy

import (
	"github.com/farmer-project/farmer/Godeps/_workspace/src/github.com/fsouza/go-dockerclient"
	"github.com/farmer-project/farmer/farmer"
	"io/ioutil"
	"os"
	"path/filepath"
	"text/template"
)

var dockerClient *docker.Client

func init() {
	dockerClient, _ = docker.NewClient(os.Getenv("FARMER_DOCKER_API"))
}

func ConfigureDomains(box *farmer.Box) error {
	for _, domain := range box.Domains {
		if err := setReverseProxyConfig(box.IP, domain.Url, domain.Port); err != nil {
			return err
		}
	}

	return nil
}

func Restart() error {
	return dockerClient.RestartContainer("farmer-reverse-proxy", 1)
}

func setReverseProxyConfig(ip string, url string, port string) error {
	t := template.New("reverse_proxy")
	absPath, err := filepath.Abs("reverse_proxy/nginx.cfg")
	if err != nil {
		return err
	}

	reProxyFile, err := ioutil.ReadFile(absPath)
	if err != nil {
		return err
	}

	t, err = t.Parse(string(reProxyFile))
	if err != nil {
		return err
	}

	type reverseProxy struct {
		Domain      string
		ContainerIP string
		Port        string
	}

	reverseProxyConfigFileLocation := os.Getenv("FARMER_REVERSE_PROXY_LOCATION")
	filePath := reverseProxyConfigFileLocation + "/" + url + "." + port + ".conf"

	os.Remove(filePath)
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}

	return t.Execute(file, &reverseProxy{
		Domain:      url,
		ContainerIP: ip,
		Port:        port,
	})
}
