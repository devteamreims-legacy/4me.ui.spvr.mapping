import _ from 'lodash';
import prefix from './prefix';

const p = prefix('cwp');

export const getCwps = (state) => _.get(p(state), 'cwps');

export const isLoading = (state) => _.get(p(state), 'isLoading');

export const getCwpById = (state, cwpId) => {
  return _.find(getCwps(state), cwp => parseInt(cwp.id) === parseInt(cwpId)) || {};
};

export const isDisabled = (state, cwpId) => {
  return !!_.get(getCwpById(state, cwpId), 'disabled', true);
};

export const getName = (state, cwpId) => {
  return _.get(getCwpById(state, cwpId), 'name', `P${cwpId}`);
};