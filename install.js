var path = require('path'),
    sh = require('shelljs');

var config ={};
config.basedir = 'magnacarto';
config.version = 'v0.1.0';
config.repositoryUrl = 'https://github.com/gmgeo/libmagnacarto.git';
config.repositoryDest = 'magnacarto/src/github.com/gmgeo/libmagnacarto';

if (!sh.which('git')) {
  sh.echo('This script requires git. Exiting.');
  sh.exit(1);
}

if (!sh.which('go')) {
  sh.echo('This script requires go. Exiting.');
  sh.exit(1);
}

if (!sh.which('make')) {
  sh.echo('This script requires make. Exiting.');
  sh.exit(1);
}

sh.rm('-rf', config.basedir);
sh.mkdir(config.basedir);
if (sh.exec('git clone --branch ' + config.version + ' ' + config.repositoryUrl +
    ' ' + config.repositoryDest).code !== 0) {
  sh.echo('Cloning repository failed.');
  sh.exit(1);
}

sh.cd(config.basedir);
sh.env['GOPATH'] = sh.pwd();
sh.env['PATH'] += path.delimiter + sh.pwd() + '/bin';

if (sh.exec('go get github.com/tools/godep').code !== 0) {
  sh.echo('Getting godep failed.');
  sh.exit(1);
}

sh.cd('src/github.com/gmgeo/libmagnacarto');

if (sh.exec('make').code !== 0) {
  sh.echo('Building library failed.');
  sh.exit(1);
}

sh.mv('build/libmagnacarto.*', '../../../../bin/');
