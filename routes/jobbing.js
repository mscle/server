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
var MONEY = 5;

exports.MONEY = MONEY;
exports.WEIGHT_MIN = WEIGHT_MIN * WEIGHT_DELTA;
exports.WEIGHT_MAX = WEIGHT_MAX * WEIGHT_DELTA;

exports.MES_TOOEARLY = { message: "Слишком рано, попробуйте позже"};
exports.MES_NOTSTARTED = { message: "Работа не начата"};
exports.MES_STARTEDYET = { message: "Работа уже начата"};
exports.MES_TIMEISUP = { message: "Время истекло"};
exports.MES_NOWEIGHT = { message: "Не выбран вес"};

function clearJobbing(session)
{
    session.player.jobbing = { isStarted: false, startedTime: null, weight: null };
}

function initJobbing(session)
{
    if (session.player.jobbing == undefined)
    {
        clearJobbing(session);
    }
}

function getExpiredTime(session)
{
    var time = new Date(session.player.jobbing.startedTime);
    return DateHelper.addSeconds(time, exports.JOBBING_TIMER + MAX_DELAY);
}

exports.setNextTime = function (id, value) {
    return Player.update(id, { $set: { "jobbing.nextTime": value } });
};

exports.get = function (session) {
    initJobbing(session);

    var playerId = session.player.id,
        now = new Date(),
        jobbing = session.player.jobbing;

    if (jobbing.isStarted == true && jobbing.startedTime)
    {
        if (now > getExpiredTime(session))
        {
            jobbing.isStarted = false;
            jobbing.startedTime = null;
            jobbing.weight = null;
            return Player.find(playerId, 'jobbing').then(
                function (playerJobbing) {
                    var now = new Date();
                    if (now < playerJobbing.nextTime) {
                        return P.call(function (fulfill) {
                            fulfill(exports.MES_TOOEARLY);
                        });
                    }
                    else {
                        jobbing.weight = (Math.floor(Math.random() * (WEIGHT_MAX - WEIGHT_MIN + 1)) + WEIGHT_MIN) * WEIGHT_DELTA;
                        return P.call(function (fulfill) {
                            fulfill(jobbing.weight);
                        });
                    }
                }
            );
        }
        else
        {
            return P.call(function (fulfill) {
                fulfill(exports.MES_STARTEDYET);
            });
        }
    }
    else
    {
        return Player.find(playerId, 'jobbing').then(
            function (playerJobbing) {
                var now = new Date();
                if (now < playerJobbing.nextTime) {
                    return P.call(function (fulfill) {
                        fulfill(exports.MES_TOOEARLY);
                    });
                }
                else {
                    if (!jobbing.weight) {
                        jobbing.weight = (Math.floor(Math.random() * (WEIGHT_MAX - WEIGHT_MIN + 1)) + WEIGHT_MIN) * WEIGHT_DELTA;
                    }
                    return P.call(function (fulfill) {
                        fulfill(jobbing.weight);
                    });
                }
            }
        );
    }
};

exports.start = function(session){
    initJobbing(session);
    var playerId = session.player.id;
    var jobbing = session.player.jobbing;

    if (jobbing.isStarted == true)
    {
        return P.call(function (fulfill) {
            fulfill(exports.MES_STARTEDYET);
        });
    }
    else
    {
        if (jobbing.weight == null)
        {
            return P.call(function (fulfill) {
                fulfill(exports.MES_NOWEIGHT);
            });
        }
        else
        {
            var now = new Date();
            jobbing.isStarted = true;
            jobbing.startedTime = now;
            exports.setNextTime(playerId, DateHelper.setNextTime(now, exports.JOBBING_PERIOD));
            return P.call(function (fulfill) {
                fulfill();
            });
        }
    }
};

exports.complete = function (session) {
    var playerId = session.player.id;
    var jobbing = session.player.jobbing;

    if (jobbing.isStarted == false)
    {
        return P.call(function (fulfill) {
            fulfill(exports.MES_NOTSTARTED);
        });
    }
    else
    {
        if (new Date() < getExpiredTime(session))
        {
            clearJobbing(session);
            return Player.incMoney(playerId, MONEY).then(
                function () {
                    return P.call(function (fulfill) {
                        fulfill(MONEY);
                    });
                }
            );
        }
        else
        {
            clearJobbing(session);
            return P.call(function (fulfill) {
                fulfill(exports.MES_TIMEISUP);
            });
        }
    }
};
