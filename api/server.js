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

fastify.get('/users/search', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { q } = request.query
    if (!q) return []

    const users = await prisma.user.findMany({
        where: {
            id: { not: request.user.id },
            OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { username: { contains: q, mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            followers: {
                where: { followerId: request.user.id }
            }
        },
        take: 20
    })

    return users.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        isFollowing: u.followers.length > 0
    }))
})

fastify.get('/users/:userId', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { userId } = request.params

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
            _count: {
                select: {
                    posts: true,
                    followers: true,
                    following: true,
                }
            },
            followers: {
                where: { followerId: request.user.id }
            }
        }
    })

    if (!user) return reply.status(404).send({ error: 'User not found' })

    return {
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        postsCount: user._count.posts,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        isFollowing: user.followers.length > 0
    }
})

fastify.post('/follows', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { followingId } = request.body
    
    if (followingId === request.user.id) {
        return reply.status(400).send({ error: 'Você não pode seguir a si mesmo' })
    }

    try {
        await prisma.follow.create({
            data: {
                followerId: request.user.id,
                followingId
            }
        })
        return { success: true }
    } catch (err) {
        // Ignora erro de unique constraint
        return { success: true }
    }
})

fastify.delete('/follows/:userId', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { userId } = request.params

    await prisma.follow.deleteMany({
        where: {
            followerId: request.user.id,
            followingId: userId
        }
    })

    return { success: true }
})

fastify.post('/posts', { preHandler: [authenticateToken] }, async (request, reply) => {
    const {
        photoUrl, caption, rating, latitude, longitude,
        placeName, placeId, category, extras,
        // Novos campos de restaurante
        mediaType, cuisineTypes, priceRange, occasions, mealTimes,
        wouldReturn, bestDish, tip, foodRating, serviceRating, ambienceRating, valueRating
    } = request.body

    const post = await prisma.post.create({
        data: {
            userId: request.user.id,
            photoUrl,
            caption,
            rating: rating || 0,
            latitude,
            longitude,
            placeName,
            placeId,
            category,
            metadata: extras || null,
            mediaType: mediaType || 'photo',
            cuisineTypes: cuisineTypes || [],
            priceRange: priceRange || null,
            occasions: occasions || [],
            mealTimes: mealTimes || [],
            wouldReturn: wouldReturn || null,
            bestDish: bestDish || null,
            tip: tip || null,
            foodRating: foodRating || null,
            serviceRating: serviceRating || null,
            ambienceRating: ambienceRating || null,
            valueRating: valueRating || null,
        }
    })

    return post
})

fastify.get('/posts/feed', { preHandler: [authenticateToken] }, async (request, reply) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Busca IDs de quem o usuário segue
    const follows = await prisma.follow.findMany({
        where: { followerId: request.user.id },
        select: { followingId: true }
    })
    const followingIds = follows.map(f => f.followingId)

    const posts = await prisma.post.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        take: 100, // busca mais para poder ordenar e depois cortar
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { name: true, username: true, avatar: true }
            }
        }
    })

    // Adiciona campo priority e ordena: seguidores primeiro, depois recentes
    const sorted = posts
        .map(p => ({
            ...p,
            priority: followingIds.includes(p.userId) ? 1 : 2
        }))
        .sort((a, b) => a.priority - b.priority || b.createdAt - a.createdAt)
        .slice(0, 20)

    return sorted
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

// ── Rotas de Listas ────────────────────────────────────────

fastify.post('/lists', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { title, description, emoji, color } = request.body
    if (!title) return reply.status(400).send({ error: 'Título é obrigatório' })

    const list = await prisma.list.create({
        data: {
            userId: request.user.id,
            title,
            description: description || null,
            emoji: emoji || '📍',
            color: color || '#F97316',
        }
    })
    return list
})

fastify.get('/lists/user/:userId', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { userId } = request.params

    const lists = await prisma.list.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            items: {
                take: 3,
                include: {
                    post: { select: { photoUrl: true } }
                },
                orderBy: { addedAt: 'desc' }
            },
            _count: { select: { items: true } }
        }
    })

    return lists.map(l => ({
        id: l.id,
        title: l.title,
        description: l.description,
        emoji: l.emoji,
        color: l.color,
        createdAt: l.createdAt,
        itemCount: l._count.items,
        previews: l.items.map(i => i.post.photoUrl)
    }))
})

fastify.get('/lists/:listId', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { listId } = request.params

    const list = await prisma.list.findUnique({
        where: { id: listId },
        include: {
            user: { select: { id: true, name: true, username: true, avatar: true } },
            items: {
                orderBy: { addedAt: 'desc' },
                include: {
                    post: {
                        select: {
                            id: true, photoUrl: true, mediaType: true,
                            latitude: true, longitude: true, placeName: true,
                            rating: true, category: true, caption: true
                        }
                    }
                }
            }
        }
    })

    if (!list) return reply.status(404).send({ error: 'Lista não encontrada' })

    return {
        ...list,
        posts: list.items.map(i => i.post)
    }
})

fastify.post('/lists/:listId/items', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { listId } = request.params
    const { postId } = request.body

    // Verifica se o post pertence ao usuário logado
    const post = await prisma.post.findFirst({ where: { id: postId, userId: request.user.id } })
    if (!post) return reply.status(403).send({ error: 'Post não encontrado ou não pertence a você' })

    // Verifica se a lista pertence ao usuário logado
    const list = await prisma.list.findFirst({ where: { id: listId, userId: request.user.id } })
    if (!list) return reply.status(403).send({ error: 'Lista não encontrada' })

    try {
        await prisma.listItem.create({ data: { listId, postId } })
        return { success: true }
    } catch {
        return { success: true } // unique constraint — ignora duplicata
    }
})

fastify.delete('/lists/:listId/items/:postId', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { listId, postId } = request.params

    await prisma.listItem.deleteMany({ where: { listId, postId } })
    return { success: true }
})

fastify.delete('/lists/:listId', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { listId } = request.params

    const list = await prisma.list.findFirst({ where: { id: listId, userId: request.user.id } })
    if (!list) return reply.status(403).send({ error: 'Não autorizado' })

    await prisma.list.delete({ where: { id: listId } })
    return { success: true }
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