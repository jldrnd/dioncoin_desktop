import React from 'react';
import translate from '../../../translate/translate';
import { connect } from 'react-redux';
import {
  copyString,
  apiElectrumListunspent,
  apiElectrumSweep,
  apiGetRemoteTimestamp,
  triggerToaster,
} from '../../../actions/actionCreators';
import addCoinOptionsCrypto from '../../addcoin/addcoinOptionsCrypto';
import addCoinOptionsAC from '../../addcoin/addcoinOptionsAC';
import Select from 'react-select';
import Store from '../../../store';
import mainWindow from '../../../util/mainWindow';
import ReactTooltip from 'react-tooltip';
import Config from '../../../config';
const SEED_TRIM_TIMEOUT = 5000;
import { seedToWif } from 'agama-wallet-lib/src/keys';
import electrumJSNetworks from 'agama-wallet-lib/build/bitcoinjs-networks';
import { isKomodoCoin } from 'agama-wallet-lib/build/coin-helpers';
import {
  fromSats,
  toSats,
} from 'agama-wallet-lib/src/utils';
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';

const { shell } = window.require('electron');
const SPV_MAX_LOCAL_TIMESTAMP_DEVIATION = 60; // seconds

class SweepKeysPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      seedInputVisibility: false,
      trimPassphraseTimer: null,
      wifkeysPassphrase: '',
      seedExtraSpaces: false,
      decryptedPassphrase: null,
      coin: null,
      sweepPreflight: null,
      sweepResult: null,
      processingTx: false,
      processingPreflight: false,
    };
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.toggleSeedInputVisibility = this.toggleSeedInputVisibility.bind(this);
    this._copyString = this._copyString.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.sweepKeysPreflight = this.sweepKeysPreflight.bind(this);
    this.cancelSweep = this.cancelSweep.bind(this);
    this.confirmSweep = this.confirmSweep.bind(this);
    this.openExplorerWindow = this.openExplorerWindow.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.Dashboard &&
        props.Dashboard.activeSection !== 'settings') {
      this.setState(this.defaultState);

      // reset input vals
      this.refs.wifkeysPassphrase.value = '';
      this.refs.wifkeysPassphraseTextarea.value = '';
    }
  }

  openExplorerWindow() {
    const txid = this.state.sweepResult.result.txid;
    const url = explorerList[this.state.coin.split('|')[0]].split('/').length - 1 > 2 ? `${explorerList[this.state.coin.split('|')[0]]}${txid}` : `${explorerList[this.state.coin.split('|')[0]]}/tx/${txid}`;
    return shell.openExternal(url);
  }

  cancelSweep() {
    this.setState({
      sweepPreflight: null,
    });
  }

  confirmSweep() {
    const _coin = this.state.coin.split('|')[0];
    let _fees = mainWindow.spvFees;

    if (Number(this.state.sweepPreflight.balance) - fromSats(_fees[this.props.ActiveCoin.coin]) >= 0) {
      const _kp = seedToWif(
        this.state.wifkeysPassphrase,
        electrumJSNetworks[isKomodoCoin(_coin.toLowerCase()) ? 'kmd' : _coin.toLowerCase()],
        true
      );

      this.setState({
        processingTx: true,
      });

      apiElectrumSweep(
        _coin,
        toSats(this.state.sweepPreflight.balance - 0.0001),
        this.props.Dashboard.electrumCoins[_coin].pub,
        _kp.pub,
        true,
        _kp.priv,
      )
      .then((res) => {
        if (res.msg === 'success') {
          Store.dispatch(
            triggerToaster(
              translate('SETTINGS.SWEEP_SUCCESS', `${this.state.sweepPreflight.balance - 0.0001} ${_coin}`) + ' ' + translate('SETTINGS.FROM_SM') + ' ' + _kp.pub + ' ' + translate('SEND.TO') + ' ' + this.props.Dashboard.electrumCoins[_coin].pub,
              translate('TOASTR.WALLET_NOTIFICATION'),
              'success toastr-wide',
              false
            )
          );

          this.setState({
            seedInputVisibility: false,
            trimPassphraseTimer: null,
            wifkeysPassphrase: '',
            seedExtraSpaces: false,
            decryptedPassphrase: null,
            sweepPreflight: null,
            processingTx: false,
            processingPreflight: false,
          });

          this.refs.wifkeysPassphrase.value = '';
          this.refs.wifkeysPassphraseTextarea.value = '';
        }

        this.setState({
          sweepResult: res,
        });
      });
    } else {
      Store.dispatch(
        triggerToaster(
          translate('SEND.INSUFFICIENT_FUNDS'),
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
    }
  }

  sweepKeysPreflight() {
    const _coin = this.state.coin.split('|')[0];

    const _kp = seedToWif(
      this.state.wifkeysPassphrase,
      electrumJSNetworks[isKomodoCoin(_coin.toLowerCase()) ? 'kmd' : _coin.toLowerCase()],
      true
    );

    this.setState({
      processingPreflight: true,
      sweepResult: null,
    });

    apiElectrumListunspent(
      _coin,
      _kp.pub
    )
    .then((res) => {
      this.setState({
        processingPreflight: false,
      });

      if (res.msg === 'success') {
        const _utxos = res.result;
        let _balance = 0;

        for (let i = 0; i < _utxos.length; i++) {
          _balance += Number(_utxos[i].amount);
        }

        if (_balance > 0) {
          this.setState({
            sweepPreflight: {
              balance: _balance.toFixed(8),
              from: _kp.pub,
              to: this.props.Dashboard.electrumCoins[_coin].pub,
            },
          });
        } else {
        Store.dispatch(
          triggerToaster(
            translate('SETTINGS.IS_EMPTY', _kp.pub),
            translate('TOASTR.ERROR'),
            'error'
          )
        );
        }
      } else {
        Store.dispatch(
          triggerToaster(
            translate('SETTINGS.UNABLE_TO_FETCH_BALANCE', _kp.pub),
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      }
    });
  }

  toggleSeedInputVisibility() {
    this.setState({
      seedInputVisibility: !this.state.seedInputVisibility,
    });
  }

  _copyCoinAddress(address) {
    Store.dispatch(copyCoinAddress(address));
  }

  _copyString(str, msg) {
    Store.dispatch(copyString(str, msg));
  }

  updateInput(e) {
    const newValue = e.target.value;

    clearTimeout(this.state.trimPassphraseTimer);

    const _trimPassphraseTimer = setTimeout(() => {
      if (newValue[0] === ' ' ||
          newValue[newValue.length - 1] === ' ') {
        this.setState({
          seedExtraSpaces: true,
        });
      } else {
        this.setState({
          seedExtraSpaces: false,
        });
      }
    }, SEED_TRIM_TIMEOUT);

    if (e.target.name === 'wifkeysPassphrase') {
      this.resizeLoginTextarea();
    }

    this.setState({
      trimPassphraseTimer: _trimPassphraseTimer,
      [e.target.name === 'wifkeysPassphraseTextarea' ? 'wifkeysPassphrase' : e.target.name]: newValue,
    });
  }

  resizeLoginTextarea() {
    // auto-size textarea
    setTimeout(() => {
      if (this.state.seedInputVisibility) {
        document.querySelector('#wifkeysPassphraseTextarea').style.height = '1px';
        document.querySelector('#wifkeysPassphraseTextarea').style.height = `${(15 + document.querySelector('#wifkeysPassphraseTextarea').scrollHeight)}px`;
      }
    }, 100);
  }

  updateSelectedCoin(e, propName) {
    if (e &&
        e.value &&
        e.value.indexOf('|')) {
      this.setState({
        [propName]: e.value,
      });

      if (e.value.split('|')[0] === 'KMD') {
        apiGetRemoteTimestamp()
        .then((res) => {
          if (res.msg === 'success') {
            if (Math.abs(checkTimestamp(res.result)) > SPV_MAX_LOCAL_TIMESTAMP_DEVIATION) {
              Store.dispatch(
                triggerToaster(
                  translate('SEND.CLOCK_OUT_OF_SYNC'),
                  translate('TOASTR.WALLET_NOTIFICATION'),
                  'warning',
                  false
                )
              );
            }
          }
        });
      }
    }
  }

  renderCoinOption(option) {
    return (
      <div>
        <img
          src={ `assets/images/cryptologo/${option.icon.toLowerCase()}.png` }
          alt={ option.label }
          width="30px"
          height="30px" />
        <span className="margin-left-10">{ option.label }</span>
      </div>
    );
  }

  renderCoinsList() {
    const _activeCoins = this.props.Dashboard.electrumCoins;
    const allCoins = addCoinOptionsCrypto('skip').concat(addCoinOptionsAC('skip'));
    let _items = [];

    for (let i = 0; i < allCoins.length; i++) {
      if (_activeCoins[allCoins[i].icon.toUpperCase()] &&
          allCoins[i].icon.toUpperCase() !== 'BTC') {
        _items.push(allCoins[i]);
      }
    }

    return _items;
  }

  render() {
    return (
      <div className="sweep-keys-panel">
        <div className="row">
          <div className="col-sm-12 margin-bottom-15">
            <div className="padding-bottom-20">{ translate('SETTINGS.SWEEP_KEY_DESC') }</div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12">
            <div className="form-group form-material floating padding-bottom-40">
              <label
                className="control-label col-sm-1 no-padding-left padding-top-10"
                htmlFor="kmdWalletSendTo">{ translate('TOOLS.COIN') }</label>
              <Select
                name="coin"
                className="col-sm-3"
                value={ this.state.coin }
                onChange={ (event) => this.updateSelectedCoin(event, 'coin') }
                optionRenderer={ this.renderCoinOption }
                valueRenderer={ this.renderCoinOption }
                options={ this.renderCoinsList() } />
            </div>
            <div
              className="wifkeys-form margin-top-70"
              autoComplete="off">
              <div className="form-group form-material floating">
                <input
                  type="password"
                  className={ !this.state.seedInputVisibility ? 'form-control' : 'hide' }
                  autoComplete="off"
                  name="wifkeysPassphrase"
                  ref="wifkeysPassphrase"
                  id="wifkeysPassphrase"
                  onChange={ this.updateInput }
                  value={ this.state.wifkeysPassphrase } />
                <textarea
                  className={ this.state.seedInputVisibility ? 'form-control blur' : 'hide' }
                  autoComplete="off"
                  id="wifkeysPassphraseTextarea"
                  ref="wifkeysPassphraseTextarea"
                  name="wifkeysPassphraseTextarea"
                  onChange={ this.updateInput }
                  value={ this.state.wifkeysPassphrase }></textarea>
                <i
                  className={ 'seed-toggle fa fa-eye' + (!this.state.seedInputVisibility ? '-slash' : '') }
                  onClick={ this.toggleSeedInputVisibility }></i>
                { !mainWindow.pinAccess &&
                  <label
                    className="floating-label"
                    htmlFor="wifkeysPassphrase">{ translate('INDEX.PASSPHRASE') } / WIF</label>
                }
                { this.state.seedExtraSpaces &&
                  <i className="icon fa-warning seed-extra-spaces-warning"
                    data-tip={ translate('LOGIN.SEED_TRAILING_CHARS') }
                    data-html={ true }
                    data-for="sweepKeys"></i>
                }
                <ReactTooltip
                  id="sweepKeys"
                  effect="solid"
                  className="text-left" />
              </div>
              { !this.state.sweepPreflight &&
                <div className="col-sm-12 col-xs-12 text-align-center">
                  <button
                    type="button"
                    className="btn btn-primary waves-effect waves-light margin-bottom-5"
                    disabled={ this.state.processingPreflight }
                    onClick={ this.sweepKeysPreflight }>
                    { this.state.processingPreflight ? translate('SETTINGS.SWEEP_LOADING_BALANCE') : 'OK' }
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
        { this.state.sweepPreflight &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-30">
            <table>
              <tbody>
                <tr>
                  <td>
                    <strong>{ translate('INDEX.FROM') }</strong>
                  </td>
                  <td className="blur">
                    { this.state.sweepPreflight.from }
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>{ translate('INDEX.TO') }</strong>
                  </td>
                  <td className="blur">
                    { this.state.sweepPreflight.to }
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>{ translate('INDEX.AMOUNT') }</strong>
                  </td>
                  <td>
                    { this.state.sweepPreflight.balance }
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="padding-top-10 padding-bottom-10 fs-15">
              <strong className="color-warning">{ translate('SEND.WARNING') }:</strong> { translate('SETTINGS.SWEEP_WARNING') } { translate('SETTINGS.SWEEP_CONF') }
              <div className="margin-top-15">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={ this.state.processingTx }
                  onClick={ this.confirmSweep }>
                  { this.state.processingTx ? translate('SETTINGS.SWEEP_PROCESSING_TX') : translate('INDEX.CONFIRM') }
                </button>
                <button
                  type="button"
                  className="btn btn-primary margin-left-15"
                  disabled={ this.state.processingTx }
                  onClick={ this.cancelSweep }>
                  { translate('LOGIN.CANCEL') }
                </button>
              </div>
            </div>
          </div>
        }
        { this.state.sweepResult &&
          this.state.sweepResult.msg &&
          this.state.sweepResult.msg === 'success' &&
          this.state.sweepResult.result.txid &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-50">
            TXID: <span className="blur selectable word-break--all">{ this.state.sweepResult.result.txid }</span>
              <button
                className="btn btn-default btn-xs clipboard-edexaddr margin-left-10"
                title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                onClick={ () => this._copyString(this.state.sweepResult.result.txid, translate('SEND.TXID_COPIED')) }>
                <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
              </button>
              <div className="margin-top-20">
                <button
                  type="button"
                  className="btn btn-sm white btn-dark waves-effect waves-light pull-left"
                  onClick={ this.openExplorerWindow }>
                  <i className="icon fa-external-link"></i> { translate('INDEX.OPEN_TRANSACTION_IN_EPLORER', this.state.coin.split('|')[0]) }
                </button>
              </div>
          </div>
        }
        { this.state.sweepResult &&
          this.state.sweepResult.msg &&
          this.state.sweepResult.msg === 'error' &&
          <div className="padding-top-10">
            <div>
              <strong className="text-capitalize">{ translate('API.ERROR_SM') }</strong>
            </div>
            { this.state.sweepResult.result.toLowerCase().indexOf('decode error') === -1 &&
              <div>{ this.state.sweepResult.result }</div>
            }
            { this.state.sweepResult.raw &&
              this.state.sweepResult.raw.txid &&
              <div>{ this.state.sweepResult.raw.txid.replace(/\[.*\]/, '') }</div>
            }
            { this.state.sweepResult.raw &&
              this.state.sweepResult.raw.txid &&
              this.state.sweepResult.raw.txid.indexOf('bad-txns-inputs-spent') > -1 &&
              <div className="margin-top-10">
                { translate('SEND.BAD_TXN_SPENT_ERR1') }
                <ul>
                  <li>{ translate('SEND.BAD_TXN_SPENT_ERR2') }</li>
                  <li>{ translate('SEND.BAD_TXN_SPENT_ERR3') }</li>
                  <li>{ translate('SEND.BAD_TXN_SPENT_ERR4') }</li>
                </ul>
              </div>
            }
          </div>
        }
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
    },
    Settings: state.Settings,
    Main: state.Main,
    Dashboard: state.Dashboard,
  };
};

export default connect(mapStateToProps)(SweepKeysPanel);