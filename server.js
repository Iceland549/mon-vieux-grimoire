const http = require('http');

const server = http.createServer((req, res) =>{
    res.end('Voilà le serveur !');
});

server.listen(process.env.PORT || 3000);