var Db = require('../db');
var Player = require('../controllers/player');
var Record = require('../controllers/record');
var P = require('../p');

var WEIGHT_MIN = 20;
var REPEATS_MIN = 0;
var REPEATS_MAX = 200;

var COEFF_POWER = 4;
var COEFF_FRAZZLE = 10;
var COEFF_BODYPOWER = 8;

exports.MES_WEIGHT= { message: "Нельзя собрать такой вес"};
exports.MES_REPEATS_MAX = { message: "Нет смысла делать столько повторений"};
exports.MES_REPEATS_MIN = { message: "Сделай хотя бы одно повторение"};
exports.MES_ENERGY = { message: "Не хватает энергии, отдохни и подкрепись"};
exports.MES_EXERCISE = { message: "Упражнение недоступно"};

function round2(v)
{
    return Math.round(v * 100) / 100;
}

exports.getExercisePower = function(playerBody, publicInfo, exercise)
{
    //TODO: stimulants
    var level = publicInfo.level;
    var totalPower = 0;
    for (var i = 0; i < exercise.body.length; i++)
    {
        var muscleExercise = exercise.body[i];
        var muscleBody = playerBody[muscleExercise._id];
        var muscleInfo = Db.dics.muscles[muscleExercise._id];
        var power = level * muscleInfo.power * muscleExercise.stress / COEFF_POWER;
        power = power + power * muscleBody.power / COEFF_BODYPOWER;
        power = power - power * muscleBody.frazzle / COEFF_FRAZZLE;
        totalPower += power;
    }
    totalPower = totalPower * exercise.coeff + exercise.power;
    return totalPower;
};

exports.execute = function(playerId, gymId, exerciseId, weight, repeats)
{
    return P.call(function(fulfill, reject)
    {
        var gym = Db.dics.gyms[gymId];
        if (gym.exercises.indexOf(exerciseId) == -1)
        {
            fulfill(exports.MES_EXERCISE);
            return;
        }

        var exercise = Db.dics.exercises[exerciseId];

        if (weight < WEIGHT_MIN || gym.max < weight || weight % gym.delta != 0)
        {
            fulfill(exports.MES_WEIGHT);
            return;
        }
        if (repeats < REPEATS_MIN)
        {
            fulfill(exports.MES_REPEATS_MIN);
            return;
        }
        if (repeats > REPEATS_MAX)
        {
            fulfill(exports.MES_REPEATS_MAX);
            return;
        }

        Player.find(playerId, ['body', 'public', 'records', 'private']).then(
            function(player)
            {
                var power = exports.getExercisePower(player.body, player.public, exercise);
                if (power < weight)
                {
                    fulfill({ repeatsMax: power / weight, repeats: power / weight, energy: exercise.energy });
                    return;
                }

                var mass = player.public.level * 1.33 + 40;
                var k1 = 1 - weight / power;
                var repeatsMax = round2(k1 / 0.03 + k1 * k1 * 35 + 1);
                var k2 = weight * repeatsMax - weight * repeatsMax * (k1 + 0.25) + weight;
                var effMax = k2 / (mass * 15);

                var repeatsPlan = repeats > 0 ? repeats : repeatsMax;
                var repeatsFact = round2(repeatsPlan < repeatsMax ? repeatsPlan : repeatsMax);
                var effFact = (repeatsFact / repeatsPlan) * effMax;

                var energyFact = Math.ceil((repeatsFact / repeatsMax) * exercise.energy);
                if (energyFact > player.private.energy)
                {
                    fulfill(exports.MES_ENERGY);
                    return;
                }

                var record;
                Player.setFrazzle(playerId, player.body, exercise, effFact).then(
                    function()
                    {
                        return Record.check(playerId, player.records, exerciseId, weight);
                    }, reject
                ).then(
                    function(answer)
                    {
                        record = answer;
                        return Player.decEnergy(playerId, energyFact);
                    }, reject
                ).then(
                    function()
                    {
                        fulfill(
                            {
                                repeatsMax: repeatsMax,
                                repeats: repeatsFact,
                                energy: energyFact,
                                record: record
                            });
                    }, reject
                );
            },
            reject
        );
    });
};
