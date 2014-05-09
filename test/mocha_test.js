var Ping = require('ping-lite'),
    assert = require('assert');

describe('ping-lite.js', function() {
  describe('new Ping()', function() {
    it('should fail w/o a host', function(done) {
      assert.throws(function() {
        var ping = new Ping();
      }, Error);
      done();
    });
    it('should pass w/ a host', function(done) {
      var ping = new Ping('8.8.8.8');
      done();
    });
  });
  describe('#send', function() {
    this.timeout(6000); // ping timer shouldn't exceed 5000ms
    it('8.8.8.8 should get a response', function(done) {
      var ping = new Ping('8.8.8.8');
      ping.send(function(ms) {
        assert(Number(ms), 'Google DNS may not be reachable');
        done();
      });
    });
    it('8.8.8.88 should NOT get a response', function(done) {
      var ping = new Ping('8.8.8.88');
      ping.send(function(ms) {
        assert(ms === null, 'You pinged 8.8.8.88!?');
        done();
      });
    });
  });
  describe('#start', function() {
    this.timeout(16000);
    it('should send 3 pings to 8.8.8.8 with defaults', function(done) {
      var ping = new Ping('8.8.8.8');
      var pings = 0;
      ping.start(function(ms) {
        assert((Number(ms) || ms === null), '#send returned something unexpected');
        ++pings;
      });
      setTimeout(function() {
        ping.stop();
        assert(pings === 3, '#start did not send 3 pings: '+pings)
        done();
      }, 15000);
    });
    it('should send 5 pings to 8.8.8.8 with { interval: 1000 }', function(done) {
      var ping = new Ping('8.8.8.8', { interval: 1000 });
      var pings = 0;
      ping.start(function(ms) {
        assert((Number(ms) || ms === null), '#send returned something unexpected');
        ++pings;
      });
      setTimeout(function() {
        ping.stop();
        assert(pings === 5, '#start did not send 3 pings: '+pings)
        done();
      }, 5000);
    });
  });
});
