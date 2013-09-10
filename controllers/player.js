var Db = require('../db');
var P = require('../p');
var DateHelper = require('./date');
var Factor = require('./factor');
var Players = require('../muscledb/collections/players');

exports.REG_FRAZZLE = 0.2;
exports.REG_ENERGY = 0.3;
exports.REG_ENERGY_PER_HOUR = exports.REG_ENERGY * Players.ENERGY_MAX;
exports.REG_FRAZZLE_PER_HOUR = exports.REG_FRAZZLE;
var UPDATE_PERIOD = 5;
var FIX_PERIOD = 4;

exports.incPrize = function(id, prize)
{
    return P.call(function(fulfill, reject, handler)
    {
        Db.players.update(
            { _id: id },
            {
                $inc: {'private.money': prize.money, 'private.gold': prize.gold}
            },
            handler
        );
    });
};

exports.decMoney = function(id, value)
{
    return P.call(function(fulfill, reject, handler)
    {
        Db.players.update(
            { _id: id },
            {
                $inc: {
                    'private.money': value.money == undefined ? 0 : -value.money,
                    'private.gold': value.gold == undefined ? 0 : -value.gold
                }
            },
            handler
        );
    });
};

exports.decEnergy = function(id, value)
{
    return P.call(function(fulfill, reject, handler)
    {
        Db.players.update(
            { _id: id },
            {
                $inc: { 'private.energy': -value }
            },
            handler
        );
    });
};

exports.remove = function(id)
{
    return P.call(function(fulfill, reject, handler)
    {
        Db.players.remove({ _id: id}, handler);
    });
};

exports.update = function(id, setClause)
{
    return P.call(function(fulfill, reject, handler)
    {
        Db.players.update({ _id: id}, setClause, handler);
    });
};

exports.create = function(id)
{
    var newPlayer = require('../muscledb/collections/players').newPlayer();
    newPlayer._id = id;
    return P.call(function(fulfill, reject, handler)
    {
        Db.players.insert(newPlayer, handler);
    });
};

exports.find = function(id, shown)
{
    var shownBase = shown;
    if (typeof shown === 'string') shown = [shown];
    var target = {};
    for (var i = 0; i < shown.length; i++) target[shown[i]] = 1;

    return P.call(function(fulfill, reject)
    {
        Db.players.findOne({ _id: id }, target, function(err, data)
        {
            if (err)reject(err);
            else
            {
                if (data == null) fulfill(null);
                else if (typeof shownBase === 'string')
                    fulfill(data[shownBase]);
                else fulfill(data);
            }
        });
    });
};

exports.setFrazzle = function(playerId, body, exercise, effect)
{
    return P.call(function(fulfill, reject, handler)
    {
        var setClause = {};
        for (var i = 0; i < exercise.body.length; i++)
        {
            var muscleExercise = exercise.body[i];
            var muscleBody = body[muscleExercise._id];
            var f = muscleBody.frazzle + muscleExercise.stress * effect;
            if (f > 1) f = 1;
            f = round2(f);
            var e = muscleBody.stress + muscleExercise.stress * effect;
            if (e > 1) e = 1;
            e = round2(e);
            setClause['body.' + muscleExercise._id + '.frazzle'] = f;
            setClause['body.' + muscleExercise._id + '.stress'] = e;
        }

        Db.players.update(
            {_id: playerId},
            {
                $set: setClause
            },
            handler
        );
    });
};

function round2(v)
{
    return Math.round(v * 100) / 100;
}

function getFixClause(player, setClause)
{
    var getPowerAll = function()
    {
        var muscles = Db.dics.muscles;
        var powerAll = 0;
        for (var i = 0; i < muscles.length; i++)
        {
            powerAll += muscles[i].power;
        }
        return powerAll;
    };

    var now = new Date();
    var reg = player.private.reg;
    var minFixTime = DateHelper.addHoursClone(reg.lastFixTime, FIX_PERIOD);
    if (minFixTime > now) return setClause;

    var powerAll = getPowerAll();
    var stress = 0;

    for (var i = 0; i < player.body.length; i++)
    {
        var muscleBody = player.body[i];
        var muscles = Db.dics.muscles;
        var muscle = muscles[muscleBody._id];

        stress += muscle.power * muscleBody.stress / powerAll;
    }

//    setClause['private.reg.rest'] = 1;
//    setClause['private.reg.food'] = 1;
//    setClause['private.reg.stimulant'] = 1;
//
//    stress = 1;

    var p = stress * setClause['private.reg.rest'] * setClause['private.reg.food'] * setClause['private.reg.stimulant'];
    if (Math.random() < p)
    {
        setClause['public.level'] = player.public.level + 1;
        for (i = 0; i < player.body.length; i++)
        {
            setClause['body.' + i + '.frazzle'] = 0;
            setClause['body.' + i + '.stress'] = 0;
        }
    }

    setClause['private.reg.rest'] = 0;
    setClause['private.reg.food'] = 0;
    setClause['private.reg.stimulant'] = 0;
    return setClause;
}

