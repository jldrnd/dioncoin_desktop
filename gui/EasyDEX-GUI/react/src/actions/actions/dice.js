import { triggerToaster } from '../actionCreators';
import { DICE_LIST } from '../storeType';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import Store from '../../store';
import fetchType from '../../util/fetchType';
import translate from '../../translate/translate';

export const diceProcessErrors = (json) => {
  console.warn('dice response', json);

  if (json) {
    if (json.error) {
      Store.dispatch(
        triggerToaster(
          ['Dice error (code: diceProcessErrors)',
           'response: ' + JSON.stringify(json.error)],
          translate('TOASTR.ERROR'),
          'error toastr-wide',
          false,
        )
      );
    }
  } else {
    Store.dispatch(
      triggerToaster(
        'General dice error (code: diceProcessErrors)',
        translate('TOASTR.ERROR'),
        'error'
      )
    );
  }
}

export const getDiceList = (coin) => {
  return dispatch => {
    const payload = {
      mode: null,
      chain: coin,
      cmd: 'dicelist',
      rpc2cli,
      token,
    };

    return fetch(
      `http://127.0.0.1:${agamaPort}/api/cli`,
      fetchType(JSON.stringify({ payload })).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.getDiceList') + ' (code: getDiceList)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      diceProcessErrors(json);
      dispatch(diceListState(json));
    });
  };
}

const diceListState = (json) => {
  return {
    type: DICE_LIST,
    data: json,
  }
};