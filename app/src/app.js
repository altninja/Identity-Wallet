'use strict';

document.addEventListener('dragover', function (event) {
  event.preventDefault();
  return false;
}, false);

document.addEventListener('drop', function (event) {
  event.preventDefault();
  return false;
}, false);

/**
 *
 */
window.zxcvbn = requireNodeModule('zxcvbn');
window.qrcode = requireNodeModule('qrcode-generator');

/**
 * External Modules
 */
requireNodeModule('@uirouter/angularjs');
requireNodeModule('angular-material');
requireNodeModule('angular-messages');
requireNodeModule('angular-sanitize');
requireNodeModule('angular-local-storage');
requireNodeModule('angular-qrcode');
requireNodeModule('angular-zxcvbn');

/**
 *
 */
requireAppModule('angular/app.templates');

/**
 * main module: 'kyc-wallet'
 */
window.app = angular.module('kyc-wallet', [
  'ngMaterial',
  'ngMessages',
  'ngSanitize',
  'ui.router',
  'templates',
  'LocalStorageModule',
  'monospaced.qrcode',
  'zxcvbn'
]);

/**
 * Internal Modules
 */
const appRun = requireAppModule('angular/configs/app.run');
const appStates = requireAppModule('angular/configs/app.states');

/**
 * constants
 */
const config = requireAppModule('config', true);
let envConfig = isDevMode() ? config.default : config.production;
let appConfig = Object.assign(config.common, envConfig);

angular.module('kyc-wallet').constant('CONFIG', appConfig);

const appDictionaryConstant = requireAppModule('angular/constants/app.dictionary.constant');
angular.module('kyc-wallet').constant('DICTIONARY', appDictionaryConstant);

const appEventsConstant = requireAppModule('angular/constants/app.events.constant');
angular.module('kyc-wallet').constant('EVENTS', appEventsConstant);


/**
 * services
 */
const RPCService = requireAppModule('angular/services/rpc.service');
angular.module('kyc-wallet').service('RPCService', RPCService);

const SqlLiteService = requireAppModule('angular/services/sql-lite.service');
angular.module('kyc-wallet').service('SqlLiteService', SqlLiteService);

const CommonService = requireAppModule('angular/services/common.service');
angular.module('kyc-wallet').service('CommonService', CommonService);

const EtherScanService = requireAppModule('angular/services/ether-scan.service');
angular.module('kyc-wallet').service('EtherScanService', EtherScanService);

const Web3Service = requireAppModule('angular/services/web3.service');
angular.module('kyc-wallet').service('Web3Service', Web3Service);

const EtherUnitsService = requireAppModule('angular/services/ether-units.service');
angular.module('kyc-wallet').service('EtherUnitsService', EtherUnitsService);

const SelfkeyService = requireAppModule('angular/services/selfkey.service');
angular.module('kyc-wallet').service('SelfkeyService', SelfkeyService);

const LedgerService = requireAppModule('angular/services/ledger.service');
angular.module('kyc-wallet').service('LedgerService', LedgerService);

const SignService = requireAppModule('angular/services/sign.service');
angular.module('kyc-wallet').service('SignService', SignService);


/**
 * directives
 */
const SkCloseWarningBoxDirective = requireAppModule('angular/directives/commons/sk-close-warning-box.directive');
angular.module('kyc-wallet').directive('skCloseWarningBox', SkCloseWarningBoxDirective);

const SkOfflineWarningBoxDirective = requireAppModule('angular/directives/commons/sk-offline-warning-box.directive');
angular.module('kyc-wallet').directive('skOfflineWarningBox', SkOfflineWarningBoxDirective);

const SkLoadingDirective = requireAppModule('angular/directives/commons/sk-loading.directive');
angular.module('kyc-wallet').directive('skLoading', SkLoadingDirective);

const SkIconDirective = requireAppModule('angular/directives/commons/sk-icon.directive');
angular.module('kyc-wallet').directive('skIcon', SkIconDirective);

