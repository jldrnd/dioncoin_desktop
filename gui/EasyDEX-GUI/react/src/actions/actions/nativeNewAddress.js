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
import fetchType from '../../util/fetchType';

export const getNewKMDAddresses = (coin, pubpriv, mode) => {
  return dispatch => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: pubpriv === 'public' ? 'getnewaddress' : 'z_getnewaddress',
      rpc2cli,
      token,
    };

    return fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload: payload })).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getNewAddress') + ' (code: getNewKMDAddresses)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      json = json.result;
      dispatch(
        triggerToaster(
          json.result ? json.result : json,
          translate('KMD_NATIVE.NEW_ADDR_GENERATED'),
          'info selectable',
          false
        )
      );
      dispatch(getDashboardUpdate(coin, mode));
    })
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          json.result ? json.result : json,
          translate('KMD_NATIVE.NEW_ADDR_GENERATED'),
          'info',
          false
        )
      );
      dispatch(getDashboardUpdate(coin));
    });
  }
}