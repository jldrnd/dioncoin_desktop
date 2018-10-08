import React from 'react';
import translate from '../../translate/translate';
import LoginSettingsModal from '../dashboard/loginSettingsModal/loginSettingsModal';
import ZcparamsFetchModal from '../dashboard/zcparamsFetchModal/zcparamsFetchModal';
import QRModal from '../dashboard/qrModal/qrModal';
import Select from 'react-select';
import ReactTooltip from 'react-tooltip';
import mainWindow from '../../util/mainWindow';

const LoginRender = function() {
  return (
    <div>
      <ZcparamsFetchModal />
      <LoginSettingsModal section={ this.state.displayLoginSettingsDropdownSection } />
      { this.renderSwallModal() }
      <div className="page animsition vertical-align text-center fade-in">
        <div className="page-content vertical-align-middle col-xs-12 col-sm-6 col-sm-offset-3">
          <div className="brand">
            <img
              className="brand-img"
              src="assets/images/agama-login-logo.svg"
              width="200"
              height="160"
              alt="SuperNET Agama" />
          </div>
          <div className="login-settings-dropdown margin-bottom-30">
            <div>
              <span
                className="login-settings-dropdown-trigger"
                onClick={ this.toggleLoginSettingsDropdown }>
                <i className="icon fa-cogs"></i>&nbsp;
                <span className="login-settings-dropdown-label">{ translate('LOGIN.QUICK_ACCESS') }</span>
              </span>
            </div>
            { this.state.displayLoginSettingsDropdown &&
              <div>
                <ul className="dropdown-menu show">
                  <li>
                    <a onClick={ () => this.toggleLoginSettingsDropdownSection('settings') }>
                      <i className="icon md-settings"></i> { translate('INDEX.SETTINGS') }
                    </a>
                  </li>
                  <li>
                    <a onClick={ () => this.toggleLoginSettingsDropdownSection('about') }>
                      <i className="icon fa-users"></i> { translate('ABOUT.ABOUT_AGAMA') }
                    </a>
                  </li>
                  { this.renderResetSPVCoinsOption() &&
                    <li>
                      <a onClick={ this.resetSPVCoins }>
                        <i className="icon fa-trash"></i> { translate('LOGIN.QMENU_REMOVE_SPV') }
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </div>

          <div className={ this.state.activeLoginSection === 'login' ? 'show' : 'hide' }>
            <h4 className="color-white">
              { translate('INDEX.WELCOME_LOGIN') }
            </h4>
            { this.props.Login.pinList.length > 0 &&
              <div className="margin-top-25 margin-bottom-70">{ translate('LOGIN.PIN_LOGIN_INFO') }</div>
            }
            { this.props.Login.pinList.length > 0 &&
              <div className="pin-login-block">
                <div className="form-group form-material col-sm-8 horizontal-padding-0 margin-top-40 margin-bottom-80">
                  <select
                    className="form-control form-material"
                    name="selectedPin"
                    id="selectedPin"
                    ref="selectedPin"
                    value={ this.state.selectedPin }
                    onChange={ (event) => this.updateSelectedPin(event) }
                    autoFocus>
                    <option
                      className="login-option"
                      value="">
                      { translate('INDEX.SELECT_PIN_NAME') }
                    </option>
                    { this.renderPinsList() }
                  </select>
                  <label
                    className="floating-label margin-bottom-20"
                    htmlFor="selectedPin">
                    { translate('LOGIN.PIN_PW_ACCESS') }
                  </label>
                </div>
                <div className="form-group form-material col-sm-4 padding-left-10 margin-top-40 margin-bottom-80">
                  <input
                    type="password"
                    className="form-control"
                    name="decryptKey"
                    ref="decryptKey"
                    placeholder={ translate('LOGIN.DECRYPT_KEY') }
                    onChange={ this.updateInput }
                    onKeyDown={ (event) => this.handleKeydown(event) }
                    value={ this.state.decryptKey } />
                </div>
              </div>
            }
            <div className="form-group form-material floating col-sm-12 horizontal-padding-0">
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
              <label
                className="floating-label"
                htmlFor="inputPassword">
                { translate('INDEX.WALLET_SEED') }
              </label>
              <div className="qr-modal-login-block">
                <QRModal
                  mode="scan"
                  setRecieverFromScan={ this.setRecieverFromScan } />
              </div>
            </div>
            { this.state.loginPassPhraseSeedType &&
              <div
                className={ 'form-group form-material floating horizontal-padding-0 seed-type-block ' + (this.props.Login.pinList.length > 0 ? 'margin-top-130' : 'margin-top-20') }
                style={{ width: `${this.state.loginPassPhraseSeedType.length * 8}px` }}>
                <div className="placeholder-label">{ this.state.loginPassPhraseSeedType }</div>
              </div>
            }
            { this.state.seedExtraSpaces &&
              <i className="icon fa-warning seed-extra-spaces-warning"
                data-tip={ translate('LOGIN.SEED_TRAILING_CHARS') }
                data-html={ true }
                data-for="login1"></i>
            }
            <ReactTooltip
              id="login1"
              effect="solid"
              className="text-left" />
            <button
              type="button"
              className="btn btn-primary btn-block margin-top-20"
              onClick={ this.loginSeed }
              disabled={
                (this.props.Login.pinList.length === 0 && (!this.state.loginPassphrase || !this.state.loginPassphrase.length)) ||
                (this.props.Login.pinList.length > 0 && (!this.state.selectedPin || !this.state.decryptKey) && !this.state.loginPassphrase)
              }>
              { translate('INDEX.SIGN_IN') }
            </button>
            <div className="form-group form-material floating">
              <button
                className="btn btn-lg btn-flat btn-block waves-effect"
                id="register-btn"
                onClick={ () => this.updateActiveLoginSection('signup') }>
                { translate('INDEX.CREATE_WALLET') }
              </button>
              <button
                className="btn btn-lg btn-flat btn-block waves-effect hide"
                id="logint-another-wallet">
                { translate('INDEX.LOGIN_ANOTHER_WALLET') }
              </button>
              <button
                className="btn btn-lg btn-flat btn-block waves-effect margin-top-20"
                id="register-btn"
                onClick={ this.toggleActivateCoinForm }
                disabled={ !this.props.Main }>
                <span className="ladda-label">
                  { translate('ADD_COIN.ADD_ANOTHER_COIN') }
                </span>
              </button>
            </div>
          </div>

          { this.state.activeLoginSection === 'activateCoin' &&
            <div className="show">
              <h4 className="color-white">
                { translate('INDEX.WELCOME_PLEASE_ADD') }
              </h4>
              <div className="form-group form-material floating width-540 vertical-margin-30 auto-side-margin">
                <button
                  className="btn btn-lg btn-primary btn-block ladda-button"
                  onClick={ this.toggleActivateCoinForm }
                  disabled={ !this.props.Main }>
                  <span className="ladda-label">
                    { translate('INDEX.ACTIVATE_COIN') }
                  </span>
                </button>
                <div className="line">{ translate('LOGIN.OR_USE_A_SHORTCUT') }</div>
                { mainWindow.arch === 'x64' &&
                  <div className="addcoin-shortcut">
                    <div>
                      <i className="icon fa-cube margin-right-5"></i>
                      { translate('INDEX.NATIVE_MODE') }
                      <i
                        className="icon fa-question-circle login-help"
                        data-tip={
                          `<strong>${ translate('LOGIN.NATIVE_MODE_DESC_P1') }</strong> ` +
                          `<u>${ translate('LOGIN.NATIVE_MODE_DESC_P2') }</u> ` +
                          translate('LOGIN.NATIVE_MODE_DESC_P3') +
                          '<br/>' +
                          translate('LOGIN.NATIVE_MODE_DESC_P4') +
                          ` <strong>${ translate('LOGIN.NATIVE_MODE_DESC_P5') }</strong> ` +
                          translate('LOGIN.NATIVE_MODE_DESC_P6') +
                          '<br/>' +
                          translate('LOGIN.NATIVE_MODE_DESC_P7') +
                          ` <u>${ translate('LOGIN.NATIVE_MODE_DESC_P8') }</u> ` +
                          translate('LOGIN.NATIVE_MODE_DESC_P9')
                        }
                        data-html={ true }
                        data-for="login2"></i>
                      <ReactTooltip
                        id="login2"
                        effect="solid"
                        className="text-left" />
                    </div>
                    <Select
                      name="selectedShortcutNative"
                      value={ this.state.selectedShortcutNative }
                      onChange={ (event) => this.updateSelectedShortcut(event, 'native') }
                      optionRenderer={ this.renderShortcutOption }
                      valueRenderer={ this.renderShortcutOption }
                      options={[
                        {
                          value: 'kmd',
                          label: 'kmd',
                        },
                        {
                          value: 'bntn',
                          label: 'bntn',
                        },
                        {
                          value: 'mnz',
                          label: 'mnz',
                        },
                        {
                          value: 'btch',
                          label: 'btch',
                        },
                        {
                          value: 'revs',
                          label: 'revs',
                        },
                        {
                          value: 'jumblr',
                          label: 'jumblr',
                        },
                        {
                          value: 'kmd+revs+jumblr',
                          label: 'kmd+revs+jumblr',
                        },
                      ]} />
                  </div>
                }
                <div className="addcoin-shortcut">
                  <div>
                    <i className="icon fa-flash margin-right-5"></i>
                    { translate('INDEX.SPV_MODE') }
                    <i
                      className="icon fa-question-circle login-help"
                      data-tip={ 
                        translate('LOGIN.SPV_MODE_DESC_P1') +
                        ` <u>${ translate('LOGIN.SPV_MODE_DESC_P2') }</u> ` +
                        translate('LOGIN.SPV_MODE_DESC_P3') +
                        '<br/>' +
                        translate('LOGIN.SPV_MODE_DESC_P4')
                      }
                      data-html={ true }
                      data-for="login3"></i>
                    <ReactTooltip
                      id="login3"
                      effect="solid"
                      className="text-left" />
                  </div>
                  <Select
                    name="selectedShortcutSPV"
                    value={ this.state.selectedShortcutSPV }
                    onChange={ (event) => this.updateSelectedShortcut(event, 'spv') }
                    optionRenderer={ this.renderShortcutOption }
                    valueRenderer={ this.renderShortcutOption }
                    options={[
                      {
                        value: 'kmd',
                        label: 'kmd',
                      },
                      {
                        value: 'chips',
                        label: 'chips',
                      },
                      {
                        value: 'bntn',
                        label: 'bntn',
                      },
                      {
                        value: 'btch',
                        label: 'btch',
                      },
                      {
                        value: 'mnz',
                        label: 'mnz',
                      },
                      {
                        value: 'revs',
                        label: 'revs',
                      },
                      {
                        value: 'jumblr',
                        label: 'jumblr',
                      },
                      {
                        value: 'kmd+revs+jumblr',
                        label: 'kmd+revs+jumblr',
                      },
                    ]} />
                </div>
              </div>
            </div>
          }

          <div className={ this.state.activeLoginSection === 'signup' ? 'show' : 'hide' }>
            <div className="register-form">
              <h4 className="hint color-white">
                { translate('INDEX.SELECT_SEED_TYPE') }:
              </h4>
              <div className="row">
                <div className="col-sm-5 horizontal-padding-0">
                  <div className="toggle-box vertical-padding-20">
                    <span className="pointer">
                      <label className="switch">
                        <input
                          type="checkbox"
                          readOnly
                          checked={ this.isCustomWalletSeed() } />
                        <div
                          className="slider"
                          onClick={ () => this.toggleCustomWalletSeed() }></div>
                      </label>
                      <div
                        className="toggle-label white"
                        onClick={ () => this.toggleCustomWalletSeed() }>
                        { translate('LOGIN.CUSTOM_WALLET_SEED') }
                      </div>
                    </span>
                  </div>
                </div>
                <div className="col-sm-7 horizontal-padding-0">
                { !this.isCustomWalletSeed() &&
                  <div>
                    <div className="form-group form-material floating">
                      <div
                        className="radio-custom radio-default radio-inline"
                        onClick={ () => this.state.bitsOption !== 256 && this.generateNewSeed(256) }>
                        <input
                          type="radio"
                          name="PassPhraseOptions"
                          checked={ this.state.bitsOption === 256 }
                          readOnly />
                        <label htmlFor="PassPhraseOptionsIguana">
                          { translate('LOGIN.IGUANA_SEED') }
                        </label>
                      </div>
                      <div
                        className="radio-custom radio-default radio-inline"
                        onClick={ () => this.state.bitsOption !== 160 && this.generateNewSeed(160) }>
                        <input
                          type="radio"
                          name="PassPhraseOptions"
                          checked={ this.state.bitsOption === 160 }
                          readOnly />
                        <label htmlFor="PassPhraseOptionsWaves">
                          { translate('LOGIN.WAVES_SEED') }
                        </label>
                      </div>
                      <div
                        className="radio-custom radio-default radio-inline"
                        onClick={ () => this.state.bitsOption !== 128 && this.generateNewSeed(128) }>
                        <input
                          type="radio"
                          name="PassPhraseOptions"
                          checked={ this.state.bitsOption === 128 }
                          readOnly />
                        <label htmlFor="PassPhraseOptionsNXT">
                          { translate('LOGIN.NXT_SEED') }
                        </label>
                      </div>
                    </div>
                  </div>
                }
                </div>
              </div>

              <div className="form-group form-material floating seed-tooltip">
                <textarea
                  className="form-control placeholder-no-fix height-100"
                  type="text"
                  id="walletseed"
                  value={ this.state.randomSeed }
                  onChange={ (e) => this.updateWalletSeed(e) }
                  readOnly={ !this.isCustomWalletSeed() }></textarea>
                <button
                  className="copy-floating-label"
                  htmlFor="walletseed"
                  onClick={ () => this.copyPassPhraseToClipboard() }>
                  { translate('INDEX.COPY') }
                </button>
                <label
                  className="floating-label"
                  htmlFor="walletseed">
                  { translate('INDEX.WALLET_SEED') }
                </label>
              </div>
              <div className="form-group form-material floating">
                <textarea
                  className="form-control placeholder-no-fix height-100"
                  type="text"
                  name="randomSeedConfirm"
                  value={ this.state.randomSeedConfirm }
                  onChange={ this.updateRegisterConfirmPassPhraseInput }
                  id="rwalletseed"></textarea>
                { this.state.isSeedBlank &&
                  <span className="help-block">
                    { translate('LOGIN.MUST_ENTER_SEED') }.
                  </span>
                }
                { this.state.isSeedConfirmError &&
                  <span className="help-block">
                    { translate('LOGIN.ENTER_VALUE_AGAIN') }.
                  </span>
                }
                <label
                  className="floating-label"
                  htmlFor="rwalletseed">
                  { translate('INDEX.CONFIRM_SEED') }
                </label>
                { !this.isCustomWalletSeed() &&
                  <div className="seed-encrypt-block">
                    <div className="form-group form-material floating text-left">
                      <div className="toggle-box vertical-padding-20">
                        <span
                          className="pointer"
                          disabled>
                          <label className="switch">
                            <input
                              type="checkbox"
                              readOnly
                              checked={ this.shouldEncryptSeed() } />
                            <div
                              className="slider"
                              onClick={ () => this.toggleShouldEncryptSeed() }></div>
                          </label>
                          <div
                            className="toggle-label white"
                            onClick={ () => this.toggleShouldEncryptSeed() }>
                            { translate('LOGIN.ENCRYPT_SEED') }
                          </div>
                        </span>
                        <i
                          className="icon fa-question-circle login-help"
                          data-tip={ 
                            translate('LOGIN.SEED_ENCRYPT_KEY_DESC_P1') +
                            '<br />' +
                            translate('LOGIN.SEED_ENCRYPT_KEY_DESC_P2')
                          }
                          data-html={ true }
                          data-for="login4"></i>
                        <ReactTooltip
                          id="login4"
                          effect="solid"
                          className="text-left" />
                      </div>
                    </div>
                    { this.state.shouldEncryptSeed &&
                      <div>
                        <div className="form-group form-material floating text-left">
                          <input
                            type="password"
                            name="encryptKey"
                            ref="encryptKey"
                            className="form-control"
                            onChange={ this.updateInput }
                            autoComplete="off"
                            value={ this.state.encryptKey || '' } />
                          <label
                            className="floating-label"
                            htmlFor="encryptKey">
                            { translate('LOGIN.SEED_ENCRYPT_KEY') }
                          </label>
                        </div>
                        <div className="form-group form-material floating text-left margin-top-60 margin-bottom-40">
                          <input
                            type="password"
                            name="encryptKeyConfirm"
                            ref="encryptKeyConfirm"
                            className="form-control"
                            onChange={ this.updateInput }
                            autoComplete="off"
                            value={ this.state.encryptKeyConfirm || '' } />
                          <label
                            className="floating-label"
                            htmlFor="encryptKeyConfirm">
                            { translate('LOGIN.SEED_ENCRYPT_KEY_CONFIRM') }
                          </label>
                        </div>
                        <div className="toggle-box vertical-padding-20 text-left">
                          <span className="pointer">
                            <label className="switch">
                              <input
                                type="checkbox"
                                readOnly
                                checked={ this.state.isCustomPinFilename } />
                              <div
                                className="slider"
                                onClick={ () => this.toggleCustomPinFilename() }></div>
                            </label>
                            <div
                              className="toggle-label white"
                              onClick={ () => this.toggleCustomPinFilename() }>
                              { translate('LOGIN.CUSTOM_PIN_FNAME') }
                            </div>
                          </span>
                          <i
                            className="icon fa-question-circle login-help"
                            data-tip={ translate('LOGIN.CUSTOM_PIN_FNAME_INFO') }
                            data-html={ true }
                            data-for="login5"></i>
                          <ReactTooltip
                            id="login5"
                            effect="solid"
                            className="text-left" />
                        </div>
                        { this.state.isCustomPinFilename &&
                          <div className="form-group form-material floating text-left margin-top-20 margin-bottom-40">
                            <input
                              type="text"
                              name="customPinFilename"
                              ref="customPinFilename"
                              className="form-control"
                              onChange={ this.updateInput }
                              autoComplete="off"
                              value={ this.state.customPinFilename || '' } />
                            <label
                              className="floating-label"
                              htmlFor="customPinFilename">
                              { translate('LOGIN.CUSTOM_PIN_FNAME') }
                            </label>
                          </div>
                        }
                      </div>
                    }
                  </div>
                }
                <div className="btn btn-success btn-block margin-top-20 btn-generate-qr">
                  <QRModal
                    qrSize="256"
                    modalSize="md"
                    title={ translate('LOGIN.SEED_QR_RECOVERY') }
                    fileName="agama-seed"
                    content={ this.state.randomSeed } />
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={ this.handleRegisterWallet }
                disabled={
                  !this.state.randomSeedConfirm ||
                  !this.state.randomSeed ||
                  !this.state.randomSeedConfirm.length ||
                  !this.state.randomSeed.length ||
                  this.state.randomSeedConfirm !== this.state.randomSeed
                }>
                { translate('INDEX.REGISTER') }
              </button>
              <div className="form-group form-material floating">
                <button
                  className="btn btn-lg btn-flat btn-block waves-effect"
                  id="register-back-btn"
                  onClick={ () => this.updateActiveLoginSection('login') }>
                  { translate('INDEX.BACK_TO_LOGIN') }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRender;