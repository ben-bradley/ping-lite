var spawn = require('child_process').spawn,
  util = require('util'),
  fs = require('fs'),
  EventEmitter = require('events').EventEmitter;

// https://variadic.me/posts/2013-10-22-bind-call-and-apply-in-javascript.html
var bind = Function.prototype.call.bind(Function.prototype.bind);

/**
 * Detect the OS
 * @returns {String} Returns a simple, human-friendly version of the OS
 */
function Platform() {
  if (/^win/.test(process.platform))
    return 'windows';
  else if (/^linux/.test(process.platform))
    return 'linux';
  else if (/^darwin/.test(process.platform))
    return 'mac';
}

/**
 * Construct the profile for spawning the binary
 * @param   {String} platform The human-friendly version of the OS. Valid options = [ 'windows', 'linux', 'mac' ]
 * @returns {Object} A Profile object that is assigned to the `.profile` property
 */
var Profile = function (platform) {
  /*
  if (WIN) {
    this._bin = 'c:/windows/system32/ping.exe';
    this._args = (options.args) ? options.args : [ '-n', '1', '-w', '5000', host ];
    this._regmatch = /time=(.+?)ms/;
  }
  else if (LIN) {
    this._bin = '/bin/ping';
    this._args = (options.args) ? options.args : [ '-n', '-w', '2', '-c', '1', host ];
    this._regmatch = /time=(.+?) ms/; // need to verify this
  }
  else if (MAC) {
    this._bin = '/sbin/ping';
    this._args = (options.args) ? options.args : [ '-n', '-t', '2', '-c', '1', host ];
    this._regmatch = /time=(.+?) ms/;
  }
  */
  if (platform === 'windows')
    return {
      bin: 'c:/windows/system32/ping.exe',
      args: ['-n', '1', '-w', '5000'],
      pingline: /\s*\d+\s+\d+\.\d+\.\d+\.\d+\s+.+/,
      parse: function (hop) {
        return {
          counter: Number(1),
          ip: hop[5],
          ms: hop.splice(2, 3).map(function (time) {
            return (time === '*') ? null : Number(time.replace(/ ms/, ''));
          })
        }
      }
    };
  else if (platform === 'linux')
    return {
      bin: '/bin/traceroute',
      args: ['-n', '-q', '1'],
      pingline: /\s*\d+\s+(\d+\.\d+\.\d+\.\d+\s+.+|\*)/,
      parse: function (hop) {
        hop = hop.trim().split(/\s+/);
        return {
          counter: Number(hop[0]),
          ip: (hop[1] === '*') ? null : hop[1],
          ms: (hop[2]) ? Number(hop[2]) : null
        };
      }
    };
  else if (platform === 'mac')
    return {
      bin: '/sbin/ping',
      args: ['-n', '-t', '2', '-c', '1'],
      pingline: /\d+ bytes from (\d+\.\d+\.\d+\.\d+)\: icmp_seq=(\d+) ttl=\d+ time=(\d+)/,
      //64 bytes from 170.48.11.162: icmp_seq=0 ttl=237 time=105.423 ms
      parse: function (pong) {
        var parts = pong.match(/\d+ bytes from (\d+\.\d+\.\d+\.\d+)\: icmp_seq=\d+ ttl=\d+ time=(\d+)/)
        return {
          ip: (parts[1] || null),
          ms: (parts[2]) ? Number(parts[2]) : null
        }
      }
    };
}

module.exports = Ping;

/**
 * The base ping class
 * @param   {String} host An FQDN or IP address to trace.
 * @returns {Object} Returns the base ping class.
 */
function Ping(host, options) {
  if (!host || typeof host !== 'string')
    throw new Error('host must be a string');

  this.host = host;
  this.platform = Platform();
  this.profile = new Profile(this.platform);
  this.options = {
    interval: 5000
  };

  for (var o in options) {
    this.options[o] = options[o];
  }

  this.reset();

  if (!fs.existsSync(this.profile.bin))
    throw new Error('Could not find ' + this.profile.bin);

  this.profile.args.push(this.host);

  return this;
}

util.inherits(Ping, EventEmitter);

/**
 * Helper to clear the properties.
 */
