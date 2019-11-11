

let http = require("http");

let fs = require("fs");

function joinPath() {

	let slash = __dirname.indexOf("/") > -1 ? "/" : "\\";

	let rawPath = Array.prototype.join.call(arguments, slash);
	return rawPath.replace(/\\+|\/+/g, slash).replace(/\\+|\/+/g, slash);

}

function createServer(routers, publicDir) {

	let server = http.createServer(function(request, response) {

		let reqUrl = request.url;

		let query = {};
		let rawQuery = "";
		let urlWithoutQuery = reqUrl;

		let i = reqUrl.indexOf("?");
		let hasQuery = i > -1;

		if (hasQuery) {

			rawQuery = reqUrl.substring(i + 1);
			urlWithoutQuery = reqUrl.substring(0, i);

			let keyValuePairArr = rawQuery.split("&");

			for (let i = 0; i < keyValuePairArr.length; i++) {

				let keyValuePair = keyValuePairArr[i].split("=");

				query[keyValuePair[0]] = keyValuePair[1]; 

			}
			
		}

		request.query = query;
		request.rawQuery = rawQuery;

		let route = request.method + " " + urlWithoutQuery;

		if (routers[route]) {

			return routers[route](request, response);

		} else if (request.method == "GET") {

			let x = joinPath(__dirname, publicDir, urlWithoutQuery);

			return sendFile(request, response, x);

		} else {

			return response.end();
		
		}


	});

	return server;

}


function sendFile(request, response, url) {

	let ext = url.substring(url.indexOf("."));

	if (ext == url) {

		url = joinPath(url, "index.html");

		ext = ".html";

	}

	let contentTypes = {

		".html": "text/html",
		".js": "text/javascript",
		".css": "text/css"

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
	sendFile: sendFile,
	joinPath: joinPath

}