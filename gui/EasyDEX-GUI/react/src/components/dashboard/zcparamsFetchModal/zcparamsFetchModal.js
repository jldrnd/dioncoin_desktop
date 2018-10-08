import React from 'react';
import { connect } from 'react-redux';
import {
  toggleZcparamsFetchModal,
  downloadZCashParamsPromise,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import Config from '../../../config';
import translate from '../../../translate/translate';
import mainWindow from '../../../util/mainWindow';
import io from 'socket.io-client';

import ZcparamsFetchModalRender from './zcparamsFetchModal.render';

const socket = io.connect(`http://127.0.0.1:${Config.agamaPort}`);

let updateProgressBar = {
  zcparams: {
    proving: -1,
    verifying: -1,
  },
};

class ZcparamsFetchModal extends React.Component {
  constructor() {
    super();
    this.state = {
      open: false,
      updateLog: [],
      zcparamsSources: {},
      dlOption: 'agama.komodoplatform.com',
      done: false,
      className: 'hide',
    };
    this.dismiss = this.dismiss.bind(this);
    this._downloadZCashParamsPromise = this._downloadZCashParamsPromise.bind(this);
  }

  _downloadZCashParamsPromise() {
    let _updateLog = [];

    updateProgressBar.zcparams = {
      proving: 0,
      verifying: 0,
    };
    _updateLog.push(`${ translate('ZCPARAMS_FETCH.DOWNLOADING_ZCASH_KEYS') }...`);
    this.setState(Object.assign({}, this.state, {
      updateLog: _updateLog,
      done: false,
    }));

    downloadZCashParamsPromise(this.state.dlOption);
  }

  dismiss() {
    this.setState(Object.assign({}, this.state, {
      className: 'show out',
    }));

    setTimeout(() => {
      this.setState(Object.assign({}, this.state, {
        open: false,
        className: 'hide',
      }));

      Store.dispatch(toggleZcparamsFetchModal(false));
    }, 300);
  }

  componentWillUnmount() {
    socket.removeAllListeners('zcparams', msg => this.updateSocketsData(msg));
  }

  componentWillMount() {
    socket.on('zcparams', msg => this.updateSocketsData(msg));

    this.setState(Object.assign({}, this.state, {
      zcparamsSources: mainWindow.zcashParamsDownloadLinks,
    }));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.displayZcparamsModal !== this.state.open) {
      this.setState(Object.assign({}, this.state, {
        className: nextProps.displayZcparamsModal ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          open: nextProps.displayZcparamsModal,
          className: nextProps.displayZcparamsModal ? 'show in' : 'hide',
        }));
      }, nextProps.displayZcparamsModal ? 50 : 300);
    }
  }

  updateSocketsData(data) {
    if (data &&
        data.msg &&
        data.msg.type === 'zcpdownload') {
      const _msg = data.msg;

      if (_msg.status === 'progress' &&
          _msg.progress &&
          _msg.progress < 100) {
        this.setState(Object.assign({}, this.state, {
          updateProgressPatch: _msg.progress,
        }));
        updateProgressBar.zcparams[_msg.file] = _msg.progress;
      } else {
        if (_msg.status === 'progress' &&
            _msg.progress &&
            _msg.progress === 100) {
          let _updateLog = this.state.updateLog;
          this.setState(Object.assign({}, this.state, {
            updateLog: _updateLog,
          }));
          updateProgressBar.zcparams[_msg.file] = 100;
        } else if (_msg.status === 'done') {
          let _updateLog = this.state.updateLog;

          if (_msg.file === 'proving') {
            _updateLog = [];
            _updateLog.push(translate('ZCPARAMS_FETCH.BOTH_KEYS_VERIFIED'));
            _updateLog.push(translate('ZCPARAMS_FETCH.CLOSE_THE_MODAL'));
            this.setState(Object.assign({}, this.state, {
              updateLog: _updateLog,
              done: true,
            }));

            mainWindow.zcashParamsExistPromise()
            .then((res) => {
              const _errors = mainWindow.zcashParamsCheckErrors(res);
              mainWindow.zcashParamsExist = res;
            });
          } else {
            this.setState(Object.assign({}, this.state, {
              updateLog: _updateLog,
            }));
          }
          updateProgressBar.zcparams[_msg.file] = -1;
        } else if (_msg.status === 'error') {
          let _updateLog = this.state.updateLog;

          _updateLog.push(`${translate('ZCPARAMS_FETCH.ZCPARAMS_VERIFICATION_ERROR_P1')} ${_msg.file} ${translate('ZCPARAMS_FETCH.ZCPARAMS_VERIFICATION_ERROR_P2')}`);
          this.setState(Object.assign({}, this.state, {
            updateLog: _updateLog,
            done: true,
          }));
          updateProgressBar.zcparams = {
            proving: -1,
            verifying: -1,
          };
        }
      }
    }
  }

  renderUpdateStatus() {
    const _updateLogLength = this.state.updateLog.length;
    let items = [];
    let patchProgressBar = null;

    for (let i = 0; i < _updateLogLength; i++) {
      items.push(
        <div key={ `settings-update-log-${i}` }>{ this.state.updateLog[i] }</div>
      );
    }

    if (_updateLogLength) {
      return (
        <div className="padding-top-20 zcparams-progress">
          <h5>{ translate('SETTINGS.PROGRESS') }</h5>
          <div className="padding-bottom-15">{ items }</div>
          <div className={ updateProgressBar.zcparams.proving > -1 && !this.state.done ? 'progress progress-sm' : 'hide' }>
            <div
              className="progress-bar progress-bar-striped active progress-bar-indicating progress-bar-success font-size-80-percent"
              style={{ width: `${updateProgressBar.zcparams.proving}%` }}>
            </div>
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  renderDLOptions() {
    let _items = [];
    let _dlOptions = this.state.zcparamsSources;

    for (let key in _dlOptions) {
      _items.push(
        <option
          key={ `zcparams-dloptions-list-${key}` }
          value={ key }>
          { key }
        </option>
      );
    }

    return _items;
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  render() {
    return ZcparamsFetchModalRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
    },
    displayZcparamsModal: state.Dashboard.displayZcparamsModal,
  };
};

export default connect(mapStateToProps)(ZcparamsFetchModal);