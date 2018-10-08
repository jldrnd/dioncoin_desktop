import {
  LOAD_APP_INFO,
  GET_WIF_KEY,
  GET_DEBUG_LOG,
  GET_PEERS_LIST,
  LOAD_APP_CONFIG,
} from '../storeType';
import translate from '../../translate/translate';
import { triggerToaster } from '../actionCreators';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import Store from '../../store';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';

const getAppInfoState = (json) => {
  return {
    type: LOAD_APP_INFO,
    info: json,
  }
}

export const getAppInfo = () => {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/appinfo${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getSettings') + ' (code: getAppInfo)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => dispatch(getAppInfoState(json)));
  }
}

export const settingsWifkeyState = (json, coin) => {
  return {
    type: GET_WIF_KEY,
    wifkey: json,
    address: json[coin],
  }
}

const parseImportPrivKeyResponse = (json, dispatch) => {
  if (json.error === 'illegal privkey') {
    return dispatch => {
      dispatch(
        triggerToaster(
          translate('API.ILLEGAL_PRIVKEY'),
          translate('TOASTR.SETTINGS_NOTIFICATION'),
          'error'
        )
      );
    }
  } else if (json.error === 'privkey already in wallet') {
    return dispatch => {
      dispatch(
        triggerToaster(
          translate('API.PRIVKEY_IN_WALLET'),
          translate('TOASTR.SETTINGS_NOTIFICATION'),
          'warning'
        )
      );
    }
  }

  if (json &&
      json.result !== undefined &&
      json.result == 'success') {
    return dispatch => {
      dispatch(
        triggerToaster(
          translate('TOASTR.PRIV_KEY_IMPORTED'),
          translate('TOASTR.SETTINGS_NOTIFICATION'),
          'success'
        )
      );
    }
  }
}

const getDebugLogState = (json) => {
  const _data = json.result.replace('\n', '\r\n');

  return {
    type: GET_DEBUG_LOG,
    data: _data,
  }
}

export const getDebugLog = (target, linesCount, acName) => {
  let payload = {
    herdname: target,
    lastLines: linesCount,
    token,
  };

  if (acName) {
    payload.ac = acName;
  }

  return dispatch => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/debuglog`,
      fetchType(JSON.stringify(payload)).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getSettings') + ' (code: getDebugLog)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => dispatch(getDebugLogState(json)));
  }
}

export const saveAppConfig = (_payload) => {
  return dispatch => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/appconf`,
      fetchType(
        JSON.stringify({
          payload: _payload,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getSettings') + ' (code: saveAppConfig)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(getAppConfig());
      dispatch(
        triggerToaster(
          translate('TOASTR.SETTINGS_SAVED'),
          translate('TOASTR.SETTINGS_NOTIFICATION'),
          'success'
        )
      );
    });
  }
}

const getAppConfigState = (json) => {
  return {
    type: LOAD_APP_CONFIG,
    config: json,
  }
}

export function getAppConfig() {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/appconf${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getSettings') + ' (code: getAppConfig)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => dispatch(getAppConfigState(json)));
  }
}

export const resetAppConfig = () => {
  return dispatch => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/appconf/reset`,
      fetchType(JSON.stringify({ token })).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getSettings') + ' (code: resetAppConfig)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(getAppConfig());
      dispatch(
        triggerToaster(
          translate('TOASTR.SETTINGS_RESET'),
          translate('TOASTR.SETTINGS_NOTIFICATION'),
          'success'
        )
      );
    });
  }
}

export const coindGetStdout = (chain) => {
  const _chain = chain === 'KMD' ? 'komodod' : chain;

  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      chain,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/coind/stdout${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getSettings') + ' (code: coindGetStdout)',
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

export const getWalletDatKeys = (chain, keyMatchPattern) => {
  const _chain = chain === 'KMD' ? null : chain;

  return new Promise((resolve, reject) => {
    const _urlParams1 = {
      token,
      chain,
      search: keyMatchPattern,
    };
    const _urlParams2 = {
      token,
      chain,
    };
    fetch(
      keyMatchPattern ? `http://127.0.0.1:${agamaPort}/api/coindwalletkeys${urlParams(_urlParams1)}` : `http://127.0.0.1:${agamaPort}/api/coindwalletkeys${urlParams(_urlParams2)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getSettings') + ' (code: getWalletDatKeys)',
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

export const dumpPrivKey = (coin, address, isZaddr) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: isZaddr ? 'z_exportkey' : 'dumpprivkey',
      params: [ address ],
      rpc2cli,
      token,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch(function(error) {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.dumpPrivKey') + ' (code: dumpPrivKeyPromise)',
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

export const validateAddress = (coin, address, isZaddr) => {
  return new Promise((resolve, reject) => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: isZaddr ? 'z_validateaddress' : 'validateaddress',
      params: [ address ],
      rpc2cli,
      token,
    };

    fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch(function(error) {
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
      resolve(json.result ? json.result : json);
    });
  });
}

export const resetSPVCache = () => {
  return dispatch => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/cache/delete`,
      fetchType(JSON.stringify({ token })).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getSettings') + ' (code: resetSPVCache)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(getAppInfo());
      dispatch(
        triggerToaster(
          translate('TOASTR.SETTINGS_CACHE_RESET'),
          translate('TOASTR.SETTINGS_NOTIFICATION'),
          'success'
        )
      );
    });
  }
}