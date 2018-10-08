import {
  DASHBOARD_ACTIVE_COIN_NATIVE_OPIDS,
  DASHBOARD_ACTIVE_COIN_SENDTO,
} from '../storeType';
import translate from '../../translate/translate';
import {
  triggerToaster,
  getDashboardUpdate,
} from '../actionCreators';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import Store from '../../store';
import fetchType from '../../util/fetchType';

export const sendNativeTx = (coin, _payload) => {
  let payload;
  let _apiMethod;

  if ((_payload.addressType === 'public' && // transparent
      _payload.sendTo.length !== 95) || !_payload.sendFrom) {
    _apiMethod = 'sendtoaddress';
  } else { // private
    _apiMethod = 'z_sendmany';
  }

  return dispatch => {
    payload = {
      mode: null,
      chain: coin,
      cmd: _apiMethod,
      rpc2cli,
      token,
      params:
        (_payload.addressType === 'public' && _payload.sendTo.length !== 95) || !_payload.sendFrom ?
        (_payload.subtractFee ?
          [
            _payload.sendTo,
            _payload.amount,
            '',
            '',
            true
          ]
          :
          [
            _payload.sendTo,
            _payload.amount
          ]
        )
        :
        [
          _payload.sendFrom,
          [{
            address: _payload.sendTo,
            amount: _payload.amount
          }]
        ]
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.sendNativeTx') + ' (code: sendNativeTx)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then((response) => {
      const _response = response.text().then((text) => { return text; });
      return _response;
    })
    .then((json) => {
      if (json.indexOf('"code":') > -1) {
        let _message = json.substring(
          `${json.indexOf('"message":"') + 11}`,
          json.indexOf('"},"id":"jl777"')
        );

        if (json.indexOf('"code":-4') > -1) {
          dispatch(
            triggerToaster(
              JSON.parse(json).error.message.indexOf('too large') > -1 ? translate('API.TX_TOO_LARGE') : translate('API.WALLETDAT_MISMATCH'),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'info',
              false
            )
          );
        } else if (json.indexOf('"code":-5') > -1) {
          dispatch(
            triggerToaster(
              translate('TOASTR.INVALID_ADDRESS', coin),
              translate('TOASTR.WALLET_NOTIFICATION'),
              'error',
            )
          );
        } else {
          if (rpc2cli) {
            _message = JSON.parse(json).error.message;
          }

          dispatch(
            triggerToaster(
              _message,
              translate('TOASTR.WALLET_NOTIFICATION'),
              'error'
            )
          );
        }
      } else {
        dispatch(sendToAddressState(JSON.parse(json).result));
        dispatch(
          triggerToaster(
            translate('TOASTR.TX_SENT_ALT'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'success'
          )
        );
      }
    });
  }
}

export function getKMDOPIDState(json) {
  return {
    type: DASHBOARD_ACTIVE_COIN_NATIVE_OPIDS,
    opids: json,
  }
}

// remove?
export const getKMDOPID = (opid, coin) => {
  return dispatch => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'z_getoperationstatus',
      rpc2cli,
      token,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.txDataFail') + ' (code: getKMDOPID)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      json = json.result;
      dispatch(getKMDOPIDState(json));
    });
  };
}

export const sendToAddressPromise = (coin, address, amount) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'sendtoaddress',
      rpc2cli,
      token,
      params: [
        address,
        amount,
        'KMD interest claim request',
        'KMD interest claim request',
        true
      ],
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.sendNativeTx') + ' (code: sendToAddressPromise)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

export const sendToAddressState = (json) => {
  return {
    type: DASHBOARD_ACTIVE_COIN_SENDTO,
    lastSendToResponse: json,
  }
}

export const clearLastSendToResponseState = () => {
  return {
    type: DASHBOARD_ACTIVE_COIN_SENDTO,
    lastSendToResponse: null,
  }
}

export const validateAddressPromise = (coin, address) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'validateaddress',
      params: [ address ],
      rpc2cli,
      token,
    };

    fetch(
      `http://127.0.0.1:${Config.agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.validateAddress') + ' (code: validateAddressPromise)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

export const clearOPIDs = (coin) => {
  return dispatch => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'z_getoperationresult',
      rpc2cli,
      token,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.txDataFail') + ' (code: clearOPIDs)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      json = json.result;

      if (json.length) {
        dispatch(
          triggerToaster(
            translate('SEND.ALL_OPID_CLEARED'),
            translate('TOASTR.WALLET_NOTIFICATION'),
            'success'
          )
        );
        Store.dispatch(getDashboardUpdate(coin));
      }
    });
  };
}