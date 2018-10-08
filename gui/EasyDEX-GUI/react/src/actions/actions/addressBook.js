import { ADDRESS_BOOK } from '../storeType';
import Config, {
  token,
  agamaPort,
} from '../../config';
import { triggerToaster } from '../actionCreators';
import translate from '../../translate/translate';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';
import Store from '../../store';

export const modifyAddressBook = (data) => {
  const payload = {
    data,
    token,
  };

  return new Promise((resolve, reject) => {
    fetch(
      `http://127.0.0.1:${agamaPort}/api/addressbook`,
      fetchType(JSON.stringify(payload)).post
    )
    .catch((error) => {
      console.log(error);
      Store.dispatch(
        triggerToaster(
          translate('API.modifyAddressBook') + ' (code: modifyAddressBook)',
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
            translate('API.ADDRESS_BOOK_MODIFY_ERR'),
            'error'
          )
        );
        resolve(json);
      }
    });
  });
}

export const loadAddressBook = () => {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/addressbook${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getAddressBook') + ' (code: getAddressBook)',
          translate('TOASTR.ERROR'),
          'error'
        )
      );
    })
    .then(response => response.json())
    .then(json => {
      if (typeof json.result === 'string') {
        dispatch(loadAddressBookState([]));
      } else {
        const res = json.result;
        let _items = [];

        // convert obj to array
        Object.keys(res).map((key, index) => {
          if (!_items[res[key].coin]) {
            _items[res[key].coin] = [];
          }
          _items[res[key].coin].push({
            pub: key,
            title: res[key].title,
          });
        });

        dispatch(loadAddressBookState({
          obj: json.result,
          arr: _items,
        }));
      }
    });
  }
}

export const loadAddressBookState = (data) => {
  return {
    type: ADDRESS_BOOK,
    addressBook: data,
  }
}