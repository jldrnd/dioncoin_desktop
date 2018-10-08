import {
  GET_ACTIVE_COINS,
  LOGIN,
  ACTIVE_HANDLE,
  DISPLAY_LOGIN_SETTINGS_MODAL,
  DISPLAY_NOTARY_ELECTIONS_MODAL,
  BLUR_SENSITIVE_DATA,
  NEW_UPDATE_AVAILABLE,
} from '../actions/storeType';

export const Main = (state = {
  isLoggedIn: false,
  displayLoginSettingsModal: false,
  displayNotaryElectionsModal: false,
  blurSensitiveData: false,
  newUpdateAvailable: false,
  total: 0,
}, action) => {
  switch (action.type) {
    case GET_ACTIVE_COINS:
      return {
        ...state,
        coins: action.coins,
        total: action.total,
      };
    case LOGIN:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
      };
    case ACTIVE_HANDLE:
      return {
        ...state,
        isLoggedIn: action.isLoggedIn,
        activeHandle: action.handle,
      };
    case DISPLAY_LOGIN_SETTINGS_MODAL:
      return {
        ...state,
        displayLoginSettingsModal: action.displayLoginSettingsModal,
      };
    case DISPLAY_NOTARY_ELECTIONS_MODAL:
      return {
        ...state,
        displayNotaryElectionsModal: action.displayNotaryElectionsModal,
      };
    case BLUR_SENSITIVE_DATA:
      return {
        ...state,
        blurSensitiveData: action.blurSensitiveData,
      };
    case NEW_UPDATE_AVAILABLE:
      return {
        ...state,
        newUpdateAvailable: action.newUpdateAvailable,
      };
    default:
      return state;
  }
}

export default Main;