import translate from '../../translate/translate';
import Config, {
  token,
  agamaPort,
} from '../../config';
import { triggerToaster } from '../actionCreators';
import Store from '../../store';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';

export const apiElectionsBalance = (coin, address) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
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
          translate('API.apiElectionsBalance') + ' (code: apiElectionsBalance)',
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

export const apiElectionsTransactions = (coin, address, type) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      coin,
      address,
      full: true,
      type,
      maxlength: 20,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/elections/listtransactions${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.apiElectionsTransactions') + ' (code: apiElectionsTransactions)',
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

export const apiElectionsStatus = () => {
  return new Promise((resolve, reject) => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/elections/status`,
      fetchType(
        JSON.stringify({
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectionsStatus') + ' (code: apiElectionsStatus)',
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

export const apiElectionsLogin = (seed, network) => {
  return new Promise((resolve, reject) => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/elections/login`,
      fetchType(
        JSON.stringify({
          seed,
          network,
          iguana: true,
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectionsLogin') + ' (code: apiElectionsLogin)',
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

export const apiElectionsLogout = () => {
  return new Promise((resolve, reject) => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/elections/logout`,
      fetchType(
        JSON.stringify({
          token,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectionsLogout') + ' (code: apiElectionsLogout)',
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

export const apiElectionsSend = (coin, value, sendToAddress, changeAddress, opreturn) => {
  value = Math.floor(value);

  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      coin,
      address,
      value,
      opreturn,
      change: changeAddress,
      vote: true,
      push: true,
      verify: false
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/createrawtx${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectionsSend') + ' (code: apiElectionsSend)',
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

export const apiElectionsSendMany = (coin, targets, change, opreturn) => {
  return new Promise((resolve, reject) => {
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/electrum/createrawtx-multiout`,
      fetchType(
        JSON.stringify({
          token,
          coin,
          targets,
          change,
          opreturn,
          push: true,
          verify: false,
          vote: true,
        })
      ).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.apiElectionsSendMany') + ' (code: apiElectionsSendMany)',
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