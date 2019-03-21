//var cmd = require('node-cmd');
//cmd.run('npm run serve');

var exec = require('child_process').exec;
exec('babel-node src/index.js', { windowsHide: true });
