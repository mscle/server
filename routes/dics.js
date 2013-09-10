var NAMES = ['awards', 'factors', 'muscles', 'muscles_view', 'exercises', 'gyms', 'bank', 'work'];
var dics = {};

var Db = require('../db');
var P = require('../p');
var Vow = require('vow');

function load(name)
{
    return P.call(function (fulfill, reject)
    {
        Db.find(name).then(
            function (items)
            {
                dics[name] = items;
                fulfill(items);
            },
            reject
        );
    });
}

exports.get = function ()
{
    return P.call(function (fulfill, reject)
    {
        if (dics[NAMES[0]] != undefined)
        {
            fulfill(dics);
            return;
        }

        var promises = [];
        for (var i = 0; i < NAMES.length; i++)
            promises.push(load(NAMES[i]));

        Vow.all(promises).then(function ()
        {
            fulfill(dics);
        }, reject);
    });
};

exports.update = function(name)
{
    return P.call(function (fulfill, reject)
    {
        load(name).then(fulfill, reject);
    });
};

