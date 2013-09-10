var Vow = require('vow');
exports.Vow = Vow;

exports.call = function ()
{
    var promise = Vow.promise();
    var fulfill = function(result)
    {
        promise.fulfill(result);
    };
    var reject = function(err)
    {
        promise.reject(err);
    };
    var handler = function(err, result)
    {
        if (err) promise.reject(err);
        else promise.fulfill(result);
    };
    var args = [fulfill, reject, handler];
    //for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
    arguments[0].apply(this, args);
    return promise;
};