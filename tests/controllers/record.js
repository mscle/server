var Db = require('../../db');
var Muscledb = require('../../muscledb/muscledb');
var Player = require('../../controllers/player');
var Record = require('../../controllers/record');

exports.setUp = function(callback)
{
    Muscledb.recreate().then(callback, console.log);
};

var PLAYER_ID_TEST1 = 0;
var PLAYER_ID_TEST2 = 1;
var EXERCISE_ID = 0;

exports.check = function(test)
{
    var records1 = null;
    var records2 = null;

    Player.find(PLAYER_ID_TEST1, 'records').then(
        function(answer)
        {
            records1 = answer;
            return Player.find(PLAYER_ID_TEST2, 'records');
        },console.log
    ).then(
        function(answer)
        {
            records2 = answer;
            return Record.check(PLAYER_ID_TEST1, records1, EXERCISE_ID, 50);
        },console.log
    ).then(
        function(answer)
        {
            test.equal(answer.PR, true);
            test.equal(answer.WR, true);

            return Record.check(PLAYER_ID_TEST2, records2, EXERCISE_ID, 40);
        },console.log
    ).then(
        function(answer)
        {
            test.equal(answer.PR, true);
            test.equal(answer.WR == false, true);

            return Player.find(PLAYER_ID_TEST1, 'records');
        },console.log
    ).then(
        function(answer)
        {
            records1 = answer;
            return Record.check(PLAYER_ID_TEST1, records1, EXERCISE_ID, 40);
        },console.log
    ).then(
        function(answer)
        {
            test.equal(answer.PR == false, true);
            test.equal(answer.WR == false, true);

            test.done();
        },console.log
    );
};

