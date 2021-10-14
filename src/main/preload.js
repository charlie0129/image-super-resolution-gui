const { contextBridge, ipcRenderer} = require("electron");
// const path = require('path');

contextBridge.exposeInMainWorld("electron", {
  ipcRenderer: {
    myPing() {
      ipcRenderer.send("ipc-example", "ping");
    },
    on(channel, func) {
      const validChannels = ["ipc-example"];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ["ipc-example"];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    }
  }
});

// console.log();

// const appRoot =
//   process.platform === 'win32'
//     ? path.join(app.getAppPath(), '/../../../')
//     : path.join(app.getAppPath(), '/../../../../');
//
// const execRoot = path.dirname(app.getPath('exe'));
// export default execRoot;
