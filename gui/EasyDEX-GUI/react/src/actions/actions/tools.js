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

export const apiToolsSeedKeys = (seed) => {
  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/keys`,
      fetchType(
        JSON.stringify({
          seed,
          active: true,
          iguana: true,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getTools') + ' (code: apiToolsSeedKeys)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

export const apiToolsBalance = (coin, address) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token: Config.token,
      coin,
      address,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/getbalance${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getTools') + ' (code: apiToolsBalance)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

export const apiToolsTransactions = (coin, address) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      coin,
      address,
      full: true,
      maxlength: 20,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/listtransactions${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getTools') + ' (code: apiToolsTransactions)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

export const apiToolsBuildUnsigned = (coin, value, sendToAddress, changeAddress) => {
  value = Math.floor(value);

  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      coin,
      value,
      address: sendToAddress,
      change: changeAddress,
      verify: false,
      push: false,
      offline: true,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/createrawtx${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getTools') + ' (code: apiToolsBuildUnsigned)',
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

export const apiToolsListunspent = (coin, address) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      coin,
      address,
      full: true,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/listunspent${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getTools') + ' (code: apiToolsListunspent)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

export const apiToolsPushTx = (network, rawtx) => {
  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/pushtx`,
      fetchType(
        JSON.stringify({
          network,
          rawtx,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getTools') + ' (code: apiToolsPushTx)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

export const apiToolsWifToKP = (coin, wif) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      coin,
      wif,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/wiftopub${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getTools') + ' (code: apiToolsWifToKP)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

export const apiToolsSeedToWif = (seed, network, iguana) => {
  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/seedtowif`,
      fetchType(
        JSON.stringify({
          seed,
          network,
          iguana,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getTools') + ' (code: apiToolsSeedToWif)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(!json.result ? 'error' : json);
    });
  });
}

// remote bitcore api
export const apiToolsMultiAddressBalance = (addressList, fallback) => {
  return new Promise((resolve, reject) => {
    fetch(
      fallback ? 'https://kmdexplorer.io/insight-api-komodo/addrs/utxo' : 'https://www.kmdexplorer.ru/insight-api-komodo/addrs/utxo',
      fetchType(
        JSON.stringify({
          addrs: addressList,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      console.warn(`apiToolsMultiAddressBalance has failed, ${fallback ? ' use fallback' : ' all routes have failed'}`);

      resolve({
        msg: 'error',
        code: fallback ? -1554 : -777,
      });
    })
    .then((response) => {
      const _response = response.text().then((text) => { return text; });
      return _response;
    })
    .then(json => {
      try {
        json = JSON.parse(json);

        if (json.length ||
            (typeof json === 'object' && !Object.keys(json).length)) {
          resolve({
            msg: 'success',
            result: json,
          });
        } else {
          resolve({
            msg: 'error',
            result: 'error parsing response',
          });
        }
      } catch (e) {
        resolve({
          msg: 'error',
          result: json.indexOf('<html>') === -1 ? json : 'error parsing response',
        });
      }
    });
  });
}