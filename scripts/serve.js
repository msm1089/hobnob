//var cmd = require('node-cmd');
//cmd.run('npm run serve');

var exec = require('child_process').exec;
exec('node dist/index.js', { windowsHide: true });
