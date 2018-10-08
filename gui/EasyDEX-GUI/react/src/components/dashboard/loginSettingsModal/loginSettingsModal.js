import React from 'react';
import { connect } from 'react-redux';
import translate from '../../../translate/translate';
import { toggleLoginSettingsModal } from '../../../actions/actionCreators';
import Store from '../../../store';

import { LoginSettingsModalRender } from './loginSettingsModal.render';

class LoginSettingsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      className: 'hide',
      open: false,
    };
    this.closeLoginSettingsModal = this.closeLoginSettingsModal.bind(this);
  }

  closeLoginSettingsModal() {
    this.setState(Object.assign({}, this.state, {
      className: 'show out',
    }));

    setTimeout(() => {
      Store.dispatch(toggleLoginSettingsModal(false));

      this.setState(Object.assign({}, this.state, {
        className: 'hide',
        open: false,
      }));
    }, 300);
  }

  componentWillReceiveProps(props) {
    if (props.Main &&
        props.Main.displayLoginSettingsModal !== this.state.open) {
      this.setState({
        className: props.Main.displayLoginSettingsModal ? 'show fade' : 'show out',
      });

      setTimeout(() => {
        this.setState(Object.assign({}, this.state, {
          open: props.Main.displayLoginSettingsModal,
          className: props.Main.displayLoginSettingsModal ? 'show in' : 'hide',
        }));
      }, props.Main.displayLoginSettingsModal ? 50 : 300);
    }
  }

  render() {
    return LoginSettingsModalRender.call(this);
  }
}

const mapStateToProps = (state) => {
  return {
    Main: state.Main,
  };
};

export default connect(mapStateToProps)(LoginSettingsModal);
