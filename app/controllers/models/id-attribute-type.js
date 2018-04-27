const electron = require('electron');

module.exports = function (knex) {

    const TABLE_NAME = 'id_attribute_types';
    const Controller = function () { };
    const helpers = electron.app.helpers;

    /**
     *
     */
    Controller.createIfNotExists = _createIfNotExists;
    Controller.findAll = _findAll;

    /**
     *
     */
    async function _createIfNotExists(data) {
        try {
            let rows = await knex(TABLE_NAME).select().where({ "key": data.key });

            if (rows && rows.length) {
                return rows[0];
            } else {
                let dataToSave = {
                    key: data.key,
                    type: data.type[0],
                    category: data.category,
                    entity: JSON.stringify(data.entity),
                    createdAt: new Date().getTime()
                };

                let insertedIds = await knex(TABLE_NAME).insert(dataToSave);
                dataToSave.id = insertedIds[0];

                return dataToSave;
            }
        } catch (e) {
            throw 'id_attribute_types_findAll_error';
        }
    }

    async function _findAll() {
        try {
            return await knex(TABLE_NAME).select();
        } catch (e) {
            throw 'id_attribute_types_findAll_error';
        }
    }

    return Controller;
}
