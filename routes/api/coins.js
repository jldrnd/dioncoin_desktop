module.exports = (api) => {
  /*
   *  type: GET
   *
   */
  api.get('/InstantDEX/allcoins', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      let retObj;
      let nativeCoindList = [];
      let electrumCoinsList = [];

      for (let key in api.electrumCoins) {
        if (key !== 'auth') {
          electrumCoinsList.push(key.toUpperCase());
        }
      }

      for (let key in api.coindInstanceRegistry) {
        nativeCoindList.push(key === 'komodod' ? 'KMD' : key);
      }

      retObj = {
        native: nativeCoindList,
        spv: electrumCoinsList,
        total: Object.keys(api.electrumCoins).length - 1 + Object.keys(nativeCoindList).length,
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