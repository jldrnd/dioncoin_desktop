// TODO: watchonly spendable switch

const Promise = require('bluebird');
const { checkTimestamp } = require('agama-wallet-lib/src/time');
const UTXO_1MONTH_THRESHOLD_SECONDS = 2592000;

module.exports = (api) => {
  api.listunspent = (ecl, address, network, full, verify) => {
    let _atLeastOneDecodeTxFailed = false;

    if (full &&
        !ecl.insight) {
      return new Promise((resolve, reject) => {
        ecl.connect();
        ecl.blockchainAddressListunspent(address)
        .then((_utxoJSON) => {
          if (_utxoJSON &&
              _utxoJSON.length) {
            let formattedUtxoList = [];
            let _utxo = [];

            api.electrumGetCurrentBlock(network)
            .then((currentHeight) => {
              if (currentHeight &&
                  Number(currentHeight) > 0) {
                // filter out unconfirmed utxos
                for (let i = 0; i < _utxoJSON.length; i++) {
                  if (Number(currentHeight) - Number(_utxoJSON[i].height) !== 0) {
                    _utxo.push(_utxoJSON[i]);
                  }
                }

                if (!_utxo.length) { // no confirmed utxo
                  ecl.close();
                  resolve('no valid utxo');
                } else {
                  Promise.all(_utxo.map((_utxoItem, index) => {
                    return new Promise((resolve, reject) => {
                      api.getTransaction(_utxoItem.tx_hash, network, ecl)
                      .then((_rawtxJSON) => {
                        api.log('electrum gettransaction ==>', 'spv.listunspent');
                        api.log(`${index} | ${(_rawtxJSON.length - 1)}`, 'spv.listunspent');
                        api.log(_rawtxJSON, 'spv.listunspent');

                        // decode tx
                        const _network = api.getNetworkData(network);
                        let decodedTx;

                        if (api.getTransactionDecoded(_utxoItem.tx_hash, network)) {
                          decodedTx = api.getTransactionDecoded(_utxoItem.tx_hash, network);
                        } else {
                          decodedTx = api.electrumJSTxDecoder(_rawtxJSON, network, _network);
                          api.getTransactionDecoded(_utxoItem.tx_hash, network, decodedTx);
                        }

                        // api.log('decoded tx =>', true);
                        // api.log(decodedTx, true);

                        if (!decodedTx) {
                          _atLeastOneDecodeTxFailed = true;
                          resolve('cant decode tx');
                        } else {
                          if (network === 'komodo' ||
                              network.toLowerCase() === 'kmd') {
                            let interest = 0;

                            if (Number(_utxoItem.value) * 0.00000001 >= 10 &&
                                decodedTx.format.locktime > 0) {
                              interest = api.kmdCalcInterest(decodedTx.format.locktime, _utxoItem.value, _utxoItem.height);
                            }

                            let _resolveObj = {
                              txid: _utxoItem.tx_hash,
                              vout: _utxoItem.tx_pos,
                              address,
                              amount: Number(_utxoItem.value) * 0.00000001,
                              amountSats: _utxoItem.value,
                              locktime: decodedTx.format.locktime,
                              interest: Number(interest.toFixed(8)),
                              interestSats: Math.floor(interest * 100000000),
                              timeElapsedFromLocktime: Math.floor(Date.now() / 1000) - decodedTx.format.locktime * 1000,
                              timeElapsedFromLocktimeInSeconds: checkTimestamp(decodedTx.format.locktime * 1000),
                              timeTill1MonthInterestStopsInSeconds: UTXO_1MONTH_THRESHOLD_SECONDS - checkTimestamp(decodedTx.format.locktime * 1000) > 0 ? UTXO_1MONTH_THRESHOLD_SECONDS - checkTimestamp(decodedTx.format.locktime * 1000) : 0,
                              interestRulesCheckPass: !decodedTx.format.locktime || Number(decodedTx.format.locktime) === 0 || checkTimestamp(decodedTx.format.locktime * 1000) > UTXO_1MONTH_THRESHOLD_SECONDS ? false : true,
                              confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                              spendable: true,
                              verified: false,
                            };

                            // merkle root verification against another electrum server
                            if (verify) {
                              api.verifyMerkleByCoin(
                                api.findCoinName(network),
                                _utxoItem.tx_hash,
                                _utxoItem.height
                              )
                              .then((verifyMerkleRes) => {
                                if (verifyMerkleRes &&
                                    verifyMerkleRes === api.CONNECTION_ERROR_OR_INCOMPLETE_DATA) {
                                  verifyMerkleRes = false;
                                }

                                _resolveObj.verified = verifyMerkleRes;
                                resolve(_resolveObj);
                              });
                            } else {
                              resolve(_resolveObj);
                            }
                          } else {
                            let _resolveObj = {
                              txid: _utxoItem.tx_hash,
                              vout: _utxoItem.tx_pos,
                              address,
                              amount: Number(_utxoItem.value) * 0.00000001,
                              amountSats: _utxoItem.value,
                              confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                              spendable: true,
                              verified: false,
                            };

                            // merkle root verification against another electrum server
                            if (verify) {
                              api.verifyMerkleByCoin(
                                api.findCoinName(network),
                                _utxoItem.tx_hash,
                                _utxoItem.height
                              )
                              .then((verifyMerkleRes) => {
                                if (verifyMerkleRes &&
                                    verifyMerkleRes === api.CONNECTION_ERROR_OR_INCOMPLETE_DATA) {
                                  verifyMerkleRes = false;
                                }

                                _resolveObj.verified = verifyMerkleRes;
                                resolve(_resolveObj);
                              });
                            } else {
                              resolve(_resolveObj);
                            }
                          }
                        }
                      });
                    });
                  }))
                  .then(promiseResult => {
                    ecl.close();

                    if (!_atLeastOneDecodeTxFailed) {
                      api.log(promiseResult, 'spv.listunspent');
                      resolve(promiseResult);
                    } else {
                      api.log('listunspent error, cant decode tx(s)', 'spv.listunspent');
                      resolve('decode error');
                    }
                  });
                }
              } else {
                ecl.close();
                resolve('cant get current height');
              }
            });
          } else {
            ecl.close();
            resolve(api.CONNECTION_ERROR_OR_INCOMPLETE_DATA);
          }
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        ecl.connect();
        ecl.blockchainAddressListunspent(address)
        .then((json) => {
          ecl.close();

          if (json &&
              json.length) {
            resolve(json);
          } else {
            resolve(api.CONNECTION_ERROR_OR_INCOMPLETE_DATA);
          }
        });
      });
    }
  }

  api.get('/electrum/listunspent', (req, res, next) => {
    if (api.checkToken(req.query.token)) {
      const network = req.query.network || api.findNetworkObj(req.query.coin);
      const ecl = api.ecl(network);

      if (req.query.full &&
          req.query.full === 'true') {
            api.listunspent(
          ecl,
          req.query.address,
          network,
          true,
          req.query.verify
        )
        .then((listunspent) => {
          api.log('electrum listunspent ==>', 'spv.listunspent');

          const retObj = {
            msg: 'success',
            result: listunspent,
          };

          res.end(JSON.stringify(retObj));
        });
      } else {
        api.listunspent(ecl, req.query.address, network)
        .then((listunspent) => {
          ecl.close();
          api.log('electrum listunspent ==>', 'spv.listunspent');

          const retObj = {
            msg: 'success',
            result: listunspent,
          };

          res.end(JSON.stringify(retObj));
        });
      }
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