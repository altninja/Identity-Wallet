'use strict'

function MarketplaceJoinController(
    $rootScope,
    $scope, 
    $mdDialog, 
    $log,
    viewTags, 
    $http,
    RPCService
) {
    
    'ngInject'

    $scope.viewTags = viewTags

    $scope.cancel = event => {
        $mdDialog.cancel()
    }

    $scope.redirect = () => {
    	RPCService.makeCall('openBrowserWindow', { url: successUrl })
    }

    $scope.joinOffer = () => {
        $http.post('http://localhost:3000/' + offer, payload)
            .then(res => {
                const successUrl = 'http://localhost:3001/success?name=' + offer
            })
    }
}

MarketplaceJoinController.$inject = [
    "$rootScope",
    "$scope", 
    "$mdDialog", 
    "$log",
    "viewTags", 
    "$http",
    "RPCService"
]

module.exports = MarketplaceJoinController
