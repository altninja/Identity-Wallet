
exports.up = function (knex, Promise) {
    return knex.schema.createTable('token_prices', (table) => {
        table.string('symbol').notNullable();
        table.string('name').notNullable();
        table.string('source').notNullable();
        table.decimal('priceInUSD');
        table.decimal('priceInBTC');
        table.decimal('priceInETH');
        table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updatedAt');
        table.unique(['symbol', 'source']);
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('token_prices');
};