Ping.prototype.reset = function () {
  this.interval = 0;
  this.stdout = '';
  this.stderr = '';
  this.pong = {
    ip: null,
    ms: null
  };
}

Ping.prototype.send = function (callback) {
  this.reset();

  var ping = spawn(this.profile.bin, this.profile.args),
    stdout = this.stdout,
    stderr = this.stderr,
    pong = this.pong,
    parse = this.profile.parse,
    pingline = this.profile.pingline,
    emit = bind(this.emit, this);

  // collect & parse stdout
  ping.stdout.on('data', function (data) {
    stdout += data;
  });

  // collect stderr
  ping.stderr.on('data', function (data) {
    stderr += data;
  });

  // handle when the binary exits
  ping.on('exit', function (code) {
    var error = (code !== 0) ? new Error(stderr.replace(/\n\r*/, ' ').trim()) : null;

    var lines = stdout.split(/\n\r*/);
    for (var l in lines) {
      var line = lines.shift();
      if (pingline.test(line)) {
        pong = parse(line);
        emit('pong', pong);
      }
    }

    emit('done', error, pong);
    emit('result', pong.ms);

    if (callback)
      return callback(error, pong);
  });

}

Ping.prototype.start = function (callback) {
  var send = bind(this.send, this);
  this.interval = setInterval(function () {
    send(callback);
  }, this.options.interval);
  send(callback);
};

Ping.prototype.stop = function () {
  clearInterval(this.interval);
  this.emit('stop');
};





//
//var spawn = require('child_process').spawn,
//  events = require('events'),
//  fs = require('fs'),
//  WIN = /^win/.test(process.platform),
//  LIN = /^linux/.test(process.platform),
//  MAC = /^darwin/.test(process.platform);
//
//function Ping(host, options) {
//  if (!host)
//    throw new Error('You must specify a host to ping!');
//
//  this._host = host;
//  this._options = options = (options || {});
//
//  events.EventEmitter.call(this);
//
//  if (WIN) {
//    this._bin = 'c:/windows/system32/ping.exe';
//    this._args = (options.args) ? options.args : ['-n', '1', '-w', '5000', host];
//    this._regmatch = /time=(.+?)ms/;
//  } else if (LIN) {
//    this._bin = '/bin/ping';
//    this._args = (options.args) ? options.args : ['-n', '-w', '2', '-c', '1', host];
//    this._regmatch = /time=(.+?) ms/; // need to verify this
//  } else if (MAC) {
//    this._bin = '/sbin/ping';
//    this._args = (options.args) ? options.args : ['-n', '-t', '2', '-c', '1', host];
//    this._regmatch = /time=(.+?) ms/;
//  } else {
//    throw new Error('Could not detect your ping binary.');
//  }
//
//  if (!fs.existsSync(this._bin))
//    throw new Error('Could not detect ' + this._bin + ' on your system');
//
//  this._i = 0;
//
//  return this;
//};
//
//Ping.prototype.__proto__ = events.EventEmitter.prototype;
//
//// SEND A PING
//// ===========
//Ping.prototype.send = function (callback) {
//  var self = this;
//
//  this._ping = spawn(this._bin, this._args); // spawn the binary
//
//  this._ping.on('error', function (err) { // handle binary errors
//    if (callback)
//      callback(err);
//    else
//      self.emit('error', err);
//  });
//
//  this._ping.stdout.on('data', function (data) { // log stdout
//    this._stdout = (this._stdout || '') + data;
//  });
//
//  this._ping.stderr.on('data', function (data) { // log stderr
//    this._stderr = (this._stderr || '') + data;
//  });
//
//  this._ping.on('exit', function (code) { // handle complete
//    var stdout = this.stdout._stdout,
//      stderr = this.stderr._stderr,
//      ms;
//
//    if (stderr)
//      throw new Error(stderr);
//    else if (!stdout)
//      throw new Error('No stdout detected');
//
//    ms = stdout.match(self._regmatch); // parse out the ##ms response
//    ms = (ms && ms[1]) ? Number(ms[1]) : ms;
//
//    if (callback)
//      callback(ms);
//    else
//      self.emit('result', ms);
//  });
//};
//
