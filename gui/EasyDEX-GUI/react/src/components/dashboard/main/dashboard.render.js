import React from 'react';

import Navbar from '../navbar/navbar';
import CoinTile from '../coinTile/coinTile';
import WalletsBalance from '../walletsBalance/walletsBalance';
import WalletsProgress from '../walletsProgress/walletsProgress';
import WalletsNav from '../walletsNav/walletsNav';
import SendCoin from '../sendCoin/sendCoin';
import WalletsData from '../walletsData/walletsData';
import Jumblr from '../jumblr/jumblr';
import Settings from '../settings/settings';
import ReceiveCoin from '../receiveCoin/receiveCoin';
import About from '../about/about';
import Support from '../support/support';
import Tools from '../tools/tools';
import WalletsMain from '../walletsMain/walletsMain';
import WalletsTxInfo from '../walletsTxInfo/walletsTxInfo';
import CoindDownModal from '../coindDownModal/coindDownModal';
import ImportKeyModal from '../importKeyModal/importKeyModal';
import ZcparamsFetchModal from '../zcparamsFetchModal/zcparamsFetchModal';
import ClaimInterestModal from '../claimInterestModal/claimInterestModal';
import Dice from '../dice/dice';

const DashboardRender = function() {
  return (
    <div className={ 'full-height' + (this.props.Main.blurSensitiveData ? ' blur-sensitive-data' : '') }>
      <div
        className={ this.isSectionActive('wallets') ? 'page-main' : '' }
        id="section-dashboard">
        <Navbar />
        <CoindDownModal />
        <ImportKeyModal />
        <ZcparamsFetchModal />
        { this.isSectionActive('wallets') &&
          <div>
            <CoinTile />
            <WalletsNav />
            <WalletsTxInfo />
            <WalletsMain />
            <ClaimInterestModal />
          </div>
        }
        { this.isSectionActive('dice') &&
          <div>
            <Dice />
          </div>
        }
        { this.isSectionActive('edex') &&
          <EDEX />
        }
        { this.isSectionActive('jumblr') &&
          <Jumblr  />
        }
        { this.isSectionActive('settings') &&
          <Settings disableWalletSpecificUI={ false } />
        }
        { this.isSectionActive('about') &&
          <About />
        }
        { this.isSectionActive('support') &&
          <Support />
        }
        { this.isSectionActive('tools') &&
          <Tools />
        }
      </div>
    </div>
  );
};

export default DashboardRender;