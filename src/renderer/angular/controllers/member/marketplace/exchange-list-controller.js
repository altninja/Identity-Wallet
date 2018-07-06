'use strict'

function MemberMarketplaceExchangeListController(
	$rootScope,
	$scope,
	$log,
	$timeout,
	$mdDialog,
	$mdPanel,
	SqlLiteService,
	$sce,
	$filter,
	$http
) {
	'ngInject'

	$log.info('MemberMarketplaceMainController', SqlLiteService.getExchangeData())

	SqlLiteService.loadExchangeData().then(() => {
		$scope.exchangesList = SqlLiteService.getExchangeData()

		angular.forEach($scope.exchangesList, item => {
			if (item.data && item.data.description) {
				item.content = $filter('limitTo')(item.data.description, 150, 0)
				item.content = $sce.trustAsHtml(item.content)
			}
		})
	})

	const address = '0x' + $rootScope.wallet.getPublicKeyHex()
	$http.get('http://localhost:3000/staking/verify?address=' + address).then(staked => {
		$scope.stakingStatus = staked.data.staked
		$scope.stakingAmount = staked.data.amount
	})

}

MemberMarketplaceExchangeListController.$inject = [
	'$rootScope',
	'$scope',
	'$log',
	'$timeout',
	'$mdDialog',
	'$mdPanel',
	'SqlLiteService',
	'$sce',
	'$filter',
	'$http'
]

module.exports = MemberMarketplaceExchangeListController
