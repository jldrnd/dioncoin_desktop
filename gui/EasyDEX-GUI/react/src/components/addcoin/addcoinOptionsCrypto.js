import translate from '../../translate/translate';
import mainWindow from '../../util/mainWindow';
import config from '../../config';
import { cryptoCoins } from '../../util/coinHelper';
import { sortObject } from 'agama-wallet-lib/src/utils';

let _prepCoinsList;
let coins = cryptoCoins;
let _activeCoins;

// disable non kmd coins
if (!config.experimentalFeatures) {
  coins = coins.slice(0, 2);
}

// sort coins by their title
let _coins = [];
let coinsList = [];

for (let i = 0; i < cryptoCoins.length; i++) {
  _coins[translate('CRYPTO.' + cryptoCoins[i].toUpperCase())] = cryptoCoins[i];
}

_coins = sortObject(_coins);

for (let key in _coins) {
  if (config.experimentalFeatures ||
      (!config.experimentalFeatures && (_coins[key] === 'KMD' || _coins[key] === 'CHIPS'))) {
    coinsList.push(_coins[key]);
  }
}

coins = coinsList;

const prepCoinsList = (filterActiveCoins) => {
  const availableKMDModes = mainWindow.arch === 'x64' ? 'spv|native' : 'spv';
  let _items = [];

  if (filterActiveCoins) {
    for (let i = 0; i < _prepCoinsList.length; i++) {
      if (_activeCoins === 'skip' || (_activeCoins !== 'skip' &&
          _activeCoins &&
          _activeCoins.spv &&
          _activeCoins.spv.indexOf(_prepCoinsList[i].icon.toUpperCase()) === -1 &&
          _activeCoins.native.indexOf(_prepCoinsList[i].icon.toUpperCase()) === -1)) {
        _items.push(_prepCoinsList[i]);
      }
    }
  } else {
    for (let i = 0; i < coins.length; i++) {
      try {
        if (mainWindow &&
            mainWindow.electrumServers &&
            mainWindow.electrumServers[coins[i].toLowerCase()] &&
            (_activeCoins === 'skip' || (_activeCoins !== 'skip' &&
            _activeCoins &&
            _activeCoins.spv &&
            _activeCoins.native &&
            _activeCoins.spv.indexOf(coins[i].toUpperCase()) === -1 &&
            _activeCoins.native.indexOf(coins[i].toUpperCase()) === -1))) {
          _items.push({
            label: `${translate('CRYPTO.' + coins[i])} (${coins[i]})`,
            icon: coins[i],
            value: `${coins[i]}|${coins[i] === 'KMD' ? availableKMDModes : 'spv'}`,
          });
        }
      } catch (e) {
        console.warn('electron remote error' + e);
      }
    }
  }

  _prepCoinsList = _items;

  return _items;
};

const addCoinOptionsCrypto = (activeCoins) => {
  _activeCoins = activeCoins;

  if (_prepCoinsList) {
    return prepCoinsList();
  } else {
    return prepCoinsList();
  }
}

export default addCoinOptionsCrypto;