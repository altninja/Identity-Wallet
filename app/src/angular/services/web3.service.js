const Wallet = requireAppModule('angular/classes/wallet');
const EthUnits = requireAppModule('angular/classes/eth-units');
const EthUtils = requireAppModule('angular/classes/eth-utils');
const Token = requireAppModule('angular/classes/token');

const ABI = requireAppModule('angular/store/abi.json').abi;

function dec2hexString(dec) {
    return '0x' + (dec + 0x10000).toString(16).substr(-4).toUpperCase();
}

// documentation
// https://www.myetherapi.com/
function Web3Service($rootScope, $window, $q, $timeout, $log, $http, $httpParamSerializerJQLike, EVENTS, CommonService, $interval, CONFIG, SqlLiteService) {
    'ngInject';

    $log.info('Web3Service Initialized');

    /**
     *
     */
    const REQUEST_INTERVAL_DELAY = 500;

    /**
     *
     */
    const SERVER_CONFIG = {
        mew: {
            1: { url: "https://api.myetherapi.com/eth" },
            3: { url: "https://api.myetherapi.com/rop" }
        },
        infura: {
            1: { url: "https://mainnet.infura.io" },
            3: { url: "https://ropsten.infura.io" }
        }
    }

    const SELECTED_SERVER_URL = SERVER_CONFIG[CONFIG.node][CONFIG.chainId].url;

    let lastRequestTime = 0;
    const requestQueue = [];

    /**
     *
     */
    class Web3Service {

        constructor() {
            Web3Service.web3 = new Web3();

            Web3Service.web3.setProvider(new Web3Service.web3.providers.HttpProvider(SELECTED_SERVER_URL));

            EthUtils.web3 = new Web3();
            window.EthUtils = EthUtils;


            Web3Service.q = async.queue((data, callback) => {
                $log.info("WEB3 REQUESTS IN QUEUE: ", Web3Service.q.length(), "######");

                let baseFn = data.contract ? data.contract : Web3Service.web3.eth;
                let self = data.contract ? data.contract : this;

                if (data.baseFn) {
                    baseFn = data.baseFn;
                }

                let promise = baseFn[data.method].apply(self, data.args)

                $timeout(() => {
                    callback(promise);
                }, REQUEST_INTERVAL_DELAY);
            }, 1);
        }

        static getContractPastEvents(contract, args) {
            let defer = $q.defer();

            // wei
            Web3Service.waitForTicket(defer, 'getPastEvents', args, contract);

            return defer.promise;
        }

        getContractInfo(contractAddress) {

            let deferDecimal = $q.defer();
            let deferSymbol = $q.defer();

            var tokenContract = new Web3Service.web3.eth.Contract(ABI,contractAddress);
            let decimalFn = tokenContract.methods.decimals();
            var symbolFn = tokenContract.methods.symbol();

            // wei
            Web3Service.waitForTicket(deferDecimal, 'call', [], null, decimalFn);
            Web3Service.waitForTicket(deferSymbol, 'call', [], null, symbolFn);

            return $q.all([deferDecimal.promise,deferSymbol.promise]);
        }

        getMostRecentBlockNumber() {
            let defer = $q.defer();

            // wei
            Web3Service.waitForTicket(defer, 'getBlockNumber', []);

            return defer.promise;
        }

        static getMostRecentBlockNumberStatic() {
            let defer = $q.defer();

            // wei
            Web3Service.waitForTicket(defer, 'getBlockNumber', []);

            return defer.promise;
        }

        getBalance(addressHex) {
            let defer = $q.defer();

            // wei
            Web3Service.waitForTicket(defer, 'getBalance', [addressHex]);

            return defer.promise;
        }

        getTokenBalanceByData(data) {
            let defer = $q.defer();

            // wei
            Web3Service.waitForTicket(defer, 'call', [data]);

            return defer.promise;
        }

        getEstimateGas(fromAddressHex, toAddressHex, amountHex) {
            let defer = $q.defer();

            let args = {
                "from": fromAddressHex,
                "to": toAddressHex,
                "value": amountHex
            }

            // wei
            Web3Service.waitForTicket(defer, 'estimateGas', [args]);

            return defer.promise;
        }

        getGasPrice() {
            let defer = $q.defer();

            // wei
            Web3Service.waitForTicket(defer, 'getGasPrice', []);

            return defer.promise;
        }

        getTransactionCount(addressHex) {
            let defer = $q.defer();

            // number
            Web3Service.waitForTicket(defer, 'getTransactionCount', [addressHex, 'pending']);

            return defer.promise;
        }

        sendRawTransaction(signedTxHex) {
            let defer = $q.defer();

            Web3Service.waitForTicket(defer, 'sendSignedTransaction', [signedTxHex]);

            return defer.promise;
        }

        getTransaction(transactionHex) {
            let defer = $q.defer();

            Web3Service.waitForTicket(defer, 'getTransaction', [transactionHex]);

            return defer.promise;
        }

        getTransactionReceipt(transactionHex) {
            let defer = $q.defer();

            Web3Service.waitForTicket(defer, 'getTransactionReceipt', [transactionHex]);

            return defer.promise;
        }

        static getBlock(blockNumber, withTransactions) {
            withTransactions = withTransactions || false;
            let defer = $q.defer();

            // wei
            Web3Service.waitForTicket(defer, 'getBlock', [blockNumber, withTransactions]);

            return defer.promise;
        }


        static waitForTicket(defer, method, args, contract, baseFn) {
            Web3Service.q.push({ method: method, args: args, contract: contract, baseFn: baseFn }, (promise) => {
                $log.info("handle response", method);
                promise.then((response) => {
                    $log.info("method response", method, response);
                    defer.resolve(response)
                }).catch((error) => {
                    $log.error("method response error", method, error);
                    defer.reject(error);
                });
            });
        }
    };

    return new Web3Service();
}

module.exports = Web3Service;
