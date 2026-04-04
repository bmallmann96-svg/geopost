const fastify = require('fastify')({ logger: true })
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const prisma = new PrismaClient()

// Middleware
const authenticateToken = async (request, reply) => {
    const authHeader = request.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return reply.status(401).send({ error: 'Token missing' })
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        request.user = decoded
    } catch (err) {
        return reply.status(403).send({ error: 'Token invalid or expired' })
    }
}

fastify.get('/health', async () => {
    return { status: 'ok', message: 'GeoPost API rodando!' }
})

fastify.get('/users', async () => {
    const users = await prisma.user.findMany()
    return users
})

fastify.post('/auth/register', async (request, reply) => {
    const { name, username, email, password } = request.body
    
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] }
    })
    
    if (existingUser) {
        return reply.status(400).send({ error: 'Nome de usuário ou e-mail já estão em uso' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    
    const user = await prisma.user.create({
        data: {
            name,
            username,
            email,
            password: hashedPassword
        }
    })
    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    
    return {
        token,
        user: { id: user.id, name: user.name, username: user.username, email: user.email }
    }
})

fastify.post('/auth/login', async (request, reply) => {
    const { email, password } = request.body
    
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return reply.status(401).send({ error: 'Email ou senha incorretos' })
    }
    
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return reply.status(401).send({ error: 'Email ou senha incorretos' })
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    
    return {
        token,
        user: { id: user.id, name: user.name, username: user.username, email: user.email }
    }
})

fastify.get('/auth/me', { preHandler: [authenticateToken] }, async (request, reply) => {
    const user = await prisma.user.findUnique({
        where: { id: request.user.id },
        select: { id: true, name: true, username: true, email: true, bio: true, avatar: true }
    })
    if (!user) return reply.status(404).send({ error: 'User not found' })
    return user
})

fastify.post('/posts', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { photoUrl, caption, rating, latitude, longitude, placeName, placeId, category, extras } = request.body
    
    const post = await prisma.post.create({
        data: {
            userId: request.user.id,
            photoUrl,
            caption,
            rating,
            latitude,
            longitude,
            placeName,
            placeId,
            category,
            metadata: extras || null
        }
    })
    
    return post
})

fastify.get('/posts/feed', { preHandler: [authenticateToken] }, async (request, reply) => {
    const posts = await prisma.post.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, username: true, avatar: true }
            }
        }
    })
    return posts
})

fastify.get('/posts/user/:userId', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { userId } = request.params
    const posts = await prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, username: true, avatar: true }
            }
        }
    })
    return posts
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