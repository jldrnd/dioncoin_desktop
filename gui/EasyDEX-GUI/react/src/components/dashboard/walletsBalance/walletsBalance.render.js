import React from 'react';
import ReactTooltip from 'react-tooltip';
import translate from '../../../translate/translate';
import Spinner from '../spinner/spinner';
import Config from '../../../config';
import mainWindow from '../../../util/mainWindow';

const WalletsBalanceRender = function() {
  return (
    <div
      id="wallet-widgets"
      className="wallet-widgets">
      { this.renderBalance('transparent') !== -777 &&
        <div className="col-xs-12 flex">
          { (this.props.ActiveCoin.mode === 'spv' ||
             (this.props.ActiveCoin.mode === 'native' &&
              mainWindow.chainParams &&
              mainWindow.chainParams[this.props.ActiveCoin.coin] &&
              !mainWindow.chainParams[this.props.ActiveCoin.coin].ac_private) ||
              (this.props.ActiveCoin.mode === 'native' && this.props.ActiveCoin.coin === 'KMD')) &&
            <div className={
              this.props.ActiveCoin.coin === 'CHIPS' ||
              (this.props.ActiveCoin.mode === 'spv' && this.props.ActiveCoin.coin !== 'KMD') ||
              this.renderBalance('total') === this.renderBalance('transparent') ||
              this.renderBalance('total') === 0 ? 'col-lg-12 col-xs-12 balance-placeholder--bold' : (this.props.ActiveCoin.mode === 'spv' || Number(this.renderBalance('private')) === 0 ? 'col-lg-4 col-xs-12' : 'col-lg-3 col-xs-12')
            }>
              <div className="widget widget-shadow">
                <div className="widget-content">
                  { this.state.loading &&
                    <span className="spinner--small">
                      <Spinner />
                    </span>
                  }
                  { !this.state.loading &&
                    <i
                      className="icon fa-refresh manual-balance-refresh pointer"
                      onClick={ this.refreshBalance }></i>
                  }
                  <div className="padding-20 padding-top-10">
                    <div className="clearfix cursor-default">
                      <div className="pull-left padding-vertical-10">
                        { this.props.ActiveCoin.coin !== 'CHIPS' &&
                          this.props.ActiveCoin.mode !== 'spv' &&
                          <i className="icon fa-eye font-size-24 vertical-align-bottom margin-right-5"></i>
                        }
                        { this.props.ActiveCoin.mode === 'spv' &&
                          Number(this.renderBalance('interest')) > 0 &&
                          <span className="padding-right-30">&nbsp;</span>
                        }
                        { this.props.ActiveCoin.coin === 'CHIPS' || this.props.ActiveCoin.mode === 'spv' ? translate('INDEX.BALANCE') : translate('INDEX.TRANSPARENT_BALANCE') }
                        { this.props.ActiveCoin.mode === 'spv' &&
                          Number(this.props.ActiveCoin.balance.unconfirmed) < 0 &&
                          <i
                            className="icon fa-info-circle margin-left-5 icon-unconf-balance"
                            data-tip={ `${translate('INDEX.UNCONFIRMED_BALANCE')} ${Math.abs(this.props.ActiveCoin.balance.unconfirmed)}` }
                            data-for="balance2"></i>
                        }
                        <ReactTooltip
                          id="balance2"
                          effect="solid"
                          className="text-left" />
                      </div>
                      <span className="pull-right padding-top-10 font-size-22">
                        { this.renderBalance('transparent', true) }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <div className={ ((this.props.ActiveCoin.mode === 'native' && Number(this.renderBalance('private'))) > 0 || mainWindow.chainParams && mainWindow.chainParams[this.props.ActiveCoin.coin] && mainWindow.chainParams[this.props.ActiveCoin.coin].ac_private) ? 'col-lg-3 col-xs-12' : 'hide' }>
            <div className="widget widget-shadow">
              <div className="padding-20 padding-top-10">
                <div className="clearfix cursor-default">
                  <div className="pull-left padding-vertical-10">
                    <i className="icon fa-eye-slash font-size-24 vertical-align-bottom margin-right-5"></i>
                    { translate('INDEX.Z_BALANCE') }
                  </div>
                  <span
                    className="pull-right padding-top-10 font-size-22"
                    data-tip={ Config.roundValues ? this.renderBalance('private') : '' }
                    data-for="balance3">
                    { this.renderBalance('private', true) }
                  </span>
                  <ReactTooltip
                    id="balance3"
                    effect="solid"
                    className="text-left" />
                </div>
              </div>
            </div>
          </div>

          <div className={ this.props.ActiveCoin.coin === 'KMD' && Number(this.renderBalance('interest')) > 0 ? (this.props.ActiveCoin.mode === 'spv' || Number(this.renderBalance('private')) === 0 ? 'col-lg-4 col-xs-12' : 'col-lg-3 col-xs-12') : 'hide' }>
            <div className="widget widget-shadow">
              <div className="widget-content">
                <div className="padding-20 padding-top-10">
                  <div className="clearfix cursor-default">
                    <div className="pull-left padding-vertical-10">
                      <i className="icon fa-money font-size-24 vertical-align-bottom margin-right-5"></i>
                      { translate('INDEX.INTEREST_EARNED') }
                    </div>
                    <span
                      className="pull-right padding-top-10 font-size-22"
                      data-tip={ Config.roundValues ? this.renderBalance('interest') : '' }
                      data-for="balance4">
                      { this.renderBalance('interest', true) }
                    </span>
                    <ReactTooltip
                      id="balance4"
                      effect="solid"
                      className="text-left" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          { (this.props.ActiveCoin.mode === 'spv' ||
             (this.props.ActiveCoin.mode === 'native' &&
              mainWindow.chainParams &&
              mainWindow.chainParams[this.props.ActiveCoin.coin] &&
              !mainWindow.chainParams[this.props.ActiveCoin.coin].ac_private) ||
              (this.props.ActiveCoin.mode === 'native' && this.props.ActiveCoin.coin === 'KMD')) &&
            <div className={
              this.props.ActiveCoin.coin === 'CHIPS' ||
              (this.props.ActiveCoin.coin !== 'KMD' && this.props.ActiveCoin.mode === 'spv') ||
              Number(this.renderBalance('total')) === 0 ||
              this.renderBalance('total') === this.renderBalance('transparent') ? 'hide' : (this.props.ActiveCoin.mode === 'spv' || Number(this.renderBalance('private')) === 0 ? 'col-lg-4 col-xs-12' : 'col-lg-3 col-xs-12')
            }>
              <div className="widget widget-shadow">
                <div className="widget-content">
                  <div className="padding-20 padding-top-10">
                    <div className="clearfix cursor-default">
                      <div className="pull-left padding-vertical-10">
                        <i className="icon fa-bullseye font-size-24 vertical-align-bottom margin-right-5"></i>
                        { translate('INDEX.TOTAL_BALANCE') }
                      </div>
                      <span
                        className="pull-right padding-top-10 font-size-22"
                        data-tip={ Config.roundValues ? this.renderBalance('total') : '' }
                        data-for="balance5">
                        { this.renderBalance('total', true) }
                      </span>
                      <ReactTooltip
                        id="balance5"
                        effect="solid"
                        className="text-left" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>
  );
};

export default WalletsBalanceRender;