var Db = require('../../db');

exports.develop = function (test)
{
    Db.init(Db.DEVELOP).then(
        function ()
        {
            Db.db.close();
            test.done();
        },
        console.log);
};