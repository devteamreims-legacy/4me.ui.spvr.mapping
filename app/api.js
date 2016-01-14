(function() {

'use strict';

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping.api
 * @description
 * A single service called mapping.api which provides api urls for the whole organ
 */


angular.module('4me.ui.spvr.mapping.api', [])
.constant('mapping.api', {
  rootPath: 'http://localhost:3000',
  cwp: {
    getAll: '/cwp',
    getSingle: '/cwp/', // + cwpId
    commit: '/cwp' // POST
  }
});

}());
