'use strict';

function GuestKeystoreCreateStep5Controller($rootScope, $scope, $log, $state, $stateParams, $mdDialog, $timeout, SqlLiteService, RPCService, CommonService, SelfkeyService) {
    'ngInject'

    $log.info('GuestKeystoreCreateStep5Controller');

    $scope.createBasicId = (event) => {
        $state.go('guest.create.step-6');
    }

    $scope.importKycFile = (event) => {
        RPCService.makeCall('idAttribute_importFromKYCPackage', { walletId: $rootScope.wallet.id }).then((data) => {
            //on cancel choose a file
            if (!data) {
                return;
            }

            SelfkeyService.triggerAirdrop(data.airDropCode).then(() => {
                RPCService.makeCall('wallet_removeAirdropCode', { walletId: $rootScope.wallet.id, airDropCode: data.airDropCode }).then((wallet) => {
                    $rootScope.wallet.airDropCode = null;
                });
            });

            $rootScope.wallet.loadIdAttributes().then(() => {
                $state.go('guest.create.step-6', {type: 'kyc_import'});
            })
        }).catch((error) => {
            CommonService.showToast('error', 'Error');
        });
    }
};

module.exports = GuestKeystoreCreateStep5Controller;
