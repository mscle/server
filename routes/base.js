var Player = require('../controllers/player');
var P = require('../p');

exports.ERR_AUTH_FAIL = { message: "Authorization fail"};
exports.MES_SUCCESS = { message: "Success"};

exports.auth = function(session, id, authKey)
{
    return P.call(function(fulfill, reject)
    {
        if (session.player != undefined)
        {
            if (session.player.id == id)
            {
                fulfill(exports.MES_SUCCESS);
                return;
            }
        }

        //TODO: Check MD5
        if (authKey != '123')
        {
            fulfill(exports.ERR_AUTH_FAIL);
            return;
        }

        var initSession = function()
        {
            session.player = {
                id: id,
                jobbing: { started: false, lastTime: null }
            };
            session.auth = true;
            fulfill(exports.MES_SUCCESS);
        };

        Player.find(id, '_id').then(
            function(_id)
            {
                if (_id == null)
                {
                    Player.create(id).then(initSession, reject);
                }
                else
                    initSession();
            },
            reject
        );
    });
}
