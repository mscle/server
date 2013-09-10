var Db = require('../../db');
var Jobbing = require('../../routes/jobbing');
var DateHelper = require('../../controllers/date');

var PLAYER_ID_TEST = 0;
var session = { player: { id: PLAYER_ID_TEST } };

exports.setUp = function(callback)
{
    Db.init(Db.DEVELOP).then(callback, console.log);
};

exports.getSuccess = function(test)
{
    var past = DateHelper.expire(new Date(), -Jobbing.JOBBING_PERIOD - 1);

    Jobbing.setExpire(PLAYER_ID_TEST, past).then(
        function()
        {
            return Jobbing.get(session);
        },
        console.log
    ).then(
        function(weight)
        {
            test.equal(session.player.jobbing.started, true);
            test.equal(Jobbing.WEIGHT_MIN <= weight && weight <= Jobbing.WEIGHT_MAX, true);
            test.done();
        },
        console.log
    );
};

exports.getFail = function(test)
{
    var now = DateHelper.addMinutes(new Date(), 1);

    Jobbing.setExpire(PLAYER_ID_TEST, now).then(
        function()
        {
            return Jobbing.get(session);
        },
        console.log
    ).then(
        function(answer)
        {
            test.equal(answer, Jobbing.MES_TOOEARLY);
            test.done();
        },
        console.log
    );
};

exports.completeSuccess = function(test)
{
    var past = DateHelper.expire(new Date(), -Jobbing.JOBBING_PERIOD - 1);

    Jobbing.setExpire(PLAYER_ID_TEST, past).then(
        function()
        {
            return Jobbing.get(session);
        },
        console.log
    ).then(
        function(answer)
        {
            test.equal(session.player.jobbing.started, true);
            return Jobbing.complete(session);
        },
        console.log
    ).then(
        function(answer)
        {
            test.equal(session.player.jobbing.started, false);
            test.equal(answer.money != undefined, true);
            test.done();
        },
        console.log
    );
};

exports.completeNotStarted = function(test)
{
    var now = DateHelper.addMinutes(new Date(), 1);

    Jobbing.setExpire(PLAYER_ID_TEST, now).then(
        function()
        {
            return Jobbing.get(session);
        },
        console.log
    ).then(
        function(answer)
        {
            test.equal(session.player.jobbing.started, false);
            return Jobbing.complete(session);
        },
        console.log
    ).then(
        function(answer)
        {
            test.equal(answer, Jobbing.MES_NOTSTARTED);
            test.done();
        },
        console.log
    );
};

exports.completeTimeIsUp = function(test)
{
    var past = DateHelper.expire(new Date(), -Jobbing.JOBBING_PERIOD - 1);

    Jobbing.setExpire(PLAYER_ID_TEST, past).then(
        function()
        {
            return Jobbing.get(session);
        },
        console.log
    ).then(
        function(answer)
        {
            test.equal(session.player.jobbing.started, true);

            session.player.jobbing.lastTime =
                DateHelper.addSeconds(session.player.jobbing.lastTime, -Jobbing.JOBBING_TIMER - 10);

            return Jobbing.complete(session);
        },
        console.log
    ).then(
        function(answer)
        {
            test.equal(answer, Jobbing.MES_TIMEISUP);
            test.done();
        },
        console.log
    );
};