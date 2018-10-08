import React from 'react';
import WalletMain from './walletMain';
import Store from '../../store';
import {
  getDexCoins,
  activeHandle,
  apiElectrumCoins,
  loadAddressBook,
} from '../../actions/actionCreators';
import mainWindow from '../../util/mainWindow';
import Config from '../../config';

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coins: null,
    };
  }

  componentDidMount() {
    const appVersion = mainWindow.appBasicInfo;

    if (appVersion) {
      const _arch = `${mainWindow.arch === 'x64' ? '' : (mainWindow.arch === 'spv-only' ? '-spv-only' : '-32bit')}-beta`;
      const _version = `v${appVersion.version.replace('version=', '')}${_arch}`;
      
      document.title = `${appVersion.name} (${_version})`;
    }

    // prevent drag n drop external files
    document.addEventListener('dragover', event => event.preventDefault());
    document.addEventListener('drop', event => event.preventDefault());

    // apply dark theme
    if (Config.darkmode) {
      document.body.setAttribute('darkmode', true);
    }
  }

  componentWillMount() {
    Store.dispatch(loadAddressBook());
    Store.dispatch(getDexCoins());
    Store.dispatch(activeHandle());
    Store.dispatch(apiElectrumCoins());
  }

  render() {
    return (
      <WalletMain />
    );
  }
}

export default Main;