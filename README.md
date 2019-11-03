# http-server #
Http server with file serving and routing for nodejs. No library.

## Example Code
`
let serverHelper = require("./server.js");

// Routers are added with the method followed the url and separated by a space
let ROUTERS = {
  "GET /ip": function(request, response) {
    response.end("Your ip address: " + request.socket.remoteAddress);
  }
};

let PUBLIC_DIRECTORY = "node";

let startListening = true;

// Starts the server to listen on port 8080
let server = serverHelper.createServer(PUBLIC_DIRECTORY, ROUTERS, startListening);
`

The code is simple and self-explainatory. I don't think there is anything more to be said.
