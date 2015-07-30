var
    CreateAction = require('./docker-actions/CreateAction'),
    StartAction = require('./docker-actions/StartAction'),
    InfoAction = require('./docker-actions/InfoAction'),
    StopAction = require('./docker-actions/StopAction'),
    RestartAction = require('./docker-actions/RestartAction'),
    RemoveAction = require('./docker-actions/RemoveAction'),
    ListImagesAction = require('./docker-actions/ListImagesAction')
    ;

function DockerClient() {

}

DockerClient.prototype.buildCreateAction = function () {
    return new CreateAction();
};

DockerClient.prototype.buildStartAction = function () {
    return new StartAction();
};

DockerClient.prototype.buildInfoAction = function (identifier) {
    return new InfoAction(identifier);
};

DockerClient.prototype.buildListImagesAction = function () {
    return new ListImagesAction();
};

DockerClient.prototype.buildStopAction = function (identifier) {
    return new StopAction(identifier);
};

DockerClient.prototype.buildRemoveAction = function (identifier) {
    return new RemoveAction(identifier);
};

DockerClient.prototype.buildRestartAction = function (identifier) {
    return new RestartAction(identifier);
};

module.exports = DockerClient;
