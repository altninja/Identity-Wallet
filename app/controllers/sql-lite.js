#!/usr/bin/env node

const electron = require('electron');
const knexMigrate = require('knex-migrate');
const path = require('path');
const config = { cwd: './app/controllers' };

module.exports = function () {

    let scope = this;

    this.init = async function () {
        try {
            const log = ({ action, migration }) => console.log('Doing ' + action + ' on ' + migration);
            await knexMigrate('up', config, log);

            scope.knex = require('knex')({
                client: 'sqlite3',
                useNullAsDefault: true,
                connection: {
                    filename: path.join(electron.app.getPath('userData'), 'IdentityWalletStorage.sqlite')
                }
            });

            _initModels();
        } catch (e) {
            console.log(">>>>", e);
        }
    }

    /**
     *
     */
    function _initModels() {
        scope.wallet = require('./models/wallet.js')(scope.knex);
        scope.appSetting = require('./models/app-setting.js')(scope.knex);
        scope.idAttributeType = require('./models/id-attribute-type.js')(scope.knex);
        scope.idAttribute = require('./models/id-attribute.js')(scope.knex);
        scope.token = require('./models/token.js')(scope.knex);
        scope.walletToken = require('./models/wallet-token.js')(scope.knex);
        scope.actionLog = require('./models/action-log.js')(scope.knex);
    }
}
