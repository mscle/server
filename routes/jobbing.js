var Db = require('../db');
var Player = require('../controllers/player');
var DateHelper = require('../controllers/date');
var P = require('../p');

exports.JOBBING_PERIOD = 1;
var WEIGHT_MIN = 20;
var WEIGHT_MAX = 95;
var WEIGHT_DELTA = 2.5;
exports.JOBBING_TIMER = 60;
var MAX_DELAY = 3;
var PRIZE = { money: 5, gold: 1};

exports.WEIGHT_MIN = WEIGHT_MIN * WEIGHT_DELTA;
exports.WEIGHT_MAX = WEIGHT_MAX * WEIGHT_DELTA;

exports.MES_TOOEARLY = { message: "Слишком рано, попробуйте позже"};
exports.MES_NOTSTARTED = { message: "Работа не начата"};
exports.MES_TIMEISUP = { message: "Время истекло"};

exports.setExpire = function(id, value)
{
    return P.call(function(fulfill, reject)
    {
        Player.update(id, { $set: { "jobbing.expire": value } }).then(fulfill, reject);
    });
};

exports.get = function(session)
{
    var playerId = session.player.id;
    return P.call(function(fulfill, reject)
    {
        Player.find(playerId, 'jobbing').then(
            function(jobbing)
            {
                var now = new Date();
                if (jobbing.expire > now)
                {
                    session.player.jobbing = { started: false };
                    fulfill(exports.MES_TOOEARLY);
                }
                else
                {
                    session.player.jobbing = { started: true, lastTime: now };
                    var weight = (Math.floor(Math.random() * (WEIGHT_MAX - WEIGHT_MIN + 1)) + WEIGHT_MIN) * WEIGHT_DELTA;
                    exports.setExpire(playerId, DateHelper.expire(now, exports.JOBBING_PERIOD));
                    fulfill(weight);
                }
            },
            reject
        );
    });
};

exports.complete = function(session)
{
    return P.call(function(fulfill, reject)
    {
        if (session.player.jobbing.started == false)
        {
            fulfill(exports.MES_NOTSTARTED);
            return;
        }
        session.player.jobbing.started = false;

        //var lastTime = new Date(session.player.jobbing.lastTime);
        if (DateHelper.addSeconds(session.player.jobbing.lastTime, exports.JOBBING_TIMER + MAX_DELAY) < new Date())
            fulfill(exports.MES_TIMEISUP);
        else
            Player.incPrize(session.player.id, PRIZE).then(
                function()
                {
                    fulfill(PRIZE);
                },
                reject
            );
    });
};
