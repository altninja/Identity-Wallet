
const initialIdAttributeTypeList = require('../../../assets/data/initial-id-attribute-type-list.json');

exports.up = function (knex, Promise) {
    return Promise.all([
        knex.schema.createTable('id_attribute_types', (table) => {
            table.string('key').primary();
            table.string('category').notNullable();
            table.string('type').notNullable();
            table.string('entity').notNullable();
            table.integer('isInitial').defaultTo(0)
            table.integer('createdAt').notNullable();
            table.integer('updatedAt');
        }).then(() => {
            let promises = [];
            for (let i in initialIdAttributeTypeList) {
                let item = initialIdAttributeTypeList[i];
                item.entity = JSON.stringify(item.entity);
                promises.push(
                    knex('id_attribute_types').insert({
                        key: item.key,
                        category: item.category,
                        type: item.type,
                        entity: item.entity,
                        isInitial: 1,
                        createdAt: new Date().getTime()
                    })
                );
            }
            return Promise.all(promises);
        })
    ]);
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('id_attribute_types');
};
