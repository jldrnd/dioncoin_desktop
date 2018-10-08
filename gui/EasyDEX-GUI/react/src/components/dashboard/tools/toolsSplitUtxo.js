import React from 'react';
import translate from '../../../translate/translate';
import addCoinOptionsCrypto from '../../addcoin/addcoinOptionsCrypto';
import addCoinOptionsAC from '../../addcoin/addcoinOptionsAC';
import Select from 'react-select';
import {
  triggerToaster,
  apiToolsBalance,
  apiToolsBuildUnsigned,
  apiToolsPushTx,
  apiToolsSeedToWif,
  apiToolsWifToKP,
  apiElectrumListunspent,
  apiCliPromise,
  apiElectrumSplitUtxoPromise,
  apiElectrumPushTx,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import devlog from '../../../util/devlog';
import { isKomodoCoin } from 'agama-wallet-lib/src/coin-helpers';
import { explorerList } from 'agama-wallet-lib/src/coin-helpers';
import { toSats } from 'agama-wallet-lib/src/utils';

const { shell } = window.require('electron');

class ToolsSplitUTXO extends React.Component {
  constructor() {
    super();
    this.state = {
      utxoSplitLargestUtxo: null,
      utxoSplitAddress: null,
      utxoSplitWif: null,
      utxoSplitSeed: '',
      utxoSplitCoin: '',
      utxoSplitList: null,
      utxoSplitPairsCount: 1,
      utxoSplitPairs: '10,0.002',
      utxoSplitRawtx: null,
      utxoSplitPushResult: null,
      utxoSplitShowUtxoList: false,
      splitUtxoApproximateVal: null,
      isNative: false,
      singleModeOnly: false,
    };
    this.updateInput = this.updateInput.bind(this);
    this.updateSelectedCoin = this.updateSelectedCoin.bind(this);
    this.getUtxoSplit = this.getUtxoSplit.bind(this);
    this.splitUtxo = this.splitUtxo.bind(this);
    this.toggleSplitUtxoList = this.toggleSplitUtxoList.bind(this);
    this.splitUtxoApproximate = this.splitUtxoApproximate.bind(this);
    this.toggleIsNative = this.toggleIsNative.bind(this);
    this._getUtxoSplit = this._getUtxoSplit.bind(this);
    this._splitUtxo = this._splitUtxo.bind(this);
  }

  toggleIsNative() {
    this.setState({
      isNative: !this.state.isNative,
    });
  }

  toggleSplitUtxoList() {
    this.setState({
      utxoSplitShowUtxoList: !this.state.utxoSplitShowUtxoList,
    });
  }

  splitUtxoApproximate() {
    let largestUTXO = { amount: 0 };

    for (let i = 0; i < this.state.utxoSplitList.length; i++) {
      if (Number(this.state.utxoSplitList[i].amount) > Number(largestUTXO.amount)) {
        largestUTXO = JSON.parse(JSON.stringify(this.state.utxoSplitList[i]));
      }
    }

    devlog(`largest utxo ${largestUTXO.amount}`);
    devlog(`largest utxo ${largestUTXO.amount}`);

    const utxoSize = largestUTXO.amount;
    const targetSizes = this.state.utxoSplitPairs.split(',');
    const wif = this.state.utxoSplitWif;
    const address = this.state.utxoSplitAddress;
    const pairsCount = this.state.utxoSplitPairsCount;
    let totalOutSize = 0;
    let _targets = [];

    devlog(`total utxos ${pairsCount * targetSizes.length}`);
    devlog(`total pairs ${pairsCount}`);
    devlog(`utxo size ${utxoSize}`);
    devlog(`utxo sizes`);
    devlog(targetSizes);

    for (let i = 0; i < pairsCount; i++) {
      for (let j = 0; j < targetSizes.length; j++) {
        devlog(`vout ${_targets.length} ${targetSizes[j]}`);
        _targets.push(Number(toSats(targetSizes[j])));
        totalOutSize += Number(targetSizes[j]);
      }
    }

    devlog(`total out size ${totalOutSize}`);
    devlog(`largest utxo size ${largestUTXO.amount}`);
    devlog(`change ${Number(largestUTXO.amount - totalOutSize) - 0.0001 + (largestUTXO.interest ? largestUTXO.interest : 0)}`);

    this.setState({
      splitUtxoApproximateVal: largestUTXO.amount - totalOutSize > 0 ? totalOutSize : translate('TOOLS.UTXO_SPLIT_NOOP'),
    });
  }

  _splitUtxo(coin, rawtx) {
    return new Promise((resolve, reject) => {
      if (this.state.isNative) {
        apiCliPromise(
          null,
          coin,
          'sendrawtransaction',
          [rawtx]
        )
        .then((res) => {
          resolve(res);
        });
      } else {
        apiElectrumPushTx(
          coin,
          rawtx
        )
        .then((res) => {
          resolve(res);
        });
      }
    });
  }

  splitUtxo() {
    let largestUTXO = { amount: 0 };

    for (let i = 0; i < this.state.utxoSplitList.length; i++) {
      if (Number(this.state.utxoSplitList[i].amount) > Number(largestUTXO.amount)) {
        largestUTXO = JSON.parse(JSON.stringify(this.state.utxoSplitList[i]));
      }
    }

    devlog(`largest utxo ${largestUTXO.amount}`);
    devlog(`largest utxo ${largestUTXO.amount}`);

    const utxoSize = largestUTXO.amount;
    const targetSizes = this.state.utxoSplitPairs.split(',');
    const wif = this.state.utxoSplitWif;
    const address = this.state.utxoSplitAddress;
    const pairsCount = this.state.utxoSplitPairsCount;
    let totalOutSize = 0;
    let _targets = [];

    devlog(`total utxos ${pairsCount * targetSizes.length}`);
    devlog(`total pairs ${pairsCount}`);
    devlog(`utxo size ${utxoSize}`);
    devlog(`utxo sizes`);
    devlog(targetSizes);

    for (let i = 0; i < pairsCount; i++) {
      for (let j = 0; j < targetSizes.length; j++) {
        devlog(`vout ${_targets.length} ${targetSizes[j]}`);
        _targets.push(parseInt(Number(toSats(targetSizes[j]))));
        totalOutSize += Number(targetSizes[j]);
      }
    }

    devlog(`total out size ${totalOutSize}`);
    devlog(`largest utxo size ${largestUTXO.amount}`);
    devlog(`change ${Number(largestUTXO.amount - totalOutSize) - 0.0001 + (largestUTXO.interest ? largestUTXO.interest : 0)}`);

    const payload = {
      wif,
      network: 'komodo',
      targets: _targets,
      utxo: [largestUTXO],
      changeAddress: address,
      outputAddress: address,
      change: Math.floor(Number(toSats(largestUTXO.amount - totalOutSize)) - 10000 + (toSats(largestUTXO.interest ? largestUTXO.interest : 0))), // 10k sat fee
    };

    devlog(payload);
    devlog(largestUTXO);

    apiElectrumSplitUtxoPromise(payload)
    .then((res) => {
      devlog(res);

      if (res.msg === 'success') {
        const _coin = this.state.utxoSplitCoin.split('|');

        this._splitUtxo(
          _coin[0],
          res.result
        )
        .then((res) => {
          devlog(res);

          if (!res.error) {
            this.setState({
              utxoSplitPushResult: res.result,
            });
            Store.dispatch(
              triggerToaster(
                translate('TOOLS.SPLIT_SUCCESS'),
                'UTXO',
                'success'
              )
            );
          } else {
            Store.dispatch(
              triggerToaster(
                res.result,
                translate('TOOLS.ERR_SPLIT_UTXO'),
                'error'
              )
            );
          }
        });
      } else {
        Store.dispatch(
          triggerToaster(
            res.result,
            translate('TOOLS.ERR_SPLIT_UTXO'),
            'error'
          )
        );
      }
    });
  }

  _getUtxoSplit(coin, pub) {
    return new Promise((resolve, reject) => {
      if (this.state.isNative) {
        apiCliPromise(
          null,
          coin,
          'listunspent'
        )
        .then((res) => {
          resolve(res);
        });
      } else {
        apiElectrumListunspent(
          coin,
          pub
        )
        .then((res) => {
          resolve(res);
        });
      }
    });
  }

  getUtxoSplit() {
    const _coin = this.state.utxoSplitCoin.split('|');

    apiToolsSeedToWif(
      this.state.utxoSplitSeed,
      _coin[0],
      true
    )
    .then((seed2kpRes) => {
      if (seed2kpRes.msg === 'success') {
        this._getUtxoSplit(
          _coin[0],
          seed2kpRes.result.keys.pub
        )
        .then((res) => {
          // devlog(res);

          if (!res.error) {
            const _utxoList = res.result;
            let largestUTXO = 0;

            if (_utxoList &&
                _utxoList.length) {
              let _mineUtxo = [];

              for (let i = 0; i < _utxoList.length; i++) {
                if (_utxoList[i].spendable &&
                    seed2kpRes.result.keys.pub === _utxoList[i].address) {
                  _mineUtxo.push(_utxoList[i]);
                }
              }

              for (let i = 0; i < _mineUtxo.length; i++) {
                if (Number(_mineUtxo[i].amount) > Number(largestUTXO)) {
                  largestUTXO = _mineUtxo[i].amount;
                }
              }

              this.setState({
                utxoSplitList: _mineUtxo,
                utxoSplitLargestUtxo: largestUTXO,
                utxoSplitAddress: seed2kpRes.result.keys.pub,
                utxoSplitWif: seed2kpRes.result.keys.priv,
              });
            } else {
              Store.dispatch(
                triggerToaster(
                  res.result,
                  translate('TOOLS.ERR_SPLIT_UTXO'),
                  'error'
                )
              );
            }
          } else {
            Store.dispatch(
              triggerToaster(
                res.result,
                translate('TOOLS.ERR_GET_UTXO'),
                'error'
              )
            );
          }
        });
      } else {
        Store.dispatch(
          triggerToaster(
            seed2kpRes.result,
            translate('TOOLS.ERR_SEED_TO_WIF'),
            'error'
          )
        );
      }
    });
  }

  renderCoinOption(option) {
    return (
      <div>
        <img
          src={ `assets/images/cryptologo/${option.icon.toLowerCase()}.png` }
          alt={ option.label }
          width="30px"
          height="30px" />
        <span className="margin-left-10">{ option.label }</span>
      </div>
    );
  }

  updateSelectedCoin(e, propName) {
    if (e &&
        e.value &&
        e.value.indexOf('|')) {
      const _val = e.value;
      const _newState = {
        [propName]: _val,
      };

      console.warn(_val);

      if (_val.indexOf('|spv|native') > -1) {
        _newState.singleModeOnly = false;
        _newState.isNative = true;
      } else if (_val.indexOf('|spv') > -1) {
        _newState.singleModeOnly = true;
        _newState.isNative = false;
      } else {
        _newState.singleModeOnly = true;
        _newState.isNative = true;
      }

      this.setState(_newState);
    }
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  openExplorerWindow(txid, coin) {
    const url = explorerList[coin].split('/').length - 1 > 2 ? `${explorerList[coin]}${txid}` : `${explorerList[coin]}/tx/${txid}`;
    return shell.openExternal(url);
  }

  renderUTXOSplitMergeResponse(type) {
    const _utxos = type === 'merge' ? this.state.utxoMergeList : this.state.utxoSplitList;
    let _items = [];

    if (_utxos &&
        _utxos.length) {
      for (let i = 0; i < _utxos.length; i++) {
        _items.push(
          <tr key={ `tools-utxos-${i}` }>
            <td>{ _utxos[i].amount }</td>
            <td className="blur selectable">{ _utxos[i].address }</td>
            <td>{ _utxos[i].confirmations }</td>
            <td>{ _utxos[i].vout }</td>
            <td className="blur selectable">{ _utxos[i].txid }</td>
          </tr>
        );
      }
    }

    return (
      <table className="table table-hover dataTable table-striped">
        <thead>
          <tr>
            <th>{ translate('TOOLS.AMOUNT') }</th>
            <th>{ translate('TOOLS.ADDR') }</th>
            <th>{ translate('TOOLS.CONFS') }</th>
            <th>{ translate('TOOLS.VOUT') }</th>
            <th>TxID</th>
          </tr>
        </thead>
        <tbody>
        { _items }
        </tbody>
        <tfoot>
          <tr>
            <th>{ translate('TOOLS.AMOUNT') }</th>
            <th>{ translate('TOOLS.ADDR') }</th>
            <th>{ translate('TOOLS.CONFS') }</th>
            <th>{ translate('TOOLS.VOUT') }</th>
            <th>TxID</th>
          </tr>
        </tfoot>
      </table>
    );
  }

  render() {
    return (
      <div className="row margin-left-10">
        <div className="col-xlg-12 form-group form-material no-padding-left padding-bottom-10">
          <h4>{ translate('TOOLS.SPLIT_UTXO') }</h4>
        </div>
        <div className="col-xlg-12 form-group form-material no-padding-left padding-top-20 padding-bottom-50">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">{ translate('TOOLS.COIN') }</label>
          <Select
            name="utxoSplitCoin"
            className="col-sm-3"
            value={ this.state.utxoSplitCoin }
            onChange={ (event) => this.updateSelectedCoin(event, 'utxoSplitCoin') }
            optionRenderer={ this.renderCoinOption }
            valueRenderer={ this.renderCoinOption }
            options={
              addCoinOptionsCrypto('skip')
              .concat(addCoinOptionsAC('skip'))
            } />
        </div>
        <div className="col-xlg-12 form-group form-material no-padding-left padding-top-20 padding-bottom-50">
          <span disabled={ this.state.singleModeOnly }>
            <label className="switch">
              <input
                type="checkbox"
                checked={ this.state.isNative } />
              <div
                className="slider"
                onClick={ this.toggleIsNative }></div>
            </label>
            <div
              className="toggle-label margin-right-15 pointer"
              onClick={ this.toggleIsNative }>
              { translate('LOGIN.NATIVE_MODE_DESC_P2') }
            </div>
          </span>
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left">
          <label
            className="control-label col-sm-1 no-padding-left"
            htmlFor="kmdWalletSendTo">{ translate('TOOLS.SEED') }</label>
          <input
            type="text"
            className="form-control col-sm-3 blur"
            name="utxoSplitSeed"
            onChange={ this.updateInput }
            value={ this.state.utxoSplitSeed }
            placeholder={ translate('TOOLS.ENTER_A_SEED') }
            autoComplete="off"
            required />
        </div>
        { this.state.utxoSplitAddress &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            Pub: <span className="blur selectable">{ this.state.utxoSplitAddress }</span>
          </div>
        }
        { this.state.utxoSplitAddress &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            WIF: <span className="blur selectable">{ this.state.utxoSplitWif }</span>
          </div>
        }
        <div className="col-sm-12 form-group no-padding-left margin-top-20 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            onClick={ this.getUtxoSplit }>
            { translate('TOOLS.GET_UTXO') }
          </button>
        </div>
        { this.state.utxoSplitList &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            { /*this.renderUTXOSplitResponse()*/ }
            <div>{ translate('TOOLS.TOTAL') } UTXO: { this.state.utxoSplitList.length }</div>
            <div>{ translate('TOOLS.LARGEST') } UTXO: { this.state.utxoSplitLargestUtxo }</div>
          </div>
        }
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
          <label className="switch">
            <input
              type="checkbox"
              checked={ this.state.utxoSplitShowUtxoList } />
            <div
              className="slider"
              onClick={ this.toggleSplitUtxoList }></div>
          </label>
          <div
            className="toggle-label margin-right-15 pointer iguana-core-toggle"
            onClick={ this.toggleSplitUtxoList }>
            { translate('TOOLS.SHOW_UTXO_LIST') }
          </div>
        </div>
        { this.state.utxoSplitShowUtxoList &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            { this.renderUTXOSplitMergeResponse('split') }
          </div>
        }
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-20 padding-bottom-20">
          <label
            className="control-label col-sm-2 no-padding-left"
            htmlFor="kmdWalletSendTo">{ translate('TOOLS.UTXO_SIZES') }</label>
          <input
            type="text"
            className="form-control col-sm-3"
            name="utxoSplitPairs"
            onChange={ this.updateInput }
            value={ this.state.utxoSplitPairs }
            placeholder={ translate('TOOLS.UTXO_SIZES') }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left padding-top-20 padding-bottom-20">
          <label
            className="control-label col-sm-2 no-padding-left"
            htmlFor="kmdWalletSendTo">{ translate('TOOLS.NUMBER_OF_PAIRS') }</label>
          <input
            type="text"
            className="form-control col-sm-3"
            name="utxoSplitPairsCount"
            onChange={ this.updateInput }
            value={ this.state.utxoSplitPairsCount }
            placeholder={ translate('TOOLS.NUMBER_OF_PAIRS') }
            autoComplete="off"
            required />
        </div>
        <div className="col-sm-12 form-group form-material no-padding-left margin-top-10 padding-bottom-10">
          <button
            type="button"
            className="btn btn-info col-sm-2"
            onClick={ this.splitUtxoApproximate }>
            { translate('TOOLS.CALC_TOTAL_OUT_SIZE') }
          </button>
          <button
            type="button"
            className="btn btn-info col-sm-2 margin-left-40"
            onClick={ this.splitUtxo }>
            { translate('TOOLS.SPLIT_UTXO') }
          </button>
        </div>
        { this.state.splitUtxoApproximateVal &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            { translate('TOOLS.TOTAL_OUT_SIZE') }: { this.state.splitUtxoApproximateVal }
          </div>
        }
        {
          /*this.state.utxoSplitRawtx &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            Rawtx: <div style={{ wordBreak: 'break-all' }}>{ this.state.utxoSplitRawtx }</div>
          </div>*/
        }
        { this.state.utxoSplitPushResult &&
          <div className="col-sm-12 form-group form-material no-padding-left margin-top-10">
            TXID: <div className="blur selectable word-break--all">{ this.state.utxoSplitPushResult }</div>
            { isKomodoCoin(this.state.utxoSplitCoin.split('|')[0]) &&
              <div className="margin-top-10">
                <button
                  type="button"
                  className="btn btn-sm white btn-dark waves-effect waves-light pull-left"
                  onClick={ () => this.openExplorerWindow(this.state.utxoSplitPushResult, this.state.utxoSplitCoin.split('|')[0]) }>
                  <i className="icon fa-external-link"></i> { translate('INDEX.OPEN_TRANSACTION_IN_EPLORER', this.state.utxoSplitCoin.split('|')[0]) }
                </button>
              </div>
            }
          </div>
        }
      </div>
    );
  }
}

export default ToolsSplitUTXO;