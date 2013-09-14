var Db = require('../db');
var P = require('../p');
var DateHelper = require('./date');
var PlayersCollection = require('../muscledb/collections/players');

exports.REG_FRAZZLE_PER_HOUR = 0.2;
exports.REG_ENERGY = 0.3;
exports.REG_ENERGY_PER_HOUR = exports.REG_ENERGY * PlayersCollection.ENERGY_MAX;
var UPDATE_PERIOD = 5;
var CHECK_LEVELUP_PERIOD = 4;

var update = function (id, setClause) {
    return P.call(function (fulfill, reject, handler) {
        Db.players.update({ _id: id}, setClause, handler);
    });
};

var remove = function (id) {
    return P.call(function (fulfill, reject, handler) {
        Db.players.remove({ _id: id}, handler);
    });
};

var create = function (id) {
    var newPlayer = require('../muscledb/collections/players').newPlayer();
    newPlayer._id = id;

    return P.call(function (fulfill, reject, handler) {
        Db.players.insert(newPlayer, handler);
    });
};

var find = function (id, shown) {
    var shownBase = shown;
    if (typeof shown === 'string') shown = [shown];
    var target = {};
    for (var i = 0; i < shown.length; i++) target[shown[i]] = 1;

    return P.call(function (fulfill, reject) {
        Db.players.findOne({ _id: id }, target, function (err, data) {
            if (err)reject(err);
            else {
                if (data == null) fulfill(null);
                else if (typeof shownBase === 'string')
                    fulfill(data[shownBase]);
                else fulfill(data);
            }
        });
    });
};

var setFrazzle = function (playerId, body, exercise, effect) {
    var setClause = {};
    for (var i = 0; i < exercise.body.length; i++) {
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

    return update(playerId, { $set: setClause });
};

var updateState = function (id) {

    return find(id, ['private', 'body', 'public']).then(
        function (player) {
            var setClause = getUpdateClause(player);
            if (setClause == null) {
                var promise = P.Promise();
                promise.fulfill();
                return promise;
            }

            setClause = getClauseAfterCheckLevelUp(player, setClause);
            return update(id, {$set: setClause});
        }
    );
};

exports.incMoney = function (id, money) {
    return update(id, { $inc: {'private.money': money } });
};

exports.decMoney = function (id, money) {
    return update(id, { $inc: {'private.money': money == undefined ? 0 : -money } });
};

exports.decEnergy = function (id, value) {
    return update(id, { $inc: { 'private.energy': -value } });
};

exports.remove = remove;
exports.update = update;
exports.create = create;
exports.find = find;
exports.setFrazzle = setFrazzle;
exports.updateState = updateState;

function round2(v) {
    return Math.round(v * 100) / 100;
}

// Resting: regenerating energy and muscles (energy->energy_max, frazzle->0)
function getUpdateClause(player) {

    var now = new Date();
    var reg = player.private.reg;
    var minUpdateTime = DateHelper.addMinutesClone(reg.lastUpdateTime, UPDATE_PERIOD);
    if (minUpdateTime > now) return null;

    var interval = DateHelper.intervalHours(now - reg.lastUpdateTime);

    var frazzleDecrease = round2(exports.REG_FRAZZLE_PER_HOUR * interval);
    var energyValue = Math.round(player.private.energy + exports.REG_ENERGY_PER_HOUR * interval);

    if (energyValue > PlayersCollection.ENERGY_MAX)
        energyValue = PlayersCollection.ENERGY_MAX;

    var setClause =
    {
        'private.energy': energyValue,
        'private.reg.lastUpdateTime': now
    };

    for (var i = 0; i < player.body.length; i++) {
        var muscle = player.body[i];
        muscle.frazzle = round2(muscle.frazzle - frazzleDecrease);
        if (muscle.frazzle < 0)muscle.frazzle = 0;

        setClause['body.' + i + '.frazzle'] = muscle.frazzle;
    }
    return setClause;
}

// Calculate prob of level increase. Returns clause.
function getClauseAfterCheckLevelUp(player, setClause) {
    var getPowerAll = function () {
        var muscles = Db.dics.muscles;
        var powerAll = 0;
        for (var i = 0; i < muscles.length; i++) {
            powerAll += muscles[i].power;
        }
        return powerAll;
    };

    var now = new Date();
    var reg = player.private.reg;
    var minFixTime = DateHelper.addHoursClone(reg.lastCheckLevelUpTime, CHECK_LEVELUP_PERIOD);
    if (minFixTime > now) return setClause;

    var powerAll = getPowerAll();
    var stress = 0;

    for (var i = 0; i < player.body.length; i++) {
        var muscleBody = player.body[i];
        var muscles = Db.dics.muscles;
        var muscle = muscles[muscleBody._id];

        stress += muscle.power * muscleBody.stress / powerAll;
    }

    //var p = stress * setClause['private.reg.rest'] * setClause['private.reg.food'] * setClause['private.reg.stimulant'];
    var p = stress * 0.5;
    if (Math.random() < p) {
        setClause['public.level'] = player.public.level + 1;
        for (i = 0; i < player.body.length; i++) {
            setClause['body.' + i + '.frazzle'] = 0;
            setClause['body.' + i + '.stress'] = 0;
        }
    }

    return setClause;
}
