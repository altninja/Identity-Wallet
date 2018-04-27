exports.up = function (knex, Promise) {
    return knex.schema.createTable('action_logs', (table) => {
        table.increments('id');
        table.integer('walletId').notNullable().references('wallets.id');
        table.string('title');
        table.string('content');
        table.integer('createdAt').notNullable();
        table.integer('updatedAt');
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('action_logs');
};
