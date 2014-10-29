var Ping = require('../'),
  should = require('should');

var target = 'localhost';

describe('Ping-lite', function () {

  it('should be requireable', function () {
    (Ping).should.be.a.Function;
  });

  it('should return a Ping instance', function () {
    var ping = new Ping(target);
    (ping).should.be.an.instanceOf(Ping);
    (ping).should.have.properties(['host', 'platform', 'profile']);
    (ping.send).should.be.a.Function;
    (ping.start).should.be.a.Function;
    (ping.stop).should.be.a.Function;
  });

  describe('Events', function () {

    it('result - should return (ms)', function (done) {
      var ping = new Ping(target);
      ping.on('result', function (ms) {
        (ms).should.be.a.Number;
        done();
      });
      ping.send();
    });

    it('done - should return (err, pong)', function (done) {
      var ping = new Ping(target);
      ping.on('done', function (err, pong) {
        if (err)
          (err).should.be.an.Error;
        else
          (pong).should.be.an.Object.with.properties(['ip', 'ms']);
        done();
      });
      ping.send();
    });

    it('pong - should return (pong)', function (done) {
      var ping = new Ping(target);
      ping.on('pong', function (pong) {
        (pong).should.be.an.Object.with.properties(['ip', 'ms']);
        done();
      });
      ping.send();
    });

    it('stop - should stop an in-progress ping', function (done) {
      var ping = new Ping(target);
      ping.on('stop', function () {
        done();
      });
      ping.start();
      ping.stop();
    });

  });

  describe('Callback', function () {

    it('should return (err, ms)', function (done) {
      var ping = new Ping(target);
      ping.send(function (err, pong) {
        if (err)
          (err).should.be.an.Error;
        else
          (pong).should.be.an.Object.with.properties(['ip', 'ms']);
        done();
      });
    });

  });

  describe('Ping.start()', function () {

    it('should send 3 pings with a 5 second interval', function (done) {
      this.timeout(11000);
      var counter = 0;

      var ping = new Ping(target);
      ping.on('pong', function (pong) {
        if (++counter === 3)
          done();
      });
      ping.start();
    });

    it('should send 3 pings with a 1 second interval', function (done) {
      this.timeout(3000);
      var counter = 0;

      var ping = new Ping(target, {
        interval: 1000
      });
      ping.on('pong', function (pong) {
        if (++counter === 3)
          done();
      });
      ping.start();
    });

  });

  describe('Ping.stop()', function () {

    it('should stop a ping session', function (done) {
      var ping = new Ping(target);
      ping.on('stop', function () {
        done();
      });
      ping.start();
      setTimeout(function () {
        ping.stop();
      }, 1750);
    });

  });

});


//describe('ping-lite.js', function () {
//  describe('new Ping()', function () {
//    it('should fail w/o a host', function (done) {
//      assert.throws(function () {
//        var ping = new Ping();
//      }, Error);
//      done();
//    });
//    it('should pass w/ a host', function (done) {
//      var ping = new Ping('8.8.8.8');
//      done();
//    });
//  });
//  describe('#send', function () {
//    this.timeout(6000); // ping timer shouldn't exceed 5000ms
//    it('8.8.8.8 should get a response', function (done) {
//      var ping = new Ping('8.8.8.8');
//      ping.send(function (ms) {
//        assert(Number(ms), 'Google DNS may not be reachable');
//        done();
//      });
//    });
//    it('www.google.com should get a response', function (done) {
//      var ping = new Ping('www.google.com');
//      ping.send(function (ms) {
//        assert(Number(ms), 'Google may not be reachable');
//        done();
//      });
//    });
//    it('8.8.8.88 should NOT get a response', function (done) {
//      var ping = new Ping('8.8.8.88');
//      ping.send(function (ms) {
//        assert(ms === null, 'how did you ping 8.8.8.88!?');
//        done();
//      });
//    });
//  });
//  describe('#start', function () {
//    it('should send 3 pings to 8.8.8.8 with defaults', function (done) {
//      this.timeout(16000);
//      var ping = new Ping('8.8.8.8');
//      var pings = 0;
//      ping.start(function (ms) {
//        assert((Number(ms) || ms === null), '#send returned something unexpected');
//        ++pings;
//      });
//      setTimeout(function () {
//        ping.stop();
//        assert(pings === 3, '#start did not send 3 pings: ' + pings)
//        done();
//      }, 15000);
//    });
//    it('should send 10 pings to 8.8.8.8 with { interval: 500 } in ~ 5 sec', function (done) {
//      this.timeout(5100);
//      var ping = new Ping('8.8.8.8', {
//        interval: 500
//      });
//      var pings = 0;
//      ping.start(function (ms) {
//        assert((Number(ms) || ms === null), '#send returned something unexpected');
//        if (++pings === 10)
//          done();
//      });
//    });
//  });
//});