function getUpdateClause(player)
{
    var frazzleIncrease = 0;
    var energyIncrease = player.private.energy;
    var restIncrease = player.private.reg.rest;
    var foodIncrease = player.private.reg.food;
    var stimulantIncrease = player.private.reg.stimulant;

    var increase = function(end, factorInfo)
    {
        var interval = DateHelper.intervalHours(end - reg.lastUpdateTime);
        if (factorInfo != undefined)
        {
            if (factorInfo.group != 'food')
            {
                frazzleIncrease += round2(factorInfo.reg.frazzle * interval);
                energyIncrease += round2(factorInfo.reg.energy * Players.ENERGY_MAX * interval);
            }

            if (factorInfo.group == 'rest')
                restIncrease += round2(factorInfo.reg.growth * interval);
            else if (factorInfo.group == 'stimulant')
                stimulantIncrease += round2(factorInfo.reg.growth * interval);
            else if (factorInfo.group == 'food')
            {
                var mass = player.public.level * 1.33 + 40;
                var proteinFact = ((factorInfo.food.protein * factorInfo.food.weight) / 100) / (2 * mass);
                var carbsFact = ((factorInfo.food.carbs * factorInfo.food.weight) / 100) / (4 * mass);
                foodIncrease = round2(proteinFact / 2 + carbsFact / 2);
            }
        }
        else
        {
            frazzleIncrease = round2(frazzleIncrease + exports.REG_FRAZZLE_PER_HOUR * interval);
            energyIncrease = Math.round(energyIncrease + exports.REG_ENERGY_PER_HOUR * interval);

            if (energyIncrease > Players.ENERGY_MAX)
                energyIncrease = Players.ENERGY_MAX;
        }
    };

    var now = new Date();
    var reg = player.private.reg;
    var minUpdateTime = DateHelper.addMinutesClone(reg.lastUpdateTime, UPDATE_PERIOD);
    if (minUpdateTime > now) return null;

    for (var i = 0; i < player.factors.length; i++)
    {
        var factor = player.factors[i];
        var factorInfo = Factor.get(factor._id);
        var end = factor.expire > now ? now : factor.expire;
        increase(end, factorInfo);
    }

    increase(now);

    if (restIncrease > 1) restIncrease = 1;
    if (foodIncrease > 1) foodIncrease = 1;
    if (stimulantIncrease > 1) stimulantIncrease = 1;

    var setClause =
    {
        'private.energy': energyIncrease,
        'private.reg.lastUpdateTime': now,
        'private.reg.rest': restIncrease,
        'private.reg.food': foodIncrease,
        'private.reg.stimulant': stimulantIncrease
    };

    for (i = 0; i < player.body.length; i++)
    {
        var muscle = player.body[i];
        muscle.frazzle = round2(muscle.frazzle - frazzleIncrease);
        if (muscle.frazzle < 0)muscle.frazzle = 0;

        setClause['body.' + i + '.frazzle'] = muscle.frazzle;
    }
    return setClause;
}

exports.updateState = function(id)
{
    return P.call(function(fulfill, reject)
    {
        exports.find(id, ['factors', 'private', 'body', 'public']).then(
            function(player)
            {
                var setClause = getUpdateClause(player);
                if (setClause == null)
                {
                    fulfill();
                    return;
                }

                setClause = getFixClause(player, setClause);

                exports.update(id, {$set: setClause}).then(
                    function()
                    {
                        Factor.clear(id).then(fulfill, reject);
                    }, reject
                );
            }, reject
        );
    });
};