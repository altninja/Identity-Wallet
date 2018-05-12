'use strict';

const electron = require('electron');
const CoinMarketCap = require('coinmarketcap-api');
const client = new CoinMarketCap();

module.exports = function (app) {
    const ITEMS_LIMIT = 3000;
    const INTERVAL = 30000; // millis
    const controller = function () { };

    let intervalPromise = null;

    controller.prototype.startUpdater = () => {
        intervalPromise = setInterval(_loadAndSavePrices, INTERVAL);
    }

    controller.prototype.stopUpdater = () => {
        clearInterval(intervalPromise);
    }

    controller.prototype.loadAndSavePrices = _loadAndSavePrices;

    async function _loadAndSavePrices() {
        let list = await client.getTicker({ limit: ITEMS_LIMIT });
        for (let item in list.data) {
            if (intervalPromise === null) return;
            await electron.app.sqlLite.tokenPrice.updatePrices('https://coinmarketcap.com', item.symbol, item.name, +item.price_usd, +item.price_btc, +item.price_eth);
        }
        return list;
    }

    return controller;
};