const SkButtonLoadingDirective = requireAppModule('angular/directives/commons/sk-button-loading.directive');
angular.module('kyc-wallet').directive('skButtonLoading', SkButtonLoadingDirective);

const SkSelectIfDirective = requireAppModule('angular/directives/commons/sk-select-if.directive');
angular.module('kyc-wallet').directive('skSelectIf', SkSelectIfDirective);

const skShowLoading = requireAppModule('angular/directives/commons/sk-show-loading.directive');
angular.module('kyc-wallet').directive('skShowLoading', skShowLoading);

const SkLinearProgressDirective = requireAppModule('angular/directives/commons/sk-linear-progress.directive');
angular.module('kyc-wallet').directive('skLinearProgress', SkLinearProgressDirective);

const SkTokenBoxDirective = requireAppModule('angular/directives/commons/sk-token-box.directive');
angular.module('kyc-wallet').directive('skTokenBox', SkTokenBoxDirective);

const SkCustomTokenBoxDirective = requireAppModule('angular/directives/commons/sk-custom-token-box.directive');
angular.module('kyc-wallet').directive('skCustomTokenBox', SkCustomTokenBoxDirective);

const SkCirclePieChartDirective = requireAppModule('angular/directives/commons/sk-circle-pie-chart.directive');
angular.module('kyc-wallet').directive('skCirclePieChart', SkCirclePieChartDirective);

const SkUserInfoBoxDirective = requireAppModule('angular/directives/commons/sk-user-info-box.directive');
angular.module('kyc-wallet').directive('skUserInfoBox', SkUserInfoBoxDirective);

const ScrollToEndDirective = requireAppModule('angular/directives/commons/scroll-to-end.directive');
angular.module('kyc-wallet').directive('scrollToEnd', ScrollToEndDirective);

const CopyToClipboardDirective = requireAppModule('angular/directives/commons/copy-to-clipboard.directive');
angular.module('kyc-wallet').directive('copyToClipboard', CopyToClipboardDirective);

const SkDoubleHeaderDirective = requireAppModule('angular/directives/commons/sk-double-header.directive');
angular.module('kyc-wallet').directive('skDoubleHeader', SkDoubleHeaderDirective);

/**
 * controllers
 */

/**
 * commons
 */
const ToastController = requireAppModule('angular/controllers/commons/toast-controller.js');
angular.module('kyc-wallet').controller('ToastController', ToastController);

const TermsDialogController = requireAppModule('angular/controllers/commons/dialogs/terms-controller.js');
angular.module('kyc-wallet').controller('TermsDialogController', TermsDialogController);

const StartupGuideDialogController = requireAppModule('angular/controllers/commons/dialogs/startup-guide-controller.js');
angular.module('kyc-wallet').controller('StartupGuideDialogController', StartupGuideDialogController);

const ReceiveTokenDialogController = requireAppModule('angular/controllers/commons/dialogs/receive-token-controller.js');
angular.module('kyc-wallet').controller('ReceiveTokenDialogController', ReceiveTokenDialogController);

const SendTokenDialogController = requireAppModule('angular/controllers/commons/dialogs/send-token-controller.js');
angular.module('kyc-wallet').controller('SendTokenDialogController', SendTokenDialogController);

const UpdateDialogController = requireAppModule('angular/controllers/commons/dialogs/update-controller.js');
angular.module('kyc-wallet').controller('UpdateDialogController', UpdateDialogController);

const PasswordWarningDialogController = requireAppModule('angular/controllers/commons/dialogs/password-warning-controller.js');
angular.module('kyc-wallet').controller('PasswordWarningDialogController', PasswordWarningDialogController);

const IdWalletInfoController = requireAppModule('angular/controllers/commons/dialogs/id-wallet-info-controller.js');
angular.module('kyc-wallet').controller('IdWalletInfoController', IdWalletInfoController);

