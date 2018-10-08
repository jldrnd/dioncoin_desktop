import React from 'react';
import translate from '../../../translate/translate';
import QRModal from '../qrModal/qrModal';
import ReactTooltip from 'react-tooltip';
import {
  formatValue,
  isPositiveNumber,
  fromSats,
  toSats,
} from 'agama-wallet-lib/src/utils';
import {
  explorerList,
  isKomodoCoin,
} from 'agama-wallet-lib/src/coin-helpers';
import Config from '../../../config';
import mainWindow from '../../../util/mainWindow';

const kvCoins = {
  'KV': true,
  'BEER': true,
  'PIZZA': true,
};

export const AddressListRender = function() {
  return (
    <div className={ `btn-group bootstrap-select form-control form-material showkmdwalletaddrs show-tick ${(this.state.addressSelectorOpen ? 'open' : '')}` }>
      <button
        type="button"
        className={ 'btn dropdown-toggle btn-info' + (this.props.ActiveCoin.mode === 'spv' ? ' disabled' : '') }
        onClick={ this.openDropMenu }>
        <span className="filter-option pull-left">{ this.renderSelectorCurrentLabel() }&nbsp;</span>
        <span className="bs-caret">
          <span className="caret"></span>
        </span>
      </button>
      <div className="dropdown-menu open">
        <ul className="dropdown-menu inner">
          { (this.props.ActiveCoin.mode === 'spv' ||
            (this.props.ActiveCoin.mode === 'native' && this.props.ActiveCoin.coin !== 'KMD' && mainWindow.chainParams && mainWindow.chainParams[this.props.ActiveCoin.coin] && !mainWindow.chainParams[this.props.ActiveCoin.coin].ac_private)) &&
            (!this.state.sendTo || (this.state.sendTo && this.state.sendTo.substring(0, 2) !== 'zc' && this.state.sendTo.length !== 95)) &&
            <li
              className="selected"
              onClick={ () => this.updateAddressSelection(null, 'public', null) }>
              <a>
                <span className="text">
                  { this.props.ActiveCoin.mode === 'spv' ? `[ ${this.props.ActiveCoin.balance.balance - Math.abs(this.props.ActiveCoin.balance.unconfirmed)} ${this.props.ActiveCoin.coin} ] ${this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub}` : translate('INDEX.T_FUNDS') }
                </span>
                <span
                  className="glyphicon glyphicon-ok check-mark pull-right"
                  style={{ display: this.state.sendFrom === null ? 'inline-block' : 'none' }}></span>
              </a>
            </li>
          }
          { (this.props.ActiveCoin.mode === 'spv' ||
             ((this.props.ActiveCoin.mode === 'native' && this.props.ActiveCoin.coin === 'KMD') || (this.props.ActiveCoin.mode === 'native' && this.props.ActiveCoin.coin !== 'KMD' && mainWindow.chainParams && mainWindow.chainParams[this.props.ActiveCoin.coin] && !mainWindow.chainParams[this.props.ActiveCoin.coin].ac_private))) &&
            this.renderAddressByType('public')
          }
          { this.renderAddressByType('private') }
        </ul>
      </div>
    </div>
  );
};

