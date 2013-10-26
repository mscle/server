exports.ENERGY_MAX = 100;
exports.START_MONEY = 125;

exports.newPlayer = function(id, level)
{
    return {
        _id: id,
        jobbing: {
            nextTime: new Date()
        },
        private: {
            money: exports.START_MONEY,
            energy: exports.ENERGY_MAX,
            energyMax: exports.ENERGY_MAX,
            reg: {
                lastUpdateTime: new Date(),
                lastCheckLevelUpTime: new Date()
            }
        },
        public: {
            level: level
        },
        body: [
            {
                _id: 0,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 1,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 2,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 3,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 4,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 5,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 6,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 7,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 8,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 9,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 10,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 11,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 12,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 13,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 14,
                stress: 0,
                frazzle: 0
            },
            {
                _id: 15,
                stress: 0,
                frazzle: 0
            }
        ]
    };
};

var player0 = exports.newPlayer(0, 120);
var player1 = exports.newPlayer(1, 2);
var player2 = exports.newPlayer(2, 6);
var player3 = exports.newPlayer(3, 3);
var player4 = exports.newPlayer(4, 7);
var player5 = exports.newPlayer(5, 10);

exports.players = [
    player0, player1, player2, player3, player4, player5
];