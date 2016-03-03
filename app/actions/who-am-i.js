import {
  setSubscriptionFilter
} from '../socket';

export const FME_BIND_CWP = 'FME_BIND_CWP';
export const FME_BIND_SECTORS = 'FME_BIND_SECTORS';

export function bindCwpAction(cwp = {}) {
  return {
    type: FME_BIND_CWP,
    cwp: {
      id: cwp.id,
      name: cwp.name
    }
  };
}

export function bindSectorsAction(sectors = []) {
  return {
    type: FME_BIND_SECTORS,
    sectors
  };
}


export function onSectorChange(sectors) {
  return (dispatch, getState) => {
    // Change state
    dispatch(bindSectorsAction(sectors));

    // Refresh mapping list
    //dispatch(refreshFullList());
  };
}

export function onCwpChange(cwp) {
  return (dispatch, getState) => {
    dispatch(bindCwpAction(cwp));
  };
}