export const _SendFormRender = function() {
  return (
    <div className="extcoin-send-form">
      { (this.state.renderAddressDropdown ||
        (this.props.ActiveCoin.mode === 'native' && this.props.ActiveCoin.coin !== 'KMD' && mainWindow.chainParams && mainWindow.chainParams[this.props.ActiveCoin.coin] && mainWindow.chainParams[this.props.ActiveCoin.coin].ac_private)) &&
        <div className="row">
          <div className="col-xlg-12 form-group form-material">
            <label className="control-label padding-bottom-10">
              { translate('INDEX.SEND_FROM') }
            </label>
            { this.renderAddressList() }
          </div>
        </div>
      }
      { !this.state.kvSend &&
        <div className="row">
          <div className="col-xlg-12 form-group form-material">
            { this.props.ActiveCoin.mode === 'spv' &&
              this.renderAddressBookDropdown(true) < 1 &&
              <button
                type="button"
                className="btn btn-default btn-send-self"
                onClick={ this.setSendToSelf }>
                { translate('SEND.SELF') }
              </button>
            }
            { this.props.AddressBook &&
              this.props.AddressBook.arr &&
              typeof this.props.AddressBook.arr === 'object' &&
              this.props.AddressBook.arr[isKomodoCoin(this.props.ActiveCoin.coin) ? 'KMD' : this.props.ActiveCoin.coin] &&
              this.renderAddressBookDropdown(true) > 0 &&
              <button
                type="button"
                className="btn btn-default btn-send-address-book-dropdown"
                onClick={ this.toggleAddressBookDropdown }>
                { translate('SETTINGS.ADDRESS_BOOK') } <i className="icon fa-angle-down"></i>
              </button>
            }
            { this.state.addressBookSelectorOpen &&
              <div className="coin-tile-context-menu coin-tile-context-menu--address-book">
                <ul>
                  { this.renderAddressBookDropdown() }
                </ul>
              </div>
            }
            <label
              className="control-label"
              htmlFor="kmdWalletSendTo">{ translate('INDEX.SEND_TO') }</label>
            <input
              type="text"
              className={ 'form-control' + (this.props.AddressBook && this.props.AddressBook.arr && typeof this.props.AddressBook.arr === 'object' && this.props.AddressBook.arr[isKomodoCoin(this.props.ActiveCoin.coin) ? 'KMD' : this.props.ActiveCoin.coin] ? ' send-to-padding-right' : '') }
              name="sendTo"
              onChange={ this.updateInput }
              value={ this.state.sendTo }
              id="kmdWalletSendTo"
              placeholder={ translate('SEND.' + (this.props.ActiveCoin.mode === 'spv' ? 'ENTER_ADDRESS' : (this.props.ActiveCoin.mode === 'native' && this.props.ActiveCoin.coin !== 'KMD' && mainWindow.chainParams && mainWindow.chainParams[this.props.ActiveCoin.coin] && mainWindow.chainParams[this.props.ActiveCoin.coin].ac_private) ? 'ENTER_Z_ADDR' : 'ENTER_T_OR_Z_ADDR')) }
              autoComplete="off"
              required />
          </div>
          <div className="col-lg-12 form-group form-material">
            { (this.props.ActiveCoin.mode === 'spv' ||
               (this.props.ActiveCoin.mode === 'native' && this.state.sendFrom)) &&
              <button
                type="button"
                className="btn btn-default btn-send-self"
                onClick={ this.setSendAmountAll }>
                { translate('SEND.ALL') }
              </button>
            }
            <label
              className="control-label"
              htmlFor="kmdWalletAmount">
              { translate('INDEX.AMOUNT') }
            </label>
            <input
              type="text"
              className="form-control"
              name="amount"
              value={ this.state.amount !== 0 ? this.state.amount : '' }
              onChange={ this.updateInput }
              id="kmdWalletAmount"
              placeholder="0.000"
              autoComplete="off" />
          </div>
          <div className={ 'col-lg-6 form-group form-material' + (this.isTransparentTx() && this.props.ActiveCoin.mode === 'native' ? '' : ' hide') }>
            { this.state.sendTo.length <= 34 && // TODO: proper pub addr check
              <span className="pointer">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={ this.state.subtractFee }
                    readOnly />
                  <div
                    className="slider"
                    onClick={ () => this.toggleSubtractFee() }></div>
                </label>
                <div
                  className="toggle-label"
                  onClick={ () => this.toggleSubtractFee() }>
                    { translate('DASHBOARD.SUBTRACT_FEE') }
                </div>
              </span>
            }
          </div>
          { this.renderBTCFees() }
          { this.props.ActiveCoin.mode === 'spv' &&
            Config.spv.allowCustomFees &&
            <div className="col-lg-12 form-group form-material">
              <label
                className="control-label"
                htmlFor="kmdWalletFee">
                { translate('INDEX.FEE_PER_TX') }
              </label>
              <input
                type="text"
                className="form-control"
                name="fee"
                onChange={ this.updateInput }
                id="kmdWalletFee"
                placeholder="0.0001"
                value={ this.state.fee !== 0 ? this.state.fee : '' }
                autoComplete="off" />
              <button
                type="button"
                className="btn btn-default btn-send-self"
                onClick={ this.setDefaultFee }>
                { translate('INDEX.DEFAULT') }
              </button>
            </div>
          }
          { this.props.ActiveCoin.mode === 'spv' &&
            Config.spv.allowCustomFees &&
            this.state.amount > 0 &&
            isPositiveNumber(this.state.fee) &&
            isPositiveNumber(this.state.amount) &&
            <div className="col-lg-12">
              <span>
                <strong>{ translate('INDEX.TOTAL') }:</strong>&nbsp;
                { this.state.amount } + { this.state.fee } = { Number((Number(this.state.amount) + Number(this.state.fee)).toFixed(8)) }&nbsp;
                { this.props.ActiveCoin.coin }
              </span>
            </div>
          }
          { (!this.isFullySynced() || !navigator.onLine) &&
            this.props.ActiveCoin &&
            this.props.ActiveCoin.mode === 'native' &&
            <div className="col-lg-12 padding-top-20 padding-bottom-20 send-coin-sync-warning">
              <i className="icon fa-warning color-warning margin-right-5"></i>&nbsp;
              <span className="desc">{ translate('SEND.SEND_NATIVE_SYNC_WARNING') }</span>
            </div>
          }
          <div className="col-lg-12">
            <button
              type="button"
              className="btn btn-primary waves-effect waves-light pull-right"
              onClick={ this.props.renderFormOnly ? this.handleSubmit : () => this.changeSendCoinStep(1) }
              disabled={
                !this.state.sendTo ||
                !this.state.amount
              }>
              { translate('INDEX.SEND') } { this.state.amount } { this.props.ActiveCoin.coin }
            </button>
          </div>
        </div>
      }
      { this.state.kvSend &&
        <div className="row">
          {/*<button
            type="button"
            className="btn btn-default btn-send-self"
            onClick={ this.loadTestData }>
            Load test data
          </button>*/}
          <div className="col-xlg-12 form-group form-material">
            <label
              className="control-label"
              htmlFor="kvSendTag">{ translate('KV.TAG') }</label>
            <input
              type="text"
              className="form-control"
              name="kvSendTag"
              onChange={ this.updateInput }
              value={ this.state.kvSendTag }
              id="kvSendTag"
              placeholder={ translate('KV.TITLE') }
              autoComplete="off"
              maxLength="64"
              required />
          </div>
          <div className="col-xlg-12 form-group form-material">
            <label
              className="control-label"
              htmlFor="kvSendTitle">{ translate('KV.TITLE') }</label>
            <input
              type="text"
              className="form-control"
              name="kvSendTitle"
              onChange={ this.updateInput }
              value={ this.state.kvSendTitle }
              id="kvSendTitle"
              placeholder={ translate('KV.ENTER_A_TITLE') }
              autoComplete="off"
              maxLength="128"
              required />
          </div>
          <div className="col-xlg-12 form-group form-material">
            <label
              className="control-label margin-bottom-10"
              htmlFor="kvSendContent">{ translate('KV.CONTENT') }</label>
            <textarea
              className="full-width height-400"
              rows="20"
              cols="80"
              id="kvSendContent"
              name="kvSendContent"
              onChange={ this.updateInput }
              value={ this.state.kvSendContent }></textarea>
          </div>
          <div className="col-xlg-12 form-group form-material">
            { (4096 - this.state.kvSendContent.length) > 0 &&
              <span>{ translate('KV.CHARS_LEFT') }:  { 4096 - this.state.kvSendContent.length }</span>
            }
            { (4096 - this.state.kvSendContent.length) < 0 &&
              <span>{ translate('KV.KV_ERR_TOO_LONG') }</span>
            }
          </div>
          <div className="col-lg-12">
            <button
              type="button"
              className="btn btn-primary waves-effect waves-light pull-right"
              onClick={ this.props.renderFormOnly ? this.handleSubmit : () => this.changeSendCoinStep(1) }
              disabled={ !this.state.kvSendContent }>
              { translate('INDEX.SEND') } KV { this.props.ActiveCoin.coin }
            </button>
          </div>
        </div>
      }
    </div>
  );
}

