exports.addMinutes = function(date, minutes)
{
    date.setMinutes(date.getMinutes() + minutes);
    return date;
};

exports.addMinutesClone = function(date, minutes)
{
    var newDate = new Date(date);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    return newDate;
};

exports.addSeconds = function(date, seconds)
{
    date.setSeconds(date.getSeconds() + seconds);
    return date;
};

exports.addSecondsClone = function(date, seconds)
{
    var newDate = new Date(date);
    newDate.setSeconds(newDate.getSeconds() + seconds);
    return newDate;
};

exports.addHours = function(date, hours)
{
    date.setHours(date.getHours() + hours);
    return date;
};

exports.addHoursClone = function(date, hours)
{
    var newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
};

exports.expire = function(date, hours)
{
    var newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
};

exports.intervalHours = function(timestamp)
{
    return timestamp / 1000 / 60 / 60;
}