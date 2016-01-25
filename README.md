# Magnacarto Node.js bindings

**Experimental, work in progress.**

Provides node.js bindings for [omniscale/magnacarto](https://github.com/omniscale/magnacarto) through [gmgeo/libmagnacarto](https://github.com/gmgeo/libmagnacarto).

## API

`buildFromFile(file)`
expects a file path of a .mml file and outputs a Mapnik or MapServer style string.

For available options see [gmgeo/libmagnacarto](https://github.com/gmgeo/libmagnacarto).

## Usage

```
var Magnacarto = require('magnacarto');

var mc = new Magnacarto({
    builderType: 'mapnik3'
});

var result = mc.buildFromFile('project.mml');
```
