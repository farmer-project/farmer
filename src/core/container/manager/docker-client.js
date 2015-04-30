var
    CreateAction = require('./actions/CreateAction'),
    StartAction = require('./actions/StartAction'),
    InfoAction = require('./actions/InfoAction'),
    StopAction = require('./actions/StopAction'),
    RemoveAction = require('./actions/RemoveAction'),
    ListImagesAction = require('./actions/ListImagesAction')
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

module.exports = DockerClient;
