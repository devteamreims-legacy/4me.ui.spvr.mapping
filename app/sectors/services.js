import _ from 'lodash';

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping.sectors.services
 * @description
 * # Sectors services
 *
 * SPVR Mapping sector services
 */
angular.module('4me.ui.spvr.mapping.sectors.services', [
  '4me.core.config',
  '4me.core.sectors.services',
  '4me.ui.spvr.mapping.errors',
  '4me.ui.spvr.mapping.api',
  '4me.ui.spvr.mapping.status'
])
.factory('sectorSuggestion', sectorSuggestion);

sectorSuggestion.$inject = ['$http', '$q', 'mapping.api', 'mapping.errors'];
function sectorSuggestion($http, $q, api, errors) {
  var service = {};

  var suggestPromises = [];

  service.get = function(cwpId) {
    var id = parseInt(cwpId);
    if(id === 0) {
      return $q.reject(new Error('invalid argument'));
    }
    if(suggestPromises[id]) {
      return suggestPromises[id];
    }
    suggestPromises[id] = $http.get(api.rootPath + api.mapping.suggest(id), {cache: false})
      .then(function(res) {
        var r = [];
        _.each(res.data, function(s) {
          r.push({
            sectors: s.sectors
          });
        });
        suggestPromises[id] = undefined;
        return r;
      })
      .catch(function(err) {
        suggestPromises[id] = undefined;
        errors.add('warning', 'Could not load sector suggestions for cwp ' + id, err);
        return $q.reject(err);
      });
    return suggestPromises[id];
  };


  return service;

}
