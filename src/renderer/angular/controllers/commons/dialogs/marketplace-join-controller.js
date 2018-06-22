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

    $scope.joinOffer = (email, password) => {
        const payload = {
            email: email,
            password: password
        }
        $http.post('http://localhost:3000/' + viewTags.offer, payload)
            .then(res => {
                const successUrl = 'http://localhost:3001/success?name=' + viewTags.offer
                RPCService.makeCall('openBrowserWindow', { url: successUrl })
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
