var Db = require('../../db');
var Jobbing = require('../../routes/jobbing');
var DateHelper = require('../../controllers/date');

var PLAYER_ID_TEST = 0;

exports.setUp = function(callback)
{
    Db.init(Db.DEVELOP).then(callback, console.log);
};

exports.startSuccess = function(test)
{
    var session = { player: { id: PLAYER_ID_TEST } };
    var past = DateHelper.setNextTime(new Date(), -Jobbing.JOBBING_PERIOD - 1);

    Jobbing.setNextTime(PLAYER_ID_TEST, past).then(
        function()
        {
            return Jobbing.get(session);
        },
        console.log
    ).then(
        function(weight)
        {
            test.equal(session.player.jobbing.isStarted, false);
            test.equal(session.player.jobbing.startedTime, null);
            test.equal(session.player.jobbing.weight != undefined, true);
            test.equal(Jobbing.WEIGHT_MIN <= weight && weight <= Jobbing.WEIGHT_MAX, true);
            return Jobbing.start(session);
        },
        console.log
    ).then(
        function()
        {
            test.equal(session.player.jobbing.isStarted, true);
            test.done();
        }
    );
};

exports.getFail = function(test)
{
    var session = { player: { id: PLAYER_ID_TEST } };
    var future = DateHelper.addMinutes(new Date(), 1);

    Jobbing.setNextTime(PLAYER_ID_TEST, future).then(
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
    var session = { player: { id: PLAYER_ID_TEST } };
    var past = DateHelper.setNextTime(new Date(), -Jobbing.JOBBING_PERIOD - 1);

    Jobbing.setNextTime(PLAYER_ID_TEST, past).then(
        function()
        {
            return Jobbing.get(session);
        },
        console.log
    ).then(
        function()
        {
            return Jobbing.start(session);
        },
        console.log
    ).then(
        function()
        {
            test.equal(session.player.jobbing.isStarted, true);
            return Jobbing.complete(session);
        },
        console.log
    ).then(
        function(money)
        {
            test.equal(session.player.jobbing.isStarted, false);
            test.equal(money == Jobbing.MONEY, true);
            test.done();
        },
        console.log
    );
};

exports.completeNotStarted = function(test)
{
    var session = { player: { id: PLAYER_ID_TEST } };
    var now = DateHelper.addMinutes(new Date(), 1);

    Jobbing.setNextTime(PLAYER_ID_TEST, now).then(
        function()
        {
            return Jobbing.start(session);
        },
        console.log
    ).then(
        function(answer)
        {
            test.equal(session.player.jobbing.isStarted, false);
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
    var session = { player: { id: PLAYER_ID_TEST } };
    var past = DateHelper.setNextTime(new Date(), -Jobbing.JOBBING_PERIOD - 1);

    Jobbing.setNextTime(PLAYER_ID_TEST, past).then(
        function()
        {
            return Jobbing.get(session);
        },
        console.log
    ).then(
        function()
        {
            return Jobbing.start(session);
        },
        console.log
    ).then(
        function()
        {
            test.equal(session.player.jobbing.isStarted, true);

            session.player.jobbing.startedTime =
                DateHelper.addSeconds(session.player.jobbing.startedTime, -Jobbing.JOBBING_TIMER - 10);

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