const InfoDialogController = requireAppModule('angular/controllers/commons/dialogs/info-dialog-controller.js');
angular.module('kyc-wallet').controller('InfoDialogController', InfoDialogController);

const ConnectingToLedgerController = requireAppModule('angular/controllers/commons/dialogs/connecting-to-ledger-controller.js');
angular.module('kyc-wallet').controller('ConnectingToLedgerController', ConnectingToLedgerController);

const ChooseLedgerAddressController = requireAppModule('angular/controllers/commons/dialogs/choose-ledger-address-controller.js');
angular.module('kyc-wallet').controller('ChooseLedgerAddressController', ChooseLedgerAddressController);

const AddEditDocumentDialogController = requireAppModule('angular/controllers/commons/dialogs/id-attributes/add-edit-document-controller.js');
angular.module('kyc-wallet').controller('AddEditDocumentDialogController', AddEditDocumentDialogController);

const AddEditStaticDataDialogController = requireAppModule('angular/controllers/commons/dialogs/id-attributes/add-edit-static-data-controller.js');
angular.module('kyc-wallet').controller('AddEditStaticDataDialogController', AddEditStaticDataDialogController);

const AddIdAttributeDialogController = requireAppModule('angular/controllers/commons/dialogs/id-attributes/add-id-attribute-controller.js');
angular.module('kyc-wallet').controller('AddIdAttributeDialogController', AddIdAttributeDialogController);

const AddCustomTokenDialogController = requireAppModule('angular/controllers/commons/dialogs/add-custom-token-controller.js');
angular.module('kyc-wallet').controller('AddCustomTokenDialogController', AddCustomTokenDialogController);

const NewERC20TokenInfoController = requireAppModule('angular/controllers/commons/dialogs/new-erc20-token-info-controller.js');
angular.module('kyc-wallet').controller('NewERC20TokenInfoController', NewERC20TokenInfoController);

const ConfirmationDialogController = requireAppModule('angular/controllers/commons/dialogs/confirmation-dialog-controller.js');
angular.module('kyc-wallet').controller('ConfirmationDialogController', ConfirmationDialogController);


/**
 * guest
 */
const GuestLayoutController = requireAppModule('angular/controllers/guest/layout-controller.js');
angular.module('kyc-wallet').controller('GuestLayoutController', GuestLayoutController);

const GuestLoadingController = requireAppModule('angular/controllers/guest/loading-controller.js');
angular.module('kyc-wallet').controller('GuestLoadingController', GuestLoadingController);

/**
 * const wallet
 */
const GuestImportWalletController = requireAppModule('angular/controllers/guest/import/import-controller.js');
angular.module('kyc-wallet').controller('GuestImportWalletController', GuestImportWalletController);

const GuestImportKeystoreController = requireAppModule('angular/controllers/guest/import/keystore-controller.js');
angular.module('kyc-wallet').controller('GuestImportKeystoreController', GuestImportKeystoreController);

const GuestImportPrivateKeyController = requireAppModule('angular/controllers/guest/import/private-key-controller.js');
angular.module('kyc-wallet').controller('GuestImportPrivateKeyController', GuestImportPrivateKeyController);

const GuestImportLedgerController = requireAppModule('angular/controllers/guest/import/ledger.js');
angular.module('kyc-wallet').controller('GuestImportLedgerController', GuestImportLedgerController);

/**
 * create wallet
 */
const GuestKeystoreCreateStep1Controller = requireAppModule('angular/controllers/guest/create/step-1.controller.js');
angular.module('kyc-wallet').controller('GuestKeystoreCreateStep1Controller', GuestKeystoreCreateStep1Controller);

const GuestKeystoreCreateStep2Controller = requireAppModule('angular/controllers/guest/create/step-2.controller.js');
angular.module('kyc-wallet').controller('GuestKeystoreCreateStep2Controller', GuestKeystoreCreateStep2Controller);

