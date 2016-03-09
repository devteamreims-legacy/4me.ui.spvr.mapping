import api from './api.js';

import components from './components/';

import mappingNgRedux from './mappingRedux';

import rootReducer from './reducers/';
import thunk from 'redux-thunk';
import deepFreeze from 'redux-freeze';
import createLogger from 'redux-logger';
import { combineReducers } from 'redux';

import { bootstrap } from './bootstrap';

import _ from 'lodash';

/**
 * @ngdoc overview
 * @name 4me.ui.spvr.mapping
 * @description
 * # 4me.ui.spvr.mapping
 *
 * 4me Organ to manage control room mapping
 */
const m = angular
  .module('4me.ui.spvr.mapping', [
      'ui.router',
      '4me.core.config',
      '4me.core.notifications',
      '4me.core.errors',
      '4me.core.organs.services',
      '4me.core.status',
      // Organ modules
      components,
      mappingNgRedux
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
    templateUrl: 'views/spvr.mapping/app/index.tpl.html'
  });
};

mappingRegistration.$inject = ['mainOrganService', '$state', '$injector'];
function mappingRegistration(mainOrganService, $state, $injector) {
  var r = mainOrganService.register({
    name: 'mapping',
    isActive: () => $state.includes('mapping'),
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

mappingErrors.$inject = ['errors'];
function mappingErrors(errors) {
  var service = {};

  service.add = function(type, message, reason) {
    return errors.add('mapping', type, message, reason);
  };

  return _.defaults(service, errors);
}

m.factory('mapping.notifications', mappingNotifications);

mappingNotifications.$inject = ['notifications'];
function mappingNotifications(notifications) {
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

m.config(setupRedux);

setupRedux.$inject = ['$mappingNgReduxProvider'];
function setupRedux($mappingNgReduxProvider) {

  const logger = createLogger();
  $mappingNgReduxProvider.createStoreWith(rootReducer, [thunk, deepFreeze, logger]);
}

m.run(bootstrapXman);

bootstrapXman.$inject = ['$mappingNgRedux', '$rootScope', 'myCwp', 'mySector'];
function bootstrapXman($mappingNgRedux, $rootScope, myCwp, mySector) {
  const store = $mappingNgRedux;

  bootstrap(store, $rootScope, myCwp, mySector);
}