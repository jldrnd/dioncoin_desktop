import React from 'react';
import translate from '../../../translate/translate';
import mainWindow from '../../../util/mainWindow';
import ReactTooltip from 'react-tooltip';
import Config from '../../../config';

const NavbarRender = function() {
  return (
    <nav className="site-navbar navbar navbar-default navbar-fixed-top navbar-mega">
      <div className="navbar-header">
        <div className="navbar-brand navbar-brand-center site-gridmenu-toggle">
          <img
            className="navbar-brand-logo hidden-xs"
            src="assets/images/agama-logo-side.svg"
            height="100"
            width="100"
            title={ translate('ABOUT.AGAMA_WALLET') } />
          <img
            className="navbar-brand-logo hidden-lg"
            src="assets/images/agama-icon.svg"
            title={ translate('ABOUT.AGAMA_WALLET') } />
          <span className="navbar-brand-text hidden-xs"></span>
        </div>
      </div>
      <div className="navbar-container container-fluid">
        <div className="collapse navbar-collapse navbar-collapse-toolbar">
          <ul className="nav navbar-toolbar">
            <li className="hidden-float hide">
              <a>
                <i className="icon hamburger hamburger-arrow-left">
                  <span className="sr-only">{ translate('INDEX.TOGGLE_MENUBAR') }</span>
                  <span className="hamburger-bar"></span>
                </i>
              </a>
            </li>
            <li className={ 'nav-top-menu' + (this.isSectionActive('wallets') ? ' active' : '') }>
              <a onClick={ () => this.dashboardChangeSection('wallets') }>
                <i className="site-menu-icon"></i> { translate('INDEX.WALLETS') }
              </a>
            </li>
            <li className={
              (this.isSectionActive('dex') ? 'active nav-top-menu' : 'nav-top-menu') +
              (mainWindow.argv.indexOf('dexonly') > -1 ? '' : ' hide')
            }>
              <a onClick={ () => this.dashboardChangeSection('dex') }>
                <i className="site-menu-icon"></i> BarterDEX
              </a>
            </li>
            { this.props.ActiveCoin &&
              (/*this._checkAC() || */
              this.props.ActiveCoin.coin === 'KMD' &&
              this.props.ActiveCoin.mode === 'native') &&
              <li className={ 'nav-top-menu' + (this.isSectionActive('jumblr') ? ' active' : '') }>
                <a onClick={ () => this.dashboardChangeSection('jumblr') }>
                  <i className="site-menu-icon"></i> Jumblr
                </a>
              </li>
            }
            { this.props.ActiveCoin.mode !== 'spv' &&
              <li className="nav-top-menu">
                <a onClick={ this.openImportKeyModal }>
                  <i className="site-menu-icon"></i> { translate('IMPORT_KEY.IMPORT_KEY') }
                </a>
              </li>
            }
            { /*<li className={ this.isSectionActive('explorer') ? 'active nav-top-menu' : 'nav-top-menu' }>
              <a onClick={ () => this.dashboardChangeSection('exporer') }>
                <i className="site-menu-icon"></i> Explorer
              </a>
            </li>*/ }
            { Config.experimentalFeatures &&
              <li className={ 'nav-top-menu' + (this.isSectionActive('tools') ? ' active' : '') }>
                <a onClick={ () => this.dashboardChangeSection('tools') }>
                  <i className="site-menu-icon"></i> { translate('TOOLS.TOOLS') }
                </a>
              </li>
            }
            { mainWindow.nnVoteChain &&
              <li className="nav-top-menu">
                <a onClick={ this._toggleNotaryElectionsModal }>
                  <i className="site-menu-icon"></i> { translate('NN_ELECTIONS.NN_ELECTIONS_2018') }
                </a>
              </li>
            }
            { Config.experimentalFeatures &&
              Config.dev &&
              this.props.ActiveCoin &&
              this.props.ActiveCoin.mode === 'native' &&
              <li className={ 'nav-top-menu' + (this.isSectionActive('dice') ? ' active' : '') }>
                <a onClick={ () => this.dashboardChangeSection('dice') }>
                  <img
                    src="assets/images/dice.png"
                    width="50"
                    title={ translate('DICE.DICE') } />
                  { translate('DICE.DICE') }
                </a>
              </li>
            }
            { !navigator.onLine &&
              <li
                className="nav-top-menu offline"
                data-tip={ translate('INDEX.WALLET_OFFLINE') }
                data-for="navbar">
                <span className="offline-icon"></span> { translate('INDEX.OFFLINE') }
              </li>
            }
          </ul>
          <ReactTooltip
              id="importKey1"
              effect="solid"
              className="text-left" />
          <ul className="nav navbar-toolbar navbar-right navbar-toolbar-right">
            <li>
              <a
                className="pointer padding-bottom-10 padding-top-16"
                onClick={ this.toggleAddCoinModal }>
                <span>
                  <img
                    src="assets/images/icons/activatecoin.png"
                    alt={ translate('INDEX.ADD_COIN') } />
                </span>
              </a>
            </li>
            <li
              className={
                'pointer dropdown' +
                (this.state.openDropMenu ? ' open' : '') +
                (this.props.Main.newUpdateAvailable.result === 'update' ? ' new-update-icon' : '')
              }
              onClick={ this.openDropMenu }>
              <a className="navbar-avatar dropdown-toggle">
                <span className="navbar-avatar-inner">
                  <i
                    title={ translate('INDEX.TOP_MENU') }
                    className="icon fa-bars"></i>
                </span>
              </a>
              <ul className="dropdown-menu">
                { this.props.Main.newUpdateAvailable.result === 'update' &&
                  <li className="new-update-icon-link">
                    <a onClick={ this.openKomodoPlatformLink }>
                      <i className="icon fa-level-up"></i> { translate('INDEX.NEW_VERSION') }
                    </a>
                  </li>
                }
                { !this.isSectionActive('settings') &&
                  <li>
                    <a onClick={ () => this.dashboardChangeSection('settings') }>
                      <i className="icon md-settings"></i> { translate('INDEX.SETTINGS') }
                    </a>
                  </li>
                }
                { !this.isSectionActive('about') &&
                  <li>
                    <a onClick={ () => this.dashboardChangeSection('about') }>
                      <i className="icon fa-users"></i> { translate('ABOUT.ABOUT_AGAMA') }
                    </a>
                  </li>
                }
                { !this.isSectionActive('support') &&
                  <li>
                    <a onClick={ () => this.dashboardChangeSection('support') }>
                      <i className="icon fa-life-ring"></i> { translate('SETTINGS.SUPPORT') }
                    </a>
                  </li>
                }
                <li>
                  <a onClick={ this._toggleBlurSensitiveData }>
                    <i className={ 'nbps icon fa-eye' + (!this.props.Main.blurSensitiveData ? '-slash' : '') }></i>
                    { translate('INDEX.' + (this.props.Main.blurSensitiveData ? 'SHOW_SENSITIVE_DATA' : 'HIDE_SENSITIVE_DATA')) }
                  </a>
                </li>
                { this.isRenderSpvLockLogout() &&
                  <li>
                    <a onClick={ this.spvLock }>
                      <i className="icon fa-lock"></i> { translate('DASHBOARD.SOFT_LOGOUT') }
                    </a>
                  </li>
                }
                { this.isRenderSpvLockLogout() &&
                  <li>
                    <a onClick={ this.spvLogout }>
                      <i className="icon fa-power-off"></i> { translate('DASHBOARD.COMPLETE_LOGOUT') }
                    </a>
                  </li>
                }
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarRender;