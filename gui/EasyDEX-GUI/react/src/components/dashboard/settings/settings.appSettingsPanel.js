import React from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import translate from '../../../translate/translate';
import Config from '../../../config';
import {
  getAppConfig,
  getAppInfo,
  resetAppConfig,
  resetSPVCache,
  saveAppConfig,
  skipFullDashboardUpdate,
  triggerToaster,
  apiElectrumKvServersList,
} from '../../../actions/actionCreators';
import Store from '../../../store';
import mainWindow from '../../../util/mainWindow';

class AppSettingsPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      appSettings: {},
      appConfigSchema: {},
    };
    this._saveAppConfig = this._saveAppConfig.bind(this);
    this._resetAppConfig = this._resetAppConfig.bind(this);
    this._skipFullDashboardUpdate = this._skipFullDashboardUpdate.bind(this);
    this._resetSPVCache = this._resetSPVCache.bind(this);
    this._apiElectrumKvServersList = this._apiElectrumKvServersList.bind(this);
    this.updateInput = this.updateInput.bind(this);
  }

  _apiElectrumKvServersList() {
    apiElectrumKvServersList()
    .then((res) => {
      if (res.msg === 'success') {
        Store.dispatch(
          triggerToaster(
            translate('SETTINGS.DOWNLOAD_KV_ELECTRUMS_DONE'),
            translate('INDEX.SETTINGS'),
            'success'
          )
        );
      } else {
        Store.dispatch(
          triggerToaster(
            translate('SETTINGS.DOWNLOAD_KV_ELECTRUMS_ERR'),
            translate('INDEX.SETTINGS'),
            'error'
          )
        );
      }
    });
  }

  _resetSPVCache() {
    Store.dispatch(resetSPVCache());
  }

  componentWillMount() {
    const _appConfigSchema = mainWindow.appConfigSchema;
    const _appSettings = this.props.Settings.appSettings ? this.props.Settings.appSettings : Object.assign({}, mainWindow.appConfig);

    this.setState(Object.assign({}, this.state, {
      appConfigSchema: _appConfigSchema,
      appSettings: _appSettings,
    }));
  }

  componentDidMount(props) {
    Store.dispatch(getAppConfig());
    Store.dispatch(getAppInfo());
  }

  _skipFullDashboardUpdate() {
    Store.dispatch(skipFullDashboardUpdate(!this.props.Dashboard.skipFullDashboardUpdate));
  }

  _resetAppConfig() {
    Store.dispatch(resetAppConfig());
  }

  _saveAppConfig() {
    const _appSettings = this.state.appSettings;
    let _appSettingsPristine = Object.assign({}, this.props.Settings.appSettings);
    let isError = false;
    let saveAfterPathCheck = false;

    for (let key in _appSettings) {
      if (typeof _appSettings[key] !== 'object') {
        _appSettingsPristine[key] = this.state.appConfigSchema[key] && this.state.appConfigSchema[key].type === 'number' ? Number(_appSettings[key]) : _appSettings[key];

        if (this.state.appConfigSchema[key] &&
            this.state.appConfigSchema[key].type === 'folder' &&
            _appSettings[key] &&
            _appSettings[key].length) {
          const _testLocation = mainWindow.testLocation;
          saveAfterPathCheck = true;

          _testLocation(_appSettings[key])
          .then((res) => {
            if (res === -1) {
              isError = true;
              Store.dispatch(
                triggerToaster(
                  this.renderLB('TOASTR.KOMODO_DATADIR_INVALID'),
                  translate('INDEX.SETTINGS'),
                  'error',
                  false
                )
              );
            } else if (res === false) {
              isError = true;
              Store.dispatch(
                triggerToaster(
                  this.renderLB('TOASTR.KOMODO_DATADIR_NOT_DIR'),
                  translate('INDEX.SETTINGS'),
                  'error',
                  false
                )
              );
            } else {
              Store.dispatch(saveAppConfig(_appSettingsPristine));
            }
          });
        }
      } else {
        for (let keyChild in _appSettings[key]) {
          _appSettingsPristine[key][keyChild] = this.state.appConfigSchema[key][keyChild].type === 'number' ? Number(_appSettings[key][keyChild]) : _appSettings[key][keyChild];
        }
      }
    }

    delete _appSettingsPristine.token;

    if (!saveAfterPathCheck) {
      Store.dispatch(saveAppConfig(_appSettingsPristine));
      mainWindow.appConfig = _appSettingsPristine;
    }
  }

  renderLB(_translationID) {
    const _translationComponents = translate(_translationID).split('<br>');

    return _translationComponents.map((_translation) =>
      <span key={ `translate-${Math.random(0, 9) * 10}` }>
        {_translation}
        <br />
      </span>
    );
  }

  renderSelectOptions(data, translateSelector, name) {
    let _items = [];

    for (let i = 0; i < data.length; i++) {
      _items.push(
        <option
          key={ `settings-${name}-opt-${i}` }
          value={ data[i] }>
          { translate(`${translateSelector}.${data[i].toUpperCase()}`) }
        </option>
      );
    }

    return _items;
  }

  renderConfigEditForm() {
    const _appConfig = this.state.appSettings;
    let items = [];

    for (let key in _appConfig) {
      if (this.state.appConfigSchema[key] &&
          typeof _appConfig[key] === 'object') {
        if ((this.state.appConfigSchema[key].display && this.state.appConfigSchema[key].type !== 'select') ||
            (this.state.appConfigSchema[key].display && this.state.appConfigSchema[key].type === 'select' && Config.experimentalFeatures)) {
          items.push(
            <tr key={ `app-settings-${key}` }>
              <td className="padding-15">
                { this.state.appConfigSchema[key].displayName ? this.state.appConfigSchema[key].displayName : key }
                { this.state.appConfigSchema[key].info &&
                  <i
                    className="icon fa-question-circle settings-help"
                    data-tip={ this.state.appConfigSchema[key].info }
                    data-for="appSettings1"
                    data-html={ true }></i>
                }
                <ReactTooltip
                  id="appSettings1"
                  effect="solid"
                  className="text-left" />
              </td>
              <td className="padding-15"></td>
            </tr>
          );

          for (let _key in _appConfig[key]) {
            items.push(
              <tr key={ `app-settings-${key}-${_key}` }>
                <td className="padding-15 padding-left-30">
                  { this.state.appConfigSchema[key][_key].displayName ? this.state.appConfigSchema[key][_key].displayName : _key }
                  { this.state.appConfigSchema[key][_key].info &&
                    <i
                      className="icon fa-question-circle settings-help"
                      data-tip={ this.state.appConfigSchema[key][_key].info }
                      data-html={ true }
                      data-for="appSettings2"></i>
                  }
                  <ReactTooltip
                    id="appSettings2"
                    effect="solid"
                    className="text-left" />
                </td>
                <td className="padding-15">
                  { this.state.appConfigSchema[key][_key].type === 'number' &&
                    <input
                      type="number"
                      pattern="[0-9]*"
                      name={ `${key}__${_key}` }
                      value={ _appConfig[key][_key] }
                      onChange={ (event) => this.updateInputSettings(event, key, _key) } />
                  }
                  { (this.state.appConfigSchema[key][_key].type === 'string' ||
                    this.state.appConfigSchema[key][_key].type === 'folder') &&
                    <input
                      type="text"
                      name={ `${key}__${_key}` }
                      value={ _appConfig[key][_key] }
                      className={ this.state.appConfigSchema[key][_key].type === 'folder' ? 'full-width': '' }
                      onChange={ (event) => this.updateInputSettings(event, key, _key) } />
                  }
                  { this.state.appConfigSchema[key][_key].type === 'boolean' &&
                    <span className="pointer toggle">
                      <label className="switch">
                        <input
                          type="checkbox"
                          name={ `${key}__${_key}` }
                          value={ _appConfig[key] }
                          checked={ _appConfig[key][_key] }
                          readOnly />
                        <div
                          className="slider"
                          onClick={ (event) => this.updateInputSettings(event, key, _key) }></div>
                      </label>
                    </span>
                  }
                </td>
              </tr>
            );

            if (key === 'spv' &&
                _key === 'cache' &&
                this.props.Settings.appInfo &&
                this.props.Settings.appInfo.cacheSize &&
                this.props.Settings.appInfo.cacheSize !== '2 Bytes') {
              items.push(
                <tr key={ `app-settings-${key}-${_key}-size` }>
                  <td
                    colSpan="2"
                    className="padding-15 padding-left-30">
                    { translate('SETTINGS.CURRENT_CACHE_SIZE') }: <strong>{ this.props.Settings.appInfo.cacheSize }</strong>
                    <button
                      type="button"
                      className="btn btn-info waves-effect waves-light margin-left-30"
                      onClick={ this._resetSPVCache }>
                      { translate('SETTINGS.CLEAR_CACHE') }
                    </button>
                  </td>
                </tr>
              );
            }

            if (key === 'spv' &&
                _key === 'syncServerListFromKv') {
              items.push(
                <tr key={ `app-settings-${key}-${_key}-size` }>
                  <td
                    colSpan="2"
                    className="padding-15">
                    <button
                      type="button"
                      className="btn btn-info waves-effect waves-light margin-left-15"
                      onClick={ this._apiElectrumKvServersList }>
                      { translate('SETTINGS.DOWNLOAD_KV_ELECTRUMS') }
                    </button>
                  </td>
                </tr>
              );
            }
          }
        }
      } else {
        if ((this.state.appConfigSchema[key] && this.state.appConfigSchema[key].display && this.state.appConfigSchema[key].type !== 'select') ||
            (this.state.appConfigSchema[key] && this.state.appConfigSchema[key].display && this.state.appConfigSchema[key].type === 'select' && Config.experimentalFeatures)) {
          items.push(
            <tr key={ `app-settings-${key}` }>
              <td className="padding-15">
                { this.state.appConfigSchema[key].displayName ? this.state.appConfigSchema[key].displayName : key }
                { this.state.appConfigSchema[key].info &&
                  <i
                    className="icon fa-question-circle settings-help"
                    data-tip={ this.state.appConfigSchema[key].info }
                    data-html={ true }
                    data-for="appSettings3"></i>
                }
                <ReactTooltip
                  id="appSettings3"
                  effect="solid"
                  className="text-left" />
              </td>
              <td className="padding-15">
                { this.state.appConfigSchema[key].type === 'number' &&
                  <input
                    type="number"
                    pattern="[0-9]*"
                    name={ `${key}` }
                    value={ _appConfig[key] }
                    onChange={ (event) => this.updateInputSettings(event, key) } />
                }
                { (this.state.appConfigSchema[key].type === 'string' ||
                  this.state.appConfigSchema[key].type === 'folder') &&
                  <input
                    type="text"
                    name={ `${key}` }
                    value={ _appConfig[key] }
                    className={ this.state.appConfigSchema[key].type === 'folder' ? 'full-width': '' }
                    onChange={ (event) => this.updateInputSettings(event, key) } />
                }
                { this.state.appConfigSchema[key].type === 'boolean' &&
                  <span className="pointer toggle">
                    <label className="switch">
                      <input
                        type="checkbox"
                        name={ `${key}` }
                        value={ _appConfig[key] }
                        checked={ _appConfig[key] }
                        readOnly />
                      <div
                        className="slider"
                        onClick={ (event) => this.updateInputSettings(event, key) }></div>
                    </label>
                  </span>
                }
                { this.state.appConfigSchema[key].type === 'select' &&
                  Config.experimentalFeatures &&
                  <select
                    className="form-control select-settings"
                    name={ `${key}` }
                    value={ _appConfig[key] }
                    onChange={ (event) => this.updateInputSettings(event, key) }>
                    { this.renderSelectOptions(this.state.appConfigSchema[key].data, this.state.appConfigSchema[key].translateSelector, key) }
                  </select>
                }
              </td>
            </tr>
          );
        }
      }
    }

    items.push(
      <tr key={ `kmd-main-sync-only` }>
        <td className="padding-15">
          { translate('SETTINGS.KMD_MAIN_SYNC_ONLY') }
          <i
            className="icon fa-question-circle settings-help"
            data-tip={ translate('SETTINGS.RPC_FETCH_ONLY_DESC') }
            data-html={ true }
            data-for="appSettings4"></i>
          <ReactTooltip
            id="appSettings4"
            effect="solid"
            className="text-left" />
        </td>
        <td className="padding-15">
          <span className="pointer toggle">
            <label className="switch">
              <input
                type="checkbox"
                name={ `kmd-main-sync-only` }
                value={ this.props.Dashboard.skipFullDashboardUpdate }
                checked={ this.props.Dashboard.skipFullDashboardUpdate }
                readOnly />
              <div
                className="slider"
                onClick={ this._skipFullDashboardUpdate }></div>
            </label>
          </span>
        </td>
      </tr>
    );

    return items;
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  updateInputSettings(e, parentKey, childKey) {
    let _appSettings = this.state.appSettings;
    let _appSettingsPrev = Object.assign({}, _appSettings);

    if (!childKey &&
        this.state.appConfigSchema[parentKey].type === 'boolean') {
      _appSettings[parentKey] = typeof _appSettings[parentKey] !== undefined ? !_appSettings[parentKey] : !this.state.appSettings[parentKey];
    } else if (
      childKey &&
      this.state.appConfigSchema[parentKey][childKey].type === 'boolean'
    ) {
      _appSettings[parentKey][childKey] = typeof _appSettings[parentKey][childKey] !== undefined ? !_appSettings[parentKey][childKey] : !this.state.appSettings[parentKey][childKey];
    } else if (
      (!childKey && this.state.appConfigSchema[parentKey].type === 'number') ||
      (childKey && this.state.appConfigSchema[parentKey][childKey].type === 'number')
    ) {
      if (!childKey) {
        if (e.target.value === '') {
          _appSettings[e.target.name] = _appSettingsPrev[e.target.name];
        } else {
          _appSettings[e.target.name] = e.target.value.replace(/[^0-9]+/g, '');
        }
      } else {
        if (e.target.value === '') {
          _appSettings[parentKey][childKey] = _appSettingsPrev[parentKey][childKey];
        } else {
          _appSettings[parentKey][childKey] = e.target.value.replace(/[^0-9]+/g, '');
        }
      }
    } else {
      _appSettings[e.target.name] = e.target.value;
    }

    this.setState({
      appSettings: _appSettings,
    });
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12 padding-top-15">
            <p>
              <strong>{ translate('SETTINGS.CONFIG_RESTART_REQUIRED') }</strong>
            </p>
            <table>
              <tbody>
              { this.renderConfigEditForm() }
              </tbody>
            </table>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-xs-12 text-align-center padding-top-35 padding-bottom-30">
            <button
              type="button"
              className="btn btn-primary waves-effect waves-light"
              onClick={ this._saveAppConfig }>
              { translate('SETTINGS.SAVE_APP_CONFIG') }
            </button>
            <button
              type="button"
              className="btn btn-primary waves-effect waves-light margin-left-30"
              onClick={ this._resetAppConfig }>
              { translate('SETTINGS.RESET_TO_DEFAULT') }
            </button>
          </div>
        </div>
      </div>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    Settings: state.Settings,
    Dashboard: {
      skipFullDashboardUpdate: state.Dashboard.skipFullDashboardUpdate,
    },
  };
};

export default connect(mapStateToProps)(AppSettingsPanel);