'use strict';

function MemberMarketplaceExchangeItemController($rootScope, $scope, $log, $filter, $state, $sce, $timeout, $mdDialog, $mdPanel, SqlLiteService, CommonService, RPCService, $http) {
    'ngInject'

    $scope.realData = $state.params.data;

    $log.info('MemberMarketplaceExchangeItemController');

    // Initial 300 characters will be displayed.
    $scope.strLimit = 300;
    $scope.toggle = function () {
        $scope.realData.text = $filter('limitTo')($scope.realData.description, $scope.strLimit, 0);
        $scope.realData.text = $sce.trustAsHtml($scope.realData.text);
    };
    $scope.toggle();

    // Event trigger on click of the Show more button.
    $scope.showMore = function () {
        $scope.strLimit = $scope.realData.description.length;
        $scope.toggle();
    };

    // Event trigger on click on the Show less button.
    $scope.showLess = function () {
        $scope.strLimit = 300;
        $scope.toggle();
    };

    $scope.isInKycFields = function (item) {
        return ($scope.realData ? $scope.realData['kyc_template'] || [] : []).indexOf(item) > -1;
    }

    $scope.joinOffer = function(name) {
        console.log(name)
        // check staking status of wallet
            // send data to main via IPC
            // do web3 request via node
            // return true / false staking passed
            // UI explainer

        
        // send request with offer object to SK API
            // exchange name
            // exchange id
            // user data attributes (name email etc...)
            // user documents (selfie etc...)
        $http.post('http://localhost:3000/test/join', {name: name}).then(function(res) {
            // redirect to X depending on response 
            console.log(res.data.name)
            $mdDialog.show({
                controller: 'MarketplaceJoinController',
                templateUrl: 'common/dialogs/marketplace-join.html',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose: false,
                fullscreen: false,
                escapeToClose: false,
                locals: {
                    text: res.data.message,
                    title: 'Join Offer',
                    offerName: res.data.name,
                    successUrl: 'http://localhost:3001/success?name=' + res.data.name
                }
            })
        })    
    };

};
MemberMarketplaceExchangeItemController.$inject = ["$rootScope", "$scope", "$log", "$filter", "$state", "$sce", "$timeout", "$mdDialog", "$mdPanel", "SqlLiteService", "CommonService", "RPCService", "$http"];
module.exports = MemberMarketplaceExchangeItemController;
