import {
  isLoading as isMappingLoading,
  getMap,
  getSectorsByCwpId
} from '../selectors/map';

import {
  getCwpById
} from '../selectors/cwp';

import axios from 'axios';

import api from '../api';

export const MAPPING_FETCH_MAP_START = 'MAPPING_FETCH_MAP_START';
export const MAPPING_FETCH_MAP_FAIL = 'MAPPING_FETCH_MAP_FAIL';
export const MAPPING_FETCH_MAP_COMPLETE = 'MAPPING_FETCH_MAP_COMPLETE';

export const MAPPING_COMMIT_MAP_START = 'MAPPING_COMMIT_MAP_START';
export const MAPPING_COMMIT_MAP_FAIL = 'MAPPING_COMMIT_MAP_FAIL';

// Refresh CWPs
// Uses redux thunk
export function refreshMap() {
  return (dispatch, getState) => {
    // Check if loading
    let isLoading = isMappingLoading(getState());

    // Here we should abort current request and restart one
    // This is not currently implemented in axios
    // See here : https://github.com/mzabriskie/axios/issues/50

    // Current workaround is to let first request fly and to just resend one
    /*
    if(isLoading) {
      console.log('Already loading !!');
      return;
    }
    */

    dispatch(start());

    const apiUrl = api.rootPath + api.mapping.getMap;


    console.log('Loading Mapping from backend');
    
    return axios.get(apiUrl)
      .then((response) => {
        return dispatch(complete(response.data));
      })
      .catch((error) => {
        return dispatch(fail(error));
      });
  }
}

export function bindSectorsToCwp(cwpId, sectors) {
  return (dispatch, getState) => {
    // Sanity check
    const cwpExists = !_.isEmpty(getCwpById(getState(), cwpId));

    if(!cwpExists) {
      console.log('Could not bind sectors to unknown cwp !' + cwpId);
      return;
    }

    const boundSectors = getSectorsByCwpId(getState(), cwpId);

    if(!_.isEmpty(_.without(boundSectors, ...sectors))) {
      console.log('Could not remove sectors from cwp !' + cwpId);
      return;
    }

    if(_.isEmpty(_.without(sectors, ...boundSectors))) {
      console.log(`Nothing more bound to cwp ${cwpId}, discard`);
      return;
    }

    const removeSectorsFromOtherCwps = (cwp) => {
      const newSectors = _(_.get(cwp, 'sectors', []))
        .without(...sectors)
        .value();
      return Object.assign({}, cwp, {sectors: newSectors});
    };

    const addSectorsToGivenCwp = (cwp) => {
      if(parseInt(cwp.cwpId) === parseInt(cwpId)) {
        const newSectors = _(_.get(cwp, 'sectors', []))
          .concat(...sectors)
          .uniq()
          .value();

        return Object.assign({}, cwp, {sectors: newSectors});
      }
      return cwp;
    };

    // Compute new map
    const newMap = _(getMap(getState()))
      .map(removeSectorsFromOtherCwps)
      .map(addSectorsToGivenCwp)
      .value();



    // commitMap and refresh

    return dispatch(commitMap(newMap))
      .then(() => dispatch(refreshMap()));

  };
}

function commitMap(map) {
  return (dispatch, getState) => {
    const apiUrl = api.rootPath + api.mapping.commit;

    return axios.post(apiUrl, map)
      .catch((error) => {
        return dispatch(commitFail(error));
      });
  }
}

export function commitFail(rawError) {
  const error = rawError.message || rawError.statusText || 'Unknown error';
  return {
    type: MAPPING_COMMIT_MAP_FAIL,
    error
  };
}

export function commitStart() {
  return {
    type: MAPPING_COMMIT_MAP_START
  };
}

export function fail(rawError) {
  const error = rawError.message || rawError.statusText || 'Unknown error';
  return {
    type: MAPPING_FETCH_MAP_FAIL,
    error
  };
}

export function start() {
  return {
    type: MAPPING_FETCH_MAP_START
  };
}


export function complete(map = []) {
  return {
    type: MAPPING_FETCH_MAP_COMPLETE,
    map
  };
}