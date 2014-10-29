var Ping = require('../');

var ping = new Ping('8.8.8.8');

ping.on('pong', function (pong) {
  console.log('!pong:', pong);
  /* !pong: { ip: '8.8.8.8', ms: 112 } */
});

ping.on('result', function (ms) {
  console.log('!result:', ms);
  /* !result: 112 */
});

ping.on('done', function (err, pong) {
  console.log('!done:', (err || pong));
  /* !done: { ip: '8.8.8.8', ms: 112 } */
});

ping.send(function (err, ms) {
  console.log('callback:', (err || ms));
  /* callback: 112 */
});
