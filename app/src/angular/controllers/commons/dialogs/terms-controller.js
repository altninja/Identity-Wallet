'use strict';

function TermsDialogController($rootScope, $scope, $log, $q, $mdDialog, SqlLiteService) {
    'ngInject'

    $log.info('TermsDialogController');
    $scope.isLoading = false;
    $scope.step = 'main'
    $scope.scrolledBottom = false;

    let appSettings = SqlLiteService.getAppSettings();

    $scope.changeStep = (step) => {
        $scope.step = step;
    }

    $scope.agree = (event) => {
        if (process.env.NODE_ENV !== 'test') {
            if (!$scope.scrolledBottom){
                return;
            }
        }

        $scope.isLoading = true;
        appSettings.termsAccepted = true;

        let savePromise = SqlLiteService.saveAppSettings(appSettings);
        savePromise.then(() => {
            $scope.isLoading = false;
            $mdDialog.hide();
        });
    };

    $scope.notAgree = (event) => {
        $rootScope.closeApp();
    };

    $scope.scrollToEndContainer = (direction) => {
        if (direction === 'bottom') {
            $scope.scrolledBottom = true;
            $scope.$apply()
        }
    }
};

module.exports = TermsDialogController;
