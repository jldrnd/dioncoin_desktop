import { ACTIVE_HANDLE } from '../storeType';
import translate from '../../translate/translate';
import Config, {
  token,
  agamaPort,
} from '../../config';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';
import mainWindow from '../../util/mainWindow';

import {
  triggerToaster,
  toggleAddcoinModal,
  getDexCoins,
  apiElectrumCoins,
} from '../actionCreators';
import {
  startCurrencyAssetChain,
  startAssetChain,
  startCrypto,
  checkAC,
  acConfig,
} from '../../components/addcoin/payload';

export const iguanaActiveHandleState = (json) => {
  return {
    type: ACTIVE_HANDLE,
    isLoggedIn: json.status === 'unlocked' ? true : false,
    handle: json,
  }
}

export const activeHandle = () => {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/auth/status${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.activeHandle') + ' (code: activeHandle)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(
        iguanaActiveHandleState(json)
      );
    });
  }
}

export const apiElectrumAuth = (seed) => {
  return dispatch => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/login`,
      fetchType(
        JSON.stringify({
          seed,
          iguana: true,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiElectrumAuth') + ' (code: apiElectrumAuth)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (json.msg !== 'error') {
        dispatch(activeHandle());
        dispatch(apiElectrumCoins());
      } else {
        dispatch(
          triggerToaster(
            translate('TOASTR.INCORRECT_WIF'),
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      }
    });
  }
}

export const apiElectrumAddCoin = (coin) => {
  return dispatch => {
    const _urlParams = {
      coin,
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/coins/add${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiElectrumAddCoin') + ' (code: apiElectrumAddCoin)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      dispatch(
        addCoinResult(coin, '0')
      );
    });
  }
}

export const addCoin = (coin, mode, startupParams, genproclimit) => {
  if (mode === 0 ||
      mode === '0') {
    return dispatch => {
      dispatch(apiElectrumAddCoin(coin));
    }
  } else {
    return dispatch => {
      dispatch(apiGetConfig(coin, mode, startupParams, genproclimit));
    }
  }
}

const handleErrors = (response) => {
  let _parsedResponse;

  if (!response.ok) {
    return null;
  } else {
    _parsedResponse = response.text().then((text) => { return text; });
    return _parsedResponse;
  }
}

export const apiHerd = (coin, mode, path, startupParams, genproclimit) => {
  let acData;
  let herdData = {
    ac_name: coin,
    ac_options: [
      '-daemon=0',
      '-server',
    ],
  };

  if (acConfig[coin]) {
    for (let key in acConfig[coin]) {
      if (key === 'pubkey') {
        const pubKeys = mainWindow.getPubkeys();

        if (pubKeys &&
            pubKeys[coin.toLowerCase()]) {
          herdData.ac_options.push(`-pubkey=${pubKeys[coin.toLowerCase()].pubHex}`);
        }
      } else if (key === 'genproclimit') {
        if (genproclimit > 0) {
          herdData.ac_options.push(`-genproclimit=${genproclimit + 1}`);
        } else {
          herdData.ac_options.push('-genproclimit=0');
        }
      } else if (
        key === 'addnode' &&
        typeof acConfig[coin][key] === 'object') {
        for (let i = 0; i < acConfig[coin][key].length; i++) {
          herdData.ac_options.push(`-addnode=${acConfig[coin][key][i]}`);
        }
      } else {
        herdData.ac_options.push(`-${key}=${acConfig[coin][key]}`);
      }
    }
  }

  if (!acConfig[coin] ||
      (acConfig[coin] && !acConfig[coin].addnode)) {
    herdData.ac_options.push('-addnode=78.47.196.146');
  }

  if (coin === 'ZEC') {
    herdData = {
      ac_name: 'zcashd',
      ac_options: [
        '-daemon=0',
        '-server=1',
      ],
    };
  }

  if (coin === 'KMD') {
    herdData = {
      ac_name: 'komodod',
      ac_options: [
        '-daemon=0',
        '-addnode=78.47.196.146',
      ],
    };
  }

  if (startupParams) {
    herdData.ac_custom_param = startupParams.type;

    if (startupParams.value) {
      herdData.ac_custom_param_value = startupParams.value;
    }
  }

  // TODO: switch statement
  if (coin === 'KMD') {
    acData = startCrypto(
      path.result,
      coin,
      mode
    );
  } else {
    const supply = startAssetChain(
      path.result,
      coin,
      mode,
      true
    );
    acData = startAssetChain(
      path.result,
      coin,
      mode
    );
  }

  return dispatch => {
    let _herd;

    if (coin === 'CHIPS') {
      _herd = 'chipsd';
      herdData = {};
    } else {
      _herd = coin !== 'ZEC' ? 'komodod' : 'zcashd';
    }

    return fetch(
      `http://127.0.0.1:${agamaPort}/api/herd`,
      fetchType(
        JSON.stringify({
          herd: _herd,
          options: herdData,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiHerd') + ' (code: apiHerd)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(handleErrors)
    .then((json) => {
      if (json) {
        dispatch(
          addCoinResult(coin, mode)
        );
      } else {
        dispatch(
          triggerToaster(
            `${translate('TOASTR.ERROR_STARTING_DAEMON', coin)} ${translate('TOASTR.PORT_IS_TAKEN', acData)}`,
            translate('TOASTR.SERVICE_NOTIFICATION'),
            'error',
            false
          )
        );
      }
    });
  }
}

export const addCoinResult = (coin, mode) => {
  const modeToValue = {
    '0': 'spv',
    '-1': 'native',
    '1': 'staking',
    '2': 'mining',
  };

  return dispatch => {
    dispatch(
      triggerToaster(
        `${coin} ${translate('TOASTR.STARTED_IN')} ${modeToValue[mode].toUpperCase()} ${translate('TOASTR.MODE')}`,
        translate('TOASTR.COIN_NOTIFICATION'),
        'success'
      )
    );
    dispatch(toggleAddcoinModal(false, false));

    if (Number(mode) === 0) {
      dispatch(activeHandle());
      dispatch(apiElectrumCoins());
      dispatch(getDexCoins());

      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(apiElectrumCoins());
        dispatch(getDexCoins());
      }, 500);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(apiElectrumCoins());
        dispatch(getDexCoins());
      }, 1000);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(apiElectrumCoins());
        dispatch(getDexCoins());
      }, 2000);
    } else {
      dispatch(activeHandle());
      dispatch(getDexCoins());

      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(getDexCoins());
      }, 500);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(getDexCoins());
      }, 1000);
      setTimeout(() => {
        dispatch(activeHandle());
        dispatch(getDexCoins());
      }, 5000);
    }
  }
}

