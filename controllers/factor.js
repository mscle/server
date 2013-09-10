var Db = require('../db');
var P = require('../p');
var Player = require('../controllers/player');
var Vow = require('vow');
var DateHelper = require('./date');

exports.MES_COST = "Не хватает средств";

function addFactor(playerId, factorId)
{
    return P.call(function(fulfill, reject, handler)
    {
        Db.players.update(
            {_id: playerId},
            {
                $push: {
                    factors: {
                        _id: factorId,
                        expire: DateHelper.expire(new Date(), exports.get(factorId).duration)
                    }
                }
            },
            handler
        );
    });
}

function removeFactor(playerId, factorId)
{
    return P.call(function(fulfill, reject, handler)
    {
        Db.players.update(
            {_id: playerId},
            {
                $pull: {
                    factors: {
                        _id: factorId
                    }
                }
            },
            handler
        );
    });
}

exports.get = function(factorId)
{
    for (var i = 0; i < Db.dics.factors.length; i++)
    {
        if (Db.dics.factors[i]._id == factorId) return Db.dics.factors[i];
    }
    return null;
};

exports.buy = function(playerId, factorId)
{
    return P.call(function(fulfill, reject, handler)
    {
        return Player.find(playerId, 'private').then(
            function(privateInfo)
            {
                var factor = exports.get(factorId);

                if (privateInfo.money < factor.cost.money
                    || factor.cost.gold != undefined && (privateInfo.gold < factor.cost.gold))
                {
                    fulfill(exports.MES_COST);
                    return;
                }

                addFactor(playerId, factorId).then(
                    function()
                    {
                        Player.decMoney(playerId, factor.cost).then(fulfill, reject);
                    }, reject
                );
            }, reject
        );
    });
};

exports.clear = function(playerId)
{
    return P.call(function(fulfill, reject, handler)
    {
        Player.find(playerId, 'factors').then(
            function(factors)
            {
                var promises = [];
                for (var i = 0; i < factors.length; i++)
                {
                    var factor = factors[i];

                    if (factor.expire < new Date())
                    {
                        promises.push(removeFactor(playerId, factor._id));
                    }
                }

                if (promises.length > 0)
                {
                    Vow.all(promises).then(fulfill, reject);
                }
                else
                {
                    fulfill();
                }
            }, reject
        )
    });
};