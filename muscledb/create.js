var Muscledb = require('./muscledb');
var Db = require('../db');

Muscledb.create().then(
    function ()
    {
        console.log("Database is created");
        Db.db.close();
    },
    function (err)
    {
        console.log(err);
    });