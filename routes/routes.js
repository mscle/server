var Db = require('../db');
var Base = require('./base');
var Player = require('../controllers/player');
var Factor = require('../controllers/factor');
var Dics = require('./dics');
var Gym = require('./gym');
var Jobbing = require('./jobbing');

var ERR_DEFAULT = { error: "Ошибка :( Перезапустите игру"};
var ERR_ISNOT_AUTH = "Player is not authorized";
var ERR_ROUTE = "Invalid route";
var ERR_METHOD = "Invalid method";
var ERR_PARAM = "Invalid param: ";

function handler(req, res)
{
    var successHandler = function(answer)
    {
        if (answer == undefined)answer = true;
        res.jsonp(answer);
    };

    var errorHandler = function(err)
    {
        console.log("error: " + err + " url: " + req.url);
        res.jsonp(ERR_DEFAULT);
    };

    var param = function(name, type)
    {
        if (type == undefined)type = 'string';
        var value = req.query[name];
        if (value == undefined) throw ERR_PARAM + name;
        if (type == 'int')value = parseInt(value);
        return value;
    };

    if (req.url == '/favicon.ico')
    {
        successHandler({});
        return;
    }

    var session = req.session;
    var route = req.params[0];

    if (route == '/')
    {
        var playerId = param('playerId', 'int');
        var authKey = param('authKey');
        Base.auth(session, playerId, authKey).then(successHandler, errorHandler);
        return;
    }

    if (session.auth == undefined || session.auth == false)
    {
        errorHandler(ERR_ISNOT_AUTH);
        return;
    }

    var id = session.player.id;
    var method = param('method');

    switch (route)
    {
        case '/dics':
            Dics.get().then(successHandler, errorHandler);
            break;

        case '/private':
            Player.updateState(id).then(
                function()
                {
                    Player.find(id, 'private').then(successHandler, errorHandler);
                }, errorHandler);
            break;

        case '/public':
            Player.updateState(id).then(
                function()
                {
                    Player.find(id, 'public').then(successHandler, errorHandler);
                }, errorHandler);
            break;

        case '/awards':
            Player.updateState(id).then(
                function()
                {
                    Player.find(id, 'awards').then(successHandler, errorHandler);
                }, errorHandler);
            break;

        case '/body':
            Player.updateState(id).then(
                function()
                {
                    Player.find(id, 'body').then(successHandler, errorHandler)
                }, errorHandler);
            break;

        case '/factors':
            if (method == 'get')
            {
                Player.updateState(id).then(
                    function()
                    {
                        Player.find(id, 'factors').then(successHandler, errorHandler);
                    }, errorHandler);
            }
            else if (method == 'buy')
            {
                Player.updateState(id).then(
                    function()
                    {
                        var factorId = param('factorId', 'int');
                        Factor.buy(id, factorId).then(successHandler, errorHandler);
                    }, errorHandler);
            }
            break;

        case '/jobbing':
            if (method == 'get')Jobbing.get(session).then(successHandler, errorHandler);
            else if (method == 'complete')Jobbing.complete(session).then(successHandler, errorHandler);
            else errorHandler(ERR_METHOD);
            break;

        case '/gym':
            if (method == 'execute')
            {
                var gymId = param('gymId', 'int');
                var exerciseId = param('exerciseId', 'int');
                var weight = param('weight', 'int');
                var repeats = param('repeats', 'int');
                Gym.execute(id, gymId, exerciseId, weight, repeats).then(successHandler, errorHandler);
            }
            else errorHandler(ERR_METHOD);
            break;

        default:
            errorHandler(ERR_ROUTE);
    }
}

exports.init = function(app)
{
    app.get('*', function(req, res)
    {
        try
        {
            handler(req, res);
        }
        catch (e)
        {
            console.log("error: " + e + " url: " + req.url);
            res.jsonp(ERR_DEFAULT);
        }
    });
};