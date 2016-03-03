export const MAPPING_SOCKET_CONNECTED = 'MAPPING_SOCKET_CONNECTED';
export const MAPPING_SOCKET_DISCONNECTED = 'MAPPING_SOCKET_DISCONNECTED';

export function socketConnected() {
  return (dispatch, getState) => {
    return dispatch(socketConnectedAction());
  };
}

export function socketDisconnected() {
  return (dispatch, getState) => {
    return dispatch(socketDisconnectAction());
  };
}

function socketDisconnectAction() {
  return {
    type: MAPPING_SOCKET_DISCONNECTED
  };
}

function socketConnectedAction() {
  return {
    type: MAPPING_SOCKET_CONNECTED
  };
}