
exports.up = function (knex, Promise) {
    return knex.schema.createTable('token_prices', (table) => {
        table.increments('id');
        table.string('symbol').notNullable().unique();
        table.string('name').notNullable();
        table.string('source');
        table.decimal('priceInUSD');
        table.decimal('priceInBTC');
        table.decimal('priceInETH');
        table.integer('createdAt').notNullable();
        table.integer('updatedAt');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('token_prices');
};
