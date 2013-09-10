var Db = require('../../db');
var Muscledb = require('../../muscledb/muscledb');
var Player = require('../../controllers/player');
var PlayersColl = require('../../muscledb/collections/players');
var Factor = require('../../controllers/factor');
var DateHelper = require('../../controllers/date');

exports.setUp = function(callback)
{
    Muscledb.recreate().then(callback, console.log);
};

var PLAYER_ID_TEST1 = 0;
var PLAYER_ID_TEST2 = 1;
var FACTOR_ID = 1001;

exports.get = function(test)
{
    var factor = Factor.get(FACTOR_ID);
    test.equal(factor.name, 'food2');

    factor = Factor.get(-1);
    test.equal(factor, null);
    test.done();
};

exports.buyFail = function(test)
{
    var factor = Factor.get(FACTOR_ID);
    Player.decMoney(PLAYER_ID_TEST1, {money: PlayersColl.MONEY - factor.cost.money + 1}).then(
        function()
        {
            return Factor.buy(PLAYER_ID_TEST1, FACTOR_ID);
        }
    ).then(
        function(answer)
        {
            test.equal(answer, Factor.MES_COST);
            test.done();
        }
    )
};

exports.buySuccess = function(test)
{
    var factor = Factor.get(FACTOR_ID);
    Factor.buy(PLAYER_ID_TEST1, FACTOR_ID).then(
        function(answer)
        {
            test.equal(answer, undefined);
            return Player.find(PLAYER_ID_TEST1, 'private');
        }
    ).then(
        function(privateInfo)
        {
            test.equal(privateInfo.money, PlayersColl.MONEY - factor.cost.money);
            return Player.find(PLAYER_ID_TEST1, 'factors');
        }
    ).then(
        function(factors)
        {
            test.equal(factors[0]._id, FACTOR_ID)
            test.done();
        }
    )
};

exports.clear = function(test)
{
    var factor1 = Factor.get(2000);
    var factor2 = Factor.get(2001);

    var expiredDate = DateHelper.addHours(new Date(), -1);
    var notExpiredDate = DateHelper.addHours(new Date(), 1);

    Db.players.update(
        {_id: PLAYER_ID_TEST1},
        {
            $pushAll: {
                factors: [
                    {
                        _id: factor1._id,
                        expire: expiredDate
                    },
                    {
                        _id: factor2._id,
                        expire: notExpiredDate
                    }
                ]
            }
        },
        function(err)
        {
            Factor.clear(PLAYER_ID_TEST1).then(
                function()
                {
                    Player.find(PLAYER_ID_TEST1, 'factors').then(
                        function(factors)
                        {
                            test.equal(factors[0]._id, factor2._id);
                            test.done();
                        }
                    )
                }
            )
        }
    );
};