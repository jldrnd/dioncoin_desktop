import {
  triggerToaster,
  getNewKMDAddresses,
} from '../actionCreators';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import Store from '../../store';
import fetchType from '../../util/fetchType';
import translate from '../../translate/translate';

const getNewAddress = (coin) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'getnewaddress',
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
          translate('API.getNewAddress') + ' (code: genJumblrAddress + getKMDAddressesNative)',
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

export const setJumblrAddress = (coin, type, address) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: type === 'deposit' ? 'jumblr_deposit' : 'jumblr_secret',
      params: [address],
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
          translate('API.setJumblrAddress') + ' (code: setJumblrAddress)',
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

export const pauseJumblr = (coin) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'jumblr_pause',
      params: [],
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
          translate('API.pauseJumblr') + ' (code: pauseJumblr)',
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

export const resumeJumblr = (coin) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'jumblr_resume',
      params: [],
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
          translate('API.resumeJumblr') + ' (code: resumeJumblr)',
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

const dumpPrivkey = (coin, key) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'dumpprivkey',
      params: [key],
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
          translate('API.dumpPrivkey') + ' (code: dumpPrivkey)',
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

export const importPrivkey = (coin, key, rescan = false, isZKey) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: isZKey ? 'z_importkey' : 'importprivkey',
      params: isZKey ? [
        key,
        rescan ? 'yes': 'no',
      ] : [
        key,
        '',
        rescan
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
          translate('API.importPrivkey') + ' (code: importPrivkey)',
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