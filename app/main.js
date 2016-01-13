(function() {
'use strict';
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
    controllerAs: 'mapping'
  });
};

mappingRegistration = ['mainOrganService', '$state', '$injector'];
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

m.factory('mapping.errors', mappingErrors);

mappingErrors.$inject = ['_', 'errors'];
function mappingErrors(_, errors) {
  var service = {};

  service.add = function(type, message, reason) {
    return errors.add('mapping', type, message, reason);
  };

  return _.defaults(service, errors);
}

m.factory('mapping.notifications', mappingNotifications);

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
m.factory('mapping.status', mappingStatus);

mappingStatus.$inject = ['statusFactory'];
function mappingStatus(statusFactory) {
  var service = statusFactory.get('mapping');
  return service;
}


mappingController.$inject = ['mapping.errors', 'mapping.notifications', '$state', 'ctrlroomManager'];
function mappingController(errors, notifications, $state, ctrlroomManager) {
  var mapping = this;

  mapping.initialLoading = true;

  ctrlroomManager.refreshFromBackend()
  .then(function() {
    mapping.initialLoading = false;
  })
  .catch(function() {
    notifications.add('info', 'Could not load data from backend');
  });

  mapping.isLoading = function() {
    return ctrlroomManager.isLoading();
  };

}

}());
