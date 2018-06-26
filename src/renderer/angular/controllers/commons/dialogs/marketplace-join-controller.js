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
    $scope.errmsg = ''

    console.log($rootScope.wallet.idAttributes.id_selfie.items[0].values[0].documentName)
    
    $scope.cancel = event => {
        $mdDialog.cancel()
    }

    $scope.joinOffer = () => {
        
        const options = {      
            url: 'http://localhost:3000/test/join',
            // url: 'http://localhost:3000/' + viewTags.offer,
            method: 'POST'
        }
        
        const form = {
            email: $rootScope.wallet.idAttributes.email.items[0].values[0].staticData.line1,
            password: '1234',
            first_name: $rootScope.wallet.idAttributes.first_name.items[0].values[0].staticData.line1,
            last_name: $rootScope.wallet.idAttributes.last_name.items[0].values[0].staticData.line1,
            passport : $rootScope.wallet.idAttributes.id_selfie.items[0].values[0].documentName
        }
        
        try {
            const postOffer = RPCService.makeCall('postMarketplaceAPI', { form: form , options: options })
            console.log(postOffer)
            if (postOffer) {
                RPCService.makeCall('openBrowserWindow', { url: 'http://localhost:3001/success?name=' + viewTags.offer })
            } else $scope.errmsg = 'there was an error'
        } catch (e) {

        }
        
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
