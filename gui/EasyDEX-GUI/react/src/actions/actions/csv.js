import translate from '../../translate/translate';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import { triggerToaster } from '../actionCreators';
import Store from '../../store';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';

export const apiElectrumTransactionsCSV = (coin, address) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      address,
      coin,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/listtransactions/csv${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumTransactionsCSV') + ' (code: apiElectrumTransactionsCSV)',
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

export const apiNativeTransactionsCSV = (coin) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      coin,
      rpc2cli,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/listtransactions/csv${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumTransactionsCSV') + ' (code: apiElectrumTransactionsCSV)',
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