'use strict';

const Promise = require('bluebird');
const electron = require('electron');
const config = require('../config');
const request = require('request');

module.exports = function (app) {

    const AIRTABLE_API = config.airtableBaseUrl;

    const controller = function () { };

    // TODO ... need to find items to (add/edit/remove)
    controller.prototype.loadIdAttributeTypes = async () => {
        const url = AIRTABLE_API + "id-attributes";
        let result = await _makeRequest("get", url);
        let idAttributesArray = result.ID_Attributes;

        for (let i in idAttributesArray) {
            if (!idAttributesArray[i].data) continue;
            let item = idAttributesArray[i].data.fields;
            await electron.app.sqlLite.idAttributeType.createIfNotExists(item);
        }
    }

    /*
    controller.prototype.loadExchangeData = async () => {
        const TABLE = 'Exchanges';
        request.get(AIRTABLE_API + TABLE, (error, httpResponse, result) => {
            const data = JSON.parse(result).Exchanges;
            for (let i in data) {
                if (!data[i].data) {
                    continue;
                }
                const item = data[i].data.fields;

                if (!item.name) {
                    continue;
                }

                const dataToSave = {
                    name: item.name,
                    data: JSON.stringify(item)
                };

                await electron.app.sqlLiteService.ExchangeDataHandler.create(dataToSave);
            }
        });
    }
    */

    /**
     *
     */
    function _makeRequest(method, url, data) {
        return new Promise((resolve, reject) => {
            request[method](url, (error, httpResponse, response) => {
                try {
                    response = JSON.parse(response);
                    resolve(response);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    return controller;
};
