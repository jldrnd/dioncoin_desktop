const bs58check = require('bs58check');
const bitcoinZcash = require('bitcoinjs-lib-zcash');
const bitcoin = require('bitcoinjs-lib');

module.exports = (api) => {
  api.post('/electrum/login', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      const _seed = req.body.seed;
      const isIguana = req.body.iguana;
      const _wifError = api.auth(_seed, isIguana);

      // api.log(JSON.stringify(api.electrumKeys, null, '\t'), true);

      const retObj = {
        msg: _wifError ? 'error' : 'success',
        result: 'true',
      };

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  api.auth = (seed, isIguana) => {
    let _wifError = false;

    for (let key in api.electrumCoins) {
      if (key !== 'auth') {
        const _seed = seed;
        let keys;
        let isWif = false;

        if (_seed.match('^[a-zA-Z0-9]{34}$') &&
            api.appConfig.experimentalFeatures) {
          api.log('watchonly pub addr');
          api.electrumKeys[key] = {
            priv: _seed,
            pub: _seed,
          };
          api._isWatchOnly = true;
        } else {
          api._isWatchOnly = false;

          try {
            bs58check.decode(_seed);
            isWif = true;
          } catch (e) {}

          if (isWif) {
            try {
              const _key = api.isZcash(key.toLowerCase()) ? bitcoinZcash.ECPair.fromWIF(_seed, api.getNetworkData(key.toLowerCase()), true) : bitcoin.ECPair.fromWIF(_seed, api.getNetworkData(key.toLowerCase()), true);
              keys = {
                priv: _key.toWIF(),
                pub: _key.getAddress(),
              };
            } catch (e) {
              _wifError = true;
              break;
            }
          } else {
            keys = api.seedToWif(
              _seed,
              api.findNetworkObj(key),
              isIguana,
            );
          }

          api.electrumKeys[key] = {
            priv: keys.priv,
            pub: keys.pub,
          };
        }
      }
    }

    api.electrumCoins.auth = true;

    return _wifError;
  };

  api.post('/electrum/lock', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      api.electrumCoins.auth = false;
      api.electrumKeys = {};

      const retObj = {
        msg: 'success',
        result: 'true',
      };

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  api.post('/electrum/logout', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      api.electrumCoins = {
        auth: false,
      };
      api.electrumKeys = {};

      const retObj = {
        msg: 'success',
        result: 'result',
      };

      res.end(JSON.stringify(retObj));
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  });

  return api;
};