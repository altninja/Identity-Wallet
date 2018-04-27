'use strict';

function StartupGuideDialogController($rootScope, $scope, $log, $q, $mdDialog, $state, SqlLiteService) {
    'ngInject'

    $log.info('StartupGuideDialogController');

    $scope.isLoading = false;

    let appSettings = SqlLiteService.getAppSettings();
    appSettings.guideShown = true;

    SqlLiteService.saveAppSettings(appSettings);

    $scope.cancel = (event) => {
        $mdDialog.cancel();
    }

    $scope.goToWalletSetup = () => {
        $scope.isLoading = true;
        $mdDialog.hide();
        $state.go('guest.welcome');
    }
};

module.exports = StartupGuideDialogController;
