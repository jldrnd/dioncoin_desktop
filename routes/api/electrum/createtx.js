const bitcoinJS = require('bitcoinjs-lib');
const bitcoinJSForks = require('bitcoinforksjs-lib');
const bitcoinZcash = require('bitcoinjs-lib-zcash');
const bitcoinPos = require('bitcoinjs-lib-pos');
const coinSelect = require('coinselect');

module.exports = (api) => {
  // unsigned tx
  api.buildUnsignedTx = (sendTo, changeAddress, network, utxo, changeValue, spendValue) => {
    let tx;

    // TODO: finish unsigned for zcash, btc forks and pos coins
    if (network === 'btg') {
      tx = new bitcoinJSForks.TransactionBuilder(api.getNetworkData(network));
      tx.enableBitcoinGold(true);
      api.log('enable btg', 'spv.createrawtx');
    } else {
      tx = new bitcoinJS.TransactionBuilder(api.getNetworkData(network));
    }

    api.log('buildSignedTx', 'spv.createrawtx');
    // console.log(`buildSignedTx priv key ${wif}`);
    api.log(`buildSignedTx pub key ${changeAddress}`, 'spv.createrawtx');
    // console.log('buildSignedTx std tx fee ' + api.electrumServers[network].txfee);

    for (let i = 0; i < utxo.length; i++) {
      tx.addInput(utxo[i].txid, utxo[i].vout);
    }

    tx.addOutput(sendTo, Number(spendValue));

    if (changeValue > 0) {
      tx.addOutput(changeAddress, Number(changeValue));
    }

    if (network === 'komodo' ||
        network.toUpperCase() === 'KMD') {
      const _locktime = Math.floor(Date.now() / 1000) - 777;
      tx.setLockTime(_locktime);
      api.log(`kmd tx locktime set to ${_locktime}`, 'spv.createrawtx');
    }

    api.log('buildSignedTx unsigned tx data vin', 'spv.createrawtx');
    api.log(tx.tx.ins, true);
    api.log('buildSignedTx unsigned tx data vout', 'spv.createrawtx');
    api.log(tx.tx.outs, true);
    api.log('buildSignedTx unsigned tx data', 'spv.createrawtx');
    api.log(tx, true);

    const rawtx = tx.buildIncomplete().toHex();

    api.log('buildUnsignedTx tx hex', 'spv.createrawtx');
    api.log(rawtx, 'spv.createrawtx');

    return rawtx;
  }

  // single sig
  api.buildSignedTx = (sendTo, changeAddress, wif, network, utxo, changeValue, spendValue, opreturn) => {
    let key = api.isZcash(network) ? bitcoinZcash.ECPair.fromWIF(wif, api.getNetworkData(network)) : bitcoinJS.ECPair.fromWIF(wif, api.getNetworkData(network));
    let tx;

    if (api.isZcash(network)) {
      tx = new bitcoinZcash.TransactionBuilder(api.getNetworkData(network));
    } else if (api.isPos(network)) {
      tx = new bitcoinPos.TransactionBuilder(api.getNetworkData(network));
    } else {
      tx = new bitcoinJS.TransactionBuilder(api.getNetworkData(network));
    }

    api.log('buildSignedTx', 'spv.createrawtx');
    // console.log(`buildSignedTx priv key ${wif}`);
    api.log(`buildSignedTx pub key ${key.getAddress().toString()}`, 'spv.createrawtx');
    // console.log('buildSignedTx std tx fee ' + api.electrumServers[network].txfee);

    for (let i = 0; i < utxo.length; i++) {
      tx.addInput(utxo[i].txid, utxo[i].vout);
    }

    if (api.isPos(network)) {
      tx.addOutput(
        sendTo,
        Number(spendValue),
        api.getNetworkData(network)
      );
    } else {
      tx.addOutput(sendTo, Number(spendValue));
    }

    if (changeValue > 0) {
      if (api.isPos(network)) {
        tx.addOutput(
          changeAddress,
          Number(changeValue),
          api.getNetworkData(network)
        );
      } else {
        tx.addOutput(changeAddress, Number(changeValue));
      }
    }

    if (opreturn) {
      const data = Buffer.from(opreturn, 'utf8');
      const dataScript = api.bitcoinJS.script.nullData.output.encode(data);
      tx.addOutput(dataScript, 1000);
      api.log(`opreturn ${opreturn}`, 'spv.createrawtx');
    }

    if (network === 'komodo' ||
        network.toUpperCase() === 'KMD') {
      const _locktime = Math.floor(Date.now() / 1000) - 777;
      tx.setLockTime(_locktime);
      api.log(`kmd tx locktime set to ${_locktime}`, 'spv.createrawtx');
    }

    api.log('buildSignedTx unsigned tx data vin', 'spv.createrawtx');
    api.log(tx.tx.ins, 'spv.createrawtx');
    api.log('buildSignedTx unsigned tx data vout', 'spv.createrawtx');
    api.log(tx.tx.outs, 'spv.createrawtx');
    api.log('buildSignedTx unsigned tx data', 'spv.createrawtx');
    api.log(tx, 'spv.createrawtx');

    for (let i = 0; i < utxo.length; i++) {
      if (api.isPos(network)) {
        tx.sign(
          api.getNetworkData(network),
          i,
          key
        );
      } else {
        tx.sign(i, key);
      }
    }

    const rawtx = tx.build().toHex();

    api.log('buildSignedTx signed tx hex', 'spv.createrawtx');
    api.log(rawtx, 'spv.createrawtx');

    return rawtx;
  }

  // btg
  api.buildSignedTxForks = (sendTo, changeAddress, wif, network, utxo, changeValue, spendValue) => {
    let tx;

    if (network === 'btg' ||
        network === 'bch') {
      tx = new bitcoinJSForks.TransactionBuilder(api.getNetworkData(network));
    }

    const keyPair = bitcoinJSForks.ECPair.fromWIF(wif, api.getNetworkData(network));
    const pk = bitcoinJSForks.crypto.hash160(keyPair.getPublicKeyBuffer());
    const spk = bitcoinJSForks.script.pubKeyHash.output.encode(pk);

    api.log(`buildSignedTx${network.toUpperCase()}`, 'spv.createrawtx');

    for (let i = 0; i < utxo.length; i++) {
      tx.addInput(
        utxo[i].txid,
        utxo[i].vout,
        bitcoinJSForks.Transaction.DEFAULT_SEQUENCE,
        spk
      );
    }

    tx.addOutput(sendTo, Number(spendValue));

    if (changeValue > 0) {
      tx.addOutput(changeAddress, Number(changeValue));
    }

    if (network === 'btg') {
      tx.enableBitcoinGold(true);
    } else if (network === 'bch') {
      tx.enableBitcoinCash(true);
    }

    tx.setVersion(2);

    api.log('buildSignedTx unsigned tx data vin', 'spv.createrawtx');
    api.log(tx.tx.ins, 'spv.createrawtx');
    api.log('buildSignedTx unsigned tx data vout', 'spv.createrawtx');
    api.log(tx.tx.outs, 'spv.createrawtx');
    api.log('buildSignedTx unsigned tx data', 'spv.createrawtx');
    api.log(tx, 'spv.createrawtx');

    const hashType = bitcoinJSForks.Transaction.SIGHASH_ALL | bitcoinJSForks.Transaction.SIGHASH_BITCOINCASHBIP143;

    for (let i = 0; i < utxo.length; i++) {
      tx.sign(
        i,
        keyPair,
        null,
        hashType,
        utxo[i].value
      );
    }

    const rawtx = tx.build().toHex();

    api.log('buildSignedTx signed tx hex', 'spv.createrawtx');
    api.log(rawtx, 'spv.createrawtx');

    return rawtx;
  }

  api.maxSpendBalance = (utxoList, fee) => {
    let maxSpendBalance = 0;

    for (let i = 0; i < utxoList.length; i++) {
      maxSpendBalance += Number(utxoList[i].value);
    }

    if (fee) {
      return Number(maxSpendBalance) - Number(fee);
    } else {
      return maxSpendBalance;
    }
  }

  api._listunspent = (grainedControlUtxos, ecl, changeAddress, network, full, verify) => {
    api.log(`verify ${verify}`, 'spv.listunspent');

    return new Promise((resolve, reject) => {
      if (grainedControlUtxos) {
        resolve(grainedControlUtxos);
      } else {
        api.listunspent(
          ecl,
          changeAddress,
          network,
          true,
          verify === true ? true : null
        )
        .then((utxoList) => {
          resolve(utxoList);
        });
      }
    });
  };

  api.get('/electrum/createrawtx', (req, res, next) => {
    api.createTx(req, res, next);
  });

  api.post('/electrum/createrawtx', (req, res, next) => {
    api.createTx(req, res, next, 'body');
  });

  api.createTx = (req, res, next, reqType = 'query') => {
    if (api.checkToken(req[reqType].token)) {
      // TODO: unconf output(s) error message
      const network = req[reqType].network || api.findNetworkObj(req[reqType].coin);
      const ecl = api.ecl(network);
      const outputAddress = req[reqType].address;
      const changeAddress = req[reqType].change;
      const push = req[reqType].push;
      const opreturn = req[reqType].opreturn;
      const btcFee = req[reqType].customFee && Number(req[reqType].customFee) !== 0 ? null : (req[reqType].btcfee ? Number(req[reqType].btcfee) : null);
      let fee = req[reqType].customFee && Number(req[reqType].customFee) !== 0 ? Number(req[reqType].customFee) : api.electrumServers[network].txfee;
      let value = Number(req[reqType].value);
      let wif = req[reqType].wif;

      if (req[reqType].gui) {
        wif = api.electrumKeys[req[reqType].coin.toLowerCase()].priv;
      }

      if (req[reqType].vote) {
        wif = api.elections.priv;
      }

      if (btcFee) {
        fee = 0;
      }

      api.log('electrum createrawtx =>', 'spv.createrawtx');

      ecl.connect();
      api._listunspent(
        req[reqType].utxo ? req[reqType].utxo : false,
        ecl,
        changeAddress,
        network,
        true,
        req[reqType].verify === 'true' || req[reqType].verify === true ? true : null
      )
      .then((utxoList) => {
        ecl.close();

        if (utxoList &&
            utxoList.length &&
            utxoList[0] &&
            utxoList[0].txid) {
          let utxoListFormatted = [];
          let totalInterest = 0;
          let totalInterestUTXOCount = 0;
          let interestClaimThreshold = 200;
          let utxoVerified = true;

          for (let i = 0; i < utxoList.length; i++) {
            if (network === 'komodo' ||
                network.toLowerCase() === 'kmd') {
              utxoListFormatted.push({
                txid: utxoList[i].txid,
                vout: utxoList[i].vout,
                value: Number(utxoList[i].amountSats),
                interestSats: Number(utxoList[i].interestSats),
                verified: utxoList[i].verified ? utxoList[i].verified : false,
              });
            } else {
              utxoListFormatted.push({
                txid: utxoList[i].txid,
                vout: utxoList[i].vout,
                value: Number(utxoList[i].amountSats),
                verified: utxoList[i].verified ? utxoList[i].verified : false,
              });
            }
          }

          api.log('electrum listunspent unformatted ==>', 'spv.createrawtx');
          api.log(utxoList, 'spv.createrawtx');

          api.log('electrum listunspent formatted ==>', 'spv.createrawtx');
          api.log(utxoListFormatted, 'spv.createrawtx');

          const _maxSpendBalance = Number(api.maxSpendBalance(utxoListFormatted));
          let targets = [{
            address: outputAddress,
            value: value > _maxSpendBalance ? _maxSpendBalance : value,
          }];
          api.log('targets =>', 'spv.createrawtx');
          api.log(targets, 'spv.createrawtx');

          targets[0].value = targets[0].value + fee;

          api.log(`default fee ${fee}`, 'spv.createrawtx');
          api.log('targets ==>', 'spv.createrawtx');
          api.log(targets, 'spv.createrawtx');

          // default coin selection algo blackjack with fallback to accumulative
          // make a first run, calc approx tx fee
          // if ins and outs are empty reduce max spend by txfee
          const firstRun = coinSelect(
            utxoListFormatted,
            targets,
            btcFee ? btcFee : 0
          );
          let inputs = firstRun.inputs;
          let outputs = firstRun.outputs;

          if (btcFee) {
            api.log(`btc fee per byte ${btcFee}`, 'spv.createrawtx');
            fee = firstRun.fee;
          }

          api.log('coinselect res =>', 'spv.createrawtx');
          api.log('coinselect inputs =>', 'spv.createrawtx');
          api.log(inputs, 'spv.createrawtx');
          api.log('coinselect outputs =>', 'spv.createrawtx');
          api.log(outputs, 'spv.createrawtx');
          api.log('coinselect calculated fee =>', 'spv.createrawtx');
          api.log(fee, 'spv.createrawtx');

          if (!outputs) {
            targets[0].value = targets[0].value - fee;
            api.log('second run', 'spv.createrawtx');
            api.log('coinselect adjusted targets =>', 'spv.createrawtx');
            api.log(targets, 'spv.createrawtx');

            const secondRun = coinSelect(
              utxoListFormatted,
              targets,
              0
            );
            inputs = secondRun.inputs;
            outputs = secondRun.outputs;
            fee = fee ? fee : secondRun.fee;

            api.log('second run coinselect inputs =>', 'spv.createrawtx');
            api.log(inputs, 'spv.createrawtx');
            api.log('second run coinselect outputs =>', 'spv.createrawtx');
            api.log(outputs, 'spv.createrawtx');
            api.log('second run coinselect fee =>', 'spv.createrawtx');
            api.log(fee, 'spv.createrawtx');
          }

          let _change = 0;

          if (outputs &&
              outputs.length === 2) {
            _change = outputs[1].value - fee;
          }

          if (!btcFee &&
              _change === 0) {
            outputs[0].value = outputs[0].value - fee;
          }

          if (btcFee) {
            value = outputs[0].value;
          } else {
            if (_change > 0) {
              value = outputs[0].value - fee;
            }
          }

          api.log('adjusted outputs, value - default fee =>', 'spv.createrawtx');
          api.log(outputs, 'spv.createrawtx');

          // check if any outputs are unverified
          if (inputs &&
              inputs.length) {
            for (let i = 0; i < inputs.length; i++) {
              if (!inputs[i].verified) {
                utxoVerified = false;
                break;
              }
            }

            for (let i = 0; i < inputs.length; i++) {
              if (Number(inputs[i].interestSats) > interestClaimThreshold) {
                totalInterest += Number(inputs[i].interestSats);
                totalInterestUTXOCount++;
              }
            }
          }

          const _maxSpend = api.maxSpendBalance(utxoListFormatted);

          if (value > _maxSpend) {
            const retsObj = {
              msg: 'error',
              result: `Spend value is too large. Max available amount is ${Number((_maxSpend * 0.00000001.toFixed(8)))}`,
            };

            res.end(JSON.stringify(retObj));
          } else {
            api.log(`maxspend ${_maxSpend} (${_maxSpend * 0.00000001})`, 'spv.createrawtx');
            api.log(`value ${value}`, 'spv.createrawtx');
            api.log(`sendto ${outputAddress} amount ${value} (${value * 0.00000001})`, 'spv.createrawtx');
            api.log(`changeto ${changeAddress} amount ${_change} (${_change * 0.00000001})`, 'spv.createrawtx');

            // account for KMD interest
            if ((network === 'komodo' || network.toLowerCase() === 'kmd') &&
                totalInterest > 0) {
              // account for extra vout
              // const _feeOverhead = outputs.length === 1 ? api.estimateTxSize(0, 1) * feeRate : 0;
              const _feeOverhead = 0;

              api.log(`max interest to claim ${totalInterest} (${totalInterest * 0.00000001})`, 'spv.createrawtx');
              api.log(`estimated fee overhead ${_feeOverhead}`, 'spv.createrawtx');
              api.log(`current change amount ${_change} (${_change * 0.00000001}), boosted change amount ${_change + (totalInterest - _feeOverhead)} (${(_change + (totalInterest - _feeOverhead)) * 0.00000001})`, 'spv.createrawtx');

              if (_maxSpend - fee === value) {
                _change = totalInterest - _change - _feeOverhead;

                if (outputAddress === changeAddress) {
                  value += _change;
                  _change = 0;
                  api.log(`send to self ${outputAddress} = ${changeAddress}`, 'spv.createrawtx');
                  api.log(`send to self old val ${value}, new val ${value + _change}`, 'spv.createrawtx');
                }
              } else {
                _change = _change + (totalInterest - _feeOverhead);
              }
            }

            if (!inputs &&
                !outputs) {
              const retObj = {
                msg: 'error',
                result: 'Can\'t find best fit utxo. Try lower amount.',
              };

              res.end(JSON.stringify(retObj));
            } else {
              let vinSum = 0;

              for (let i = 0; i < inputs.length; i++) {
                vinSum += inputs[i].value;
              }

              const _estimatedFee = vinSum - outputs[0].value - _change;

              api.log(`vin sum ${vinSum} (${vinSum * 0.00000001})`, 'spv.createrawtx');
              api.log(`estimatedFee ${_estimatedFee} (${_estimatedFee * 0.00000001})`, 'spv.createrawtx');
              // double check no extra fee is applied
              api.log(`vin - vout ${vinSum - value - _change}`, 'spv.createrawtx');

              if ((vinSum - value - _change) > fee) {
                _change += fee;
                api.log(`double fee, increase change by ${fee}`, 'spv.createrawtx');
              } else if ((vinSum - value - _change) === 0) { // max amount spend edge case
                api.log(`zero fee, reduce output size by ${fee}`, 'spv.createrawtx');
                value = value - fee;
              }

              // TODO: use individual dust thresholds
              if (_change > 0 &&
                  _change <= 1000) {
                api.log(`change is < 1000 sats, donate ${_change} sats to miners`, 'spv.createrawtx');
                _change = 0;
              }

              let _rawtx;

              if (req[reqType].nosig) {
                const _rawObj = {
                  utxoSet: inputs,
                  change: _change,
                  changeAdjusted: _change,
                  totalInterest,
                  fee,
                  value,
                  outputAddress,
                  changeAddress,
                  network,
                  utxoVerified,
                };

                const retObj = {
                  msg: 'success',
                  result: _rawObj,
                };

                res.end(JSON.stringify(retObj));
              } else {
                if (req[reqType].unsigned) {
                  _rawtx = api.buildUnsignedTx(
                    outputAddress,
                    changeAddress,
                    network,
                    inputs,
                    _change,
                    value
                  );
                } else {
                  if (!req[reqType].offline) {
                    if (network === 'btg' ||
                        network === 'bch') {
                      _rawtx = api.buildSignedTxForks(
                        outputAddress,
                        changeAddress,
                        wif,
                        network,
                        inputs,
                        _change,
                        value
                      );
                    } else {
                      _rawtx = api.buildSignedTx(
                        outputAddress,
                        changeAddress,
                        wif,
                        network,
                        inputs,
                        _change,
                        value,
                        opreturn
                      );
                    }
                  }
                }

                if (!push ||
                    push === 'false') {
                  const retObj = {
                    msg: 'success',
                    result: {
                      utxoSet: inputs,
                      change: _change,
                      changeAdjusted: _change,
                      totalInterest,
                      // wif,
                      fee,
                      value,
                      outputAddress,
                      changeAddress,
                      network,
                      rawtx: _rawtx,
                      utxoVerified,
                    },
                  };

                  res.end(JSON.stringify(retObj));
                } else {
                  const ecl = api.ecl(network);

                  ecl.connect();
                  ecl.blockchainTransactionBroadcast(_rawtx)
                  .then((txid) => {
                    ecl.close();

                    let _rawObj = {
                      utxoSet: inputs,
                      change: _change,
                      changeAdjusted: _change,
                      totalInterest,
                      fee,
                      value,
                      outputAddress,
                      changeAddress,
                      network,
                      rawtx: _rawtx,
                      txid,
                      utxoVerified,
                    };

                    if (txid &&
                        JSON.stringify(txid).indexOf('fee not met') > -1) {
                      _rawObj.txid = JSON.stringify(_rawObj.txid);

                      const retObj = {
                        msg: 'error',
                        result: 'Missing fee',
                        raw: _rawObj,
                      };

                      res.end(JSON.stringify(retObj));
                    } else if (
                      txid &&
                      txid.indexOf('bad-txns-inputs-spent') > -1
                    ) {
                      const retObj = {
                        msg: 'error',
                        result: 'Bad transaction inputs spent',
                        raw: _rawObj,
                      };

                      res.end(JSON.stringify(retObj));
                    } else if (
                      txid &&
                      txid.length === 64
                    ) {
                      if (txid.indexOf('bad-txns-in-belowout') > -1) {
                        const retObj = {
                          msg: 'error',
                          result: 'Bad transaction inputs spent',
                          raw: _rawObj,
                        };

                        res.end(JSON.stringify(retObj));
                      } else {
                        const retObj = {
                          msg: 'success',
                          result: _rawObj,
                        };

                        res.end(JSON.stringify(retObj));
                      }
                    } else if (
                      txid &&
                      txid.indexOf('bad-txns-in-belowout') > -1
                    ) {
                      const retObj = {
                        msg: 'error',
                        result: 'Bad transaction inputs spent',
                        raw: _rawObj,
                      };

                      res.end(JSON.stringify(retObj));
                    } else {
                      const retObj = {
                        msg: 'error',
                        result: 'Can\'t broadcast transaction',
                        raw: _rawObj,
                      };

                      res.end(JSON.stringify(retObj));
                    }
                  });
                }
              }
            }
          }
        } else {
          const retObj = {
            msg: 'error',
            result: utxoList,
          };

          res.end(JSON.stringify(retObj));
        }
      });
    } else {
      const retObj = {
        msg: 'error',
        result: 'unauthorized access',
      };

      res.end(JSON.stringify(retObj));
    }
  };

  api.post('/electrum/pushtx', (req, res, next) => {
    if (api.checkToken(req.body.token)) {
      const rawtx = req.body.rawtx;
      const _network = req.body.network;
      const ecl = api.ecl(_network);

      ecl.connect();
      ecl.blockchainTransactionBroadcast(rawtx)
      .then((json) => {
        ecl.close();
        api.log('electrum pushtx ==>', 'spv.pushtx');
        api.log(json, 'spv.pushtx');

        if (json &&
            JSON.stringify(json).indexOf('fee not met') > -1) {
          const retObj = {
            msg: 'error',
            result: 'Missing fee',
          };

          res.end(JSON.stringify(retObj));
        } else if (
          json &&
          json.indexOf('bad-txns-inputs-spent') > -1
        ) {
          const retObj = {
            msg: 'error',
            result: 'Bad transaction inputs spent',
          };

          res.end(JSON.stringify(retObj));
        } else if (
          json &&
          json.length === 64
        ) {
          if (json.indexOf('bad-txns-in-belowout') > -1) {
            const retObj = {
              msg: 'error',
              result: 'Bad transaction inputs spent',
            };

            res.end(JSON.stringify(retObj));
          } else {
            const retObj = {
              msg: 'success',
              result: json,
            };

            res.end(JSON.stringify(retObj));
          }
        } else if (
          json &&
          json.indexOf('bad-txns-in-belowout') > -1
        ) {
          const retObj = {
            msg: 'error',
            result: 'Bad transaction inputs spent',
          };

          res.end(JSON.stringify(retObj));
        } else {
          const retObj = {
            msg: 'error',
            result: 'Can\'t broadcast transaction',
          };

          res.end(JSON.stringify(retObj));
        }
      });
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