import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import {
  dashboardChangeActiveCoin,
  getKMDAddressesNative,
  startInterval,
  stopInterval,
  triggerToaster,
  setJumblrAddress,
  importPrivkey,
  copyCoinAddress,
  copyString,
  resumeJumblr,
  pauseJumblr,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import Config from '../../../config';
import {
  JumblrRender,
  JumblrRenderSecretAddressList,
} from './jumblr.render';

import passphraseGenerator from 'agama-wallet-lib/src/crypto/passphrasegenerator';
import { seedToWif } from 'agama-wallet-lib/src/keys';
import btcNetworks from 'agama-wallet-lib/src/bitcoinjs-networks';

// TODO: promises, move to backend crypto libs

if (!window.jumblrPasshrase) { // gen jumblr passphrase
  window.jumblrPasshrase = `jumblr ${passphraseGenerator.generatePassPhrase(256)}`;
}

class Jumblr extends React.Component {
  constructor() {
    super();
    this.state = {
      activeTab: 0,
      randomSeed: window.jumblrPasshrase,
      jumblrDepositAddress: null,
      jumblrSecretAddressShow: true,
      jumblrSecretAddress: [],
      jumblrSecretAddressImport: [],
      jumblrSecretAddressCountImport: 0,
      jumblrSecretAddressShowImport: true,
      jumblrSecretAddressCount: 0,
      jumblrMode: 'public',
      secretAddressCount: 1,
      secretAddressCountImport: 1,
      jumblrPassphraseImport: '',
    };
    this.generateJumblrDepositAddress = this.generateJumblrDepositAddress.bind(this);
    this.generateJumblrSecretAddress = this.generateJumblrSecretAddress.bind(this);
    this.checkJumblrSecretAddressListLength = this.checkJumblrSecretAddressListLength.bind(this);
    this.returnPassphrase = this.returnPassphrase.bind(this);
    this.generateKeys = this.generateKeys.bind(this);
    this._copyCoinAddress = this._copyCoinAddress.bind(this);
    this.copyPassphrase = this.copyPassphrase.bind(this);
    this.checkPassphraseValid = this.checkPassphraseValid.bind(this);
    this.importJumblrSecretAddress = this.importJumblrSecretAddress.bind(this);
    this._pauseJumblr = this._pauseJumblr.bind(this);
    this._resumeJumblr = this._resumeJumblr.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  _pauseJumblr() {
    pauseJumblr(this.props.ActiveCoin.coin)
    .then((json) => {
      if (json.error &&
          json.error.code) {
        Store.dispatch(
          triggerToaster(
            json.error.message,
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      } else if (
        json.result &&
        json.result.result &&
        json.result.result === 'paused'
      ) {
        Store.dispatch(
          triggerToaster(
            translate('JUMBLR.JUMBLR_PAUSED'),
            'Jumblr',
            'success'
          )
        );
      }
    });
  }

  _resumeJumblr() {
    resumeJumblr(this.props.ActiveCoin.coin)
    .then((json) => {
      if (json.error &&
          json.error.code) {
        Store.dispatch(
          triggerToaster(
            json.error.message,
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      } else if (
        json.result &&
        json.result.result &&
        json.result.result === 'resumed'
      ) {
        Store.dispatch(
          triggerToaster(
            translate('JUMBLR.JUMBLR_RESUMED'),
            'Jumblr',
            'success'
          )
        );
      }
    });
  }

  generateKeys(passphrase) {
    const _keys = seedToWif(passphrase, btcNetworks.kmd, true);

    return {
      address: _keys.pub,
      wif: _keys.priv,
    };
  }

  _JumblrRenderSecretAddressList(type) {
    return JumblrRenderSecretAddressList.call(this, type);
  }

  onChange(e) {
    const regex = /^[0-9\b]+$/;

    if (e.target.value === '' ||
        regex.test(e.target.value)) {
      this.setState({
        [e.target.name]: e.target.value,
      });
    }
  }

  passphraseOnChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  returnPassphrase() {
    this.setState({
      randomSeed: window.jumblrPasshrase,
    });
  }

  toggle(prop) {
    const _prop = this.state[prop];

    this.setState({
      [prop]: !_prop,
    });
  }

  generateJumblrSecretAddress() {
    let _jumblrSecretAddress = [];
    let _apiSuccessCount = 0;

    if (this.state.secretAddressCount === '') {
      Store.dispatch(
        triggerToaster(
          translate('TOASTR.ENTER_CORRECT_ADDR_COUNT'),
          'Jumblr',
          'error'
        )
      );
    } else {
      for (let i = 0; i < this.state.secretAddressCount; i++) {
        let _postfix;

        if (i < 9) {
          _postfix = `00${i + 1}`;
        } else if (i > 10 && i < 100) {
          _postfix = `0${i + 1}`;
        }
        const _genKeys = this.generateKeys(`${this.state.randomSeed} ${_postfix}`);

        setJumblrAddress(
          this.props.ActiveCoin.coin,
          'secret',
          _genKeys.address
        )
        .then((json) => {
          if (json.error &&
              json.error.code) {
            Store.dispatch(
              triggerToaster(
                json.error.message,
                translate('TOASTR.ERROR'),
                'error'
              )
            );
          } else if (
            json.result &&
            json.result.result &&
            json.result.result === 'success'
          ) {
            _jumblrSecretAddress.push(_genKeys);
            this.setState(Object.assign({}, this.state, {
              jumblrSecretAddress: _jumblrSecretAddress,
            }));

            if (_apiSuccessCount === this.state.secretAddressCount - 1) {
              Store.dispatch(
                triggerToaster(
                  this.state.secretAddressCount > 1 ? translate('TOASTR.JUMBLR_SECRET_ADDRESSES_SET') : translate('TOASTR.JUMBLR_SECRET_ADDRESS_SET'),
                  'Jumblr',
                  'success'
                )
              );
            }
            _apiSuccessCount++;
          }
        });
      }
    }
  }

  checkPassphraseValid() { // test passphrase validity
    const _passphrase = this.state.jumblrPassphraseImport;
    const _jumblrPrefix = _passphrase.substring(0, 6);
    const _passphraseWords = _passphrase.substring(6, _passphrase.length);
    let _errors = {
      prefix: false, // jumblr
      length: false, // 24
    };

    if (_jumblrPrefix !== 'jumblr') {
      _errors.prefix = true;
    }

    try {
      const _passphraseWordsSplit = _passphraseWords.split(' ');
      let _correctWords = 0;

      if (_passphraseWordsSplit &&
          _passphraseWordsSplit.length) {
        for (let i = 0; i < _passphraseWordsSplit.length; i++) {
          if (_passphraseWordsSplit[i].length > 2) {
            _correctWords++;
          }
        }

        if (_correctWords !== _passphraseWordsSplit.length - 1 ||
            _correctWords !== 24) {
          _errors.length = true;
        }
      } else {
        _errors.length = true;
      }
    } catch(e) {
      _errors.length = true;
    }


    if (_errors.length ||
        _errors.prefix) {
      Store.dispatch(
        triggerToaster(
          translate('TOASTR.JUMBLR_WRONG_PASSPHRASE'),
          'Jumblr',
          'error',
          false
        )
      );

      return false;
    }

    return true;
  }

  importJumblrSecretAddress() {
    let _jumblrSecretAddress = [];
    let _apiSuccessCount = 0;

    if (this.state.secretAddressCountImport === '') {
      Store.dispatch(
        triggerToaster(
          translate('TOASTR.ENTER_CORRECT_ADDR_COUNT'),
          'Jumblr',
          'error'
        )
      );
    } else {
      if (this.checkPassphraseValid()) {
        for (let i = 0; i < this.state.secretAddressCountImport; i++) {
          let _postfix;

          if (i < 9) {
            _postfix = `00${i + 1}`;
          } else if (i > 10 && i < 100) {
            _postfix = `0${i + 1}`;
          }
          const _genKeys = this.generateKeys(`${this.state.jumblrPassphraseImport} ${_postfix}`);

          importPrivkey(this.props.ActiveCoin.coin, _genKeys.wif)
          .then((json) => {
            if (!json.id &&
                !json.result &&
                !json.error) {
              _jumblrSecretAddress.push(_genKeys);
              this.setState(Object.assign({}, this.state, {
                jumblrSecretAddressImport: _jumblrSecretAddress,
              }));

              if (_apiSuccessCount === this.state.secretAddressCountImport - 1) {
                Store.dispatch(
                  triggerToaster(
                    this.state.secretAddressCountImport > 1 ? translate('TOASTR.JUMBLR_SECRET_ADDRESSES_IMPORTED') : translate('TOASTR.JUMBLR_SECRET_ADDRESS_IMPORTED'),
                    'Jumblr',
                    'success'
                  )
                );
              }
              _apiSuccessCount++;
            } else {
              Store.dispatch(
                triggerToaster(
                  json.error.message,
                  translate('TOASTR.ERROR'),
                  'error'
                )
              );
            }
          });
        }
      }
    }
  }

  checkJumblrSecretAddressListLength(type) {
    if (type === 'gen') {
      if (this.state.jumblrSecretAddress &&
          this.state.jumblrSecretAddress.length) {
        return true;
      } else {
        return false;
      }
    } else {
      if (this.state.jumblrSecretAddressImport &&
          this.state.jumblrSecretAddressImport.length) {
        return true;
      } else {
        return false;
      }
    }
  }

  generateJumblrDepositAddress() {
    const _genKeys = this.generateKeys(this.state.randomSeed);;

    importPrivkey(this.props.ActiveCoin.coin, _genKeys.wif)
    .then((json) => {
      if (!json.id &&
          !json.result &&
          !json.error) {
        setJumblrAddress(
          this.props.ActiveCoin.coin,
          'deposit',
          _genKeys.address
        )
        .then((json) => {
          if (json.error &&
              json.error.code) {
            Store.dispatch(
              triggerToaster(
                json.error.message,
                translate('TOASTR.ERROR'),
                'error'
              )
            );
          } else if (
            json.result &&
            (json.result.result === 0 || json.result.result === null)
          ) {
            this.setState(Object.assign({}, this.state, {
              jumblrDepositAddress: {
                address: _genKeys.address,
                wif: _genKeys.wif,
              },
            }));
            Store.dispatch(
              triggerToaster(
                `${translate('TOASTR.JUMBLR_DEPOSIT_ADDRESS_SET')} ${translate('JUMBLR.TO_SM')} ${_genKeys.address}`,
                'Jumblr',
                'success',
                false
              )
            );
          }
        });
      } else {
        Store.dispatch(
          triggerToaster(
            json.error.message,
            translate('TOASTR.ERROR'),
            'error'
          )
        );
      }
    });
  }

  switchJumblrMode(mode) {
    this.setState(Object.assign({}, this.state, {
      jumblrMode: mode,
      activeTab: 0,
    }));
  }

  openTab(tab) {
    this.setState(Object.assign({}, this.state, {
      activeTab: tab,
    }));
  }

  _copyCoinAddress(address) {
    Store.dispatch(copyCoinAddress(address));
  }

  copyPassphrase() {
    Store.dispatch(copyString(this.state.randomSeed, translate('JUMBLR.PASSPHRASE_COPIED')));
  }

  renderLB(_translationID) {
    const _translationComponents = translate(_translationID).split('<br>');

    return _translationComponents.map((_translation) =>
      <span key={ `jumblr-label-${Math.random(0, 9) * 10}` }>
        {_translation}
        <br />
      </span>
    );
  }

  render() {
    return JumblrRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      coin: state.ActiveCoin.coin,
    },
  };
};

export default connect(mapStateToProps)(Jumblr);