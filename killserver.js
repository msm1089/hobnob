const shell = require('node-powershell');
let ps = new shell({
  executionPolicy: 'Bypass',
  noProfile: true
});

const cmdStr = `taskkill /PID (netstat -ano | findstr :${process.env.SERVER_PORT} | select -First 1).Replace(" ","").split("G")[1] /F`
ps.addCommand(cmdStr)
ps.invoke().then(output => {
  console.log(output);
  ps.dispose();
}).catch(err => {
  console.log(err);
  ps.dispose();
});