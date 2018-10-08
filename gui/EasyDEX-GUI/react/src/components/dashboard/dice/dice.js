import React from 'react';
import { connect } from 'react-redux';
import {
  getDiceList,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import Config from '../../../config';
import mainWindow from '../../../util/mainWindow';
import diceRender from './dice.render';
const { shell } = window.require('electron');

const DICE_LIST_UPDATE_INTERVAL = 60; // sec

class Dice extends React.Component {
  constructor() {
    super();
    this.state = {
      coin: 'KMD',
    };
    this.diceListInterval = null;
  }

  componentWillMount() {
    Store.dispatch(getDiceList(this.state.coin));

    this.diceListInterval = setInterval(() => {
      Store.dispatch(getDiceList(this.state.coin));
    }, DICE_LIST_UPDATE_INTERVAL * 1000);
  }

  componentWillUnmount() {
    clearInterval(this.diceListInterval);
  }

  render() {
    return diceRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    ActiveCoin: {
      mode: state.ActiveCoin.mode,
      coin: state.ActiveCoin.coin,
    },
  };
};

export default connect(mapStateToProps)(Dice);