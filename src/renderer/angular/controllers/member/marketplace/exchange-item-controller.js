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
	const fullWallet = $rootScope.wallet.idAttributes

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
		return ($scope.realData ? $scope.realData['kyc_template'] || [] : []).indexOf(item) > -1
	}

	$http.get('http://localhost:3000/staking/verify?address=' + address).then(staked => {
		$scope.stakingStatus = staked.data.staked
		$scope.stakingAmount = staked.data.amount
	})

	$scope.checkOffer = () => {
		$http.get('http://localhost:3000/init?name=' + offer + '&address=' + address).then(res => {
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
						kycc: res.data.kycc,
						fullWallet: fullWallet
					}
				}
			})
		})
	}
}

MemberMarketplaceExchangeItemController.$inject = [
	'$rootScope',
	'$scope',
	'$log',
	'$filter',
	'$state',
	'$sce',
	'$timeout',
	'$mdDialog',
	'$mdPanel',
	'SqlLiteService',
	'CommonService',
	'RPCService',
	'$http'
]

module.exports = MemberMarketplaceExchangeItemController
