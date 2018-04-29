const EthUnits = requireAppModule('angular/classes/eth-units');
const EthUtils = requireAppModule('angular/classes/eth-utils');
const Token = requireAppModule('angular/classes/token');


function MemberLayoutController($rootScope, $scope, $log, $mdDialog, $mdSidenav, $interval, $timeout, $state, Web3Service, RPCService) {
    'ngInject'

    $scope.showScrollStyle = false;

    var OSName = "Unknown OS";
    if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
    if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";

    if (OSName === 'Windows') {
        $scope.showScrollStyle = true;
    }

    $log.info('MemberLayoutController', OSName);

    /**
     * trigger airdrop (if its not trigger yet)
     */
    if($rootScope.wallet.airDropCode){
        SelfkeyService.triggerAirdrop($rootScope.wallet.airDropCode).then(() => {
            RPCService.makeCall('wallet_removeAirdropCode', { walletId: $rootScope.wallet.id, airDropCode: $rootScope.wallet.airDropCode }).then((wallet) => {
                $rootScope.wallet.airDropCode = null;
            });
        });
    }

    /**
     *
     */
    $scope.openRightSidenav = () => {
        $mdSidenav('right').toggle().then(() => {
            $log.debug("toggle " + "right" + " is done");
        });
    }
};

module.exports = MemberLayoutController;
