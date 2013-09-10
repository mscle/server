var Db = require('../db');
var Dics = require('../routes/dics');
var P = require('../p');

function setNewPR(playerId, pr, exerciseId, weight)
{
    return P.call(function(fulfill, reject, handler)
    {
        if (pr == null)
        {
            Db.players.update(
                {_id: playerId},
                {
                    $push: {
                        records: {
                            _id: exerciseId,
                            weight: weight,
                            date: new Date()
                        }
                    }
                },
                handler
            );
        }
        else
        {
            Db.players.update(
                {_id: playerId, 'records.$._id': exerciseId},
                {
                    $set: {
                        'records.$.weight': weight,
                        'records.$.date': new Date()
                    }
                },
                handler
            );
        }
    });
}

function setNewWR(playerId, exerciseId, weight)
{
    return P.call(function(fulfill, reject, handler)
    {
        Db.exercises.update(
            {_id: exerciseId},
            {
                $set: {
                    record: {
                        weight: weight,
                        data: new Date(),
                        playerId: playerId
                    }
                }
            },
            function(err)
            {
                if (err)
                {
                    reject(err);
                    return;
                }
                Dics.update('exercises').then(fulfill, reject);
            }
        );
    });
}

var getPR = function(records, exerciseId)
{
    var pr = null;
    for (var i = 0; i < records.length; i++)
    {
        if (records[i]._id == exerciseId)pr = records[i];
    }
    return pr;
};

exports.check = function(playerId, records, exerciseId, weight)
{
    return P.call(function(fulfill, reject, handler)
    {
        var result = { PR: false, WR: false };
        var pr = getPR(records, exerciseId);
        if (pr != null)
        {
            if (pr.weight >= weight)
            {
                fulfill(result);
                return;
            }
        }

        result.PR = true;
        setNewPR(playerId, pr, exerciseId, weight).then(
            function()
            {
                var exercise = Db.dics.exercises[exerciseId];
                if (exercise.record != null)
                {
                    if (exercise.record.weight > weight)
                    {
                        fulfill(result);
                        return;
                    }
                }

                result.WR = true;
                setNewWR(playerId, exerciseId, weight).then(
                    function()
                    {
                        fulfill(result);
                        return;
                    },
                    reject
                );
            },
            reject
        );
    });
};
