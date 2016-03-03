import _ from 'lodash';


import {
  MAPPING_FETCH_SUGGESTIONS_START,
  MAPPING_FETCH_SUGGESTIONS_COMPLETE,
  MAPPING_FETCH_SUGGESTIONS_FAIL
} from '../actions/suggest';

const defaultState = {
  isLoading: false,
  cwpId: null,
  lastUpdated: Date.now(),
  suggestions: [],
  error: null
};

export default function mapReducer(state = defaultState, action) {
  switch(action.type) {
    case MAPPING_FETCH_SUGGESTIONS_START:
      return Object.assign({}, state, {
        isLoading: true,
        cwpId: action.cwpId,
        map: [],
        error: null
      });
    case MAPPING_FETCH_SUGGESTIONS_COMPLETE:
      return Object.assign({}, state, {
        isLoading: false,
        lastUpdated: Date.now(),
        cwpId: action.cwpId,
        suggestions: [...action.suggestions],
        error: null
      });
    case MAPPING_FETCH_SUGGESTIONS_FAIL:
      return Object.assign({}, state, {
        isLoading: false,
        lastUpdated: Date.now(),
        cwpId: action.cwpId,
        suggestions: [],
        error: action.error
      });
  }
  return state;
}