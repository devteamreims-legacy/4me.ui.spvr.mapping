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
  '4me.core.sectors.services',
  '4me.ui.spvr.mapping.errors',
  '4me.ui.spvr.mapping.api',
  '4me.ui.spvr.mapping.status',
])
.factory('ctrlroomManager', ctrlroomManager);

ctrlroomManager.$inject = ['_', '$http', '$q', '$log', 'mapping.errors', 'mapping.status', 'mapping.api', 'treeSectors'];
function ctrlroomManager(_, $http, $q, $log, errors, status, api, treeSectors) {
  var service = {};
  var cwps = [];
  var properties = {
    loading: true
  };

  var beforeChanges = [];

  var cdsBackendUrl = 'http://localhost:3000';
  var loadingPromise;
  var commitPromise;

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
      url: api.rootPath + api.cwp.getAll
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

      beforeChanges = []; // Reset before changes when data is loaded

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

  function revert() {
    /* This fucks up angular dirty checking, we need to preserve references here */
    /*
    if(!_.isEmpty(beforeChanges)) {
      cwps = _.clone(beforeChanges);
    }
    */
    if(!_.isEmpty(beforeChanges)) {
      _.each(cwps, function(c) {
        if(c.changed === false) {
          return;
        }
        var oldCwp = _.findWhere(beforeChanges, {id: c.id});
        _.assign(c, oldCwp);
      });
    }
    beforeChanges = [];
  }

  function addSectors(cwpId, sectors) {
    if(!cwpId || !sectors) {
      throw new Error('Argument error');
    }

    var cwp = getCwp(cwpId);
    if(_.isEmpty(cwp)) {
      throw new Error('Unknown CWP');
    }

    var s;
    /* Check argument : string / array */
    /* and convert to upper case */
    if(_.isString(sectors)) {
      sectors = [sectors.toUpperCase()];
    }
    if(_.isArray(sectors)) {
      sectors = _.map(sectors, function(s) { return s.toUpperCase(); });
    }
    if(_.isEmpty(sectors)) {
      throw new Error('Argument error');
    }
    sectors = sectors.sort();

    /* Check for unknown sectors */
    var elem = treeSectors.getElementary();
    if(!_.isEmpty(_.difference(sectors, elem))) {
      throw new Error('Unknown sector in ' + sectors.join(','));
    }

    /* Copy cwps to beforeChanges to provide a possible reversion */
    /* TODO : This won't work with multiple consecutive changes performed */
    //beforeChanges = _.cloneDeep(cwps);

    if(_.isEmpty(beforeChanges)) { // This is the first change before commit/revert
      beforeChanges = _.cloneDeep(cwps);
    } // Otherwise, we already have a beforeChanges saved, revert point is already set, do nothing


    /* Remove sectors from other sectors */
    /* BEHOLD THE NESTED LOOP HELL */
    // Loop through given sectors
    _.each(sectors, function(s) {
      // Loop through CWPs to find the one holding given sector
      var oldCwp = _.find(cwps, function(c) {
        return _.contains(c.sectors, s);
      });
      oldCwp.changed = true;
      oldCwp.sectors = _.without(oldCwp.sectors, s);
      // We could recompute here, but chances are we will be pulling more sectors from this cwp
    });

    /* Put sectors in our CWP */
    cwp.sectors = _.union(sectors, cwp.sectors);
    cwp.changed = true;

    /* Recompute name for each 'changed' CWP */
    _.each(_.filter(cwps, {changed: true}), function(c) {
      var s = treeSectors.getFromSectors(c.sectors);
      var name;
      if(s.name === undefined) {
        name = c.sectors.join(',');
      } else {
        name = s.name;
      }
      c.sectorName = name;
    });

    /* And return our CWP */
    return cwp;

  }

  function hasChanges() {
    return !_.isEmpty(beforeChanges);
  }

  function commit() {
    var self = this;
    if(commitPromise !== undefined) {
      console.log('Already commiting');
      // We are currently already loading stuff from backend
      return commitPromise;
    }

    properties.loading = true;

    /* Send http post request*/
    commitPromise = $http.post(
      api.rootPath + api.cwp.commit,
      cwps
    )
    /* On failure, raise an error */
    .catch(function(err) {
      errors.add('warning', 'Could not post data from backend', err);
      properties.loading = false;
      commitPromise = undefined;
      return $q.reject(err);
    })
    /* On success, refresh data from backend */
    .then(self.refresh)
    /* Then remove commitPromise */
    .then(function(res) {
      commitPromise = undefined;
      properties.loading = false;
      return;
    });
    
    return commitPromise;
  }

  // API
  service.bootstrap = refreshFromBackend;
  service.getCwp = getCwp;
  service.refresh = refreshFromBackend;
  service.refreshFromBackend = refreshFromBackend;
  service.revert = revert;
  service.commit = commit;
  service.isLoading = function() { return !!properties.loading; };
  service.addSectors = addSectors;
  service.hasChanges = hasChanges;
  return service;
}

}());
