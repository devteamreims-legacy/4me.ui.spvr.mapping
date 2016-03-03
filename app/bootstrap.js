import _ from 'lodash';

import {
  onSectorChange,
  onCwpChange
} from './actions/who-am-i';

import {
  refreshCwps
} from './actions/cwp';

import {
  refreshMap
} from './actions/map';

import {setupSocketIo} from './socket/';
import api from './api';

import io from 'socket.io-client';

export function bootstrap(store, $rootScope, myCwp, mySector) {
  console.log('Bootstrapping Mapping organ ...');
  console.log('Connecting socket to ' + api.socket);
  const socketIo = io.connect(api.socket);

  console.log('Attaching handlers to socket');
  setupSocketIo(store.dispatch, socketIo);

  console.log('Refreshing CWPs and map from backend');
  store.dispatch(refreshCwps())
    .then(() => store.dispatch(refreshMap()));

  console.log('Attaching rootScope handlers');
  // This needs some serious refactor, in the core

  const handler = $rootScope.$on('fme:new-sectors', () => {
    store.dispatch(onSectorChange(_.get(mySector.get(), 'sectors', [])));
  });

  const handler2 = $rootScope.$on('fme:bound-cwp', () => {
    const cwp = {
      id: myCwp.get().id,
      name: myCwp.get().name
    };
    store.dispatch(onCwpChange(cwp));
  })
}