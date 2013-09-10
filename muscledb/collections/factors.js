exports.factors = [
    {
        _id: 1000,
        group: 'food',
        name: 'food1',
        desc: 'desc',
        img: 'img',
        duration: 0,
        food: { protein: 20, carbs: 30,weight: 100 },
        cost: { money: 10, gold: 0 }
    },
    {
        _id: 1001,
        group: 'food',
        name: 'food2',
        desc: 'desc',
        img: 'img',
        duration: 0,
        food: { protein: 10, carbs: 20,weight: 200 },
        cost: { money: 20, gold: 0 }
    },
    {
        _id: 2000,
        group: 'rest',
        name: 'rest1',
        desc: 'desc',
        img: 'img',
        duration: 2,
        reg: { energy: 0.1, frazzle: 0.1, growth: 0.7 },
        cost: { money: 20, gold: 0 }
    },
    {
        _id: 2001,
        group: 'rest',
        name: 'rest2',
        desc: 'desc',
        img: 'img',
        duration: 3,
        reg: { energy: 0.2, frazzle: 0.2, growth: 0.8 },
        cost: { money: 20, gold: 1 }
    },
    {
        _id: 3000,
        group: 'stimulant',
        name: 'stimulant1',
        desc: 'desc',
        img: 'img',
        duration: 3,
        reg: { energy: 0.3, frazzle: 0.3, growth: 1.2 },
        cost: { money: 20, gold: 2 }
    },
    {
        _id: 3000,
        group: 'stimulant',
        name: 'stimulant2',
        desc: 'desc',
        img: 'img',
        duration: 8,
        reg: { energy: 0.4, frazzle: 0.4, growth: 1.3 },
        cost: { money: 20, gold: 5 }
    }
];