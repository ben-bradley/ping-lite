ping-lite [![Build Status](https://secure.travis-ci.org/ben-bradley/ping-lite.png)](http://travis-ci.org/ben-bradley/ping-lite) [![NPM](https://nodei.co/npm/ping-lite.png?downloads=true)](https://nodei.co/npm/ping-lite/)
=========
A simple ping module for NodeJS apps.

Install
=======
`npm install ping-lite`

Test
====
`cd node_modules/ping-lite && mocha`

Usage
=====
```javascript
var Ping = require('ping-lite');

var ping = new Ping('8.8.8.8');

ping.send(function(err, ms) {
  console.log(this._host+' responded in '+ms+'ms.');
});
```

Events
======
- `error` = When the `._bin` throws an error
- `result` = When the `._bin` completes, no response returns __null__

Methods
=======
- **#send(callback)** accepts an optional callback that returns an error if there's an issue with theh `._bin`, a `null` if there's no response or an `Integer` if the host responds.
- **#start(callback)** calls `#send` every 5 seconds until `#stop` is called
- **#stop()** stops active pings

Examples
========
```javascript
// send one ping & handle results with callbacks
var Ping = require('ping-lite');

var ping = new Ping('8.8.8.8');

ping.send(function(err, ms) {
  console.log(this._host+' responded in '+ms+'ms.');
});
```
```javascript
// send pings until stopped & handle results with callbacks
var Ping = require('ping-lite');

var ping = new Ping('8.8.8.8');

ping.start(function(err, ms) {
  console.log(this._host+' responded in '+ms+'ms.');
});

setTimeout(function() {
  ping.stop();
}, 20000);
```
```javascript
// send one ping & handle results with events
var Ping = require('ping-lite');

var ping = new Ping('8.8.8.8');

ping.on('error', function(err) {
  console.log('uhoh: ',err);
});

ping.on('result', function(err, ms) {
  console.log(this._host+' responded in '+ms+'ms.');
});

ping.send(); // or ping.start();
```
