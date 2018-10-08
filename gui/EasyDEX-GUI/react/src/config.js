// obsolete(?)
let Config;
let _config = {
  iguanaCorePort: 7778,
  agamaPort: 17777,
  enableCacheApi: true,
  useBasiliskInstance: true,
  openAlias: false,
  debug: true,
  defaultLang: 'EN',
  cli: {
    passthru: true,
    default: true
  },
  iguanaLessMode: true,
  roundValues: true,
  native: {
    rpc2cli: false,
  },
  token: null,
};

try {
  const mainWindow = window.require('electron').remote.getGlobal('app');
  Config = mainWindow.appConfig;
  Config.token = mainWindow.appSessionHash;
} catch (e) {
  Config = _config;
}

export const agamaPort = Config.agamaPort;
export const token = Config.token;
export const rpc2cli = Config.native.rpc2cli;

export default Config;