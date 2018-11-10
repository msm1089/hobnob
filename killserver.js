const shell = require('node-powershell');
let ps = new shell({
  executionPolicy: 'Bypass',
  noProfile: true
});

ps.addCommand('taskkill /PID (netstat -ano | findstr :8080 | select -First 1).Replace(" ","").split("G")[1] /F')
ps.invoke().then(output => {
  console.log(output);
  ps.dispose();
}).catch(err => {
  console.log(err);
  ps.dispose();
});