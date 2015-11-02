FROM nginx

ADD confd-0.10.0 /usr/local/bin/confd
RUN chmod u+x /usr/local/bin/confd
ADD confd.toml /etc/confd/conf.d/configuration.toml
ADD nginx.tmpl /etc/confd/templates/nginx.tmpl

ADD entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
