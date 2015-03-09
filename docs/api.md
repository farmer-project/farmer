any actions return a json with code and a message

Example:
```
{
    'code' : 200, // status code
    'message' : "error" //
}
```

any api return a json with HeaderStatusCode and a json with
```
{
    'result' : {},
    'error': 'ERROR MESSAGE'
}
```


APIs

GET /api/container/<containerID>
DELETE /api/container/<containerID>
GET /api/container/production/list
POST /api/container/production/create
GET /api/container/staging/list
POST /api/container/staging/create
GET /api/images


POST /api/container/staging/create
request example:
```
{
 	"name": "ravaj",
	"repo": "ssh://git@git.ravaj.ir:2011/rav/ravaj.git",
	"package": "cdn",
    "branch": "feature-vagrant-docker-provider"
}
```