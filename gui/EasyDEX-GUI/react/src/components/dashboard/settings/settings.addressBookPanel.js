import React from 'react';
import translate from '../../../translate/translate';
import { connect } from 'react-redux';
import {
  modifyAddressBook,
  loadAddressBook,
  triggerToaster,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import mainWindow from '../../../util/mainWindow';
import { cryptoCoins } from '../../../util/coinHelper';
import Config from '../../../config';

let _prepCoinsList;
let coins = cryptoCoins;

const prepCoinsList = () => {
  let _coins = [];

  for (let i = 0; i < coins.length; i++) {
    if (Config.experimentalFeatures ||
        (!Config.experimentalFeatures && (_coins[i] === 'KMD' || _coins[i] === 'CHIPS'))) {
      try {
        if (mainWindow &&
            mainWindow.electrumServers &&
            mainWindow.electrumServers[coins[i].toLowerCase()] &&
            coins[i] !== 'CHIPS') {
          _coins.push(coins[i]);
        }
      } catch (e) {
        console.warn('electron remote error' + e);
      }
    }
  }

  _prepCoinsList = _coins;

  return _coins.sort();
};

const SEED_TRIM_TIMEOUT = 5000;

class AddressBookPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      action: null,
      createNewItem: false,
      address: '',
      coin: 'KMD',
      title: '',
    };
    this.defaultState = JSON.parse(JSON.stringify(this.state));
    this.toggleCreateNewItem = this.toggleCreateNewItem.bind(this);
    this.triggerAction = this.triggerAction.bind(this);
    this.cancelAction = this.cancelAction.bind(this);
    this.save = this.save.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  toggleCreateNewItem() {
    this.setState({
      createNewItem: !this.state.createNewItem,
      address: '',
      coin: 'KMD',
      title: '',
    });
  }

  cancelAction() {
    this.setState({
      action: null,
      createNewItem: false,
      address: '',
      coin: '',
      title: '',
    });
  }

  triggerAction(id, type) {
    this.setState({
      action: {
        id,
        type,
      },
      address: id,
      coin: this.props.Settings.addressBook.obj[id].coin,
      title: this.props.Settings.addressBook.obj[id].title,
    });
  }

  save() {
    let oldAddressBookData = this.props.Settings.addressBook && this.props.Settings.addressBook.obj && Object.keys(this.props.Settings.addressBook.obj).length ? JSON.parse(JSON.stringify(this.props.Settings.addressBook.obj)) : {};

    oldAddressBookData[this.state.address] = {
      coin: this.state.coin,
      title: this.state.title,
    };

    let _validationMsg;
    const _validateAddress = mainWindow.addressVersionCheck(this.state.coin, this.state.address);

    if (_validateAddress === 'Invalid pub address') {
      _validationMsg = _validateAddress;
    } else if (!_validateAddress) {
      _validationMsg = `${this.state.address} ${translate('SEND.VALIDATION_IS_NOT_VALID_ADDR_P1')} ${this.state.coin} ${translate('SEND.VALIDATION_IS_NOT_VALID_ADDR_P2')}`;
    }

    // allow zc addresses
    if (this.state.coin === 'KMD' &&
        this.state.address.substring(0, 2) === 'zc' &&
        this.state.address.length === 95) {
      _validationMsg = null;
    }

    if (_validationMsg) {
      Store.dispatch(
        triggerToaster(
          _validationMsg,
          translate('TOASTR.WALLET_NOTIFICATION'),
          'error'
        )
      );
    } else {
      modifyAddressBook(oldAddressBookData)
      .then((res) => {
        if (res.msg === 'success') {
          this.cancelAction();

          Store.dispatch(
            triggerToaster(
              translate('SETTINGS.ADDRESS_BOOK_SAVED'),
              translate('SETTINGS.ADDRESS_BOOK'),
              'success'
            )
          );
          Store.dispatch(loadAddressBook());
        } else {
          Store.dispatch(
            triggerToaster(
              res.result,
              translate('SETTINGS.ADDRESS_BOOK'),
              'error'
            )
          );
        }
      });
    }
  }

  confirmAction(id, type) {
    if (type === 'delete') {
      let oldAddressBookData = this.props.Settings.addressBook && this.props.Settings.addressBook.obj && Object.keys(this.props.Settings.addressBook.obj).length ? JSON.parse(JSON.stringify(this.props.Settings.addressBook.obj)) : {};

      delete oldAddressBookData[id];

      modifyAddressBook(oldAddressBookData)
      .then((res) => {
        if (res.msg === 'success') {
          this.cancelAction();

          Store.dispatch(
            triggerToaster(
              translate('SETTINGS.ADDRESS_BOOK_SAVED'),
              translate('SETTINGS.ADDRESS_BOOK'),
              'success'
            )
          );
          Store.dispatch(loadAddressBook());
        } else {
          Store.dispatch(
            triggerToaster(
              res.result,
              translate('SETTINGS.ADDRESS_BOOK'),
              'error'
            )
          );
        }
      });
    } else {
      this.save();
    }
  }

  componentWillReceiveProps(props) {
    if (props.Dashboard &&
        props.Dashboard.activeSection !== 'settings') {
      this.setState(this.defaultState);
    }
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  renderCoinListSelectorOptions(coin) {
    let _items = [];
    let _coins = [];

    if (_prepCoinsList) {
      _coins = _prepCoinsList;
    } else {
      _coins = prepCoinsList();
    }
    for (let i = 0; i < _coins.length; i++) {
      _items.push(
        <option
          key={ `coind-stdout-coins-${i}` }
          value={ `${_coins[i]}` }>{ translate('CRYPTO.' + _coins[i]) + (_coins[i].toLowerCase() === 'kmd' ? ' (Chips/Assetchains)' : '') }</option>
      );
    }

    return _items;
  }

  renderAddressBook() {
    const _addressBookItems = this.props.Settings.addressBook && this.props.Settings.addressBook.obj ? this.props.Settings.addressBook.obj : {};
    let _items = [];

    for (let key in _addressBookItems) {
      if (!this.state.action || (this.state.action && this.state.action.id !== key)) {
        _items.push(
          <tr key={ `address-book-list-item-${key}` }>
            <td>
              <i
                onClick={ () => this.triggerAction(key) }
                className="icon fa-pencil-square margin-right-20"></i>
              <i
                onClick={ () => this.triggerAction(key, 'delete') }
                className="icon fa-trash"></i>
            </td>
            <td className="seletable word-break--all">{ key }</td>
            <td>{ translate('CRYPTO.' + _addressBookItems[key].coin) + (_addressBookItems[key].coin.toLowerCase() === 'kmd' ? ' (Chips/Assetchains)' : '') }</td>
            <td className="seletable">{ _addressBookItems[key].title }</td>
          </tr>
        );
      } else {
        _items.push(
          <tr key={ `address-book-list-item-${key}` }>
            { this.state.action.type === 'delete' &&
              <td colSpan="4">
                <div className="margin-bottom-10 margin-top-10">
                  <span className="word-break--all">{ translate('SETTINGS.ENTRY_REMOVE_CONFIRM', key) }</span>
                  <i
                    onClick={ () => this.confirmAction(key, 'delete') }
                    className="icon fa-check margin-left-20 margin-right-20"></i>
                  <i
                    onClick={ () => this.cancelAction() }
                    className="icon fa-close"></i>
                </div>
              </td>
            }
            { !this.state.action.type &&
              <td className="edit-block">
                <i
                  onClick={ () => this.confirmAction(key) }
                  className="icon fa-check margin-right-20 inline"></i>
                <i
                  onClick={ () => this.cancelAction() }
                  className="icon fa-close inline"></i>
              </td>
            }
            { !this.state.action.type &&
              <td>
                <input
                  type="text"
                  name="address"
                  className="form-control blur"
                  onChange={ this.updateInput }
                  autoComplete="off"
                  placeholder={ translate('SETTINGS.ADDRESS') }
                  value={ this.state.address || '' } />
              </td>
            }
            { !this.state.action.type &&
              <td>
                <select
                  className="form-control form-material"
                  name="coin"
                  value={ this.state.coin || '' }
                  onChange={ (event) => this.updateInput(event) }
                  autoFocus>
                  { this.renderCoinListSelectorOptions() }
                </select>
              </td>
            }
            { !this.state.action.type &&
              <td>
                <input
                  type="text"
                  name="title"
                  className="form-control blur"
                  onChange={ this.updateInput }
                  autoComplete="off"
                  placeholder={ translate('SETTINGS.TITLE') }
                  value={ this.state.title || '' } />
              </td>
            }
          </tr>
        );
      }
    }

    return (
      <table className="table table-hover dataTable table-striped pins-list-table">
        <thead>
          <tr>
            <th></th>
            <th>{ translate('SETTINGS.ADDRESS') }</th>
            <th>{ translate('SETTINGS.COIN') }</th>
            <th>{ translate('SETTINGS.TITLE') }</th>
          </tr>
        </thead>
        <tbody>
        { _items }
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>{ translate('SETTINGS.ADDRESS') }</th>
            <th>{ translate('SETTINGS.COIN') }</th>
            <th>{ translate('SETTINGS.TITLE') }</th>
          </tr>
        </tfoot>
      </table>
    );
  }

  render() {
    return (
      <div className="settings-address-book">
        <div className="row">
          <div className="col-sm-12">
            <div className="padding-bottom-20">{ translate('SETTINGS.THIS_SECTION_ALLOWS_YOU_TO_MANAGE_ADDRESS_BOOK') }</div>
          </div>
        </div>
        { this.props.Settings.addressBook &&
          this.props.Settings.addressBook.obj &&
          Object.keys(this.props.Settings.addressBook.obj).length > 0 &&
          <div className="row">
            <div className="col-sm-12">
            <div className="col-sm-12 col-xs-12 no-padding margin-bottom-20 text-right">
              <button
                type="button"
                className="btn btn-info waves-effect waves-light margin-bottom-5"
                onClick={ this.toggleCreateNewItem }>
                { !this.state.createNewItem ? translate('SETTINGS.CREATE_NEW_ENTRY') : translate('LOGIN.CANCEL') }
              </button>
            </div>
            { !this.state.createNewItem ? this.renderAddressBook() : null }
            </div>
          </div>
        }
        { (this.state.createNewItem || (this.props.Settings.addressBook && (!this.props.Settings.addressBook.obj || (this.props.Settings.addressBook.obj && Object.keys(this.props.Settings.addressBook.obj).length === 0)))) &&
          <div className="row">
            <div className="col-sm-6">
              <div
                className="address-book-form"
                autoComplete="off">
                <div className="form-group form-material floating">
                  <div className="form-group form-material floating text-left margin-top-20">
                    <input
                      type="text"
                      name="address"
                      className="form-control blur"
                      onChange={ this.updateInput }
                      autoComplete="off"
                      value={ this.state.address || '' } />
                    <label
                      className="floating-label"
                      htmlFor="address">{ translate('SETTINGS.ADDRESS') }</label>
                  </div>
                  <div className="form-group form-material floating text-left margin-top-60">
                    <select
                      className="form-control form-material"
                      name="coin"
                      value={ this.state.coin || '' }
                      onChange={ (event) => this.updateInput(event) }
                      autoFocus>
                      { this.renderCoinListSelectorOptions() }
                    </select>
                  </div>
                  <div className="form-group form-material floating text-left margin-top-60">
                    <input
                      type="text"
                      name="title"
                      className="form-control blur"
                      onChange={ this.updateInput }
                      autoComplete="off"
                      value={ this.state.title || '' } />
                    <label
                      className="floating-label"
                      htmlFor="title">{ translate('SETTINGS.TITLE') }</label>
                  </div>
                </div>
                <div className="col-sm-12 col-xs-12 text-align-center">
                  <button
                    type="button"
                    className="btn btn-primary waves-effect waves-light margin-bottom-5"
                    disabled={
                      !this.state.address ||
                      !this.state.coin ||
                      !this.state.title
                    }
                    onClick={ this.save }>
                    { translate('SETTINGS.SAVE') }
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    Settings: {
      addressBook: state.Settings.addressBook,
    },
  };
};

export default connect(mapStateToProps)(AddressBookPanel);