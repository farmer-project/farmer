/**
 * Created by majid on 5/28/15.
 */
'use strict';

function CommitAction() {
    this.configuration = {};
}

CommitAction.prototype.options = function (opts) {
    if (opts.container) {
        delete opts['container'];
    }

    if (opts.repo) {
        delete opts['repo'];
    }

    if (opts.tag) {
        delete opts['tag'];
    }

    if (opts.comment) {
        delete opts['comment'];
    }

    if (opts.author) {
        delete opts['author'];
    }

    this.configuration = opts;
};

CommitAction.prototype.executeOn = function (serverConfig) {
    var deferred = Q.defer(),
        options = {
            uri: urljoin(serverConfig.api, '/commit', this.queryParameters),
            method: 'POST',
            json: this.configuration
        };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 201) {
            // 201 – no error
            deferred.resolve({
                code: response.statusCode,
                result: body,
                message: 'successful'
            });

        } else {
            var errorMsg = '';
            if (response.statusCode == 404) { errorMsg = 'no such container'; }
            if (response.statusCode == 500) { errorMsg = 'server error'; }
            deferred.reject({
                code: response.statusCode,
                result: null,
                message: errorMsg
            });
        }

    });

    return deferred.promise;
};

module.exports = CommitAction;
