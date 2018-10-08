const devlog = (msg) => {
  const mainWindow = window.require('electron').remote.getGlobal('app');

  if (mainWindow.appConfig.dev) {
    console.warn(msg);
  }
}

export default devlog;