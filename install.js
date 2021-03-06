var AdmZip = require('adm-zip'),
    fs = require('fs'),
    https = require('follow-redirects').https,
    path = require('path'),
    sh = require('shelljs');

var config ={};
config.basedir = 'magnacarto';
config.version = 'v0.2.3';
config.repositoryUrl = 'https://github.com/gmgeo/libmagnacarto';
config.repositoryDest = path.join('src', 'github.com', 'gmgeo', 'libmagnacarto');

switch (process.platform) {
    case 'linux':
        config.platform = 'linux';
        break;
    case 'darwin':
        config.platform = 'darwin';
        break;
    default:
        config.platform = 'unsupported';
}

switch (process.arch) {
    case 'x64':
        config.arch = 'x64';
        break;
    case 'ia32':
        config.arch = 'x86';
        break;
}

var downloadUrl = config.repositoryUrl + '/releases/download/' + config.version +
    '/libmagnacarto-' + config.platform + '-' + config.arch + '.zip';

var download = function (url, dest, cb) {
    var file = fs.createWriteStream(dest);
    var request = https.get(url, function(response) {
        response.pipe(file);
        file.on('finish', function() {
            file.close(cb);  // close() is async, call cb after close completes.
        });
    }).on('error', function(err) { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        if (cb) cb(err.message);
    });
};

var build = function () {
    if (!sh.which('git') || !sh.which('go') || !sh.which('make')) {
      sh.echo('Building from source requires git, go and make. Exiting.');
      sh.exit(1);
    }

    if (sh.exec('git clone --branch ' + config.version + ' ' + config.repositoryUrl +
        '.git ' + config.repositoryDest).code !== 0) {
      sh.echo('Cloning repository failed.');
      sh.exit(1);
    }

    sh.env['GOPATH'] = sh.pwd();
    sh.env['GO15VENDOREXPERIMENT'] = 1;
    sh.env['PATH'] += path.delimiter + path.join(sh.pwd(), 'bin');

    if (sh.exec('go get github.com/Masterminds/glide').code !== 0) {
      sh.echo('Getting glide failed.');
      sh.exit(1);
    }

    sh.cd(path.join('src', 'github.com', 'Masterminds', 'glide'));

    if (sh.exec('make bootstrap').code == 0) {
        if (sh.exec('make build').code != 0) {
            sh.echo('Building glide failed.');
            sh.exit(1);
        }
    }
    else {
        sh.echo('Bootstrapping glide failed.');
        sh.exit(1);
    }

    sh.cd(path.join('..', '..', 'gmgeo', 'libmagnacarto'));

    if (sh.exec('glide install').code !== 0) {
      sh.echo('Installing dependencies failed.');
      sh.exit(1);
    }

    if (sh.exec('make').code !== 0) {
      sh.echo('Building library failed.');
      sh.exit(1);
    }

    sh.mv(path.join('build', 'libmagnacarto.*'), path.join('..', '..', '..', '..', 'bin'));
};

sh.rm('-rf', config.basedir);
sh.mkdir(config.basedir);
sh.cd(config.basedir);
sh.mkdir('bin');

if (config.platform != 'unsupported') {
    download(downloadUrl, 'bin/lib.zip', function (e) {
        if (!e) {
            var zip = new AdmZip('bin/lib.zip');
            zip.extractAllTo('bin/', true);
            fs.unlink('bin/lib.zip');
        }
        else {
            build();
        }
    });
}
else {
    build();
}
