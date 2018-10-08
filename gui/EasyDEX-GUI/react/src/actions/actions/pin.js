import Config, {
  token,
  agamaPort,
} from '../../config';
import {
  getDecryptedPassphrase,
  getPinList,
  triggerToaster,
  apiElectrumAuth,
} from '../actionCreators';
import translate from '../../translate/translate';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';
import Store from '../../store';

export const encryptPassphrase = (string, key, suppressToastr, customPinName) => {
  const payload = {
    string,
    key,
    token,
    pubkey: customPinName,
  };

  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/encryptkey`,
      fetchType(JSON.stringify(payload)).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.encryptKey') + ' (code: encryptKey)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
      resolve({ msg: 'error' });
    })
    .then(response => response.json())
    .then(json => {
      if (!suppressToastr) {
        if (json.msg === 'success') {
          Store.dispatch(
            triggerToaster(
              translate('INDEX.PASSPHRASE_SUCCESSFULLY_ENCRYPTED'),
              translate('KMD_NATIVE.SUCCESS'),
              'success'
            )
          );
        } else {
          Store.dispatch(
            triggerToaster(
              json.result,
              translate('TOASTR.ERROR'),
              'error'
            )
          );
        }
      }
      resolve(json);
    });
  });
}

export const loginWithPin = (key, pubkey) => {
  const payload = {
    key,
    pubkey,
    token,
  };

  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/decryptkey`,
      fetchType(JSON.stringify(payload)).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.decryptKey') + ' (code: decryptKey)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
      resolve({ msg: 'error' });
    })
    .then(response => response.json())
    .then(json => {
      if (json.msg === 'success') {
        resolve(json);
      } else {
        Store.dispatch(
          triggerToaster(
            json.result,
            translate('API.PIN_DECRYPT_ERR'),
            'error'
          )
        );
        resolve(json);
      }
    });
  });
}

export const modifyPin = (pubkey, remove, pubkeynew) => {
  const payload = remove ? {
    pubkey,
    delete: true,
    token,
  } : {
    pubkey,
    pubkeynew,
    token,
  };

  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/modifypin`,
      fetchType(JSON.stringify(payload)).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.encryptKey') + ' (code: modifyPin)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
      resolve({ msg: 'error' });
    })
    .then(response => response.json())
    .then(json => {
      if (json.msg === 'success') {
        resolve(json);
      } else {
        Store.dispatch(
          triggerToaster(
            json.result,
            translate('API.PIN_MODIFY_ERR'),
            'error'
          )
        );
        resolve(json);
      }
    });
  });
}

export const loadPinList = () => {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/getpinlist${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.encryptKey') + ' (code: getPinList)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (typeof json.result === 'string') {
        dispatch(getPinList([]));
      } else {
        dispatch(getPinList(json.result));
      }
    });
  }
}

export const changePin = (oldKey, newKey, pubkey) => {
  const payload = {
    key: oldKey,
    pubkey,
    token,
  };

  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/decryptkey`,
      fetchType(JSON.stringify(payload)).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.encryptKey') + ' (code: decryptKey)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
      resolve({ msg: 'error' });
    })
    .then(response => response.json())
    .then(json => {
      if (json.msg === 'success') {
        const string = json.result;
        // resolve(json);
        // encrypt seed with a new key
        const payload = {
          string,
          key: newKey,
          token,
          pubkey,
        };

        fetch(
          `http://127.0.0.1:${agamaPort}/api/encryptkey`,
          fetchType(JSON.stringify(payload)).post
        )
        .catch((error) => {
          console.log(error);
          Store.dispatch(
            triggerToaster(
              translate('API.encryptKey') + ' (code: changePin + encryptKey)',
              translate('TOASTR.ERROR'),
              'error'
            )
          );
          resolve({ msg: 'error' });
        })
        .then(response => response.json())
        .then(json => {
          resolve(json);
        });
      } else {
        Store.dispatch(
          triggerToaster(
            json.result,
            translate('API.PIN_DECRYPT_ERR'),
            'error'
          )
        );
        resolve(json);
      }
    });
  });
}