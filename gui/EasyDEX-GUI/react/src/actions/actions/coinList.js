import { triggerToaster } from '../actionCreators';
import Config, {
  token,
  agamaPort,
} from '../../config';
import Store from '../../store';
import translate from '../../translate/translate';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';

export const apiElectrumLock = () => {
  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/lock`,
      fetchType(JSON.stringify({ token })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumLock') + ' (code: apiElectrumLock)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}

export const apiElectrumLogout = () => {
  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/logout`,
      fetchType(JSON.stringify({ token })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectrumLogout') + ' (code: apiElectrumLogout)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}

export const apiStopCoind = (coin) => {
  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/coind/stop`,
      fetchType(coin === 'KMD' ? JSON.stringify({ token }) : JSON.stringify({ chain: coin, token })).post
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiStopCoind') + ' (code: apiStopCoind)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}

export const apiRemoveCoin = (coin, mode) => {
  return new Promise((resolve, reject, dispatch) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/coins/remove`,
      fetchType(
        JSON.stringify(coin === 'KMD' && mode === 'native' ? {
          mode,
          token,
        } : {
          mode,
          chain: coin,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiRemoveCoin') + ' (code: apiRemoveCoin)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      resolve(json);
      if (mode === 'native') {
        Store.dispatch(
          triggerToaster(
            `${coin} ${translate('API.DAEMON_IS_STILL_RUNNING')}`,
            translate('API.WARNING'),
            'warning'
          )
        );
      }
    });
  });
}

export const apiGetCoinList = () => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/coinslist${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiGetCoinList') + ' (code: apiGetCoinList)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}

export const apiPostCoinList = (data) => {
  return new Promise((resolve, reject) => {
    fetch(`http://127.0.0.1:${agamaPort}/api/coinslist`,
      fetchType(
        JSON.stringify({
          payload: data,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiPostCoinList') + ' (code: apiPostCoinList)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}

export const apiClearCoindFolder = (coin, keepWalletDat) => {
  return new Promise((resolve, reject) => {
    const _urlParams1 = {
      token,
      coin,
      keepwallet: true,
    };
    const _urlParams2 = {
      token,
      coin,
    };
    fetch(
      keepWalletDat ? `http://127.0.0.1:${agamaPort}/api/kick${urlParams(_urlParams1)}` : `http://127.0.0.1:${Config.agamaPort}/api/kick${urlParams(_urlParams2)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiClearCoindFolder') + ' (code: apiClearCoindFolder)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}