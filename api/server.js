const fastify = require('fastify')({ logger: true })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

fastify.get('/health', async () => {
    return { status: 'ok', message: 'GeoPost API rodando!' }
})

fastify.get('/users', async () => {
    const users = await prisma.user.findMany()
    return users
})

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' })
        console.log('Servidor rodando em http://localhost:3000')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()