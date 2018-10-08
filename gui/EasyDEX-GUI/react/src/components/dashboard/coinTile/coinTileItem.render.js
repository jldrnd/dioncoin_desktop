import React from 'react';
import translate from '../../../translate/translate';
import ReactTooltip from 'react-tooltip';
import { acConfig } from '../../addcoin/payload';
import mainWindow from '../../../util/mainWindow';

const testChains = [
  'BEER',
  'PIZZA',
  'VOTE2018',
];

const CoinTileItemRender = function() {
  const { item } = this.props;

  return (
    <div className="list-group-item col-xlg-6 col-lg-12 wallet-widgets-info pointer">
      <span className={ `badge up badge-${item.modecolor}` }>
        { item.modecode }
      </span>
      <div className={ 'widget widget-shadow' + (this.props.ActiveCoin.coin === item.coin ? ' active' : '') }>
        <div
          className="widget-content text-center bg-white padding-20"
          onClick={ () => this._dashboardChangeActiveCoin(item.coin, item.mode) }>
          <a className="avatar margin-bottom-5">
            <img
              className="img-responsive"
              src={ `assets/images/cryptologo/${item.coinlogo.toLowerCase()}.png` }
              alt={ item.coinname }/>
          </a>
          <div className="coin-name">
            { item.coinname } { testChains.indexOf(item.coinlogo) === -1 && <span>({ item.coinlogo.toUpperCase() })</span> }
          </div>
        </div>
      </div>
      <button
        onClick={ () => this.toggleCoinMenu(item.coin) }
        className="btn btn-default btn-xs clipboard-edexaddr coin-tile-context-menu-trigger coind-actions-menu">
        <i
          data-tip={ translate('INDEX.TOGGLE_COIN_CONTEXT_MENU') }
          data-for="coinTile1"
          className="fa fa-ellipsis-v coin-tile-context-menu-trigger"></i>
        <ReactTooltip
          id="coinTile1"
          effect="solid"
          className="text-left" />
      </button>
      { item.mode === 'native' &&
        acConfig[item.coin.toUpperCase()] &&
        acConfig[item.coin.toUpperCase()].ac_reward &&
        !acConfig[item.coin.toUpperCase()].ac_stake &&
        <i
          data-tip={ translate('INDEX.MINING_IS_ENABLED') }
          data-for="coinTile2"
          className="icon fa-gavel custom-ac-icon"></i>
      }
      <ReactTooltip
        id="coinTile2"
        effect="solid"
        className="text-left" />
      { item.mode === 'native' &&
        acConfig[item.coin.toUpperCase()] &&
        acConfig[item.coin.toUpperCase()]['ac_stake'] &&
        (!mainWindow.getPubkeys()[item.coin.toLowerCase()] || !mainWindow.getPubkeys()[item.coin.toLowerCase()].pub) &&
        <i
          data-tip={ translate('INDEX.STAKING_IS_DISABLED') }
          data-for="coinTile3"
          className="icon fa-strikethrough custom-ac-icon"></i>
      }
      <ReactTooltip
        id="coinTitle3"
        effect="solid"
        className="text-left" />
      { item.mode === 'native' &&
        acConfig[item.coin.toUpperCase()] &&
        acConfig[item.coin.toUpperCase()].ac_stake &&
        (mainWindow.getPubkeys()[item.coin.toLowerCase()] && mainWindow.getPubkeys()[item.coin.toLowerCase()].pub) &&
        <i
          data-tip={ translate('INDEX.STAKING_IS_ENABLED') }
          data-for="coinTile4"
          className="icon staking custom-ac-icon">S</i>
      }
      <ReactTooltip
        id="coinTile4"
        effect="solid"
        className="text-left" />
      { this.state.toggledCoinMenu &&
        this.state.toggledCoinMenu === item.coin &&
        <div className="coin-tile-context-menu">
          <ul>
            { this.renderStopCoinButton() &&
              item.mode === 'native' &&
              <li onClick={ () => this.stopCoind(item.coin, item.mode) }>
                <i className="icon fa-stop-circle margin-right-5"></i> { translate('DASHBOARD.STOP') }
              </li>
            }
            { this.renderStopCoinButton() &&
              item.mode === 'native' &&
              this.props.Main.coins &&
              this.props.Main.coins.native &&
              Object.keys(this.props.Main.coins.native).length > 1 &&
              <li onClick={ this.stopAllCoind }>
                <i className="icon fa-stop-circle margin-right-5"></i> { translate('DASHBOARD.STOP_ALL') }
              </li>
            }
            { this.renderRemoveCoinButton() &&
              <li onClick={ () => this.removeCoin(item.coin, item.mode) }>
                <i className="icon fa-trash-o margin-right-5"></i> { translate('DASHBOARD.REMOVE') }
              </li>
            }
          </ul>
        </div>
      }
      { mainWindow.chainParams &&
        mainWindow.chainParams[item.coin] &&
        mainWindow.chainParams[item.coin].ac_private &&
        <i
          data-tip={ translate('INDEX.Z_ADDR_ONLY') }
          data-html={ true }
          data-for="coinTile5"
          className="icon ac-private custom-ac-icon">z</i>
      }
      <ReactTooltip
        id="coinTile5"
        effect="solid"
        className="text-left" />
      { this.props.Dashboard &&
        this.props.Dashboard.electrumCoins &&
        this.props.Dashboard.electrumCoins[item.coin] &&
        this.props.Dashboard.electrumCoins[item.coin].serverList &&
        this.props.Dashboard.electrumCoins[item.coin].serverList === 'none' &&
        <i
          data-tip={ translate('SETTINGS.SPV_SINGLE_SERVER_NOTICE') }
          data-for="coinTile6"
          className="icon fa-info-circle icon-spv-connection-warning"></i>
      }
      <ReactTooltip
        id="coinTile6"
        effect="solid"
        className="text-left" />
      { this.renderCoinConError(item) &&
        !this.props.ActiveCoin.rescanInProgress &&
        <i
          onClick={ this.openCoindDownModal }
          data-tip={ `${translate('DASHBOARD.RPC_CONN_FAILURE')}: ${this.props.ActiveCoin.getinfoFetchFailures}.` }
          data-html={ true }
          data-for="coinTile7"
          className="icon fa-warning icon-native-connection-warning"></i>
      }
      <ReactTooltip
        id="coinTile7"
        effect="solid"
        className="text-left" />
    </div>
  );
};

export default CoinTileItemRender;