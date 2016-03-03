import _ from 'lodash';
import mappingNgRedux from '../../mappingRedux';

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping.sector-picker
 * @description
 * # SPVR MAPPING : Pick sectors to bind to CWP
 *
 */
export default angular.module('4me.ui.spvr.mapping.components.sector-picker', [mappingNgRedux])
.component('fmeMapUrmeSectors', {
  restrict: 'E',
  controller: sectorPickerController,
  templateUrl: 'views/spvr.mapping/app/components/sector-picker/urme.tpl.html',
  bindings: {
    parentToggleSectors: '&toggleSectors',
    sectors: '<',
    boundSectors: '<'
  }
})
.component('fmeMapUrmnSectors', {
  restrict: 'E',
  controller: sectorPickerController,
  templateUrl: 'views/spvr.mapping/app/components/sector-picker/urmn.tpl.html',
  bindings: {
    parentToggleSectors: '&toggleSectors',
    sectors: '<',
    boundSectors: '<'
  }
})
.name;

sectorPickerController.$inject = ['$scope'];
function sectorPickerController($scope) {

  const $ctrl = this;

  $ctrl.isChecked = (sector) => _.includes($ctrl.sectors, sector);

  $ctrl.isDisabled = (sector) => {
    const isSectorYr = sector === 'YR';
    const isSectorBound = _.includes($ctrl.boundSectors, sector);

    return isSectorYr || isSectorBound;
  };

  $ctrl.toggleSector = (sector) => $ctrl.toggleSectors([sector]);

  $ctrl.toggleSectors = (sectors) => $ctrl.parentToggleSectors({sectors});



}