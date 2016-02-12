import constants from './constants.js';
import ctrlroom from './ctrlroom/';
import sectors from './sectors/';
import api from './api.js';

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping
 * @description
 * # 4me.ui.spvr.mapping
 *
 * 4me Organ to manage control room mapping
 */
var m = angular
  .module('4me.ui.spvr.mapping', [
      'ui.router',
      '4me.core.config',
      '4me.core.notifications',
      '4me.core.errors',
      '4me.core.organs.services',
      '4me.core.status',
      // Organ modules
      '4me.ui.spvr.mapping.errors',
      '4me.ui.spvr.mapping.notifications',
      '4me.ui.spvr.mapping.status',
      '4me.ui.spvr.mapping.constants',
      '4me.ui.spvr.mapping.ctrlroom',
      '4me.ui.spvr.mapping.sectors'
  ]);

/**
 * @ngdoc overview
 * @name 4me.ui.stub
 * @description
 * # 4me.ui.stub register states
 *
 * Register organ states here
 */

m.config(mappingConfig);
m.run(mappingRegistration);

mappingConfig.$inject = ['$stateProvider'];
function mappingConfig($stateProvider) {
  $stateProvider.state('mapping', {
    url: '/mapping',
    templateUrl: 'views/spvr.mapping/app/index.tpl.html',
    controller: mappingController,
    controllerAs: 'mapping',
    resolve: {
      ctrlroom: ['ctrlroomManager', function(ctrlroomManager) {
        return ctrlroomManager.bootstrap();
      }],
      treeSectors: ['treeSectors', function(treeSectors) {
        return treeSectors.bootstrap();
      }]
    }
  });
};

mappingRegistration.$inject = ['mainOrganService', '$state', '$injector'];
function mappingRegistration(mainOrganService, $state, $injector) {
  var r = mainOrganService.register({
    name: 'mapping',
    navigateTo: function() {
      $state.go('mapping');
      this.getNotificationService().markAllAsRead();
    },
    getNotificationService: function() {
      return $injector.get('mapping.notifications');
    },
    getStatusService: function() {
      return $injector.get('mapping.status');
    }
  });
}

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping
 * @description
 * # Decorator for core functions
 *
 * Provides decorated services for core functions :
 * * Error management
 * * Notifications
 *
 */

angular.module('4me.ui.spvr.mapping.errors', [
  '4me.core.lodash',
  '4me.core.errors'
])
.factory('mapping.errors', mappingErrors);

mappingErrors.$inject = ['_', 'errors'];
function mappingErrors(_, errors) {
  var service = {};

  service.add = function(type, message, reason) {
    return errors.add('mapping', type, message, reason);
  };

  return _.defaults(service, errors);
}

angular.module('4me.ui.spvr.mapping.notifications', [
  '4me.core.lodash',
  '4me.core.notifications'
])
.factory('mapping.notifications', mappingNotifications);

mappingNotifications.$inject = ['_', 'notifications'];
function mappingNotifications(_, notifications) {
  var service = {};

  service.add = function(priority, title, props) {
    return notifications.add('mapping', priority, title, props);
  };

  service.get = function() {
    return _.filter(notifications.get(), function(n) {
      return n.sender === 'mapping';
    })
  };

  return _.defaults(service, _.clone(notifications));
}


// We need another full service here, not some proxy status service
angular.module('4me.ui.spvr.mapping.status', [
  '4me.core.lodash',
  '4me.core.status'
])
.factory('mapping.status', mappingStatus);

mappingStatus.$inject = ['statusFactory'];
function mappingStatus(statusFactory) {
  var service = statusFactory.get('mapping');
  return service;
}


mappingController.$inject = ['mapping.errors', 'mapping.notifications', '$state', 'ctrlroomManager'];
function mappingController(errors, notifications, $state, ctrlroomManager) {
  var mapping = this;

  mapping.isLoading = function() {
    return ctrlroomManager.isLoading();
  };

  mapping.hasChanges = function() {
    return ctrlroomManager.hasChanges();
  };

  mapping.revert = function() {
    return ctrlroomManager.revert();
  };

  mapping.commit = function() {
    return ctrlroomManager.commit();
  };

}