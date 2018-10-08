module.exports = (api) => {
  api.parseTransactionAddresses = (tx, targetAddress, network, skipTargetAddress) => {
    // TODO: calc tx fee
    let result = [];
    let _parse = {
      inputs: {},
      outputs: {},
    };
    let _sum = {
      inputs: 0,
      outputs: 0,
    };
    let _total = {
      inputs: 0,
      outputs: 0,
    };
    let _addresses = {
      inputs: [],
      outputs: [],
    };

    api.log('parseTransactionAddresses result ==>', 'spv.parseAddress');

    if (tx.format === 'cant parse') {
      return {
        type: 'unknown',
        amount: 'unknown',
        address: targetAddress,
        timestamp: tx.timestamp,
        txid: tx.format.txid,
        confirmations: tx.confirmations,
      }
    }

    for (let key in _parse) {
      if (!tx[key].length) {
        _parse[key] = [];
        _parse[key].push(tx[key]);
      } else {
        _parse[key] = tx[key];
      }

      for (let i = 0; i < _parse[key].length; i++) {
        api.log(`key ==>`, 'spv.parseAddress');
        api.log(_parse[key][i], 'spv.parseAddress');
        api.log(Number(_parse[key][i].value), 'spv.parseAddress');

        _total[key] += Number(_parse[key][i].value);

        // ignore op return outputs
        if (_parse[key][i].scriptPubKey &&
            _parse[key][i].scriptPubKey.addresses &&
            _parse[key][i].scriptPubKey.addresses[0] &&
            _parse[key][i].scriptPubKey.addresses[0] === targetAddress &&
            _parse[key][i].value) {
          _sum[key] += Number(_parse[key][i].value);
        }

        if (_parse[key][i].scriptPubKey &&
            _parse[key][i].scriptPubKey.addresses &&
            _parse[key][i].scriptPubKey.addresses[0]) {
          _addresses[key].push(_parse[key][i].scriptPubKey.addresses[0]);

          if (_parse[key][i].scriptPubKey.addresses[0] === targetAddress &&
              skipTargetAddress) {
            _addresses[key].pop();
          }
        }
      }
    }

    _addresses.inputs = [ ...new Set(_addresses.inputs) ];
    _addresses.outputs = [ ...new Set(_addresses.outputs) ];

    api.log('addresses in =>', 'spv.parseAddress');
    api.log(_addresses.inputs, 'spv.parseAddress');
    api.log('addresses out =>', 'spv.parseAddress');
    api.log(_addresses.outputs, 'spv.parseAddress');

    let isSelfSend = {
      inputs: false,
      outputs: false,
    };

    for (let key in _parse) {
      for (let i = 0; i < _addresses[key].length; i++) {
        if (_addresses[key][i] === targetAddress &&
            _addresses[key].length === 1) {
          isSelfSend[key] = true;
        }
      }
    }

    if (_sum.inputs > 0 &&
        _sum.outputs > 0) {
      // vin + change, break into two tx

      // send to self
      if (isSelfSend.inputs &&
          isSelfSend.outputs) {
        result = {
          type: 'self',
          amount: _sum.inputs === _sum.outputs ? _sum.outputs : Number(_sum.inputs - _sum.outputs).toFixed(8),
          amountIn: Number(_sum.inputs).toFixed(8),
          amountOut: Number(_sum.outputs).toFixed(8),
          address: targetAddress,
          timestamp: tx.timestamp,
          txid: tx.format.txid,
          confirmations: tx.confirmations,
        };

        if (network === 'komodo' ||
            network.toLowerCase() === 'kmd') { // calc claimed interest amount
          const vinVoutDiff = _total.inputs - _total.outputs;

          if (vinVoutDiff < 0) {
            result.interest = Number(vinVoutDiff.toFixed(8));
          }
        }
      } else {
        result = [{ // reorder since tx sort by default is from newest to oldest
          type: 'sent',
          amount: Number(_sum.inputs).toFixed(8),
          amountIn: Number(_sum.inputs).toFixed(8),
          amountOut: Number(_sum.outputs).toFixed(8),
          address: _addresses.outputs[0],
          timestamp: tx.timestamp,
          txid: tx.format.txid,
          confirmations: tx.confirmations,
          from: _addresses.inputs,
          to: _addresses.outputs,
        }, {
          type: 'received',
          amount: Number(_sum.outputs).toFixed(8),
          amountIn: Number(_sum.inputs).toFixed(8),
          amountOut: Number(_sum.outputs).toFixed(8),
          address: targetAddress,
          timestamp: tx.timestamp,
          txid: tx.format.txid,
          confirmations: tx.confirmations,
          from: _addresses.inputs,
          to: _addresses.outputs,
        }];

        if (network === 'komodo' ||
            network.toLowerCase() === 'kmd') { // calc claimed interest amount
          const vinVoutDiff = _total.inputs - _total.outputs;

          if (vinVoutDiff < 0) {
            result[1].interest = Number(vinVoutDiff.toFixed(8));
          }
        }
      }
    } else if (
      _sum.inputs === 0 &&
      _sum.outputs > 0
    ) {
      result = {
        type: 'received',
        amount: Number(_sum.outputs).toFixed(8),
        amountIn: Number(_sum.inputs).toFixed(8),
        amountOut: Number(_sum.outputs).toFixed(8),
        address: targetAddress,
        timestamp: tx.timestamp,
        txid: tx.format.txid,
        confirmations: tx.confirmations,
        from: _addresses.inputs,
        to: _addresses.outputs,
      };
    } else if (
      _sum.inputs > 0 &&
      _sum.outputs === 0
    ) {
      result = {
        type: 'sent',
        amount: Number(_sum.inputs).toFixed(8),
        amountIn: Number(_sum.inputs).toFixed(8),
        amountOut: Number(_sum.outputs).toFixed(8),
        address: isSelfSend.inputs && isSelfSend.outputs ? targetAddress : _addresses.outputs[0],
        timestamp: tx.timestamp,
        txid: tx.format.txid,
        confirmations: tx.confirmations,
        from: _addresses.inputs,
        to: _addresses.outputs,
      };
    } else {
      // (?)
      result = {
        type: 'other',
        amount: 'unknown',
        address: 'unknown',
        timestamp: tx.timestamp,
        txid: tx.format.txid,
        confirmations: tx.confirmations,
      };
    }

    api.log(_sum, 'spv.parseAddress');
    api.log(result, 'spv.parseAddress');

    return result;
  }

  return api;
};