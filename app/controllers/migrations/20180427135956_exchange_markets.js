
exports.up = function (knex, Promise) {
    return knex.schema.createTable('exchange_markets', (table) => {
        table.string('name').primary();
        table.string('data').notNullable();
        table.integer('createdAt').notNullable();
        table.integer('updatedAt');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('exchange_markets');
};
