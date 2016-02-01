(function() {
'use strict';

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping.ctrlroom.dialog.components
 * @description
 * # Mapping dialog components
 *
 * <fme-map-sector-suggest>
 * <fme-map-urme-sectors>
 * <fme-map-urmn-sectors>
 */

var dialogComponents = angular.module('4me.ui.spvr.mapping.ctrlroom.dialog.components', [
  '4me.core.lodash',
  '4me.ui.spvr.mapping.ctrlroom.services'
]);

// <fme-map-sector-suggest>
dialogComponents.component('fmeMapSectorSuggest', {
  restrict: 'E',
  bindings: {
    cwpId: '@',
    clickCallback: '&'
  },
  controller: sectorSuggestController,
  controllerAs: 'sectorSuggest',
  templateUrl: 'views/spvr.mapping/app/ctrlroom/dialog/suggest.tpl.html'
});

sectorSuggestController.$inject = ['_', 'sectorSuggestion'];
function sectorSuggestController(_, sectorSuggestion) {
  var sectorSuggest = this;

  sectorSuggest.suggestedSectors = [];
  sectorSuggest.loading = true;

  sectorSuggest.click = function(sectors) {
    return sectorSuggest.clickCallback({sectors: sectors});
  };

  sectorSuggestion.get(sectorSuggest.cwpId)
    .then(function(suggestions) {
      _.each(suggestions, function(s) {
        sectorSuggest.suggestedSectors.push(s);
      });
      sectorSuggest.loading = false;
    })
    .catch(function(err) {
      sectorSuggest.loading = false;
    });
}

// <fme-map-urme-sectors>
dialogComponents.directive('fmeMapUrmeSectors', function() {
  return {
    restrict: 'E',
    scope: true,
    templateUrl: 'views/spvr.mapping/app/ctrlroom/dialog/urme.tpl.html'
  };
});

// <fme-map-urme-sectors>
dialogComponents.directive('fmeMapUrmnSectors', function() {
  return {
    restrict: 'E',
    // TODO : Angular decided to break the possibility to have a non isolated scope
    scope: true,
    templateUrl: 'views/spvr.mapping/app/ctrlroom/dialog/urmn.tpl.html'
  };
});

}());
