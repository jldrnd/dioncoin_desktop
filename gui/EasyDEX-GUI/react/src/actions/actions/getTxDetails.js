import { triggerToaster } from '../actionCreators';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import Store from '../../store';
import fetchType from '../../util/fetchType';
import mainWindow from '../../util/mainWindow';
import translate from '../../translate/translate';

export const getTxDetails = (coin, txid, type) => {
  return new Promise((resolve, reject) => {
    let payload = {
      mode: null,
      chain: coin,
      cmd: 'gettransaction',
      params: [
        txid
      ],
      rpc2cli,
      token,
    };

    if (type === 'raw') {
      payload = {
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
    }

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumListunspent') + ' (code: getTxDetails + native)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (mainWindow.activeCoin === coin) {
        resolve(json.result ? json.result : json);
      }
    });
  });
}