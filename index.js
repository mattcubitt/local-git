var http = require('http');
var spawn = require('child_process').spawn;
var path = require('path');
var backend = require('git-http-backend');
var zlib = require('zlib');

var server = http.createServer(function(req, res) {
  var repo = req.url.split('/')[1];
  var dir = path.join(__dirname, 'repos', repo);
  var reqStream = req.headers['content-encoding'] == 'gzip' ? req.pipe(zlib.createGunzip()) : req;

  reqStream
    .pipe(
      backend(req.url, function(err, service) {
        if (err) return res.end(err + '\n');

        res.setHeader('content-type', service.type);
        console.log(service.action, repo, service.fields);

        var ps = spawn(service.cmd, service.args.concat(dir));
        ps.stdout.pipe(service.createStream()).pipe(ps.stdin);
      })
    )
    .pipe(res);
});
server.listen(5000);
