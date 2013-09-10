var Db = require('../../db');
var Player = require('../../controllers/player');
var Muscledb = require('../../muscledb/muscledb');
var DateHelper = require('../../controllers/date');
var Factor = require('../../controllers/factor');

//var updatePlayer = function()
//{
//    mongo.players.update(
//        { _id: PLAYER_ID_TEST },
//        {
//            $pushAll: { awards: [0, 1], factors: [1000, 1001, 1002], records: [
//                { _id: 0, value: 125, date: new Date(), isWR: false },
//                {_id: 1, value: 225, date: new Date(), isWR: true}
//            ] },
//            $set: { "body.0.power": 0.1, "body.1.power": 0.2, "body.3.power": 0.2, "body.4.power": 0.2,
//                "body.5.power": 0.3, "body.6.power": -0.1, "body.7.power": 0.1, "body.9.power": 0.1,
//                "body.10.power": 0.3,
//
//                "body.0.frazzle": 0.1, "body.1.frazzle": 0.5, "body.3.frazzle": 0.2, "body.4.frazzle": 0.9,
//                "body.5.frazzle": 1, "body.6.frazzle": 0.7, "body.7.frazzle": 0.1, "body.9.frazzle": 0.1,
//                "body.10.frazzle": 0.3
//            }
//        },
//        function()
//        {
//            callback();
//        }
//    );
//};

exports.setUp = function(callback)
{
    //Db.init(Db.DEVELOP).then(callback, console.log);
    Muscledb.recreate().then(callback, console.log);
};

var PLAYER_ID_TEST0 = 0;
var PLAYER_ID_TEST1 = 1;
var PLAYER_ID_TEST2 = 2;
var PLAYER_ID_TEST3 = 3;
var PLAYER_ID_TEST4 = 4;
var PLAYER_ID_TEST5 = 5;
var PLAYER_ID_NOT_EXISTS = -1;

exports.exists = function(test)
{
    Player.find(PLAYER_ID_TEST0, '_id').then(
        function(_id)
        {
            test.equal(_id != null, true);
            test.done();
        }
    );
};

exports.notExists = function(test)
{
    Player.find(PLAYER_ID_NOT_EXISTS, '_id').then(
        function(_id)
        {
            test.equal(_id == null, true);
            test.done();
        }
    );
};

exports.find = function(test)
{
    var field = 'public';
    Player.find(PLAYER_ID_TEST0, field).then(
        function(data)
        {
            test.equal(data != null, true);
            test.done();
        }
    );
};

exports.create = function(test)
{
    Player.find(PLAYER_ID_NOT_EXISTS, 'public').then(
        function(publicInfo)
        {
            test.equal(publicInfo == undefined, true);
            return Player.create(PLAYER_ID_NOT_EXISTS);
        }
    ).then(
        function()
        {
            return Player.find(PLAYER_ID_NOT_EXISTS, 'public');
        }
    ).then(
        function(publicInfo)
        {
            test.equal(publicInfo != undefined, true);
            test.done();
        }
    );
};

exports.incPrize = function(test)
{
    var prize = { money: 5, gold: 3};
    var privateInfo1 = null;

    Player.find(PLAYER_ID_TEST1, 'private').then(
        function(privateInfo)
        {
            privateInfo1 = privateInfo;
            return Player.incPrize(PLAYER_ID_TEST1, prize);
        }
    ).then(
        function()
        {
            return Player.find(PLAYER_ID_TEST1, 'private');
        }
    ).then(
        function(privateInfo2)
        {
            test.equal(privateInfo2.money, privateInfo1.money + prize.money);
            test.equal(privateInfo2.gold, privateInfo1.gold + prize.gold);
            test.done();
        }
    );
};

exports.decEnergy = function(test)
{
    var value = 5;
    var privateInfo1 = null;

    Player.find(PLAYER_ID_TEST2, 'private').then(
        function(privateInfo)
        {
            privateInfo1 = privateInfo;
            return Player.decEnergy(PLAYER_ID_TEST2, value);
        }
    ).then(
        function()
        {
            return Player.find(PLAYER_ID_TEST2, 'private');
        }
    ).then(
        function(privateInfo2)
        {
            test.equal(privateInfo2.energy, privateInfo1.energy - value);
            test.done();
        }
    );
};

exports.setFrazzle = function(test)
{
    var exercise = Db.dics.exercises[0];
    Player.find(PLAYER_ID_TEST3, 'body').then(
        function(body)
        {
            return Player.setFrazzle(PLAYER_ID_TEST3, body, exercise, 0.5);
        }
    ).then(
        function()
        {
            return Player.find(PLAYER_ID_TEST3, 'body');
        }
    ).then(
        function(body)
        {
            test.equal(body[2].frazzle, 0.25);
            test.equal(body[2].stress, 0.25);
            test.equal(body[4].frazzle, 0.4);
            test.equal(body[4].stress, 0.4);
            test.equal(body[5].frazzle, 0.15);
            test.equal(body[5].stress, 0.15);
            test.equal(body[6].frazzle, 0.5);
            test.equal(body[6].stress, 0.5);

            return Player.setFrazzle(PLAYER_ID_TEST3, body, exercise, 1);
        }
    ).then(
        function()
        {
            return Player.find(PLAYER_ID_TEST3, 'body');
        }
    ).then(
        function(body)
        {
            test.equal(body[2].frazzle, 0.75);
            test.equal(body[2].stress, 0.75);
            test.equal(body[4].frazzle, 1);
            test.equal(body[4].stress, 1);
            test.equal(body[5].frazzle, 0.45);
            test.equal(body[5].stress, 0.45);
            test.equal(body[6].frazzle, 1);
            test.equal(body[6].stress, 1);

            test.done();
        }
    )
};

