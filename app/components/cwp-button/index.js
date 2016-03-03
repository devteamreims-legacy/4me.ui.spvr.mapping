import _ from 'lodash';
import mappingNgRedux from '../../mappingRedux';

import {
  getCwpById,
  isDisabled,
  getName
} from '../../selectors/cwp';

import {
  getSectorsByCwpId
} from '../../selectors/map';

/**
 * @ngdoc overview
 * @name 4me.ui.cwp.xman.flight-list
 * @description
 * # XMAN : show the whole flight list
 *
 */
export default angular.module('4me.ui.spvr.mapping.components.cwp-button', [mappingNgRedux])
.component('fmeMapCwpButton', {
  restrict: 'E',
  controller: cwpButtonController,
  templateUrl: 'views/spvr.mapping/app/components/cwp-button/index.tpl.html',
  bindings: {
    cwpId: '@'
  }
})
.name;

const getClassForButton = (state, cwpId) => {
  const disabled = isDisabled(state, cwpId);
  if(disabled) {
    return {};
  }

  const boundSectors = !_.isEmpty(getSectorsByCwpId(state, cwpId));

  const defaultClass = {
    'md-primary': true
  };

  const ret = Object.assign({}, defaultClass);

  if(!boundSectors) {
    Object.assign(ret, {'md-hue-3': true});
  }

  return ret;
}

cwpButtonController.$inject = ['$mappingNgRedux', '$scope', '$mdDialog'];
function cwpButtonController($mappingNgRedux, $scope, $mdDialog) {

  const $ctrl = this;

  const mapStateToThis = (state) => {
    return {
      buttonClass: getClassForButton(state, $ctrl.cwpId),
      isDisabled: isDisabled(state, $ctrl.cwpId),
      cwpName: getName(state, $ctrl.cwpId),
      sectors: getSectorsByCwpId(state, $ctrl.cwpId)
    }
  };

  let unsubscribe = $mappingNgRedux.connect(mapStateToThis)(this);
  $scope.$on('$destroy', unsubscribe);

  $ctrl.onClick = (ev) => {
    // Return if cwp is disabled
    console.log('Event dispatched !');
    if($ctrl.isDisabled === true) {
      return;
    }
    $mdDialog.show({
      template: `
        <md-dialog flex="70">
          <fme-map-dialog
            cwp-id="{{$ctrl.cwpId}}"
            close-dialog="$ctrl.closeDialog()"
          ></fme-map-dialog>
        </md-dialog>
      `,
      // When the dialog is destroyed, dialog's scope will be destroyed too,
      // We create a new scope here, which inherits our parent's scope (cwpButtonController)
      scope: $scope.$new(),
      parent: angular.element(document).find('body'),
      targetEvent: ev,
      clickOutsideToClose: true
    });
  };

  $ctrl.closeDialog = () => $mdDialog.cancel();

}