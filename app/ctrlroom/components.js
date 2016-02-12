import dialog from './dialog/';

import _ from 'lodash';

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping.ctrlroom.components
 * @description
 * # Control room components
 * Control room components
 **/
angular.module('4me.ui.spvr.mapping.ctrlroom.components', [
  'ngMaterial',
  '4me.ui.spvr.mapping.ctrlroom.services',
  '4me.ui.spvr.mapping.sectors.services',
  '4me.ui.spvr.mapping.ctrlroom.dialog.components'
])
.component('fmeMapCwpButton', {
  restrict: 'E',
  bindings: {
    cwpId: '@',
  },
  controller: cwpButtonController,
  controllerAs: 'cwpButton',
  templateUrl: 'views/spvr.mapping/app/ctrlroom/button.tpl.html'
});
// Save / cancel changes button


cwpButtonController.$inject = ['$mdDialog', 'ctrlroomManager', '$scope'];
function cwpButtonController($mdDialog, ctrlroomManager, $scope) {
  var cwpButton = this;
  cwpButton.positionDisabled = true;
  cwpButton.loading = true;

  cwpButton.cwp = ctrlroomManager.getCwp(cwpButton.cwpId);

  cwpButton.classes = {};

  function isWithoutSectors() {
    return _.isEmpty(cwpButton.cwp.sectors);
  }
  

  // Angular seems to have a race condition involving ngClass
  // Throttling the call seems to work
  cwpButton.getClass = _.throttle(function() {
    return getClassObject();
  }, 100);

  function getClassObject() {
    var defaults = {
      'md-warn': false,
      'md-primary md-hue-3': false,
      'md-primary': false
    };

    var ret = _.assign({}, defaults);
    if(cwpButton.cwp.changed === true) {
      _.assign(ret, defaults, {'md-warn': true});
    } else if(isWithoutSectors()) {
      _.assign(ret, defaults, {'md-primary md-hue-3': true});
    } else {
      _.assign(ret, defaults, {'md-primary': true});
    }
    return ret;
  }

  cwpButton.isLoading = function() {
    if(ctrlroomManager.isLoading() === true) {
      return true;
    } else {
      return false;
    }
  };

  cwpButton.showDialog = function(ev) {
    // Return if cwp is disabled
    if(cwpButton.cwp.disabled === true) {
      return;
    }
    $mdDialog.show({
      controller: cwpDialogController,
      controllerAs: 'cwpDialog',
      bindToController: true,
      templateUrl: 'views/spvr.mapping/app/ctrlroom/dialog.tpl.html',
      locals: {
        cwpId: cwpButton.cwp.id
      },
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true
    });
  };

}

cwpDialogController.$inject = ['ctrlroomManager', '$mdDialog', 'treeSectors', '$log'];
function cwpDialogController(ctrlroomManager, $mdDialog, treeSectors, $log) {
  var cwpDialog = this;
  cwpDialog.cwp = ctrlroomManager.getCwp(cwpDialog.cwpId);

  if(!cwpDialog.cwp) {
    console.log('Something awful just happened');
    $mdDialog.cancel();
  }

  cwpDialog.selectedSectors = [];
  cwpDialog.newSectorString = '';

  cwpDialog.cancel = function() {
    $mdDialog.cancel();
  };

  cwpDialog.confirm = function() {
    // We need to add selectedSectors to our position
    if(!_.isEmpty(cwpDialog.selectedSectors)) {
      ctrlroomManager.addSectors(cwpDialog.cwp.id, cwpDialog.selectedSectors);
      return ctrlroomManager.commit()
        .then(function() {
          return $mdDialog.hide();
        })
        .catch(function() {
          $log.warn('Could not submit ctrlroom Map to backend !');
          // We need to show some kind of toast here
          return $mdDialog.hide();
        })
    }
    $mdDialog.hide();
  };

  cwpDialog.isLoading = function() {
    if(ctrlroomManager.isLoading() === true) {
      return true;
    } else {
      return false;
    }
  };

  cwpDialog.isChecked = function(s) {
    if(_.includes(cwpDialog.cwp.sectors, s)) {
      /* Already bound to position */
      return true;
    }
    if(_.includes(cwpDialog.selectedSectors, s)) {
      /* In selectedSectors */
      return true;
    }
    return false;
  };

  cwpDialog.isDisabled = function(s) {
    // Disable YR which is special
    return s === 'YR' || _.includes(cwpDialog.cwp.sectors, s);
  };

  cwpDialog.fromSuggestion = function(sectors) {
    var sectorGroup = treeSectors.getFromSectors(sectors);
    if(_.isEmpty(sectorGroup)) {
      console.log('This should never happen');
      return;
    }
    cwpDialog.selectedSectors = sectorGroup.elementarySectors;
    cwpDialog.confirm();
    return;
  };

  cwpDialog.toggleSectorsFromString = function(str) {
    // TODO : Handle the case about some sectors are selected, others aren't
    // Lookup string in treeSectors
    var sectorGroup = treeSectors.getFromString(str);
    if(_.isEmpty(sectorGroup)) {
      console.log('This should never happen');
      return;
    }
    _.each(sectorGroup.elementarySectors, function(s) {
      cwpDialog.toggleSector(s);
    });
  };

  cwpDialog.toggleSector = function(s) {
    /*
     * YR has a special status
     * For now, this sector exists but can't be unbound from HR
     * Therefore, we won't compute anything if YR is added or removed
     * We'll just assume the same status as HR
     */

    if(s === 'YR') {
      return;
    }
    if(_.indexOf(cwpDialog.selectedSectors, s) !== -1) { // Already selected sector, remove it
      if(s === 'HR') {
        cwpDialog.selectedSectors = _.without(cwpDialog.selectedSectors, 'YR');
      }
      cwpDialog.selectedSectors = _.without(cwpDialog.selectedSectors, s);
    } else {
      if(s === 'HR') {
        cwpDialog.selectedSectors.push('YR');
      }
      cwpDialog.selectedSectors.push(s);
    }
    // Recompute newSectorString
    _recomputeSectorString();
  };

  function _recomputeSectorString() {
    var sector = treeSectors.getFromSectors(cwpDialog.selectedSectors);
    if(!_.isEmpty(sector)) {
      cwpDialog.newSectorString = sector.name;
    } else {
      cwpDialog.newSectorString = cwpDialog.selectedSectors.join(',');
    }
  }
}
