import _ from 'lodash';

/*
import {
  XMAN_REFRESH_COMPLETE,
  XMAN_REFRESH_FAIL
} from '../actions/flight-list';
*/

import {
  MAPPING_SOCKET_CONNECTED,
  MAPPING_SOCKET_DISCONNECTED
} from '../actions/socket';

const defaultState = {
  level: 'normal',
  lastUpdated: Date.now(),
  message: ''
};

export default function statusReducer(state = defaultState, action) {
  switch(action.type) {
    case MAPPING_SOCKET_CONNECTED:
      return Object.assign({}, state, {
        level: 'normal',
        lastUpdated: Date.now(),
        message: ''
      });
    case MAPPING_SOCKET_DISCONNECTED:
      return Object.assign({}, state, {
        level: 'critical',
        lastUpdated: Date.now(),
        message: 'Lost socket connection to backend'
      });
  }
  return state;
}