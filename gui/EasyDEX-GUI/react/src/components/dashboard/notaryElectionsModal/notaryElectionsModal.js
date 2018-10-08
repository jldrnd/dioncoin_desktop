import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import {
  toggleNotaryElectionsModal,
  apiElectionsSend,
  apiElectionsSendMany,
  apiElectionsLogout,
  apiElectionsLogin,
  apiElectionsStatus,
  triggerToaster,
  apiElectionsBalance,
  apiElectionsTransactions,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import mainWindow from '../../../util/mainWindow';
import Spinner from '../spinner/spinner';
import ReactTooltip from 'react-tooltip';

import { secondsToString } from 'agama-wallet-lib/src/time';
import {
  isPositiveNumber,
  toSats,
} from 'agama-wallet-lib/src/utils';

const SEED_TRIM_TIMEOUT = 5000;
const ELECTIONS_SYNC_UPDATE_INTERVAL = 120000; // every 2 min

class NotaryElectionsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loginPassphrase: '',
      seedExtraSpaces: false,
      seedInputVisibility: false,
      userType: 'voter',
      region: null,
      trimPassphraseTimer: null,
      isAuth: false,
      balance: 0,
      transactions: null,
      coin: mainWindow.nnVoteChain,
      pub: null,
      amount: 0,
      address: '',
      voteType: 'multi',
      multiOutAddress1: '',
      multiOutAddress2: '',
      multiOutAddress3: '',
      multiOutAddress4: '',
      className: 'hide',
      open: false,
    };
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.closeModal = this.closeModal.bind(this);
    this.toggleSeedInputVisibility = this.toggleSeedInputVisibility.bind(this);
    this.resizeLoginTextarea = this.resizeLoginTextarea.bind(this);
    this.updateLoginPassPhraseInput = this.updateLoginPassPhraseInput.bind(this);
    this.setUserType = this.setUserType.bind(this);
    this.setVoteType = this.setVoteType.bind(this);
    this.setRegion = this.setRegion.bind(this);
    this.loginSeed = this.loginSeed.bind(this);
    this.logout = this.logout.bind(this);
    this.sync = this.sync.bind(this);
    this.send = this.send.bind(this);
    this.sendMulti = this.sendMulti.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.sendValidate = this.sendValidate.bind(this);
    this.verifyMultiSendForm = this.verifyMultiSendForm.bind(this);
    this.electionsDataInterval = null;
  }

  sendValidate() {
    let valid = true;

    const _amount = this.state.amount;
    const _balance = this.state.balance;
    const _fee = 0.0001;

    if (Number(_amount) + _fee > _balance) {
      Store.dispatch(
        triggerToaster(
          `${translate('SEND.INSUFFICIENT_FUNDS')} ${translate('SEND.MAX_AVAIL_BALANCE')} ${Number(_balance - _fee)} ${this.state.coin}`,
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
      valid = false;
    } else if (Number(_amount) < _fee) {
      Store.dispatch(
        triggerToaster(
          `${translate('SEND.AMOUNT_IS_TOO_SMALL', this.state.amount)}, ${translate('SEND.MIN_AMOUNT_IS', this.state.coin)} ${_fee}`,
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
      valid = false;
    }

    if (!this.state.address ||
        this.state.address.length < 34) {
      Store.dispatch(
        triggerToaster(
          translate('NN_ELECTIONS.WRONG_ADDR_FORMAT'),
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
      valid = false;
    }

    if (!isPositiveNumber(this.state.amount)) {
      Store.dispatch(
        triggerToaster(
          translate('SEND.AMOUNT_POSITIVE_NUMBER'),
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
      valid = false;
    }

    return valid;
  }

  sendMulti() {
    const _divisor = 4;
    let _addressValidateMsg = [];

    for (let i = 0; i < 4; i++) {
      const _validateAddress = mainWindow.addressVersionCheck(this.state.coin, this.state[`multiOutAddress${i + 1}`]);

      if (!_validateAddress ||
          _validateAddress === 'Invalid pub address') {
        _addressValidateMsg.push(this.state[`multiOutAddress${i + 1}`]);
      }
    }

    if (_addressValidateMsg.length) {
      Store.dispatch(
        triggerToaster(
          `${translate('NN_ELECTIONS.ADDRESSES')} ${_addressValidateMsg.join(', ')} ${translate('NN_ELECTIONS.IS_ARE_INVALID')}`,
          translate('NN_ELECTIONS.NN_ELECTIONS_2018'),
          'error',
          false
        )
      );
    } else {
      apiElectionsSendMany(
        this.state.coin,
        [{
          address: this.state.multiOutAddress1,
          value: parseInt(toSats(this.state.balance / _divisor)) - 10000,
        }, {
          address: this.state.multiOutAddress2,
          value: parseInt(toSats(this.state.balance / _divisor)) - 10000,
        }, {
          address: this.state.multiOutAddress3,
          value: parseInt(toSats(this.state.balance / _divisor)) - 10000,
        }, {
          address: this.state.multiOutAddress4,
          value: parseInt(toSats(this.state.balance / _divisor)) - 10000,
        }],
        this.state.pub,
        ['ne2k18-na-1-eu-2-ae-3-sh-4']
      )
      .then((res) => {
        if (res.msg === 'success') {
          Store.dispatch(
            triggerToaster(
              translate('NN_ELECTIONS.YOU_SUCCESFULLY_VOTED'),
              translate('NN_ELECTIONS.NN_ELECTIONS_2018'),
              'success',
              false
            )
          );
          let _transactions = this.state.transactions;
          _transactions.unshift({
            address: this.state.multiOutAddress1,
            amount: this.state.balance / _divisor,
            region: 'ne2k18-na',
            timestamp: Math.floor(Date.now() / 1000),
          }, {
            address: this.state.multiOutAddress2,
            amount: this.state.balance / _divisor,
            region: 'ne2k18-eu',
            timestamp: Math.floor(Date.now() / 1000),
          }, {
            address: this.state.multiOutAddress3,
            amount: this.state.balance / _divisor,
            region: 'ne2k18-ae',
            timestamp: Math.floor(Date.now() / 1000),
          }, {
            address: this.state.multiOutAddress4,
            amount: this.state.balance / _divisor,
            region: 'ne2k18-sh',
            timestamp: Math.floor(Date.now() / 1000),
          });
          this.setState({
            transactions: _transactions,
            balance: 0,
          });
        } else {
          Store.dispatch(
            triggerToaster(
              res.result.txid || res.result,
              translate('NN_ELECTIONS.NN_ELECTIONS_2018'),
              'error'
            )
          );
        }
      });
    }
  }

  send() {
    const _validateAddress = mainWindow.addressVersionCheck(this.state.coin, this.state.address);

    if (!_validateAddress ||
        _validateAddress === 'Invalid pub address') {
      _addressValidateMsg.push(this.state[`multiOutAddress${i + 1}`]);
      Store.dispatch(
        triggerToaster(
          `translate('NN_ELECTIONS.ADDRESS') ${this.state.address} ${translate('NN_ELECTIONS.IS_INVALID')}`,
          translate('NN_ELECTIONS.NN_ELECTIONS_2018'),
          'error',
          false
        )
      );
    } else {
      if (this.sendValidate()) {
        apiElectionsSend(
          this.state.coin,
          toSats(this.state.amount) - 10000,
          this.state.address,
          this.state.pub,
          'ne2k18-' + this.state.region,
        )
        .then((res) => {
          if (res.msg === 'success') {
            Store.dispatch(
              triggerToaster(
                `${translate('NN_ELECTIONS.YOU_SUCCESFULLY_VOTED')} ${this.state.amount} ${translate('NN_ELECTIONS.FOR')} ${this.state.address}`,
                translate('NN_ELECTIONS.NN_ELECTIONS_2018'),
                'success',
                false
              )
            );
            let _transactions = this.state.transactions;
            _transactions.unshift({
              address: this.state.address,
              amount: this.state.amount - 0.0001,
              region: 'ne2k18-' + this.state.region,
              timestamp: Math.floor(Date.now() / 1000),
            });
            this.setState({
              transactions: _transactions,
              balance: this.state.balance - this.state.amount - 0.0001,
            });
          } else {
            Store.dispatch(
              triggerToaster(
                res.result.txid || res.result,
                translate('NN_ELECTIONS.NN_ELECTIONS_2018'),
                'error'
              )
            );
          }
        });
      }
    }
  }

  sync() {
    apiElectionsStatus()
    .then((res) => {
      if (res.result !== 'unauth') {
        apiElectionsBalance(this.state.coin, res.result)
        .then((res) => {
          if (res.msg === 'success') {
            this.setState({
              balance: res.result.balance,
            });
          }
        });

        apiElectionsTransactions(
          this.state.coin,
          res.result,
          this.state.userType
        )
        .then((res) => {
          this.setState({
            transactions: res.result,
          });
        });

        this.setState({
          isAuth: true,
          pub: res.result,
        });
      }
    });
  }

  componentWillReceiveProps(props) {
    if (props.Main &&
        props.Main.displayNotaryElectionsModal !== this.state.open) {
      this.setState({
        className: props.Main.displayNotaryElectionsModal ? 'show fade' : 'show out',
      });

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          open: props.Main.displayNotaryElectionsModal,
          className: props.Main.displayNotaryElectionsModal ? 'show in' : 'hide',
        }));
      }, props.Main.displayNotaryElectionsModal ? 50 : 300);
    }

    if (props &&
        props.Main &&
        props.Main.displayNotaryElectionsModal &&
        !this.electionsDataInterval) {
      this.sync();
      this.electionsDataInterval = setInterval(() => {
        this.sync();
      }, ELECTIONS_SYNC_UPDATE_INTERVAL);
    } else {
      clearInterval(this.electionsDataInterval);
      this.electionsDataInterval = null;
    }
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleKeydown(e) {
    this.updateLoginPassPhraseInput(e);

    if (e.key === 'Enter') {
      this.loginSeed();
    }
  }

  setRegion(region) {
    this.setState({
      region,
    });
  }

  setUserType(type) {
    this.setState({
      userType: type,
    });
  }

  setVoteType(type) {
    this.setState({
      voteType: type,
    });
  }

  toggleSeedInputVisibility() {
    this.setState({
      seedInputVisibility: !this.state.seedInputVisibility,
    });

    this.resizeLoginTextarea();
  }

  resizeLoginTextarea() {
    // auto-size textarea
    setTimeout(() => {
      if (this.state.seedInputVisibility) {
        document.querySelector('#loginPassphrase').style.height = '1px';
        document.querySelector('#loginPassphrase').style.height = `${(15 + document.querySelector('#loginPassphrase').scrollHeight)}px`;
      }
    }, 100);
  }

  updateLoginPassPhraseInput(e) {
    // remove any empty chars from the start/end of the string
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

    this.resizeLoginTextarea();

    this.setState({
      trimPassphraseTimer: _trimPassphraseTimer,
      [e.target.name === 'loginPassphraseTextarea' ? 'loginPassphrase' : e.target.name]: newValue,
    });
  }

  loginSeed() {
    apiElectionsLogin(this.state.loginPassphrase, this.state.coin)
    .then((res) => {
      if (res.msg === 'success') {
        this.setState({
          isAuth: true,
          pub: res.result,
        });
        this.sync();
      } else {
        Store.dispatch(
          triggerToaster(
            translate('API.authError') + ' (code: loginSeed)',
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      }
    });

    this.setState({
      loginPassphrase: '',
      loginPassPhraseSeedType: null,
    });

    // reset login input vals
    this.refs.loginPassphrase.value = '';
    this.refs.loginPassphraseTextarea.value = '';
  }

  logout() {
    apiElectionsLogout()
    .then((res) => {
      this.setState(this.defaultState);
    });
  }

  closeModal() {
    clearInterval(this.electionsDataInterval);
    this.electionsDataInterval = null;
    Store.dispatch(toggleNotaryElectionsModal(false));
  }

  displayTxHistoryRender() {
    if (this.state.transactions &&
        this.state.transactions.length) {
      return true;
    }
  }

  verifyMultiSendForm() {
    if (!this.state.multiOutAddress1 ||
        !this.state.multiOutAddress1.length ||
        !this.state.multiOutAddress2 ||
        !this.state.multiOutAddress2.length ||
        !this.state.multiOutAddress3 ||
        !this.state.multiOutAddress3.length ||
        !this.state.multiOutAddress4 ||
        !this.state.multiOutAddress4.length) {
      return false;
    } else {
      return true;
    }
  }

  renderHistoryRegion(region) {
    let _region;

    switch (region) {
      case 'ne2k18-sh':
        _region = 'SH';
        break;
      case 'ne2k18-na':
        _region = 'NA';
        break;
      case 'ne2k18-ae':
        _region = 'AE';
        break;
      case 'ne2k18-eu':
        _region = 'EU';
        break;
    }

    return _region;
  }

  renderHistory() {
    const _history = this.state.transactions;
    let _items = [];

    for (let i = 0; i < _history.length; i++) {
      _items.push(
        <tr key={ `notary-elections-history-${i}` }>
          <td>{ _history[i].address }</td>
          <td>{ _history[i].amount === 'unknown' ? 'unknown' : Number(_history[i].amount) }</td>
          <td>{ secondsToString(_history[i].timestamp) }</td>
          <td>{ this.renderHistoryRegion(_history[i].region) }</td>
        </tr>
      );
    }

    return (
      <table className="table table-hover dataTable table-striped">
        <thead>
          <tr>
            <th>{ this.state.userType === 'voter' ? transform('NN_ELECTIONS.TO') : transform('NN_ELECTIONS.FROM') }</th>
            <th>{ translate('INDEX.AMOUNT') }</th>
            <th>{ translate('NN_ELECTIONS.TIME') }</th>
            <th>{ translate('NN_ELECTIONS.REGION') }</th>
          </tr>
        </thead>
        <tbody>
        { _items }
        </tbody>
        <tfoot>
          <tr>
            <th>{ this.state.userType === 'voter' ? translate('INDEX.TO') : translate('INDEX.FROM') }</th>
            <th>{ translate('INDEX.AMOUNT') }</th>
            <th>{ translate('NN_ELECTIONS.TIME') }</th>
            <th>{ translate('NN_ELECTIONS.REGION') }</th>
          </tr>
        </tfoot>
      </table>
    );
  }

  render() {
    return (
      <div>
        <div className={ `modal modal-3d-sign notary-elections-modal ${this.state.className}` }>
          <div
            onClick={ this.closeModal }
            className="modal-close-overlay"></div>
          <div className="modal-dialog modal-center modal-lg">
            <div
              onClick={ this.closeModal }
              className="modal-close-overlay"></div>
            <div className="modal-content">
              <div className="modal-header bg-orange-a400 wallet-send-header">
                <button
                  type="button"
                  className="close white"
                  onClick={ this.closeModal }>
                  <span>×</span>
                </button>
                <h4 className="modal-title white text-left">{ translate('NN_ELECTIONS.NN_ELECTIONS_2018') }</h4>
              </div>
              <div className="modal-body modal-body-container">
                <div className="modal-resizable">
                  <div className="elections-title-bar padding-top-10 padding-bottom-10">
                    <img src="assets/images/native/kmd_header_title_logo.png" />
                    <div className="elections-title">{ translate('NN_ELECTIONS.NN_ELECTIONS_2018') }</div>
                  </div>
                  { this.state.isAuth &&
                    <button
                      onClick={ this.logout }
                      className="btn btn-md btn-info btn-block ladda-button elections-logout-btn">
                      <i className="fa fa-power-off margin-right-5"></i>{ translate('NN_ELECTIONS.LOGOUT') }
                    </button>
                  }
                  {/*<div className="elections-user-type">
                    <a
                      className={ this.state.userType === 'voter' ? 'active' : '' }
                      onClick={ () => this.setUserType('voter') }><i className="fa fa-file margin-right-10"></i>I'm a voter</a>
                    <span className="margin-left-30 margin-right-30">|</span>
                    <a
                      className={ this.state.userType === 'candidate' ? 'active' : '' }
                      onClick={ () => this.setUserType('candidate') }><i className="fa fa-user-o margin-right-10"></i>I'm a candidate</a>
                  </div>*/}
                  { !this.state.isAuth &&
                    <div className="elections-login padding-bottom-15">
                      <label
                        className="floating-label"
                        htmlFor="inputPassword">{  this.state.userType === 'voter' ? translate('INDEX.WALLET_SEED') : translate('INDEX.PUB_KEY') }</label>
                      <input
                        type="password"
                        name="loginPassphrase"
                        ref="loginPassphrase"
                        className={ !this.state.seedInputVisibility ? 'form-control' : 'hide' }
                        onChange={ this.updateLoginPassPhraseInput }
                        onKeyDown={ (event) => this.handleKeydown(event) }
                        autoComplete="off"
                        value={ this.state.loginPassphrase || '' } />
                      <textarea
                        className={ this.state.seedInputVisibility ? 'form-control' : 'hide' }
                        id="loginPassphrase"
                        ref="loginPassphraseTextarea"
                        name="loginPassphraseTextarea"
                        autoComplete="off"
                        onChange={ this.updateLoginPassPhraseInput }
                        onKeyDown={ (event) => this.handleKeydown(event) }
                        value={ this.state.loginPassphrase || '' }></textarea>
                      <i
                        className={ 'seed-toggle fa fa-eye' + (!this.state.seedInputVisibility ? '-slash' : '') }
                        onClick={ this.toggleSeedInputVisibility }></i>
                      { this.state.seedExtraSpaces &&
                        this.state.userType === 'voter' &&
                        <i
                          className="icon fa-warning seed-extra-spaces-warning"
                          data-tip={ translate('LOGIN.SEED_TRAILING_CHARS') }
                          data-html={ true }
                          data-for="notary"></i>
                      }
                      <ReactTooltip
                        id="notary"
                        effect="solid"
                        className="text-left" />
                      <button
                        onClick={ this.loginSeed }
                        disabled={
                          !this.state.loginPassphrase ||
                          !this.state.loginPassphrase.length
                        }
                        className="btn btn-md btn-primary btn-block ladda-button elections-login-btn">
                        { translate('NN_ELECTIONS.LOGIN') }
                      </button>
                    </div>
                  }
                  { this.state.isAuth &&
                    !this.state.transactions &&
                    !this.state.balance &&
                    <Spinner />
                  }
                  { this.state.isAuth &&
                    this.state.userType === 'voter' &&
                    <div className="elections-voter-ui">
                      <div className={ 'elections-map' + (this.state.voteType === 'multi' ? ' disable' : '') }>
                        <img src="assets/images/world-map.png" />
                        <div className={ 'elections-map-node elections-map-node--na' + (this.state.region === 'na' ? ' active' : '') }>
                          <label className="notary-elections-node-title">NA</label>
                          <img
                            onClick={ () => this.setRegion('na') }
                            src="assets/images/cryptologo/kmd.png" />
                        </div>
                        <div className={ 'elections-map-node elections-map-node--sh' + (this.state.region === 'sh' ? ' active' : '') }>
                          <label className="notary-elections-node-title">SH</label>
                          <img
                            onClick={ () => this.setRegion('sh') }
                            src="assets/images/cryptologo/kmd.png" />
                        </div>
                        <div className={ 'elections-map-node elections-map-node--ae' + (this.state.region === 'ae' ? ' active' : '') }>
                          <label className="notary-elections-node-title">AE</label>
                          <img
                            onClick={ () => this.setRegion('ae') }
                            src="assets/images/cryptologo/kmd.png" />
                        </div>
                        <div className={ 'elections-map-node elections-map-node--eu' + (this.state.region === 'eu' ? ' active' : '') }>
                          <label className="notary-elections-node-title">EU</label>
                          <img
                            onClick={ () => this.setRegion('eu') }
                            src="assets/images/cryptologo/kmd.png" />
                        </div>
                      </div>
                    </div>
                  }
                  { this.state.isAuth &&
                    <div className={ 'elections-balance' + (this.state.userType === 'candidate' ? ' margin-top-25' : '') }>
                      { translate('INDEX.YOU_HAVE') } <strong>{ this.state.balance }</strong> VOTE
                    </div>
                  }
                  { this.state.isAuth &&
                    this.state.userType === 'voter' &&
                    this.state.balance > 0 &&
                    <div className={ 'elections-user-type' + (this.state.voteType === 'single' ? ' margin-bottom-30' : '') }>
                      <a
                        className={ this.state.voteType === 'multi' ? 'active' : '' }
                        onClick={ () => this.setVoteType('multi') }><i className="fa fa-users margin-right-10"></i>{ translate('INDEX.4WAY_VOTE') }</a>
                      <span className="margin-left-30 margin-right-30">|</span>
                      <a
                        className={ this.state.voteType === 'single' ? 'active' : '' }
                        onClick={ () => this.setVoteType('single') }><i className="fa fa-user margin-right-10"></i>{ translate('INDEX.1WAY_VOTE') }</a>
                    </div>
                  }
                  { this.state.isAuth &&
                    this.state.userType === 'voter' &&
                    this.state.voteType === 'single' &&
                    this.state.balance > 0 &&
                    <div className="elections-send elections-send--single margin-top-10">
                      <input
                        type="text"
                        className="form-control block margin-bottom-10"
                        name="address"
                        value={ this.state.address !== 0 ? this.state.address : '' }
                        onChange={ this.updateInput }
                        placeholder={ translate('INDEX.ENTER_AN_ADDR') }
                        autoComplete="off" />
                      <input
                        type="text"
                        className="form-control inline"
                        name="amount"
                        value={ this.state.amount !== 0 ? this.state.amount : '' }
                        onChange={ this.updateInput }
                        placeholder={ translate('INDEX.ENTER_AN_AMOUNT') }
                        autoComplete="off" />
                      <button
                        onClick={ this.send }
                        disabled={
                          !this.state.amount ||
                          !this.state.address ||
                          !this.state.address.length
                        }
                        className="btn btn-md btn-primary btn-block ladda-button elections-login-btn">
                        { translate('INDEX.VOTE') }
                      </button>
                    </div>
                  }
                  { this.state.isAuth &&
                    this.state.userType === 'voter' &&
                    this.state.voteType === 'multi' &&
                    this.state.balance > 0 &&
                    <div className="elections-send margin-top-50">
                      <div className="margin-bottom-30">{ translate('INDEX.25_PERC_SPLIT') }</div>
                      <div>
                        <label>NA</label>
                        <input
                          type="text"
                          className="form-control margin-left-15 margin-bottom-10"
                          name="multiOutAddress1"
                          value={ this.state.multiOutAddress1 !== 0 ? this.state.multiOutAddress1 : '' }
                          onChange={ this.updateInput }
                          placeholder={ translate('INDEX.ENTER_AN_ADDR_NA') }
                          autoComplete="off" />
                        <span className="margin-left-25">{ this.state.balance / 4 } VOTE</span>
                      </div>
                      <div className="margin-top-10">
                        <label>EU</label>
                        <input
                          type="text"
                          className="form-control margin-left-15 margin-bottom-10"
                          name="multiOutAddress2"
                          value={ this.state.multiOutAddress2 !== 0 ? this.state.multiOutAddress2 : '' }
                          onChange={ this.updateInput }
                          placeholder={ translate('INDEX.ENTER_AN_ADDR_EU') }
                          autoComplete="off" />
                        <span className="margin-left-25">{ this.state.balance / 4 } VOTE</span>
                      </div>
                      <div className="margin-top-10">
                        <label>AE</label>
                        <input
                          type="text"
                          className="form-control margin-left-15 margin-bottom-10"
                          name="multiOutAddress3"
                          value={ this.state.multiOutAddress3 !== 0 ? this.state.multiOutAddress3 : '' }
                          onChange={ this.updateInput }
                          placeholder={ translate('INDEX.ENTER_AN_ADDR_AE') }
                          autoComplete="off" />
                        <span className="margin-left-25">{ this.state.balance / 4 } VOTE</span>
                      </div>
                      <div className="margin-top-10">
                        <label>SH</label>
                        <input
                          type="text"
                          className="form-control margin-left-15 margin-bottom-10"
                          name="multiOutAddress4"
                          value={ this.state.multiOutAddress4 !== 0 ? this.state.multiOutAddress4 : '' }
                          onChange={ this.updateInput }
                          placeholder={ translate('INDEX.ENTER_AN_ADDR_SH') }
                          autoComplete="off" />
                        <span className="margin-left-25">{ this.state.balance / 4 } VOTE</span>
                      </div>
                      <button
                        onClick={ this.sendMulti }
                        disabled={ !this.verifyMultiSendForm() }
                        className="btn btn-md btn-primary btn-block ladda-button elections-login-btn margin-top-20">
                        { translate('INDEX.VOTE') }
                      </button>
                    </div>
                  }
                  { this.displayTxHistoryRender() &&
                    <div>
                      <div className={ `elections-history`  + (this.state.userType === 'voter' ? ' margin-top-20' : '') }>
                      { translate('INDEX.HISTORY') }
                      </div>
                      { this.renderHistory() }
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={ `modal-backdrop ${this.state.className}` } ></div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(NotaryElectionsModal);