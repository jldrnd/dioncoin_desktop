import { triggerToaster } from '../actionCreators';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import Store from '../../store';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';
import { NEW_UPDATE_AVAILABLE } from '../storeType';
import translate from '../../translate/translate';

export const newUpdateAvailable = () => {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/update/patch/check${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
    })
    .then(response => response.json())
    .then(json => {
      dispatch(newUpdateAvailableState(json));
    });
  }
}

const newUpdateAvailableState = (json) => {
  return {
    type: NEW_UPDATE_AVAILABLE,
    newUpdateAvailable: json,
  }
}

export const checkForUpdateUIPromise = () => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/update/patch/check${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getUpdate') + ' (code: checkForUpdateUIPromise)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}

export const updateUIPromise = () => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/update/patch${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getUpdate') + ' (code: updateUIPromise)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}

export const downloadZCashParamsPromise = (dloption) => {
  return new Promise((resolve, reject) => {
    const _urlParams = {
      token,
      dloption,
    };
    fetch(
      `http://127.0.0.1:${agamaPort}/api/zcparamsdl${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.downloadZCashParamsPromise') + ' (code: updateUIPromise)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => resolve(json));
  });
}