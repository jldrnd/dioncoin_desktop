import React from 'react';
import { connect } from 'react-redux';
import {
  toggleCoindDownModal,
  coindGetStdout,
  getDebugLog,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import mainWindow from '../../../util/mainWindow';
import translate from '../../../translate/translate';

import CoindDownModalRender from './coindDownModal.render';

const COIND_DOWN_MODAL_FETCH_FAILURES_THRESHOLD = mainWindow.appConfig.native.failedRPCAttemptsThreshold || 10;

class CoindDownModal extends React.Component {
  constructor() {
    super();
    this.state = {
      display: false,
      kmdMainPassiveMode: false,
      coindStdOut: translate('INDEX.LOADING') + '...',
      toggleDebugLog: true,
      className: 'hide',
      open: false,
    };
    this.dismiss = this.dismiss.bind(this);
    this.getCoindGetStdout = this.getCoindGetStdout.bind(this);
    this.toggleDebugLog = this.toggleDebugLog.bind(this);
    this.refreshDebugLog = this.refreshDebugLog.bind(this);
  }

  refreshDebugLog() {
    const _coin = this.props.ActiveCoin.coin;

    if (!this.state.toggleDebugLog) {
      if (_coin === 'KMD') {
        Store.dispatch(getDebugLog('komodo', 50));
      } else {
        Store.dispatch(getDebugLog('komodo', 50, _coin));
      }
    } else {
      this.getCoindGetStdout();
    }
  }

  toggleDebugLog() {
    this.setState({
      toggleDebugLog: !this.state.toggleDebugLog,
    });
  }

  getCoindGetStdout() {
    coindGetStdout(this.props.ActiveCoin.coin)
    .then((res) => {
      this.setState({
        coindStdOut: res.msg === 'success' ? res.result : `${translate('INDEX.ERROR_READING')} ${this.props.ActiveCoin.coin} stdout`,
      });
    });
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
      Store.dispatch(toggleCoindDownModal(false));
    }, 300);
  }

  componentWillMount() {
    this.setState(Object.assign({}, this.state, {
      kmdMainPassiveMode: mainWindow.kmdMainPassiveMode,
    }));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.displayCoindDownModal !== this.state.open) {
      this.setState(Object.assign({}, this.state, {
        className: nextProps.displayCoindDownModal && this.check() ? 'show fade' : 'show out',
      }));

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          open: nextProps.displayCoindDownModal,
          className: nextProps.displayCoindDownModal && this.check() ? 'show in' : 'hide',
        }));
      }, nextProps.displayCoindDownModal ? 50 : 300);

      if (nextProps.displayCoindDownModal) {
        this.getCoindGetStdout();
      }
    }
  }

  check() {
    if (!this.state.kmdMainPassiveMode &&
        this.props.ActiveCoin.getinfoFetchFailures >= COIND_DOWN_MODAL_FETCH_FAILURES_THRESHOLD) {
      return true;
    }
  }

  render() {
    return CoindDownModalRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
      coin: state.ActiveCoin.coin,
      getinfoFetchFailures: state.ActiveCoin.getinfoFetchFailures,
    },
    displayCoindDownModal: state.Dashboard.displayCoindDownModal,
    debugLog: state.Settings.debugLog,
  };
};

export default connect(mapStateToProps)(CoindDownModal);