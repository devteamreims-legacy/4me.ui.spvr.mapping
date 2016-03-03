import _ from 'lodash';
import mappingNgRedux from '../../mappingRedux';

import {
  getSectorsByCwpId
} from '../../selectors/map';

import {
  getName
} from '../../selectors/cwp';

import {
  getSuggest,
  getSuggestions
} from '../../selectors/suggestions';

import {
  fetchSuggestions
} from '../../actions/suggest';

import {
  bindSectorsToCwp
} from '../../actions/map';

/**
 * @ngdoc overview
 * @name 4me.ui.cwp.xman.flight-list
 * @description
 * # XMAN : show the whole flight list
 *
 */
export default angular.module('4me.ui.spvr.mapping.components.dialog', [mappingNgRedux])
.component('fmeMapDialog', {
  restrict: 'E',
  controller: dialogController,
  templateUrl: 'views/spvr.mapping/app/components/dialog/index.tpl.html',
  bindings: {
    cwpId: '@',
    closeDialog: '&'
  }
})
.name;

dialogController.$inject = ['$scope', '$mappingNgRedux'];
function dialogController($scope, $mappingNgRedux) {

  const $ctrl = this;

  const mapStateToThis = (state) => {
    return {
      cwpName: getName(state, $ctrl.cwpId),
      boundSectors: getSectorsByCwpId(state, $ctrl.cwpId),
      localSectors: _.clone(getSectorsByCwpId(state, $ctrl.cwpId)),
      suggestions: getSuggestions(state, $ctrl.cwpId),
      suggest: getSuggest(state)
    }
  };

  const mapDispatchToThis = (dispatch) => {
    return {
      pullSuggestions: () => dispatch(fetchSuggestions($ctrl.cwpId)),
      bindSectorsToCwp: (cwpId, sectors) => dispatch(bindSectorsToCwp(cwpId, sectors))
    };
  }


  let unsubscribe = $mappingNgRedux.connect(mapStateToThis, mapDispatchToThis)(this);
  $scope.$on('$destroy', unsubscribe);

  $ctrl.pullSuggestions();

  $ctrl.toggleSectors = (sectors) => {

    const sectorsToRemove = _.intersection(sectors, $ctrl.localSectors);
    const sectorsToAdd = _.without(sectors, ...sectorsToRemove);

    // Handle HR/YR issue

    if(_.includes(sectorsToAdd, 'HR')) {
      sectorsToAdd.push('YR');
    }

    if(_.includes(sectorsToRemove, 'HR')) {
      sectorsToRemove.push('YR');
    }

    $ctrl.localSectors = _($ctrl.localSectors)
      .without(...sectorsToRemove)
      .concat(...sectorsToAdd)
      // Concat bound sectors, we don't want users to remove sectors
      .concat(...$ctrl.boundSectors)
      // Remove duplicates
      .uniq()
      .value();
  };

  $ctrl.fromSuggestion = (sectors) => {
    $ctrl.localSectors = _.clone(sectors);
    $ctrl.confirm();
  };

  $ctrl.confirm = () => {

    // Some sanity checks
    const sectorsAreAdded = !_.isEmpty(_.without($ctrl.localSectors, ...$ctrl.boundSectors));

    const sectorsAreRemoved = !_.isEmpty(_.difference($ctrl.boundSectors, $ctrl.localSectors));

    if(sectorsAreRemoved) {
      console.log('dialogController: Cannot remove sector from CWP !!!');
      return $ctrl.closeDialog();
    }

    if(!sectorsAreAdded) {
      return;
    }

    $ctrl.bindSectorsToCwp($ctrl.cwpId, $ctrl.localSectors);

    $ctrl.closeDialog();
  };

  $ctrl.cancel = () => {
    $ctrl.closeDialog();
  }

}