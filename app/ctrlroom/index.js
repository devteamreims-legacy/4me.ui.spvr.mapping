import services from './services';
import components from './components';

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping.ctrlroom
 * @description
 * # Control room management module
 *
 * Meta module to include error components/services
 */
angular.module('4me.ui.spvr.mapping.ctrlroom', [
  '4me.ui.spvr.mapping.ctrlroom.services',
  '4me.ui.spvr.mapping.ctrlroom.components'
]);
