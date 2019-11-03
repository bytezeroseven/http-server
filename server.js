

let http = require("http");

let path = require("path");

let fs = require("fs");


function createServer(PUBLIC_DIRECTORY, ROUTERS, startListening) {

	let server = http.createServer(function(request, response) {

		let key = request.method + " " + request.url;

		if (ROUTERS[key]) {

			return ROUTERS[key](request, response);

		} else if (request.method == "GET") {

			return sendFile(request, response, path.join(__dirname, PUBLIC_DIRECTORY, request.url));

		}


	});

	if (startListening) {

		let port = process.env.PORT || 8080;

		server.listen(port, function() {

			console.log("Server listening on port " + port + "...");

		});

	}
	
	return server;

}


function sendFile(request, response, url) {

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
					response.end("Error 500 Server messed up");

				}

			});

		} else {

			response.writeHead(404, { "Content-Type": "text/plain" });

			response.end("Error 404 File not found");

		}

	});


}


module.exports = {

	createServer: createServer,

	sendFile: sendFile

}