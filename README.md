# http-server
Http server with file serving and routing for nodejs. No library.

## Example Code
    let serverHelper = require("./server.js");

    // Routers are added with [method][space][url]
    let routers = {
      "GET /ip": function(request, response) {
        response.end("Your ip address: " + request.socket.remoteAddress);
      }
    };

    let publicDir = "node";
    let server = serverHelper.createServer(routers, publicDir);
    
    server.listen(8080, function() { 
        console.log("Server listening on port 8080..."); 
    });

The code is simple and self-explainatory. I don't think there is anything more to be said.
