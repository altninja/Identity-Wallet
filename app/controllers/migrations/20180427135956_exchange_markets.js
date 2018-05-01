
exports.up = function (knex, Promise) {
    return knex.schema.createTable('exchange_markets', (table) => {
        table.string('name').primary();
        table.string('data').notNullable();
        table.timestamp('createdAt').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updatedAt');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('exchange_markets');
};
