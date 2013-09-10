exports.REMOTE = {
    host: 'linus.mongohq.com',
    port: 10008,
    database: 'muscledb-test'
};

exports.LOCAL = {
    host: '127.0.0.1',
    port: 27017,
    database: 'muscledb-test'
};

exports.DEVELOP = {
    host: '127.0.0.1',
    port: 27017,
    database: 'muscledb-develop',
    username: 'jonrayen',
    password: '24547294'
};

var defaultOptions = exports.DEVELOP;
var Mongo = require('mongodb');
var Server = Mongo.Server;
var Db = Mongo.Db;
var P = require('./p');
var Vow = require('vow');
var init = false;

exports.connect = function(options)
{
    var dbInstance = new Db(
        options.database,
        new Server(
            options.host,
            options.port,
            {auto_reconnect: true},
            {}
        )
    );

    return P.call(function(fulfill, reject)
    {
        dbInstance.open(function(err, db)
        {
            if (err) reject(err);
            else
            {
                exports.db = db;
                auth(options).then(fulfill, reject);
            }
        });
    });
};

function auth(options)
{
    return P.call(function(fulfill, reject, handler)
    {
        exports.db.authenticate(options.username, options.password, handler);
    });
}

exports.initDevelop = function()
{
    return exports.init(exports.DEVELOP);
};


exports.init = function(options)
{
    return P.call(function(fulfill, reject)
    {
        if (init == true)
        {
            fulfill();
            return;
        }
        exports.connect(options)
            .then(
            function()
            {
                return exports.collection('players');
            }, reject
        ).then(
            function(players)
            {
                exports.players = players;
                return exports.collection('exercises');
            }, reject
        ).then(
            function(exercises)
            {
                exports.exercises = exercises;
                return require('./routes/dics').get();
            }, reject
        ).then(
            function(dics)
            {
                exports.dics = dics;
                init = true;
                fulfill();
            }, reject);
    });
};

exports.collection = function(name)
{
    return P.call(function(fulfill, reject, handler)
    {
        exports.db.collection(name, handler);
    });
};

exports.find = function(collName)
{
    return P.call(function(fulfill, reject, handler)
    {
        exports.collection(collName).then(
            function(coll)
            {
                coll.find({$query: {}, $orderby: { _id: 1 }}).toArray(handler);
            }, reject
        );
    });
};

exports.remove = function(collName)
{
    return P.call(function(fulfill, reject, handler)
    {
        exports.collection(collName).then(
            function(coll)
            {
                coll.remove(handler);
            }, reject
        );
    });
};

exports.insert = function(collName, value)
{
    return P.call(function(fulfill, reject, handler)
    {
        exports.collection(collName).then(
            function(coll)
            {
                coll.insert(value, handler);
            }, reject
        );
    });
};

exports.dropDatabase = function()
{
    return P.call(function(fulfill, reject, handler)
    {
        exports.db.dropDatabase(handler);
    });
};

exports.addUser = function()
{
    return P.call(function(fulfill, reject, handler)
    {
        exports.db.addUser(defaultOptions.username, defaultOptions.password, false, handler);
    });
};