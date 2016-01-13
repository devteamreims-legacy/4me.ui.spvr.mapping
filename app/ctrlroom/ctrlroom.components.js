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

cwpDialogController.$inject = ['_', 'ctrlroomManager', '$mdDialog'];
function cwpDialogController(_, ctrlroomManager, $mdDialog) {
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
  }

  cwpDialog.setSectorsFromString = function() {
    // Get sectors from string
    return treeSectors.getFromString(s)
    // Filter and assign to selectedSectors
    .then(function(sectors) {
      var filtered = _.without(sectors, 'YR');
      vm.selectedSectors = filtered;
      return vm.selectedSectors;
    })
    // Recompute sector string
    .then(function(selectedSectors) {
      return vm.position.computeSectorString(_.union(selectedSectors, vm.position.sectors));
    })
    // Assign to vm.newSectorString
    .then(function(str) {
      vm.newSectorString = str;
    });
  };

  cwpDialog.toggleSectorsFromString = function(s) {
    // Lookup string in treeSectors
    return treeSectors.getFromString(s)
    .then(function(sectors) {
      _.each(_.without(sectors, 'YR'), function(s) {
        vm.toggleSector(s)
      });
    });
  };

  cwpDialog.toggleSector = function(s) {
    console.log('Called !');
    console.log(s);
    if(_.indexOf(cwpDialog.selectedSectors, s) !== -1) { // Already selected sector, remove it
      if(s === 'HR' || s === 'YR') {
        cwpDialog.selectedSectors = _.without(cwpDialog.selectedSectors, 'HR', 'YR');
      } else {
        cwpDialog.selectedSectors = _.without(cwpDialog.selectedSectors, s);
      }
    } else {
      if(s === 'HR' || s === 'YR') {
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
