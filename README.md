ping-lite
=========
A simple ping module for NodeJS apps

Install
=======
`npm install git://github.com/ben-bradley/ping-lite`

Usage
=====
```javascript
var Ping = require('ping-lite');

var ping = new Ping('8.8.8.8');

ping.send(function(err, ms) {
  if (err)
    console.log(this._host+' didn\'t respond to ping.');
  else
    console.log(this._host+' responded in '+ms+'ms.');
});
```

Events
======
- `error` = When the `._bin` throws an error
- `result` = When the `._bin` completes, no response returns __null__
