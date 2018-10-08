import { triggerToaster } from '../actionCreators';
import Config, {
  token,
  agamaPort,
  rpc2cli,
} from '../../config';
import urlParams from '../../util/url';
import fetchType from '../../util/fetchType';
import translate from '../../translate/translate';

export const apiGetSysInfo = () => {
  return dispatch => {
    const _urlParams = {
      token,
    };
    return fetch(
      `http://127.0.0.1:${agamaPort}/api/sysinfo${urlParams(_urlParams)}`,
      fetchType.get
    )
    .catch((error) => {
      console.log(error);
      dispatch(
        triggerToaster(
          translate('API.getSettings') + ' (code: apiGetSysInfo)',
          translate('TOASTR.ERROR'),
          'error'
        )
      )
    })
    .then(response => response.json())
    .then(json => console.log(json));
  }
}