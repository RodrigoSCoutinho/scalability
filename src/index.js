import { createServer } from 'node:http'
import { once } from 'node:events' 

async function handler(request, response) {
  try {
   const data = JSON.parse(await once(request, 'data'))
   console.log('\nreceived', data)
  
   response.writeHead(200)
   response.end(JSON.stringfy(data))

   setTimeout(() => {
    throw new Error('will be handled on uncaught')
 },1000);

   Promise.reject('will be handled on unhandleRejection')

 } catch(error) {
   console.error('Invalid', error.stack)
   response.writeHead(500)
   response.end()
 }
}

const server = createServer(handler)
.listen(3000)
.on('listening', () => console.log('server running at 3000')) 

// captura os erros nao tratados
// se nao tiver ele o sistema quebra
process.on('uncaughtException', (error, origin) => {
  console.log(`\n${origin} signal received. \n${error}`)
})

// se nao tiver ele, o sistema joga um warning
process.on('unhandleRejection', (error) => {
  console.log(`\nunhandleRejection signal received. \n${error}`)
})

// ------------- GraceFullShutdown ---------------------- //

function gracefullShutdown(event){
   return (code) => {
   console.log(`${event} received! with, ${code}`)
   server.close(() => {
   console.log('http server close')
   console.log('DB connection closed')
   process.exit(code)
   })
  }
}

// disparado no Ctrl + C no terminal -> multi plataform
process.on('SIGINT',gracefullShutdown('SIGINT'))

// disparando no kill
process.on('SIGTERM', gracefullShutdown('SIGTERM'))

process.on('exit', (code) => {
console.log('exit signal received', code)
})