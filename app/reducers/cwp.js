import _ from 'lodash';

import {
  MAPPING_FETCH_CWPS_START,
  MAPPING_FETCH_CWPS_COMPLETE,
  MAPPING_FETCH_CWPS_FAIL
} from '../actions/cwp';

const defaultState = {
  isLoading: true,
  lastUpdated: Date.now(),
  cwps: [{
    "id":30,
    "name":"P30",
    "disabled":false,
    "type":"cwp",
    "ipAddr":[],
    "suggestions": {
      "filteredSectors": ["KD2F","4E","4H"],
      "preferenceOrder": ["5R"]
    }
  },{
    "id":31,
    "name":"P31",
    "disabled":false,
    "type":"cwp",
    "ipAddr":[],
    "suggestions": {
      "filteredSectors": ["KDFE"],
      "preferenceOrder":["5R"]
    }
  }]
};

export default function cwpReducer(state = defaultState, action) {
  switch(action.type) {
    case MAPPING_FETCH_CWPS_START:
      return Object.assign({}, state, {
        isLoading: true,
        cwps: []
      });
    case MAPPING_FETCH_CWPS_COMPLETE:
      return Object.assign({}, state, {
        isLoading: false,
        lastUpdated: Date.now(),
        cwps: [...action.cwps]
      });
    case MAPPING_FETCH_CWPS_FAIL:
      return Object.assign({}, state, {
        isLoading: false,
        lastUpdated: Date.now(),
        cwps: []
      });
  }
  return state;
}