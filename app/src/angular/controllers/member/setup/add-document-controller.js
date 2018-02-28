'use strict';

function MemberSetupAddDocumentController($rootScope, $scope, $log, $state, $stateParams,  ElectronService, CommonService, RPCService) {
    'ngInject'

    $log.info('MemberSetupAddDocumentController');

    $scope.idAttributes = $rootScope.wallet.getIdAttributes();

    const ID_ATTRIBUTES = {
        'national_id': {
            type: "national_id",
            step: "STEP 4",
            title1: "Upload Your National ID",
            title2: "Your National ID",
            title3: "(can be driver's license, passport)",
            title4: "(Minimal size 1600x900px)",
        },
        'id_selfie': {
            type: "id_selfie",
            step: "STEP 5",
            title1: "Upload Selfie With ID",
            title2: "Selfie With National ID",
            title3: "(can be driver's license, passport)",
            title4: "(Minimal size 1600x900px)",
        }
    }

    $scope.selected = ID_ATTRIBUTES[$stateParams.type]
    $scope.selected.values = $rootScope.wallet.getIdAttributeItemValue($scope.selected.type);

    $scope.nextStep = (event) => {
        if ($stateParams.type === 'national_id') {
            $state.go('member.setup.add-document', { type: 'id_selfie' });
        } else {
            // TODO
            // 1) find missing ID attributes
            // 2) register alerts

            $state.go('member.dashboard.main');
        }
    }


    $scope.selectFile = (event) => {
        let selectedValue = $scope.idAttributes[$scope.selected.type].items[0].values[0];

        let addDocumentPromise = RPCService.makeCall('openDocumentAddDialog', { idAttributeItemValueId: selectedValue.id });
        addDocumentPromise.then((resp) => {
            if(!resp) return;
            $rootScope.wallet.loadIdAttributes().then((resp)=>{
                $scope.idAttributes = $rootScope.wallet.getIdAttributes();
                CommonService.showToast('success', 'Saved!');
                $scope.selected.values = "Saved!";
            });

        }).catch((error) => {
            CommonService.showToast('error', 'Max File Size: 50mb Allowed');
        });
    }


};

module.exports = MemberSetupAddDocumentController;