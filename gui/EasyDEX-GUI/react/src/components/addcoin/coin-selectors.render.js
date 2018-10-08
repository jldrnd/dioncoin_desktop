import React from 'react';
import translate from '../../translate/translate';
import addCoinOptionsCrypto from '../addcoin/addcoinOptionsCrypto';
import addCoinOptionsAC from '../addcoin/addcoinOptionsAC';
// import addCoinOptionsACFiat from '../addcoin/addcoinOptionsACFiat';
import mainWindow from '../../util/mainWindow';
import Select from 'react-select';
import ReactTooltip from 'react-tooltip';
import { acConfig } from '../addcoin/payload';

const CoinSelectorsRender = function(item, coin, i) {
  const _modesEnum = [
    'native',
    'spv',
    // custom ac
    'mining',
    'staking'
  ];
  let _availModes = {};
  let _coinName;

  if (item &&
      item.selectedCoin) {
    const _itemSplit = item.selectedCoin.split('|');
    _coinName = _itemSplit[0];

    for (let i = 0; i < _modesEnum.length; i++) {
      const mode = _itemSplit.find((item) => {
        return item === _modesEnum[i];
      });

      if (mode) {
        _availModes[mode] = true;
      }
    }
  }

  return (
    <div
      className={ this.hasMoreThanOneCoin() ? 'multi' : 'single' }
      key={ `add-coin-${i}` }>
      <div className={ (this.hasMoreThanOneCoin() ? 'col-sm-10' : 'col-sm-8') + (!this.hasMoreThanOneCoin() ? ' padding-left-none' : ' padding-left-15') }>
        <div className={ (this.hasMoreThanOneCoin() && ((item.mode === '-1' || item.mode === -1) || (item.mode === '1' || item.mode === 1) || (item.mode === '2' || item.mode === 2)) ? 'col-sm-6 form-group' : 'form-group') + (this.hasMoreThanOneCoin() ? ' padding-left-none' : ' padding-left-15') }>
          <Select
            name="selectedCoin"
            value={ coin }
            onChange={ (event) => this.updateSelectedCoin(event, i) }
            optionRenderer={ this.renderCoinOption }
            valueRenderer={ this.renderCoinOption }
            options={
              addCoinOptionsCrypto(this.props.Main.coins)
              .concat(addCoinOptionsAC(this.props.Main.coins))
            } />
        </div>
        { this.hasMoreThanOneCoin() &&
          ((item.mode === '-1' || item.mode === -1) || (item.mode === '1' || item.mode === 1) || (item.mode === '2' || item.mode === 2)) &&
          <div className="col-sm-6">
            <div className="toggle-box padding-bottom-10">
              <select
                className="form-control form-material"
                name="daemonParam"
                onChange={ (event) => this.updateDaemonParam(event, i) }
                autoFocus>
                <option>{ translate('INDEX.DAEMON_PARAM') }: { translate('ADD_COIN.NONE') }</option>
                <option value="silent">{ translate('INDEX.DAEMON_PARAM') }: { translate('INDEX.BACKGROUND_PROCESS') }</option>
                <option value="reindex">{ translate('INDEX.DAEMON_PARAM') }: { translate('INDEX.REINDEX') }</option>
                <option value="rescan">{ translate('INDEX.DAEMON_PARAM') }: { translate('INDEX.RESCAN') }</option>
                <option value="gen">{ translate('INDEX.DAEMON_PARAM') }: gen</option>
              </select>
            </div>
          </div>
        }
      </div>
      { !this.hasMoreThanOneCoin() &&
        <div className="col-sm-4">
          <button
            type="button"
            className="btn btn-primary"
            onClick={ () => this.activateCoin(i) }
            disabled={ item.mode === -2 }>
            { translate('INDEX.ACTIVATE_COIN') }
          </button>
        </div>
      }
      <div className="col-sm-11 text-center add-coin-modes">
        { _availModes.spv &&
          <div className="form-group col-lg-4 col-md-4 col-sm-6 col-xs-6 style-addcoin-lbl-mdl-login">
            <input
              type="radio"
              className="to-labelauty labelauty"
              name={ `mode-${i}` }
              id={ `addcoin_mdl_basilisk_mode_login-${i}` }
              disabled={ item.spvMode.disabled }
              checked={ item.spvMode.checked }
              readOnly />
            <label
              htmlFor={ `addcoin_mdl_basilisk_mode_login-${i}` }
              onClick={ () => this.updateSelectedMode('0', i) }
              style={{ pointerEvents: item.spvMode.disabled ? 'none' : 'all' }}>
              { !item.spvMode.checked &&
                <span className="labelauty-unchecked-image"></span>
              }
              { !item.spvMode.checked &&
                <span
                  className="labelauty-unchecked">
                  { translate('INDEX.SPV_MODE') }
                </span>
              }
              { item.spvMode.checked &&
                <span className="labelauty-checked-image"></span>
              }
              { item.spvMode.checked &&
                <span className="labelauty-checked">
                  { translate('INDEX.SPV_MODE') }
                </span>
              }
            </label>
          </div>
        }
        { mainWindow.arch === 'x64' &&
          _availModes.native &&
          <div className="form-group col-lg-4 col-md-4 col-sm-6 col-xs-6 padding-left-none">
            <input
              type="radio"
              className="to-labelauty labelauty"
              name={ `mode-${i}` }
              id={ `addcoin_mdl_native_mode_login-${i}` }
              disabled={ item.nativeMode.disabled }
              checked={ item.nativeMode.checked }
              readOnly />
            <label
              htmlFor={ `addcoin_mdl_native_mode_login-${i}` }
              onClick={ () => this.updateSelectedMode('-1', i) }
              style={{ pointerEvents: item.nativeMode.disabled ? 'none' : 'all' }}>
              { !item.nativeMode.checked &&
                <span className="labelauty-unchecked-image"></span>
              }
              { !item.nativeMode.checked &&
                <span className="labelauty-unchecked">
                  { translate('INDEX.NATIVE_MODE') }
                </span>
              }
              { item.nativeMode.checked &&
                <span className="labelauty-checked-image"></span>
              }
              { item.nativeMode.checked &&
                <span className="labelauty-checked">
                  { translate('INDEX.NATIVE_MODE') }
                </span>
              }
            </label>
          </div>
        }
        { mainWindow.arch === 'x64' &&
          _availModes.staking &&
          <div className="form-group col-lg-4 col-md-4 col-sm-6 col-xs-6 padding-left-none">
            <input
              type="radio"
              className="to-labelauty labelauty"
              name={ `mode-${i}` }
              id={ `addcoin_mdl_staking_mode_login-${i}` }
              disabled={ item.stakingMode.disabled }
              checked={ item.stakingMode.checked }
              readOnly />
            <label
              htmlFor={ `addcoin_mdl_staking_mode_login-${i}` }
              onClick={ () => this.updateSelectedMode('1', i) }
              style={{ pointerEvents: item.stakingMode.disabled ? 'none' : 'all' }}>
              { !item.stakingMode.checked &&
                <span className="labelauty-unchecked-image"></span>
              }
              { !item.stakingMode.checked &&
                <span className="labelauty-unchecked">
                  { translate('INDEX.STAKING_MODE') }
                </span>
              }
              { item.stakingMode.checked &&
                <span className="labelauty-checked-image"></span>
              }
              { item.stakingMode.checked &&
                <span className="labelauty-checked">
                  { translate('INDEX.STAKING_MODE') }
                </span>
              }
            </label>
          </div>
        }
        { mainWindow.arch === 'x64' &&
          _availModes.mining &&
          <div className="form-group col-lg-4 col-md-4 col-sm-6 col-xs-6 padding-left-none">
            <input
              type="radio"
              className="to-labelauty labelauty"
              name={ `mode-${i}` }
              id={ `addcoin_mdl_mining_mode_login-${i}` }
              disabled={ item.miningMode.disabled }
              checked={ item.miningMode.checked }
              readOnly />
            <label
              htmlFor={ `addcoin_mdl_mining_mode_login-${i}` }
              onClick={ () => this.updateSelectedMode('2', i) }
              style={{ pointerEvents: item.miningMode.disabled ? 'none' : 'all' }}>
              { !item.miningMode.checked &&
                <span className="labelauty-unchecked-image"></span>
              }
              { !item.miningMode.checked &&
                <span className="labelauty-unchecked">
                  { translate('INDEX.MINING_MODE') }
                </span>
              }
              { item.miningMode.checked &&
                <span className="labelauty-checked-image"></span>
              }
              { item.miningMode.checked &&
                <span className="labelauty-checked">
                  { translate('INDEX.MINING_MODE') }
                </span>
              }
            </label>
          </div>
        }
      </div>
      { this.hasMoreThanOneCoin() &&
        i !== 0 &&
        <div className="col-sm-1">
          <button
            type="button"
            className="btn btn-primary"
            onClick={ () => this.removeCoin(i) }>
            <i className="fa fa-trash-o"></i>
          </button>
        </div>
      }
      { item.stakingMode.checked &&
        <div className="col-sm-12 margin-top-20 margin-bottom-30 no-padding">
          <div className="form-material col-sm-12 margin-bottom-20">
            <p>{ translate('ADD_COIN.STAKING_PUB_P1') }</p>
            <p>{ translate('ADD_COIN.STAKING_PUB_P2') }</p>
          </div>
          <div className="form-group form-material floating col-sm-12">
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
              htmlFor="inputPassword">{ translate('INDEX.WALLET_SEED') }</label>
          </div>
          { this.state.seedExtraSpaces &&
            <i className="icon fa-warning seed-extra-spaces-warning"
              data-tip={ translate('LOGIN.SEED_TRAILING_CHARS') }
              data-html={ true }
              data-for="coinSelector"></i>
          }
          <ReactTooltip
            id="coinSelector"
            effect="solid"
            className="text-left" />
        </div>
      }
      { !this.hasMoreThanOneCoin() &&
        ((item.mode === '-1' || item.mode === -1) || (item.mode === '1' || item.mode === 1) || (item.mode === '2' || item.mode === 2)) &&
        <div className="col-sm-5 padding-bottom-30">
          <div className="toggle-box padding-top-3 padding-bottom-10">
            <select
              className="form-control form-material"
              name="daemonParam"
              onChange={ (event) => this.updateDaemonParam(event, i) }
              autoFocus>
              <option>{ translate('INDEX.DAEMON_PARAM') }: { translate('ADD_COIN.NONE') }</option>
              <option value="silent">{ translate('INDEX.DAEMON_PARAM') }: { translate('INDEX.BACKGROUND_PROCESS') }</option>
              <option value="reindex">{ translate('INDEX.DAEMON_PARAM') }: { translate('INDEX.REINDEX') }</option>
              <option value="rescan">{ translate('INDEX.DAEMON_PARAM') }: { translate('INDEX.RESCAN') }</option>
              <option value="gen">{ translate('INDEX.DAEMON_PARAM') }: gen</option>
            </select>
          </div>
        </div>
      }
      { item.daemonParam === 'gen' &&
        acConfig[_coinName] &&
        acConfig[_coinName].genproclimit &&
        <div className="col-sm-12 no-padding">
          <div className="col-sm-5 padding-bottom-30">
            <div className="toggle-box padding-bottom-10">
              <select
                className="form-control form-material"
                name="genProcLimit"
                onChange={ (event) => this.updateDaemonParam(event, i) }
                autoFocus>
                { this.renderGenproclimitOptions() }
              </select>
            </div>
          </div>
        </div>
      }
    </div>
  )
};

export default CoinSelectorsRender;