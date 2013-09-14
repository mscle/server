var Db = require('../../db');
var Player = require('../../controllers/player');
var Base = require('../../routes/base');

var PLAYER_ID = 0;
var PLAYER_ID_CREATED = 1;
var AUTH_KEY = '123';
var AUTH_KEY_WRONG = 'wrong';

exports.setUp = function(callback)
{
    Db.init(Db.DEVELOP).then(callback, console.log);
};

exports.authSuccess = function(test)
{
    var session = {};

    Base.auth(session, PLAYER_ID, AUTH_KEY).then(
        function(answer)
        {
            test.equal(answer, Base.MES_SUCCESS);
            test.equal(session.player.id, PLAYER_ID);
            test.done();
        },
        console.log
    );
};

exports.authCreate = function(test)
{
    var session = {};

    Base.auth(session, PLAYER_ID_CREATED, AUTH_KEY).then(
        function(answer)
        {
            test.equal(answer, Base.MES_SUCCESS);
            test.equal(session.player.id, PLAYER_ID_CREATED);

            return Player.find(PLAYER_ID_CREATED, '_id');
        },
        console.log
    ).then(
        function(_id)
        {
            test.equal(_id != undefined, true);
            return Player.remove(PLAYER_ID_CREATED);
        },
        console.log
    ).then(test.done, console.log);
};

exports.authFail = function(test)
{
    var session = {};

    Base.auth(session, PLAYER_ID, AUTH_KEY_WRONG).then(
        function(answer)
        {
            test.equal(answer, Base.ERR_AUTH_FAIL);
            test.done();
        },
        console.log
    );
};

