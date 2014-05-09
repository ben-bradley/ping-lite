var spawn = require('child_process').spawn,
    events = require('events'),
    WIN = /^win/.test(process.platform),
    LIN = /^linux/.test(process.platform),
    MAC = /^darwin/.test(process.platform);

module.exports = Ping;

function Ping(host, options) {
  this._host = host;
  this._options = options;

  // EVENTS
  // ======
  events.EventEmitter.call(this);

  // BINARY DETECTION
  // ================
  if (WIN) {
    this._bin = 'c:/windows/system32/ping.exe';
    this._options = (options) ? options : [ '-n', '1', '-w', '5000', host ];

  }
  else if (LIN) {
    this._bin = '/bin/ping';
    this._options = (options) ? options : [ '-n', '-w 2', '-c 1', host ];
  }
  else if (MAC) {
    this._bin = '/sbin/ping';
    this._options = [ '-n', '-t 2', '-c 1', host ];
  }
  else {
    throw new Error('Could not detect your ping binary.');
  }

  this._i = 0;

  return this;
};

// PROTOTYPE EVENTS
// ================
Ping.prototype.__proto__ = events.EventEmitter.prototype;

// SEND A PING
// ===========
Ping.prototype.send = function(callback) {
  var self = this;
  this._ping = spawn(this._bin, this._options);

  this._ping.on('error', function(err) {
    if (callback)
      callback(err);
    else
      self.emit('error', err);
  });

  this._ping.stdout.on('data', function(data) {
    this._stdout = (this._stdout || '') + data;
  });

  this._ping.stderr.on('data', function(data) {
    this._stderr = (this._stderr || '') + data;
  });

  this._ping.on('exit', function(code) {
    var stdout = this.stdout._stdout,
        stderr = this.stderr._stderr,
        ms;

    if (WIN) {
      ms = stdout.match(/time=(.+?)ms/);
      ms = (ms && ms[1]) ? Number(ms[1]) : ms;
    }
    else if (LIN || MAC) {
      /* NEED TO BUILD THIS OUT
       * if no response, ms = 0 && err = null
       */
      ms = (stdout) ? stdout : ms;
    }

    if (callback)
      callback(ms);
    else
      self.emit('result', ms);
  });
};

Ping.prototype.start = function(callback) {
  var self = this;
  this._i = setInterval(function() {
    self.send(callback)
  }, 5000);
  self.send(callback);
};

Ping.prototype.stop = function() {
  clearInterval(this._i);
};
