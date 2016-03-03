import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

import {
  FME_BIND_CWP,
  FME_BIND_SECTORS
} from '../actions/who-am-i';

const defaultState = {
  cwp: {
    id: null,
    name: null
  },
  sectors: [],
  lastUpdated: Date.now()
};

export default function whoAmIReducer(state = defaultState, action) {
  switch(action.type) {
    case FME_BIND_CWP:
      console.log('--------');
      console.log(action);
      console.log(_.get(action, 'cwp'));
      console.log('--------')
      return Object.assign({}, state, {
        cwp: merge({}, action.cwp),
        lastUpdated: Date.now()
      });
    case FME_BIND_SECTORS:
      return Object.assign({}, state, {
        sectors: cloneDeep(action.sectors),
        lastUpdated: Date.now()
      })
  }
  return state;
}