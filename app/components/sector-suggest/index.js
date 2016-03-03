import _ from 'lodash';
import mappingNgRedux from '../../mappingRedux';

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping
 * @description
 * # SPVR MAPPING : Show suggestion buttons
 *
 */
export default angular.module('4me.ui.spvr.mapping.components.sector-suggest', [mappingNgRedux])
.component('fmeMapSectorSuggest', {
  restrict: 'E',
  controller: suggestController,
  templateUrl: 'views/spvr.mapping/app/components/sector-suggest/index.tpl.html',
  bindings: {
    onClick: '&',
    suggestions: '<',
    error: '=',
    isLoading: '='
  }
})
.name;

function suggestController() {
  const $ctrl = this;
  
  $ctrl.pickSuggestion = (sectors) => $ctrl.onClick({sectors});

}