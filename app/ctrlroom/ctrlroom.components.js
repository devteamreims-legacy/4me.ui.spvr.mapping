(function() {

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping.ctrlroom.components
 * @description
 * # Control room components
 * Control room components
 **/
angular.module('4me.ui.spvr.mapping.ctrlroom.components', [
  '4me.core.lodash',
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


cwpButtonController.$inject = ['_', '$mdDialog', 'ctrlroomManager'];
function cwpButtonController(_, $mdDialog, ctrlroomManager) {
  var cwpButton = this;
  cwpButton.positionDisabled = true;
  cwpButton.loading = true;

  cwpButton.cwp = ctrlroomManager.getCwp(cwpButton.cwpId);

  cwpButton.getClass = function() {
    if(ctrlroomManager.isLoading() === true) {
      // No class when loading
      return '';
    }
    if(cwpButton.cwp.disabled === true) {
      return '';
    } else {
      if(cwpButton.cwp.changed === true) {
        return 'md-warn';
      }
      if(_.isEmpty(cwpButton.cwp.sectors)) {
        return 'md-primary md-hue-3';
      } else {
        return 'md-accent';
      }
    }
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
    /* Filter out disabled positions */
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

cwpDialogController.$inject = ['_', 'ctrlroomManager', '$mdDialog', 'treeSectors'];
function cwpDialogController(_, ctrlroomManager, $mdDialog, treeSectors) {
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
    ctrlroomManager.addSectors(cwpDialog.cwp.id, cwpDialog.selectedSectors);
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
    if(_.contains(cwpDialog.cwp.sectors, s)) {
      /* Already bound to position */
      return true;
    }
    if(_.contains(cwpDialog.selectedSectors, s)) {
      /* In selectedSectors */
      return true;
    }
    return false;
  };

  cwpDialog.isDisabled = function(s) {
    // Disable YR which is special
    return s === 'YR' || _.contains(cwpDialog.cwp.sectors, s);
  };

  cwpDialog.fromSuggestion = function(s) {
    console.log('Called with');
    console.log(s);
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
     * Therefore, we won't compute anything if YR is added
     * We'll just assume its status is bound to HR
     */

    if(s === 'YR') {
      return;
    }
    if(_.indexOf(cwpDialog.selectedSectors, s) !== -1) { // Already selected sector, remove it
      if(s === 'HR') {
        cwpDialog.selectedSectors = _.without(cwpDialog.selectedSectors, 'HR', 'YR');
      } else {
        cwpDialog.selectedSectors = _.without(cwpDialog.selectedSectors, s);
      }
    } else {
      if(s === 'HR') {
        cwpDialog.selectedSectors.push('HR');
        cwpDialog.selectedSectors.push('YR');
      } else {
        cwpDialog.selectedSectors.push(s);
      }
    }
    // Recompute newSectorString
    cwpDialog.newSectorString = cwpDialog.selectedSectors.join(',');
  };
}

function ctrlroomConfirmPanel(_, ctrlroomManager) {
  return {
    restrict: 'E',
    templateUrl: 'views/ctrlroom/_confirm.html',
    controller: ctrlroomConfirmPanelController,
    controllerAs: 'vm',
    scope: {}
  };
}

ctrlroomConfirmPanelController.$inject = ['_', 'ctrlroomManager'];
function ctrlroomConfirmPanelController(_, ctrlroomManager) {
  var vm = this;

  vm.isVisible = function() {
    if(ctrlroomManager.properties.hasChanges === true) {
      return true;
    } else {
      return false;
    }
  };

  vm.isLoading = function() {
    if(ctrlroomManager.properties.loading === true) {
      return true;
    } else {
      return false;
    }
  };

  vm.cancel = function() {
    return ctrlroomManager.refreshAll();
  };

  vm.confirm = function() {
    return ctrlroomManager.commitChanges();
  };
}

}());
