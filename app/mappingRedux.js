import ngReduxProvider from 'ng-redux/lib/components/ngRedux';

export default angular.module('mappingNgRedux', [])
  .provider('$mappingNgRedux', ngReduxProvider)
  .name;