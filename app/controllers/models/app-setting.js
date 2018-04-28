const electron = require('electron');

module.exports = function (knex) {

    const TABLE_NAME = 'app_settings';
    const Controller = function () { };
    const helpers = electron.app.helpers;

    /**
     *
     */
    Controller.findById = _findById;
    Controller.updateById = _updateById;

    /**
     *
     */
    async function _findById(id) {
        try {
            let rows = await knex(TABLE_NAME).select().where({id: id});
            return rows[0]
        } catch (e) {
            throw 'app_settings_findById_error';
        }
    }

    async function _updateById (id, data) {
        try {
            let updatedIds = await knex(TABLE_NAME).update(data).where({id: id});
            let rows = await knex(TABLE_NAME).select().where({id: id});
            return rows[0];
        } catch (e) {
            throw 'app_settings_updateById_error';
        }
    }

    return Controller;
}
