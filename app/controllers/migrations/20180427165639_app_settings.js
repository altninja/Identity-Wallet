exports.up = function (knex, Promise) {

    return Promise.all([
        knex.schema.createTable('app_settings', (table) => {
            table.increments('id');
            table.integer('guideShown').defaultTo(0);
            table.integer('icoAdsShown').defaultTo(0);
            table.integer('termsAccepted').defaultTo(0);
            table.integer('createdAt').notNullable();
            table.integer('updatedAt');
        }).then((resp) => {
            let appSetting = {
                id: 1,
                createdAt: new Date().getTime()
            };
            return knex('app_settings').insert(appSetting)
        }).catch((error) => {
            reject(error);
        })
    ]);
};

exports.down = function (knex, Promise) {
    return knex.schema.dropTableIfExists('app_settings');
};
