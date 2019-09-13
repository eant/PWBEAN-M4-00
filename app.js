const http = require("http")
const fs = require("fs")
const queryString = require("querystring")
const nodemailer = require("nodemailer")

const port = 4000

const miniOutlook = nodemailer.createTransport({
	host : process.env.SMTP,
	auth : {
		user : process.env.USER,
		pass : process.env.PASS,
		port : process.env.MPORT
	}
})

miniOutlook.verify(function(error, success){
	if(error){
		console.log("Error: GMail NO esta disponible")
		console.log(error)
	} else {
		console.log("MiniOutlook listo para enviar e-mails")
	}
})

http.createServer((request, response) => {
		
		let dir = "public/"

		let file = (request.url == "/") ? "index.html" : request.url
			file = (file.match(/[^.]+(\.[^?#]+)?/) || [])[0]
		
		let ext = file.substring( file.lastIndexOf(".") ).toLowerCase()

		console.log(`Usted quiere este recurso: ${file}`)

		if( file == "/enviar" && request.method == "POST" ){

			request.on("data", function(form){

				let datos = form.toString()

				let objeto = queryString.parse(datos)

				console.log(objeto)

				let cuerpo = `<h1>Contacto desde EANT Mailer</h1>`
						   + `<p>Datos del consultante:</p>`
						   + `<p>Nombre: ${objeto.nombre}</p>`
						   + `<p>E-Mail: ${objeto.correo}</p>`
						   + `<p>Asunto: ${objeto.asunto}</p>`
						   + `<p>Mensaje:</p>`
						   + `<blockquote>${objeto.mensaje}</blockquote>`

				miniOutlook.sendMail({
					from : objeto.correo,
					to : "silvio.messina@eant.tech",
					replyTo : objeto.correo,
					subject : objeto.asunto,
					//text : objeto.mensaje
					html : cuerpo
				}, function(error, success){

					if( error ){

						response.end("ERROR: Mensaje NO enviado :(")

					} else {

						response.end("OK: Mensaje enviado :)")

					}

				})
				

			})


		}

		let types = {
			".html"	: "text/html",
			".js"	: "text/javascript",
			".css"	: "text/css",
			".txt" 	: "text/plain",
			".json"	: "application/json",
			".png"	: "image/png",
			".jpg"	: "image/jpg",
			".gif"	: "image/gif",
			".ico"	: "image/x-icon",
			".wav"	: "audio/wav",
			".mp4"	: "video/mp4",
			".woff"	: "application/font-woff",
			".ttf"	: "application/font-ttf",
			".eot"	: "application/vnd.ms-fontobject",
			".otf"	: "application/font-otf",
			".svg"	: "application/image/svg+xml"
		}

		let contentType = types[ext] || "application/octet-stream"

		fs.readFile( dir + file, (error, content) => {
			
			if ( error ) {
				response.writeHead(404, { "Content-Type" : "text/plain" } )
				response.end("ARCHIVO NO ENCONTRADO");
			} else {
				response.writeHead(200, { "Content-Type" : contentType } )
				response.end(content)
			}

		})

}).listen(port)