exports.updateState = function(test)
{
    var exercise = Db.dics.exercises[0];
    Player.find(PLAYER_ID_TEST4, 'body').then(
        function(body)
        {
            return Player.setFrazzle(PLAYER_ID_TEST4, body, exercise, 0.5);
        }
    ).then(
        function()
        {
            return Player.find(PLAYER_ID_TEST4, 'body');
        }
    ).then(
        function(body)
        {
            test.equal(body[2].frazzle, 0.25);
            test.equal(body[2].stress, 0.25);
            test.equal(body[4].frazzle, 0.4);
            test.equal(body[4].stress, 0.4);
            test.equal(body[5].frazzle, 0.15);
            test.equal(body[5].stress, 0.15);
            test.equal(body[6].frazzle, 0.5);
            test.equal(body[6].stress, 0.5);

            var now1 = new Date();
            DateHelper.addHours(now1, -1);

            return Player.update(PLAYER_ID_TEST4, {$set: {'private.reg.lastUpdateTime': now1}});
        }
    ).then(
        function()
        {
            return Player.updateState(PLAYER_ID_TEST4);
        }
    ).then(
        function()
        {
            return Player.find(PLAYER_ID_TEST4, 'body');
        }
    ).then(
        function(body)
        {
            test.equal(body[2].frazzle, 0.05);
            test.equal(body[2].stress, 0.25);
            test.equal(body[4].frazzle, 0.2);
            test.equal(body[4].stress, 0.4);
            test.equal(body[5].frazzle, 0);
            test.equal(body[5].stress, 0.15);
            test.equal(body[6].frazzle, 0.3);
            test.equal(body[6].stress, 0.5);

            test.done();
        }
    )
};

exports.updateStateReg = function(test)
{
    var factor1 = Factor.get(1000);
    var factor2 = Factor.get(2000);
    var factor3 = Factor.get(3000);

    var expireDate = DateHelper.addHours(new Date(), 1);

    Db.players.update(
        {_id: PLAYER_ID_TEST5},
        {
            $pushAll: {
                factors: [
                    {
                        _id: factor1._id,
                        expire: expireDate
                    },
                    {
                        _id: factor2._id,
                        expire: expireDate
                    },
                    {
                        _id: factor3._id,
                        expire: expireDate
                    }
                ]
            }
        },
        function(err)
        {
            var now1 = new Date();
            DateHelper.addHours(now1, -1);

            Player.update(PLAYER_ID_TEST5, {$set: {'private.reg.lastUpdateTime': now1}})
                .then(
                function()
                {
                    return Player.updateState(PLAYER_ID_TEST5);
                }
            ).then(
                function()
                {
                    return Player.find(PLAYER_ID_TEST5, 'private');
                }
            ).then(
                function(privateInfo)
                {
                    test.equal(privateInfo.reg.rest, 0.7);
                    test.equal(privateInfo.reg.food, 0.04);
                    test.equal(privateInfo.reg.stimulant, 1);

                    test.done();
                }
            );
        }
    );
};

exports.updateStateFix = function(test)
{
    var factor1 = Factor.get(1000);
    var factor2 = Factor.get(2000);
    var factor3 = Factor.get(3000);

    var expireDate = DateHelper.addHours(new Date(), 1);

    Db.players.update(
        {_id: PLAYER_ID_TEST0},
        {
            $pushAll: {
                factors: [
                    {
                        _id: factor1._id,
                        expire: expireDate
                    },
                    {
                        _id: factor2._id,
                        expire: expireDate
                    },
                    {
                        _id: factor3._id,
                        expire: expireDate
                    }
                ]
            }
        },
        function(err)
        {
            var now1 = new Date();
            now1 = DateHelper.addHours(now1, -5);

            Player.update(PLAYER_ID_TEST0,
                {
                    $set:
                    {
                        'private.reg.lastUpdateTime': now1,
                        'private.reg.lastFixTime': now1
                    }
                }
            ).then(
                function()
                {
                    return Player.find(PLAYER_ID_TEST0, 'body');
                }
            ).then(
                function(body)
                {
                    var exercise = Db.dics.exercises[0];
                    return Player.setFrazzle(PLAYER_ID_TEST0, body, exercise, 1);
                }
            ).then(
                function()
                {
                    return Player.updateState(PLAYER_ID_TEST0);
                }
            ).then(
                function()
                {
                    return Player.find(PLAYER_ID_TEST0, 'private');
                }
            ).then(
                function(privateInfo)
                {
                    test.equal(privateInfo.reg.rest, 0);
                    test.equal(privateInfo.reg.food, 0);
                    test.equal(privateInfo.reg.stimulant, 0);

                    test.done();
                }
            );
        }
    );
};