import _ from 'lodash';
import prefix from './prefix';

const p = prefix('mapping');

export const getMapping = (state) => p(state);

export const getMap = (state) => _.get(getMapping(state), 'map');

export const isLoading = (state) => !!_.get(getMap(state), 'isLoading', false);

export const getCommitError = (state) => _.get(getMapping(state), 'commitError');
export const getRefreshError = (state) => _.get(getMapping(state), 'refreshError');
export const isErrored = (state) => getCommitError(state) !== null || getRefreshError(state) !== null;

export const getMapByCwpId = (state, cwpId) => {
  return _.find(getMap(state), m => parseInt(m.cwpId) === parseInt(cwpId)) || {};
};

export const getSectorsByCwpId = (state, cwpId) => _.get(getMapByCwpId(state, cwpId), 'sectors', []);