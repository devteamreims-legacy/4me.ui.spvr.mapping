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
  '4me.core.lodash',
  '4me.ui.spvr.mapping.errors',
  '4me.ui.spvr.mapping.status'
])
.factory('ctrlroomManager', ctrlroomManager);

ctrlroomManager.$inject = ['_', '$http', '$q', '$log', 'mapping.errors', 'mapping.status'];
function ctrlroomManager(_, $http, $q, $log, errors, status) {
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
    commit: '/cwp' // POST whole control room status
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
    return cwp || {};
  }

  function refreshFromBackend() {
    return _getFromBackend();
  }

  function _getFromBackend() {
    properties.loading = true;
    if(loadingPromise !== undefined) {
      console.log('Already loading');
      // We are currently already loading stuff from backend
      return loadingPromise;
    }

    loadingPromise = $http({
      method: 'GET',
      url: apiEndpoints.getAll
    })
    .then(function(res) {
      $log.debug('Got cwp from backend !');
      _.each(res.data, function(c) {
        var cwp = getCwp(parseInt(c.id));
        if(_.isEmpty(cwp)) {
          cwp = _createCwp(parseInt(c.id));
          cwps.push(cwp);
        }
        cwp.disabled = c.disabled;
        cwp.name = c.name;
        cwp.sectors = c.sectors;
        cwp.sectorName = c.sectorName;
      });

      properties.loading = false;
      loadingPromise = undefined;
      return cwps;
    })
    .catch(function(err) {
      errors.add('critical', 'Could not load data from backend', err);
      status.escalate('ctrlroomManager', 'critical', 'Could not load data from backend', err);
      properties.loading = false;
      loadingPromise = undefined;
      return $q.reject(err);
    });

    return loadingPromise;

  }

  function bootstrap() {
    if(!_.isEmpty(cwps)) {
      return cwps;
    } else {

    }
  }

  // API
  service.bootstrap = refreshFromBackend;
  service.getCwp = getCwp;
  service.refresh = refreshFromBackend;
  service.refreshFromBackend = refreshFromBackend;
  service.commit = function() { return $q.resolve('Committed changes'); };
  service.isLoading = function() { return !!properties.loading; };
  service.addSectors = function(cwpId, sectors) {
    return;
  };
  return service;
}

}());
