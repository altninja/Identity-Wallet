const electron = require('electron');

module.exports = function (knex) {

    const TABLE_NAME = 'documents';
    const Controller = function () { };
    const helpers = electron.app.helpers;

    /**
     *
     */
    Controller.findById = _findById

    async function _findById(id) {
        try {
            let rows = await knex(TABLE_NAME).select().where({ id: id });
            return rows[0];
        } catch (e) {
            throw 'documents_findById_error';
        }
    }

    return Controller;
}
