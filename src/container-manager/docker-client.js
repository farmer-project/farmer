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

DockerClient.prototype.buildInfoAction = function () {
    return new InfoAction();
};

DockerClient.prototype.buildListImagesAction = function () {
    return new ListImagesAction();
};

DockerClient.prototype.buildStopAction = function () {
    return new StopAction();
};

DockerClient.prototype.buildRemoveAction = function () {
    return new RemoveAction();
};

module.exports = new DockerClient();
