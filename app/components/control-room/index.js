import _ from 'lodash';
import mappingNgRedux from '../../mappingRedux';


import {
  isLoading,
  isErrored,
  getCommitError,
  getRefreshError
} from '../../selectors/map';

/**
 * @ngdoc overview
 * @name 4me.ui.cwp.xman.flight-list
 * @description
 * # XMAN : show the whole flight list
 *
 */
export default angular.module('4me.ui.spvr.mapping.components.control-room', [mappingNgRedux])
.component('fmeMapControlRoom', {
  restrict: 'E',
  controller: controlRoomController,
  templateUrl: 'views/spvr.mapping/app/components/control-room/index.tpl.html'
})
.name;

controlRoomController.$inject = ['$mappingNgRedux', '$scope'];
function controlRoomController($mappingNgRedux, $scope) {

  const mapStateToThis = (state) => ({
      isLoading: isLoading(state),
      isErrored: isErrored(state),
      commitError: getCommitError(state),
      refreshError: getRefreshError(state)
  });

  let unsubscribe = $mappingNgRedux.connect(mapStateToThis)(this);
  $scope.$on('$destroy', unsubscribe);

}