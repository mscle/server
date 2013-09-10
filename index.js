require('./server').start()
    .then(function ()
    {
        console.log('Listening port 8080...');
    }, function (err)
    {
        throw err;
    });