export const _apiGetConfig = (coin, mode, startupParams) => {
  return dispatch => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/getconf`,
      fetchType(
        JSON.stringify({
          chain: 'komodod',
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API._apiGetConfig') + ' (code: _apiGetConfig)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(
      json => dispatch(
        apiHerd(
          coin,
          mode,
          json,
          startupParams
        )
      )
    );
  }
}

export const apiGetConfig = (coin, mode, startupParams, genproclimit) => {
  if (coin === 'KMD' &&
      mode === '-1') {
    return dispatch => {
      return fetch(
        `http://127.0.0.1:${agamaPort}/api/getconf`,
        fetchType(
          JSON.stringify({
            chain: 'komodod',
            token,
          })
        ).post
      )
      .catch((error) => {
        console.log(error);
        dispatch(
          triggerToaster(
            translate('API.apiGetConfig') + ' (code: apiGetConfig)',
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      })
      .then(response => response.json())
      .then(
        json => dispatch(
          apiHerd(
            coin,
            mode,
            json,
            startupParams
          )
        )
      );
    }
  } else {
    return dispatch => {
      return fetch(
        `http://127.0.0.1:${agamaPort}/api/getconf`,
        fetchType(
          JSON.stringify({
            chain: coin,
            token,
          })
        ).post
      )
      .catch((error) => {
        console.log(error);
        dispatch(
          triggerToaster(
            translate('API.apiGetConfig') + ' (code: apiGetConfig)',
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      })
      .then(response => response.json())
      .then(
        json => dispatch(
          apiHerd(
            coin,
            mode,
            json,
            startupParams,
            genproclimit
          )
        )
      );
    }
  }
}