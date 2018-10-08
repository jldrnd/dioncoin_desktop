import React from 'react';
import translate from '../../../translate/translate';

const { shell } = window.require('electron');

class About extends React.Component {
  constructor() {
    super();
  }

  openExternalWindow(url) {
    return shell.openExternal(url);
  }

  render() {
    return (
      <div className="page margin-left-0">
        <div className="page-content">
          <h2>{ translate('ABOUT.ABOUT_AGAMA') }</h2>
          <p>{ translate('ABOUT.AGAMA_MODES') }</p>
          <ul className="padding-bottom-20">
            <li>
              <span className="font-weight-600">{ translate('INDEX.NATIVE_MODE') }</span>:&nbsp;
              { translate('ABOUT.NATIVE_MODE_DESC') }
            </li>
            <li>
              <span className="font-weight-600">{ translate('INDEX.SPV_MODE') }</span>:&nbsp;
              { translate('ADD_COIN.LITE_MODE_DESC') }
            </li>
          </ul>

          <p className="font-weight-600 padding-bottom-20">{ translate('ABOUT.AGAMA_NOTE') }</p>

          <div className="font-weight-600">{ translate('ABOUT.TESTERS') }</div>
          { translate('ABOUT.TESTERS_P1') } <a className="link" onClick={ () => this.openExternalWindow('https://komodoplatform.com/komodo-wallets') }>{ translate('ABOUT.TESTERS_P2') }</a>.&nbsp;
          { translate('ABOUT.TESTERS_P3') } <a className="link" onClick={ () => this.openExternalWindow('https://discordapp.com/channels/412898016371015680/453204571393622027') }>#agama-wallet</a> Discord { translate('ABOUT.CHANNEL') }. <a className="link" onClick={ () => this.openExternalWindow('https://komodoplatform.com/discord') }>{ translate('ABOUT.GET_AN_INVITE') }</a> { translate('ABOUT.GET_AN_INVITE_P2') }.&nbsp;
          { translate('ABOUT.TESTERS_P4') }

          <div className="padding-top-20">{ translate('ABOUT.AGAMA_DAPPS') }</div>
          <ul>
            <li>
              <span className="font-weight-600">Jumblr</span>: { translate('ABOUT.JUMBLR_DESC') }
            </li>
            <li>
              <span className="font-weight-600">BarterDEX</span>: { translate('ABOUT.BARTER_DEX_DESC_ALT') }
            </li>
          </ul>
        </div>
      </div>
    );
  }
}

export default About;