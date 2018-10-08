import {
  GET_WIF_KEY,
  GET_DEBUG_LOG,
  LOAD_APP_CONFIG,
  LOAD_APP_INFO,
  CLI,
  ADDRESS_BOOK,
} from '../actions/storeType';

export const Settings = (state = {
  wifkey: null,
  address: null,
  debugLog: null,
  appSettings: null,
  appInfo: null,
  cli: null,
  addressBook: {},
}, action) => {
  switch (action.type) {
    case GET_WIF_KEY:
      return {
        ...state,
        wifkey: action.wifkey,
        address: action.address,
      };
    case GET_DEBUG_LOG:
      return {
        ...state,
        debugLog: action.data,
      };
    case LOAD_APP_CONFIG:
      return {
        ...state,
        appSettings: action.config,
      };
    case LOAD_APP_INFO:
      return {
        ...state,
        appInfo: action.info,
      };
    case CLI:
      return {
        ...state,
        cli: action.data,
      };
    case ADDRESS_BOOK:
      return {
        ...state,
        addressBook: action.addressBook,
      };
    default:
      return state;
  }
}

export default Settings;