const GuestKeystoreCreateStep3Controller = requireAppModule('angular/controllers/guest/create/step-3.controller.js');
angular.module('kyc-wallet').controller('GuestKeystoreCreateStep3Controller', GuestKeystoreCreateStep3Controller);

const GuestKeystoreCreateStep4Controller = requireAppModule('angular/controllers/guest/create/step-4.controller.js');
angular.module('kyc-wallet').controller('GuestKeystoreCreateStep4Controller', GuestKeystoreCreateStep4Controller);

const GuestKeystoreCreateStep5Controller = requireAppModule('angular/controllers/guest/create/step-5.controller.js');
angular.module('kyc-wallet').controller('GuestKeystoreCreateStep5Controller', GuestKeystoreCreateStep5Controller);

const GuestKeystoreCreateStep6Controller = requireAppModule('angular/controllers/guest/create/step-6.controller.js');
angular.module('kyc-wallet').controller('GuestKeystoreCreateStep6Controller', GuestKeystoreCreateStep6Controller);


/**
 * member
 */
const MemberLayoutController = requireAppModule('angular/controllers/member/layout-controller.js');
angular.module('kyc-wallet').controller('MemberLayoutController', MemberLayoutController);

const MemberRightSidenavController = requireAppModule('angular/controllers/member/right-sidenav-controller.js');
angular.module('kyc-wallet').controller('MemberRightSidenavController', MemberRightSidenavController);


/**
 * setup
 */
const MemberSetupLayoutController = requireAppModule('angular/controllers/member/setup/layout-controller.js');
angular.module('kyc-wallet').controller('MemberSetupLayoutController', MemberSetupLayoutController);

const MemberSetupChecklistController = requireAppModule('angular/controllers/member/setup/checklist-controller.js');
angular.module('kyc-wallet').controller('MemberSetupChecklistController', MemberSetupChecklistController);

const MemberSetupAddDocumentController = requireAppModule('angular/controllers/member/setup/add-document-controller.js');
angular.module('kyc-wallet').controller('MemberSetupAddDocumentController', MemberSetupAddDocumentController);


/**
 * dashboard
 */
const MemberDashboardMainController = requireAppModule('angular/controllers/member/dashboard/main-controller.js');
angular.module('kyc-wallet').controller('MemberDashboardMainController', MemberDashboardMainController);


/**
 * wallet (TODO rename to token)
 */
const ManageTokenController = requireAppModule('angular/controllers/member/wallet/manage-token-controller.js');
angular.module('kyc-wallet').controller('ManageTokenController', ManageTokenController);

const ManageCryptosController = requireAppModule('angular/controllers/member/wallet/manage-cryptos-controller.js');
angular.module('kyc-wallet').controller('ManageCryptosController', ManageCryptosController);


/**
 * id wallet
 */
const MemberIdWalletMainController = requireAppModule('angular/controllers/member/id-wallet/main-controller.js');
angular.module('kyc-wallet').controller('MemberIdWalletMainController', MemberIdWalletMainController);

/**
 * marketplace
 */
const MemberMarketplaceExchangeListController = requireAppModule('angular/controllers/member/marketplace/exchange-list-controller.js');
angular.module('kyc-wallet').controller('MemberMarketplaceExchangeListController', MemberMarketplaceExchangeListController);

const MemberMarketplaceExchangeItemController = requireAppModule('angular/controllers/member/marketplace/exchange-item-controller.js');
angular.module('kyc-wallet').controller('MemberMarketplaceExchangeItemController', MemberMarketplaceExchangeItemController);


/**
 * config states
 */
angular.module('kyc-wallet').config(appStates);

/**
 * config run
 */
angular.module('kyc-wallet').run(appRun);

/**
 * bootstrap app
 */
/*
angular.bootstrap(document, ['kyc-wallet'], {
  strictDi: true
});
*/
