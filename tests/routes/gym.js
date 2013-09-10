var Db = require('../../db');
var Player = require('../../controllers/player');
var Muscledb = require('../../muscledb/muscledb');
var Gym = require('../../routes/gym');

var PLAYER_ID_TEST0 = 0;
var PLAYER_ID_TEST1 = 1;
var PLAYER_ID_TEST2 = 2;
var PLAYER_ID_TEST3 = 3;
var PLAYER_ID_TEST4 = 4;
var PLAYER_ID_TEST5 = 5;
var GYM = 0;
var EXERCISE = 0;
var session = { player: { id: PLAYER_ID_TEST0 } };

exports.setUp = function(callback)
{
    //Db.init(Db.DEVELOP).then(callback, console.log);
    Muscledb.recreate().then(callback, console.log);
};

exports.getExercisePower = function(test)
{
    var exercise = Db.dics.exercises[2];
    var body = null;

    Player.find(session.player.id, 'body').then(
        function(data)
        {
            body = data;
            return Player.find(session.player.id, 'public');
        }
    ).then(
        function(publicInfo)
        {
            var totalPower = Gym.getExercisePower(body, publicInfo, exercise);
            test.equal(totalPower, 334);
            test.done();
        }
    );
};

exports.executeSuccessForce = function(test)
{
    Gym.execute(PLAYER_ID_TEST1, GYM, EXERCISE, 90, 0).then(
        function(answer)
        {
            test.equal(answer.repeats, 34.39);
            test.equal(answer.repeatsMax, 34.39);
            test.equal(answer.energy, 5);

            return Gym.execute(PLAYER_ID_TEST1, GYM, EXERCISE, 90, 0);
        }
    ).then(
        function(answer)
        {
            test.equal(answer.repeats, 34.02);
            test.equal(answer.repeatsMax, 34.02);
            test.equal(answer.energy, 5);

            return Gym.execute(PLAYER_ID_TEST1, GYM, EXERCISE, 90, 0);
        }
    ).then(
        function(answer)
        {
            test.equal(answer.repeats, 33.63);
            test.equal(answer.repeatsMax, 33.63);
            test.equal(answer.energy, 5);

            test.done();
        }
    );
};

exports.executeSuccess = function(test)
{
    Gym.execute(PLAYER_ID_TEST2, GYM, EXERCISE, 35, 12).then(
        function(answer)
        {
            test.equal(answer.repeats, 12);
            test.equal(answer.repeatsMax, 54.48);
            test.equal(answer.energy, 5);

            test.done();
        }
    );
};

exports.executeWarmup = function(test)
{
    Gym.execute(PLAYER_ID_TEST2, GYM, EXERCISE, 100, 1).then(
        function(answer)
        {
            test.equal(answer.repeats, 1);
            test.equal(answer.repeatsMax, 31.16);
            test.equal(answer.energy, 1);

            test.done();
        }
    );
};

exports.executeFailWeight = function(test)
{
    Gym.execute(PLAYER_ID_TEST2, GYM, EXERCISE, 10, 12).then(
        function(answer)
        {
            test.equal(answer, Gym.MES_WEIGHT);
            return Gym.execute(PLAYER_ID_TEST2, GYM, EXERCISE, 100, 12);
        }
    ).then(
        function(answer)
        {
            test.equal(answer, Gym.MES_WEIGHT);
            return Gym.execute(PLAYER_ID_TEST2, GYM, EXERCISE, 33.231, 12);
        }
    ).then(
        function(answer)
        {
            test.equal(answer, Gym.MES_WEIGHT);
            test.done();
        });
};

exports.executeFailRepeats = function(test)
{
    Gym.execute(PLAYER_ID_TEST3, GYM, EXERCISE, 50, 500).then(
        function(answer)
        {
            test.equal(answer, Gym.MES_REPEATS_MAX);
            return Gym.execute(PLAYER_ID_TEST3, GYM, EXERCISE, 50, -1);
        }
    ).then(
        function(answer)
        {
            test.equal(answer, Gym.MES_REPEATS_MIN);
            test.done();
        }
    );
};

exports.executeFailLessOneRepeat = function(test)
{
    Gym.execute(PLAYER_ID_TEST4, 2, EXERCISE, 240, 1).then(
        function(answer)
        {
            test.equal(0 < answer.repeatsMax && answer.repeatsMax < 1, true);
            test.equal(0 < answer.repeats && answer.repeats < 1, true);
            test.equal(answer.energy, Db.dics.exercises[0].energy);
            test.done();
        }
    );
};

exports.executeFailEnergy = function(test)
{
    var PlayersCollection = require('../../muscledb/collections/players');
    Player.update(PLAYER_ID_TEST5, {$set: { 'private.energy': Db.dics.exercises[0].energy - 1}}).then(
        function()
        {
            return Gym.execute(PLAYER_ID_TEST5, GYM, EXERCISE, 50, 10);
        }
    ).then(
        function(answer)
        {
            test.equal(answer, Gym.MES_ENERGY);
            return Player.update(PLAYER_ID_TEST5, {$set: { 'private.energy': 1}});
        }
    ).then(
        function()
        {
            return Gym.execute(PLAYER_ID_TEST5, 2, EXERCISE, 160, 10);
        }
    ).then(
        function(answer)
        {
            test.equal(answer, Gym.MES_ENERGY);
            return Player.update(PLAYER_ID_TEST5, {$set: { 'private.energy': PlayersCollection.ENERGY_MAX}});
        }
    ).then(
        function()
        {
            test.done();
        }
    );
};