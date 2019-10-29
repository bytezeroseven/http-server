
/*


	___     ___   __________   __________   ________           ______   ______   ________   ___      ___  ______   ________
	\  \____\  \  \___   ___\  \___   ___\  \   __  \  _____   \   ___  \   ___  \   ___ \  \  \    /  /  \   ___  \   ___ \
	 \   _____  \     \  \         \  \      \   ___/  \____\   \___  \  \   __\  \   _  /_  \  \  /  /    \   __\  \   _  /_
	  \  \    \  \     \  \         \  \      \  \               ___\  \  \  \___  \  \\_  \  \  \/  /      \  \___  \  \\_  \
	   \__\    \__\     \__\         \__\      \__\              \______\  \_____\  \__\ \__\  \____/        \_____\  \__\ \__\



	Attach routers to 'ROUNTERS'
	
	Expose a directory using 'PUBLIC_DIR'

*/

let PUBLIC_DIR = "node";

let ROUTERS = {

	"/ip": function(request, response) {

		response.writeHead(200, { "Content-Type": "text/plain" });

		response.end("Your IP Adrress: " + request.socket.remoteAddress);

	}

};

let http = require("http");

let path = require("path");

let fs = require("fs");

let server = http.createServer(requestHandler);

let port = process.env.PORT || 8000;

server.listen(port, function() {

	console.log("Server listening on port " + port + "...");

});


function requestHandler(request, response) {

	if (ROUTERS[request.url]) {
		
		return ROUTERS[request.url](request, response);
	
	} else {

		sendStatic(request, response);

	}

}


/*

	If provided, customUrl will be relative to the root (__dirname), not to 'PUBLIC_DIR'.
	If customUrl is not provided, the file mentioned in the request will be served relative to 'PUBLIC_DIR'.
	If the request url is a directory, the index.html file is sent if present.

	Add more Content-Types if you find the need. Stuff works fine for me with the  three content types.

*/

function sendStatic(request, response, customUrl) {

	let url = path.join(__dirname, customUrl || (PUBLIC_DIR + request.url));

	let parsedUrl = path.parse(url);

	let ext = parsedUrl.ext;

	if (ext == "") {

		url = path.join(url, "index.html");

		ext = ".html";

	}

	let contentTypes = {

		".html": "text/html",
		".js": "text/javascript",
		".css": "text/stylesheet"

	}

	let contentType = contentTypes[ext] || "text/plain";
	
	fs.exists(url, function(doesExist) {

		if (doesExist) {

			fs.stat(url, function(err, stats) {

				if (err == undefined) {

					let fileModifiedDate = new Date(stats.mtime).toUTCString();
					let headerModifiedDate = new Date(request.headers["if-modified-since"]).toUTCString();
					let isModified = fileModifiedDate != headerModifiedDate;

					if (isModified) {

						response.writeHead(200, {

							"Content-Type": contentType,
							// why waste bandwidth over content length?
							// "Content-Length": stats.size, 
							"Last-Modified": fileModifiedDate

						});

						let readStream = fs.createReadStream(url);

						readStream.pipe(response);
						
					} else {

						response.writeHead(304);
						response.end();

					}
					

				} else {

					response.writeHead(500, { "Content-Type": "text/plain" });
					response.end("Error 500");

				}

			});

		} else {

			response.writeHead(404, { "Content-Type": "text/plain" });

			response.end("Error 404 File not found");

		}

	});


}




