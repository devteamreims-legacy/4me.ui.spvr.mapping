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
  '4me.ui.spvr.mapping.sectors.services'
])
.component('fmeMapCwpButton', {
  restrict: 'E',
  bindings: {
    cwpId: '@',
  },
  controller: cwpButtonController,
  controllerAs: 'cwpButton',
  templateUrl: 'views/spvr.mapping/app/ctrlroom/button.tpl.html'
})
// Save / cancel changes button
.directive('ctrlroomConfirmPanel', ctrlroomConfirmPanel);


cwpButtonController.$inject = ['_', '$mdDialog'];
function cwpButtonController(_, $mdDialog) {
  var cwpButton = this;
  cwpButton.positionDisabled = true;
  cwpButton.loading = true;

  cwpButton.cwp = {
    id: 34,
    name: 'P34',
    disabled: false,
    sectors: ['E', 'SE'],
    sectorName: 'FIR'
  };

  cwpButton.getClass = function() {
    return 'md-accent';

    if(ctrlroomManager.properties.loading === true) {
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
    return false;

    if(ctrlroomManager.properties.loading === true) {
      return true;
    } else {
      return false;
    }
  };

  cwpButton.showDialog = function(ev) {
    return;
    /* Filter out disabled positions */
    if(vm.position.disabled === false) {
      $mdDialog.show({
        controller: ctrlroomDialogController,
        controllerAs: 'vm',
        bindToController: true,
        templateUrl: 'views/ctrlroom/_dialog.html',
        locals: {
          position: vm.position
        },
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }
  }

}

ctrlroomDialogController.$inject = ['_', '$scope', 'ctrlroomManager', 'position', '$mdDialog', 'treeSectors'];
function ctrlroomDialogController(_, $scope, ctrlroomManager, position, $mdDialog, treeSectors) {
  var vm = this;
  vm.position = position;
  vm.selectedSectors = [];
  vm.newSectorString = '';

  vm.cancel = function() {
    $mdDialog.cancel();
  };
  vm.confirm = function() {
    // We need to add selectedSectors to our position
    ctrlroomManager.addSectors(vm.position, vm.selectedSectors);
    $mdDialog.hide();
  };

  vm.isLoading = function() {
    if(ctrlroomManager.properties.loading === true) {
      return true;
    } else {
      return false;
    }
  };

  vm.isChecked = function(s) {
    if(_.contains(vm.position.sectors, s)) {
      /* Already bound to position */
      return true;
    }
    if(_.contains(vm.selectedSectors, s)) {
      /* In selectedSectors */
      return true;
    }
    return false;
  };

  vm.isDisabled = function(s) {
    // Disable YR which is special
    return s === 'YR' || _.contains(vm.position.sectors, s);
  };

  vm.setSectorsFromString = function(s) {
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

  vm.toggleSectorsFromString = function(s) {
    // Lookup string in treeSectors
    return treeSectors.getFromString(s)
    .then(function(sectors) {
      _.each(_.without(sectors, 'YR'), function(s) {
        vm.toggleSector(s)
      });
    });
  };

  vm.toggleSector = function(s) {
    if(_.indexOf(vm.selectedSectors, s) !== -1) { // Already selected sector, remove it
      if(s === 'HR' || s === 'YR') {
        vm.selectedSectors = _.without(vm.selectedSectors, 'HR', 'YR');
      } else {
        vm.selectedSectors = _.without(vm.selectedSectors, s);
      }
    } else {
      if(s === 'HR' || s === 'YR') {
        vm.selectedSectors.push('HR');
        vm.selectedSectors.push('YR');
      } else {
        vm.selectedSectors.push(s);
      }
    }
    // Recompute newSectorString
    vm.position.computeSectorString(_.union(vm.selectedSectors, vm.position.sectors))
    .then(function(str) {
      vm.newSectorString = str;
    });
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