export const SendRender = function() {
  if (this.props.renderFormOnly) {
    return (
      <div>{ this.SendFormRender() }</div>
    );
  } else {
    return (
      <div className="col-sm-12 padding-top-10 coin-send-form">
        <div className="col-xlg-12 col-md-12 col-sm-12 col-xs-12">
          <div className="steps row margin-top-10">
            <div className={ 'step col-md-4' + (this.state.currentStep === 0 ? ' current' : '') }>
              <span className="step-number">1</span>
              <div className="step-desc">
                <span className="step-title">{ translate('INDEX.FILL_SEND_FORM') }</span>
                <p>{ translate('INDEX.FILL_SEND_DETAILS') }</p>
              </div>
            </div>
            <div className={ 'step col-md-4' + (this.state.currentStep === 1 ? ' current' : '') }>
              <span className="step-number">2</span>
              <div className="step-desc">
                <span className="step-title">{ translate('INDEX.CONFIRMING') }</span>
                <p>{ translate('INDEX.CONFIRM_DETAILS') }</p>
              </div>
            </div>
            <div className={ 'step col-md-4' + (this.state.currentStep === 2 ? ' current' : '') }>
              <span className="step-number">3</span>
              <div className="step-desc">
                <span className="step-title">{ translate('INDEX.PROCESSING_TX') }</span>
                <p>{ translate('INDEX.PROCESSING_DETAILS') }</p>
              </div>
            </div>
          </div>
        </div>

        <div className={ 'col-xlg-12 col-md-12 col-sm-12 col-xs-12' + (this.state.currentStep === 0 ? '' : ' hide') }>
          <div className="panel">
            <div className="panel-heading">
              <h3 className="panel-title">
                { translate('INDEX.SEND') } { this.props.ActiveCoin.coin }
              </h3>
              { ((this.props.ActiveCoin.mode === 'spv' && Config.experimentalFeatures && kvCoins[this.props.ActiveCoin.coin]) ||
                 (this.props.ActiveCoin.mode === 'spv' && Config.coinControl)) &&
                <div className="kv-select-block">
                  { this.props.ActiveCoin.mode === 'spv' &&
                    Config.experimentalFeatures &&
                    kvCoins[this.props.ActiveCoin.coin] &&
                    <span>
                      <button
                        type="button"
                        className={ 'btn btn-default' + (this.state.kvSend ? ' active' : '') }
                        onClick={ this.toggleKvSend }>
                        { translate('KV.SEND_KV') }
                      </button>
                      <button
                        type="button"
                        className={ 'btn btn-default margin-left-10' + (!this.state.kvSend ? ' active' : '') }
                        onClick={ this.toggleKvSend }>
                        { translate('KV.SEND_TX') }
                      </button>
                    </span>
                  }
                  { this.props.ActiveCoin.mode === 'spv' &&
                    Config.coinControl &&
                    <button
                      type="button"
                      className={ 'btn btn-default margin-left-10' + (!this.state.kvSend ? ' active' : '') }
                      onClick={ this.toggleKvSend }>
                      { translate('SEND.COIN_CONTROL') }
                    </button>
                  }
                </div>
              }
            </div>
            <div className="qr-modal-send-block">
              <QRModal
                mode="scan"
                setRecieverFromScan={ this.setRecieverFromScan } />
            </div>
            <div className="panel-body container-fluid">
            { this.SendFormRender() }
            </div>
          </div>
        </div>

        <div className={ 'col-xlg-12 col-md-12 col-sm-12 col-xs-12' + (this.state.currentStep === 1 ? '' : ' hide') }>
          <div className="panel">
            <div className="panel-body">
              <div className="row">
                <div className="col-xs-12">
                  <strong>{ translate('INDEX.TO') }</strong>
                </div>
                <div className="col-lg-6 col-sm-6 col-xs-12 word-break--all">{ this.state.sendTo }</div>
                <div className="col-lg-6 col-sm-6 col-xs-6">
                  { this.state.amount } { this.props.ActiveCoin.coin }
                </div>
                <div className={ this.state.subtractFee ? 'col-lg-6 col-sm-6 col-xs-12 padding-top-10 bold' : 'hide' }>
                  { translate('DASHBOARD.SUBTRACT_FEE') }
                </div>
              </div>

              { this.state.sendFrom &&
                <div className="row padding-top-20">
                  <div className="col-xs-12">
                    <strong>{ translate('INDEX.FROM') }</strong>
                  </div>
                  <div className="col-lg-6 col-sm-6 col-xs-12 word-break--all">{ this.state.sendFrom }</div>
                  <div className="col-lg-6 col-sm-6 col-xs-6 confirm-currency-send-container">
                    { Number(this.state.amount) } { this.props.ActiveCoin.coin }
                  </div>
                </div>
              }
              { this.state.spvPreflightRes &&
                <div className="row padding-top-20">
                  <div className="col-xs-12">
                    <strong>{ translate('SEND.FEE') }</strong>
                  </div>
                  <div className="col-lg-12 col-sm-12 col-xs-12">
                    { formatValue(fromSats(this.state.spvPreflightRes.fee)) } ({ this.state.spvPreflightRes.fee } { translate('SEND.SATS') })
                  </div>
                </div>
              }
              { this.state.spvPreflightRes &&
                <div className="row padding-top-20">
                  { this.state.spvPreflightRes.change === 0 &&
                    (formatValue((fromSats(this.state.spvPreflightRes.value)) - (fromSats(this.state.spvPreflightRes.fee))) > 0) &&
                    <div className="col-lg-12 col-sm-12 col-xs-12 padding-bottom-20">
                      <strong>{ translate('SEND.ADJUSTED_AMOUNT') }</strong>
                      <i
                        className="icon fa-question-circle settings-help send-btc"
                        data-for="sendCoin2"
                        data-tip={ translate('SEND.MAX_AVAIL_AMOUNT_TO_SPEND') }></i>
                      &nbsp;{ formatValue((fromSats(this.state.spvPreflightRes.value)) - (fromSats(this.state.spvPreflightRes.fee))) }
                    </div>
                  }
                  <ReactTooltip
                    id="sendCoin2"
                    effect="solid"
                    className="text-left" />
                  { this.state.spvPreflightRes.estimatedFee < 0 &&
                    <div className="col-lg-12 col-sm-12 col-xs-12 padding-bottom-20">
                      <strong>{ translate('SEND.KMD_INTEREST') }</strong>&nbsp;
                      { Math.abs(formatValue(fromSats(this.state.spvPreflightRes.estimatedFee))) } { translate('SEND.TO') } { this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub }
                    </div>
                  }
                  { this.state.spvPreflightRes.totalInterest > 0 &&
                    <div className="col-lg-12 col-sm-12 col-xs-12 padding-bottom-20">
                      <strong>{ translate('SEND.KMD_INTEREST') }</strong>&nbsp;
                      { Math.abs(formatValue(fromSats(this.state.spvPreflightRes.totalInterest))) } { translate('SEND.TO') } { this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub }
                    </div>
                  }
                  { this.state.spvPreflightRes.change >= 0 &&
                    <div className="col-lg-12 col-sm-12 col-xs-12">
                      <strong>{ translate('SEND.TOTAL_AMOUNT_DESC') }</strong>&nbsp;
                      { formatValue((fromSats(this.state.spvPreflightRes.value)) + fromSats((this.state.spvPreflightRes.fee))) }
                    </div>
                  }
                </div>
              }
              { Config.requirePinToConfirmTx &&
                mainWindow.pinAccess &&
                <div className="row padding-top-30">
                  <div className="col-lg-12 col-sm-12 col-xs-12 form-group form-material">
                    <label
                      className="control-label bold"
                      htmlFor="pinNumber">
                      { translate('SEND.PIN_NUMBER') }
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="pin"
                      ref="pin"
                      value={ this.state.pin }
                      onChange={ this.updateInput }
                      id="pinNumber"
                      placeholder={ translate('SEND.ENTER_YOUR_PIN') }
                      autoComplete="off" />
                  </div>
                </div>
              }
              { this.state.noUtxo &&
                <div className="padding-top-20">{ translate('SEND.NO_VALID_UTXO_ERR') }</div>
              }
              { this.state.spvPreflightSendInProgress &&
                <div className="padding-top-20">{ translate('SEND.SPV_VERIFYING') }...</div>
              }
              { this.state.spvVerificationWarning &&
                <div className="padding-top-20 fs-15">
                  <strong className="color-warning">{ translate('SEND.WARNING') }:</strong>&nbsp;
                  { translate('SEND.WARNING_SPV_P1') }<br />
                  { translate('SEND.WARNING_SPV_P2') }
                </div>
              }
              <div className="widget-body-footer">
                <a
                  className="btn btn-default waves-effect waves-light"
                  onClick={ () => this.changeSendCoinStep(0, true) }>{ translate('INDEX.BACK') }</a>
                <div className="widget-actions pull-right">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={ Config.requirePinToConfirmTx && mainWindow.pinAccess ? this.verifyPin : () => this.changeSendCoinStep(2) }>
                    { translate('INDEX.CONFIRM') }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={ 'col-xlg-12 col-md-12 col-sm-12 col-xs-12' + (this.state.currentStep === 2 ? '' : ' hide') }>
          <div className="panel">
            <div className="panel-heading">
              <h4 className="panel-title">
                { translate('INDEX.TRANSACTION_RESULT') }
              </h4>
              <div>
                { this.state.lastSendToResponse &&
                  !this.state.lastSendToResponse.msg &&
                  <table className="table table-hover table-striped">
                    <thead>
                      <tr>
                        <th className="padding-left-30">{ translate('INDEX.KEY') }</th>
                        <th className="padding-left-30">{ translate('INDEX.INFO') }</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="padding-left-30">
                        { translate('SEND.RESULT') }
                        </td>
                        <td className="padding-left-30">
                          <span className="label label-success">{ translate('SEND.SUCCESS_SM') }</span>
                        </td>
                      </tr>
                      { ((this.state.sendFrom && this.props.ActiveCoin.mode === 'native') ||
                        this.props.ActiveCoin.mode === 'spv') &&
                        <tr>
                          <td className="padding-left-30">
                          { translate('INDEX.SEND_FROM') }
                          </td>
                          <td className="padding-left-30 selectable word-break--all">
                            { this.props.ActiveCoin.mode === 'spv' ? this.props.Dashboard.electrumCoins[this.props.ActiveCoin.coin].pub : this.state.sendFrom }
                          </td>
                        </tr>
                      }
                      <tr>
                        <td className="padding-left-30">
                        { translate('INDEX.SEND_TO') }
                        </td>
                        <td className="padding-left-30 selectable word-break--all">
                          { this.state.sendTo }
                        </td>
                      </tr>
                      <tr>
                        <td className="padding-left-30">
                        { translate('INDEX.AMOUNT') }
                        </td>
                        <td className="padding-left-30 selectable">
                          { this.state.amount }
                        </td>
                      </tr>
                      <tr>
                        <td className="padding-left-30">{ translate('SEND.TRANSACTION_ID') }</td>
                        <td className="padding-left-30">
                          <span className="selectable">{ this.props.ActiveCoin.mode === 'spv' ? (this.state.lastSendToResponse && this.state.lastSendToResponse.txid ? this.state.lastSendToResponse.txid : '') : this.state.lastSendToResponse }</span>
                          { ((this.props.ActiveCoin.mode === 'spv' &&
                            this.state.lastSendToResponse &&
                            this.state.lastSendToResponse.txid) ||
                            (this.props.ActiveCoin.mode === 'native' && this.state.lastSendToResponse && this.state.lastSendToResponse.length === 64)) &&
                            <button
                              className="btn btn-default btn-xs clipboard-edexaddr margin-left-10"
                              title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                              onClick={ () => this.copyTXID(this.props.ActiveCoin.mode === 'spv' ? (this.state.lastSendToResponse && this.state.lastSendToResponse.txid ? this.state.lastSendToResponse.txid : '') : this.state.lastSendToResponse) }>
                              <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
                            </button>
                          }
                          { ((this.props.ActiveCoin.mode === 'spv' &&
                            this.state.lastSendToResponse &&
                            this.state.lastSendToResponse.txid) ||
                            (this.props.ActiveCoin.mode === 'native' && this.state.lastSendToResponse && this.state.lastSendToResponse.length === 64)) &&
                            explorerList[this.props.ActiveCoin.coin] &&
                            <div className="margin-top-10">
                              <button
                                type="button"
                                className="btn btn-sm white btn-dark waves-effect waves-light pull-left"
                                onClick={ () => this.openExplorerWindow(this.props.ActiveCoin.mode === 'spv' ? (this.state.lastSendToResponse && this.state.lastSendToResponse.txid ? this.state.lastSendToResponse.txid : '') : this.state.lastSendToResponse) }>
                                <i className="icon fa-external-link"></i> { translate('INDEX.OPEN_TRANSACTION_IN_EPLORER', this.props.ActiveCoin.coin) }
                              </button>
                            </div>
                          }
                        </td>
                      </tr>
                    </tbody>
                  </table>
                }
                { !this.state.lastSendToResponse &&
                  <div className="padding-left-30 padding-top-10">{ translate('SEND.PROCESSING_TX') }...</div>
                }
                { this.state.lastSendToResponse &&
                  this.state.lastSendToResponse.msg &&
                  this.state.lastSendToResponse.msg === 'error' &&
                  <div className="padding-left-30 padding-top-10">
                    <div>
                      <strong className="text-capitalize">{ translate('API.ERROR_SM') }</strong>
                    </div>
                    { (this.state.lastSendToResponse.result.toLowerCase().indexOf('decode error') > -1) &&
                      <div>
                        { translate('SEND.YOUR_TXHISTORY_CONTAINS_ZTX_P1') }<br />
                        { translate('SEND.YOUR_TXHISTORY_CONTAINS_ZTX_P2') }
                      </div>
                    }
                    { this.state.lastSendToResponse.result.toLowerCase().indexOf('decode error') === -1 &&
                      <div>{ this.state.lastSendToResponse.result }</div>
                    }
                    { this.props.ActiveCoin.mode === 'spv' &&
                      this.state.lastSendToResponse.raw &&
                      this.state.lastSendToResponse.raw.txid &&
                      <div>{ this.state.lastSendToResponse.raw.txid.replace(/\[.*\]/, '') }</div>
                    }
                    { this.state.lastSendToResponse.raw &&
                      this.state.lastSendToResponse.raw.txid &&
                      this.state.lastSendToResponse.raw.txid.indexOf('bad-txns-inputs-spent') > -1 &&
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
              <div className="widget-body-footer">
                <div className="widget-actions margin-bottom-15 margin-right-15">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={ () => this.changeSendCoinStep(0) }>
                    { translate('INDEX.MAKE_ANOTHER_TX') }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        { this.renderOPIDListCheck() &&
          this.props.ActiveCoin.mode === 'native' &&
          <div className="col-xs-12">
            <div className="row">
              <div className="panel nav-tabs-horizontal">
                <div>
                  <div className="col-xlg-12 col-lg-12 col-sm-12 col-xs-12">
                    <div className="panel">
                      <header className="panel-heading">
                        <h3 className="panel-title">
                          { translate('INDEX.OPERATIONS_STATUSES') }
                        </h3>
                        <span className="send-clear-opids">
                          <span
                            className="pointer"
                            onClick={ this.clearOPIDsManual }>
                            <i className="icon fa-trash margin-right-5"></i>
                            { translate('SEND.CLEAR_ALL') }
                          </span>
                          <i
                            className="icon fa-question-circle settings-help margin-left-10"
                            data-tip={ translate('SEND.CLEAR_ALL_DESC') }
                            data-html={ true }
                            data-for="clearOpids"></i>
                          <ReactTooltip
                            id="clearOpids"
                            effect="solid"
                            className="text-left" />
                        </span>
                      </header>
                      <div className="panel-body">
                        <table
                          className="table table-hover dataTable table-striped"
                          width="100%">
                          <thead>
                            <tr>
                              <th>{ translate('INDEX.STATUS') }</th>
                              <th>ID</th>
                              <th>{ translate('INDEX.TIME') }</th>
                              <th>{ translate('INDEX.RESULT') }</th>
                            </tr>
                          </thead>
                          <tbody>
                            { this.renderOPIDList() }
                          </tbody>
                          <tfoot>
                            <tr>
                              <th>{ translate('INDEX.STATUS') }</th>
                              <th>ID</th>
                              <th>{ translate('INDEX.TIME') }</th>
                              <th>{ translate('INDEX.RESULT') }</th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
};