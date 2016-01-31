var ffi = require('ffi'),
    path = require('path'),
    Struct = require('ref-struct');

var McReturn = Struct({
    'output': 'string',
    'err': 'string'
});

var Opts = Struct({
    'builderType': 'string',
    'baseDir': 'string',
    'sqliteDir': 'string',
    'fontDir': 'string',
    'shapeDir': 'string',
    'imageDir': 'string',
    'relPaths': 'bool',
    'msNoMapBlock': 'bool'
});

var libmagnacarto = ffi.Library(path.normalize(path.join(__dirname, '..', 'magnacarto', 'bin', 'libmagnacarto.so')), {
    'buildFromString': [ McReturn, [ 'string', Opts ] ],
    'buildFromFile': [ McReturn, [ 'string', Opts ] ]
});

var Magnacarto = function (config) {
    this.options = {};

    if (!config.builderType || typeof config.builderType != 'string') {
        this.options.builderType = 'mapnik2';
    }
    else {
        this.options.builderType = config.builderType;
    }
    if (config.baseDir && typeof config.baseDir == 'string') {
        this.options.baseDir = config.baseDir;
    }
    if (config.sqliteDir && typeof config.sqliteDir == 'string') {
        this.options.sqliteDir = config.sqliteDir;
    }
    if (config.fontDir && typeof config.fontDir == 'string') {
        this.options.fontDir = config.fontDir;
    }
    if (config.shapeDir && typeof config.shapeDir == 'string') {
        this.options.shapeDir = config.shapeDir;
    }
    if (config.imageDir && typeof config.imageDir == 'string') {
        this.options.imageDir = config.imageDir;
    }
    if (config.relPaths && typeof config.relPaths == 'boolean') {
        this.options.relPaths = config.relPaths;
    }
    if (config.msNoMapBlock && typeof config.msNoMapBlock == 'boolean') {
        this.options.msNoMapBlock = config.msNoMapBlock;
    }
};

Magnacarto.prototype.buildFromFile = function (mmlfile) {
    if (!mmlfile || typeof mmlfile != 'string') {
        throw new Error('Please specify a file path.');
    }

    var output = libmagnacarto.buildFromFile(path.resolve(mmlfile), this.getOpts());
    if (output.err != null) {
        throw output.err;
    }

    return output.output;
};

Magnacarto.prototype.buildFromString = function (mml) {
    if (!mml || typeof mml != 'string') {
        throw new Error('Please specify a MML string.');
    }

    if (!this.options.baseDir) {
        throw new Error('Please specify a base directory.');
    }

    var output = libmagnacarto.buildFromString(mml, this.getOpts());
    if (output.err != null) {
        throw new Error(output.err);
    }

    return output.output;
};

Magnacarto.prototype.getOpts = function () {
    var opt = new Opts;
    opt.builderType = '';
    opt.baseDir = '';
    opt.sqliteDir = '';
    opt.fontDir = '';
    opt.shapeDir = '';
    opt.imageDir = '';
    opt.relPaths = false;
    opt.nsNoMapBlock = false;
    var self = this;

    Object.keys(self.options).forEach(function (key) {
        if (Object.keys(Opts.fields).indexOf(key) > -1) {
            opt[key] = self.options[key];
        }
    });

    return opt;
};

module.exports = Magnacarto;
