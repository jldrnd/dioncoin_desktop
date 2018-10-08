import { triggerToaster } from '../actionCreators';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import Store from '../../store';
import fetchType from '../../util/fetchType';
import translate from '../../translate/translate';

export const getListUnspent = (coin) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'listunspent',
      rpc2cli,
      token,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumListunspent') + ' (code: getListUnspent)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (json &&
          json.result &&
          json.result.length) {
        let _spendable = [];

        for (let i = 0; i < json.result.length; i++) {
          if (json.result[i].spendable) {
            _spendable.push(json.result[i]);
          }
        }

        json.result = _spendable;
      }

      resolve(json.result ? json.result : json);
    });
  });
}

export const getRawTransaction = (coin, txid) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'getrawtransaction',
      params: [
        txid,
        1
      ],
      rpc2cli,
      token,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumListunspent') + ' (code: getListUnspent)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json.result ? json.result : json);
    });
  });
}