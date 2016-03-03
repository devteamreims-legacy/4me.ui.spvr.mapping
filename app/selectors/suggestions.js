import _ from 'lodash';
import prefix from './prefix';

const p = prefix('suggest');

export const getSuggest = (state) => p(state);

export const getCwpId = (state) => _.get(getSuggest(state), 'cwpId', -1);

export const isLoading = (state) => !!_.get(getSuggest(state), 'isLoading', false);

import {
  getSectorsByCwpId
} from './map';

export const getSuggestions = (state, cwpId) => {
  if(cwpId !== getCwpId(state)) {
    return [];
  }

  const sectorsBound = getSectorsByCwpId(state, cwpId);

  const suggestions = _.get(getSuggest(state), 'suggestions', []);

  const addBoundSectorsToSuggestion = (cwpId) => (suggestion) => {
    if(_.isEmpty(sectorsBound)) {
      return suggestion;
    }

    const suggestionSectors = _.get(suggestion, 'sectors', []);
    const mergedSectors = _(suggestionSectors)
      .concat(...sectorsBound)
      .uniq()
      .value();
    return Object.assign({}, suggestion, {sectors: mergedSectors});
  };

  return _(suggestions)
    .map(addBoundSectorsToSuggestion(cwpId))
    .value();
};