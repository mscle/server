//var fs = require('fs');
//    var logFile = fs.createWriteStream('./myLogFile.log', {flags: 'a'});
//    app.use(express.logger({stream: logFile}));

var Vow = require('vow');

exports.start = function ()
{
    var Express = require('express');
    var Db = require('./db');
    var Routes = require('./routes/routes');

    var app = Express();
    app.configure(function ()
    {
        app.use(Express.compress());
        app.use(Express.cookieParser());
        app.use(Express.session({ secret:'iuBviX21'}));
    });

    var promise = Vow.promise();
    var errorHandler = function (err)
    {
        promise.reject(err);
    };

    Db.init(Db.DEVELOP)
        .then(function ()
        {
            Routes.init(app);
            app.listen(8080);
            promise.fulfill();
        }, errorHandler);

    return promise;
};


