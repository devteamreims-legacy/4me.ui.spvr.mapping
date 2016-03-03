import _ from 'lodash';

/*
import {
  XMAN_REFRESH_COMPLETE,
  XMAN_REFRESH_FAIL
} from '../actions/flight-list';
*/

import {
  MAPPING_FETCH_MAP_START,
  MAPPING_FETCH_MAP_COMPLETE,
  MAPPING_FETCH_MAP_FAIL,
  MAPPING_COMMIT_MAP_START,
  MAPPING_COMMIT_MAP_FAIL
} from '../actions/map';

const defaultState = {
  isLoading: true,
  lastUpdated: Date.now(),
  map: [],
  refreshError: null,
  commitError: null
};

export default function mapReducer(state = defaultState, action) {
  switch(action.type) {
    case MAPPING_FETCH_MAP_START:
      return Object.assign({}, state, {
        isLoading: true,
        map: []
      });
    case MAPPING_FETCH_MAP_COMPLETE:
      return Object.assign({}, state, {
        isLoading: false,
        lastUpdated: Date.now(),
        map: [...action.map],
        refreshError: null
      });
    case MAPPING_FETCH_MAP_FAIL:
      return Object.assign({}, state, {
        isLoading: false,
        lastUpdated: Date.now(),
        refreshError: action.error,
        map: []
      });
    case MAPPING_COMMIT_MAP_START:
      return Object.assign({}, state, {
        isLoading: true,
        commitError: null
      });
    case MAPPING_COMMIT_MAP_FAIL:
      return Object.assign({}, state, {
        isLoading: false,
        commitError: action.error
      });
  }
  return state;
}