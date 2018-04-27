
exports.up = function (knex, Promise) {
    return knex.schema.createTable('documents', (table) => {
        table.increments('id');
        table.string('name').notNullable();
        table.string('mimeType').notNullable();
        table.integer('size').notNullable();
        table.binary('buffer').notNullable();
        table.integer('createdAt').notNullable();
        table.integer('updatedAt');
    });
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('documents');
};
