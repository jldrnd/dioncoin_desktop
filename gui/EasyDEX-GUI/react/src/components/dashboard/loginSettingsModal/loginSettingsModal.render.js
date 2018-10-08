import React from 'react';
import translate from '../../../translate/translate';
import About from '../about/about';
import Settings from '../settings/settings';

export const LoginSettingsModalRender = function() {
  return (
    <div>
      <div className={ `modal modal-3d-sign login-settings-modal ff ${this.state.className}` }>
        <div
          onClick={ this.closeLoginSettingsModal }
          className="modal-close-overlay"></div>
        <div className="modal-dialog modal-center modal-lg">
          <div
            onClick={ this.closeLoginSettingsModal }
            className="modal-close-overlay"></div>
          <div className="modal-content">
            <div className="modal-header bg-orange-a400 wallet-send-header">
              <button
                type="button"
                className="close white"
                onClick={ this.closeLoginSettingsModal }>
                <span>×</span>
              </button>
              <h4 className="modal-title white">
                { translate(this.props.section === 'about' ? 'ABOUT.ABOUT_AGAMA' : 'INDEX.SETTINGS') }
              </h4>
            </div>
            <div className="modal-body modal-body-container">
              { this.props.section === 'settings' &&
                <Settings disableWalletSpecificUI="true" />
              }
              { this.props.section === 'about' &&
                <About />
              }
            </div>
          </div>
        </div>
      </div>
      <div className={ `modal-backdrop ${this.state.className}` }></div>
    </div>
  );
};