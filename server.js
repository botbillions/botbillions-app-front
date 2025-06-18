const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');

const app = next({ dev: false, hostname: 'meuapp.local', port: 443 });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync('../../../certificates/localhost.key'),
  cert: fs.readFileSync('../../../certificates/com.crt'),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(443, (err) => {
    if (err) throw err;
    console.log('> Ready on https://meuapp.local:443');
  });
});