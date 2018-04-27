const ethTokensList = require('./../../../assets/data/eth-tokens.json');

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('tokens', (table) => {
            table.increments('id');
            table.string('symbol').notNullable();
            table.integer('decimal').notNullable();
            table.string('address').notNullable();
            table.binary('icon');
            table.integer('isCustom').notNullable().defaultTo(0);
            table.integer('networkId').notNullable().defaultTo(1);
            table.integer('createdAt').notNullable();
            table.integer('updatedAt');
            table.unique(['symbol', 'networkId']);
        }).then(()=>{
            let promises = [];
            for (let i in ethTokensList) {
                let item = ethTokensList[i];
                promises.push(
                    knex('tokens').insert({
                        symbol: item.symbol,
                        decimal: item.decimal,
                        address: item.address,
                        createdAt: new Date().getTime()
                    })
                );
            }
            return Promise.all(promises);
        })
    ]);
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('tokens');
};
