const electron = require('electron');

module.exports = function (knex) {
    const TABLE_NAME = 'exchange_markets';
    const Controller = function () { };
    const helpers = electron.app.helpers;

    /**
     *
     */
    Controller.create = async (data) => {
        let rows = await knex(TABLE_NAME).select().where({ "name": data.name });
        if (rows && rows.length) {
            data.updatedAt = new Date().getTime();
            let resp = await knex(TABLE_NAME).update(data).where({ 'name': data.name });

            if (!resp || resp !== 1) {
                throw "error_while_updating";
            }

            let newRows = await knex.select().from(TABLE_NAME).where({ 'name': data.name })
            if (newRows && newRows.length) {
                return newRows[0];
            } else {
                throw "error_while_updating";
            }
        } else {
            data.createdAt = new Date().getTime();
            await knex(TABLE_NAME).insert(data);
            return data;
        }
    };

    Controller.findAll = async () => {
        let rows = await knex(TABLE_NAME).select();
        let data = (rows || []).map(e => {
            return { name: e.name, data: JSON.parse(e.data) };
        });
        return data;
    };

    return Controller;
};
