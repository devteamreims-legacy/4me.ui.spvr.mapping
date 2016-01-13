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
      '4me.core.status'
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
  $stateProvider.state('map', {
    url: '/map',
    templateUrl: 'views/spvr.map/app/index.tpl.html',
    controller: mappingController,
    controllerAs: 'mapping'
  });
};

mappingRegistration = ['mainOrganService', '$state', '$injector', 'stub.notifications'];
function mappingRegistration(mainOrganService, $state, $injector, notifications) {

  console.log('Notifications');
  console.log(notifications);
  var r = mainOrganService.register({
    name: 'map',
    navigateTo: function() {
      $state.go('map');
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


mappingController.$inject = ['mapping.errors', 'mapping.notifications', '$state'];
function mappingController(errors, notifications, $state) {
  var stub = this;

  stub.addError = function() {
    errors.add('warning', 'info', 'test');
  };

  stub.addNotification = function(priority) {
    var navigateTo = function() {
      console.log('Going to mapping via notification');
      $state.go('stub');
    }
    var randomString = Math.random().toString(36).substring(7);
    notifications.add(priority || 'info', 'Test notification ' + randomString, {message: 'Test message', navigateTo: navigateTo});
  };
}

}());
