import {
  DASHBOARD_ELECTRUM_BALANCE,
  DASHBOARD_ELECTRUM_TRANSACTIONS,
  DASHBOARD_ELECTRUM_COINS,
} from '../storeType';
import translate from '../../translate/translate';
import Config, {
  token,
  agamaPort,
} from '../../config';
import {
  triggerToaster,
  sendToAddressState,
} from '../actionCreators';
import Store from '../../store';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';
import mainWindow from '../../util/mainWindow';

// TODO: dev display errors

// src: atomicexplorer
export const apiGetRemoteTimestamp = () => {
  return new Promise((resolve, reject) => {
    fetch(
      'https://www.atomicexplorer.com/api/timestamp/now',
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      resolve({ msg: 'error' });
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

// src: atomicexplorer
export const apiGetRemoteBTCFees = () => {
  return new Promise((resolve, reject) => {
    fetch(
      'https://www.atomicexplorer.com/api/btc/fees',
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      resolve({ msg: 'error' });
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
    });
  });
}

// btc fees fallback
export const apiGetLocalBTCFees = () => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/btcfees${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiGetLocalBTCFees') + ' (code: apiGetLocalBTCFees)',
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

export const apiElectrumSetServer = (coin, address, port) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      coin,
      address,
      port,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/coins/server/set${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumSetServer') + ' (code: apiElectrumSetServer)',
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

export const apiElectrumCheckServerConnection = (address, port, proto) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      address,
      port,
      proto,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/servers/test${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumCheckServerConnection') + ' (code: apiElectrumCheckServerConnection)',
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

export const apiElectrumKeys = (seed) => {
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
          translate('API.apiElectrumKeys') + ' (code: apiElectrumKeys)',
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

export const apiElectrumBalance = (coin, address) => {
  return dispatch => {
    const _urlParams = {
      token,
      address,
      coin,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/getbalance${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiElectrumBalance') + ' (code: apiElectrumBalance)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (mainWindow.activeCoin === coin) {
        if (json &&
            json.electrumres &&
            json.electrumres.code) {
          dispatch(
            triggerToaster(
              json.electrumres.message,
              translate('TOASTR.ERROR'),
              'error'
            )
          );
        }
        dispatch(apiElectrumBalanceState(json));
      }
    });
  }
}

export const apiElectrumBalanceState = (json) => {
  return {
    type: DASHBOARD_ELECTRUM_BALANCE,
    balance: json.result,
  }
}

export const apiElectrumTransactions = (coin, address) => {
  return dispatch => {
    const _urlParams = {
      token,
      address,
      coin,
      full: true,
      maxlength: 20,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/listtransactions${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiElectrumTransactions') + ' (code: apiElectrumTransactions)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (mainWindow.activeCoin === coin) {
        dispatch(apiElectrumTransactionsState(json));
      }
    });
  }
}

export const apiElectrumKVTransactionsPromise = (coin, address) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      address,
      coin,
      full: true,
      maxlength: 20,
      kv: true,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/listtransactions${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumTransactionsKV') + ' (code: apiElectrumTransactionsKV)',
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

export const apiElectrumTransactionsState = (json) => {
  json = json.result;

  if (json &&
      json.error) {
    json = null;
  } else if (!json || !json.length) {
    json = 'no data';
  }

  return {
    type: DASHBOARD_ELECTRUM_TRANSACTIONS,
    txhistory: json,
  }
}

export const apiElectrumCoins = () => {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/coins${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiElectrumCoins') + ' (code: apiElectrumCoins)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(apiElectrumCoinsState(json));
    });
  }
}

export const apiElectrumCoinsState = (json) => {
  return {
    type: DASHBOARD_ELECTRUM_COINS,
    electrumCoins: json.result,
  }
}

// value in sats
export const apiElectrumSend = (coin, value, sendToAddress, changeAddress, btcFee, customFee, isKv, opreturn) => {
  value = Math.floor(value);

  return dispatch => {
    const payload = {
      token,
      coin,
      value,
      customFee,
      address: changeAddress,
      change: changeAddress,
      opreturn,
      gui: true,
      verify: true,
      push: true,
    };
    const _urlParams = {
      token,
      coin,
      value,
      customFee,
      address: sendToAddress,
      change: changeAddress,
      gui: true,
      verify: true,
      push: true,
    };

    return fetch(
      isKv ? `http://127.0.0.1:${agamaPort}/api/electrum/createrawtx` : `http://127.0.0.1:${agamaPort}/api/electrum/createrawtx${urlParams(_urlParams)}${btcFee ? '&btcfee=' + btcFee : ''}`,
      isKv ? fetchType(JSON.stringify(payload)).post : fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiElectrumSend') + ' (code: apiElectrumSend)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(sendToAddressState(json.msg === 'error' ? json : json.result));
    });
  }
}

// kmd interest claiming
export const apiElectrumSendPromise = (coin, value, sendToAddress, changeAddress, btcFee) => {
  value = Math.floor(value);

  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      coin,
      value,
      address: sendToAddress,
      change: changeAddress,
      gui: true,
      verify: true,
      push: true,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/createrawtx${urlParams(_urlParams)}${btcFee ? '&btcfee=' + btcFee : ''}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumSend') + ' (code: apiElectrumSendPromise)',
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

export const apiElectrumSendPreflight = (coin, value, sendToAddress, changeAddress, btcFee, customFee, isKv, opreturn) => {
  value = Math.floor(value);

  return new Promise((resolve, reject) => {
    let payload = {
      token,
      coin,
      value,
      address: changeAddress,
      change: changeAddress,
      opreturn,
      gui: true,
      verify: true,
      push: false,
    };
    let _urlParams = {
      token,
      coin,
      value,
      address: sendToAddress,
      change: changeAddress,
      gui: true,
      verify: true,
      push: false,
    };

    if (customFee) {
      payload.customFee = customFee;
      _urlParams.customFee = customFee;
    }

    fetch(
      isKv ? `http://127.0.0.1:${agamaPort}/api/electrum/createrawtx` : `http://127.0.0.1:${agamaPort}/api/electrum/createrawtx${urlParams(_urlParams)}${btcFee ? '&btcfee=' + btcFee : ''}`,
      isKv ? fetchType(JSON.stringify(payload)).post : fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumSend') + ' (code: apiElectrumSendPreflight)',
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

export const apiElectrumListunspent = (coin, address) => {
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
          translate('API.apiElectrumListunspent') + ' (code: apiElectrumListunspent)',
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

export const apiElectrumBip39Keys = (seed, match, addressdepth, accounts) => {
  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/seed/bip39/match`,
      fetchType(
        JSON.stringify({
          seed,
          match,
          addressdepth,
          accounts,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumBip39Keys') + ' (code: apiElectrumBip39Keys)',
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

// split utxo
export const apiElectrumSplitUtxoPromise = (payload) => {
  console.warn('apiElectrumSplitUtxoPromise', payload);

  return new Promise((resolve, reject) => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/createrawtx-split`,
      fetchType(
        JSON.stringify({
          payload,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumSend') + ' (code: apiElectrumSplitUtxoPromise)',
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

// get kv electrums list
export const apiElectrumKvServersList = () => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      save: true,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/kv/servers${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumKvServersList') + ' (code: apiElectrumKvServersList)',
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

export const apiElectrumSweep = (coin, value, sendToAddress, changeAddress, push, wif, btcFee) => {
  value = Math.floor(value);

  return new Promise((resolve, reject) => {
    const payload = {
      token,
      coin,
      value,
      address: sendToAddress,
      change: changeAddress,
      verify: true,
      push,
      wif,
      btcFee,
    };
    const _urlParams = {
      token,
      coin,
      value,
      address: sendToAddress,
      change: changeAddress,
      verify: true,
      push,
      wif,
      btcFee,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/createrawtx${urlParams(_urlParams)}${btcFee ? '&btcfee=' + btcFee : ''}`,
      fetchType(JSON.stringify(payload)).post : fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumSend') + ' (code: apiElectrumSweep)',
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

export const apiElectrumPushTx = (coin, rawtx) => {
  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/pushtx`,
      fetchType(
        JSON.stringify({
          network: coin,
          rawtx,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumPushTx') + ' (code: apiElectrumPushTx)',
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