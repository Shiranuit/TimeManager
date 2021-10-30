const http = require('http');

const server = http.createServer((req, res) => {
  const fullData = [];
  req.on('data', data => {
    fullData.push(data.toString());
  })

  req.on('end', () => {
    console.log(fullData.join(''));
    let url = new URL(req.url, `http://${req.headers.host}`);
    console.log(url);
    
    console.log();
  });
  // console.log(req);
  res.end();
});

server.listen(4000);