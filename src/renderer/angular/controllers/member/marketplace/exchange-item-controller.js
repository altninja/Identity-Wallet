'use strict'

function MemberMarketplaceExchangeItemController(
    $rootScope, 
    $scope, 
    $log, 
    $filter, 
    $state, 
    $sce, 
    $timeout, 
    $mdDialog, 
    $mdPanel, 
    SqlLiteService, 
    CommonService, 
    RPCService, 
    $http
) {
    
    'ngInject'

    $scope.realData = $state.params.data

    const address = '0x' + $rootScope.wallet.getPublicKeyHex()
    const offer = $state.params.data.name.toLowerCase()
    const logo = $state.params.data.logo[0].thumbnails.large.url

    console.log($rootScope.wallet)
    console.log($state.params.data)

    $log.info('MemberMarketplaceExchangeItemController')

    // Initial 300 characters will be displayed.
    $scope.strLimit = 300
    
    $scope.toggle = () => {
        $scope.realData.text = $filter('limitTo')($scope.realData.description, $scope.strLimit, 0)
        $scope.realData.text = $sce.trustAsHtml($scope.realData.text)
    }
    
    $scope.toggle()

    // Event trigger on click of the Show more button.
    $scope.showMore = () => {
        $scope.strLimit = $scope.realData.description.length
        $scope.toggle()
    }

    // Event trigger on click on the Show less button.
    $scope.showLess = () => {
        $scope.strLimit = 300
        $scope.toggle()
    }

    $scope.isInKycFields = item => {
        return ($scope.realData ? $scope.realData['kyc_template'] || [] : []).indexOf(item) > -1;
    }

    $scope.checkOffer = () => {
        console.log('YO')
        console.log(address)
        console.log(offer)

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

        $http.get('http://localhost:3000/init?name=' + offer + '&address=' + address)
            .then(res => {
                console.log(res.data)
                $mdDialog.show({
                    controller: 'MarketplaceJoinController',
                    templateUrl: 'common/dialogs/marketplace-join.html',
                    parent: angular.element(document.body),
                    targetEvent: event,
                    clickOutsideToClose: true,
                    fullscreen: false,
                    escapeToClose: false,
                    locals: {
                        viewTags: {
                            logo: logo,
                            offer: offer,
                            address: address,
                            required: res.data.required,
                            password: res.data.password,
                            kycc: res.data.kycc  
                        }
                    }
                })
        })
    }

}

MemberMarketplaceExchangeItemController.$inject = [
    "$rootScope", 
    "$scope", 
    "$log", 
    "$filter", 
    "$state", 
    "$sce", 
    "$timeout", 
    "$mdDialog", 
    "$mdPanel", 
    "SqlLiteService", 
    "CommonService", 
    "RPCService", 
    "$http"
]

module.exports = MemberMarketplaceExchangeItemController
