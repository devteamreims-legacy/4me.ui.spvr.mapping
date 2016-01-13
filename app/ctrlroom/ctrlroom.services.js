(function() {
'use strict';

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping.ctrlroom.services
 * @description
 * # Errors Services
 *
 * Errors Services
 */

angular.module('4me.ui.spvr.mapping.ctrlroom.services', [
  '4me.core.config',
  '4me.core.lodash'
])
.factory('ctrlroomManager', ctrlroomManager);

ctrlroomManager.$inject = ['_', '$http', '$q', '$log'];
function ctrlroomManager(_, $http, $q, $log) {
  var service = {};
  var cwps = [];
  var properties = {
    loading: true
  };

  var cdsBackendUrl = 'http://localhost:3000';
  var loadingPromise;

  var apiEndpoints = {
    getAll: cdsBackendUrl + '/cwp',
    getSingle: cdsBackendUrl + '/cwp/', // + positionId
    addSectors: '/cwp' // POST whole control room status
  };


  function _createCwp(cwpId) {
    return {
      id: cwpId,
      name: 'P' + cwpId,
      disabled: false,
      sectors: [],
      sectorName: '',
      changed: false
    };
  }

  function getCwp(cwpId) {
    var cwp = _.findWhere(cwps, {id: parseInt(cwpId)});
    // Nothing in cache
    if(cwp === undefined) {
      cwp = _createCwp(parseInt(cwpId));
      cwps.push(cwp);
    }
    return cwp;
  }

  function refreshFromBackend() {
    return _loadFromBackend();
  }

  function _loadFromBackend() {
    properties.loading = true;
    if(loadingPromise !== undefined) {
      // We are currently already loading stuff from backend
      return loadingPromise;
    }

    loadingPromise = $http({
      method: 'GET',
      url: apiEndpoints.getAll
    })
    .then(function(res) {
      $log.debug('Got cwp from backend !');
      $log.debug(res.data);

      _.each(res.data, function(c) {
        $log.debug('Parsing data for cwp : ');
        $log.debug(c);
        var cwp = getCwp(parseInt(c.id));
        cwp.disabled = c.disabled;
        cwp.name = c.name;
        cwp.sectors = c.sectors;
        cwp.sectorName = c.sectorName;
      });

      properties.loading = false;
      return cwps;
    });

    return loadingPromise;

  }

  // API
  service.getCwp = getCwp;
  service.refreshFromBackend = refreshFromBackend;
  service.isLoading = function() { return !!properties.loading; }
  return service;
}

}());
