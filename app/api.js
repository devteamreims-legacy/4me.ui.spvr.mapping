/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping.api
 * @description
 * A single service called mapping.api which provides api urls for the whole organ
 */

const api = {
  rootPath: 'http://' + window.location.hostname + ':3100',
  mapping: {
    getMap: '/mapping',
    suggest: (cwpId) => `/mapping/cwp/${cwpId}/suggest`,
    commit: '/mapping' // POST
  },
  cwp: {
    getAll: '/cwp',
    getSingle: (cwpId) => `/cwp/${cwpId}`, // + cwpId
  },
  socket: 'http://' + window.location.hostname + ':3100'
};

angular.module('4me.ui.spvr.mapping.api', [])
.constant('mapping.api', api);

export default api;
