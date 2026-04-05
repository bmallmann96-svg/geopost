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
        // Campos de restaurante
        mediaType, cuisineTypes, priceRange, occasions, mealTimes,
        wouldReturn, bestDish, tip, foodRating, serviceRating, ambienceRating, valueRating,
        // Campos de ponto turístico
        visitDuration, bestSeason, bestTimeOfDay, crowdLevel, howToGetThere,
        wheelchairAccess, petsAllowed, touristTip, mustSee, attractionTypes,
        experienceRating, accessibilityRating, conservationRating
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
            // Restaurante
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
            // Ponto turístico
            visitDuration: visitDuration || null,
            bestSeason: bestSeason || [],
            bestTimeOfDay: bestTimeOfDay || [],
            crowdLevel: crowdLevel || null,
            howToGetThere: howToGetThere || [],
            wheelchairAccess: wheelchairAccess || null,
            petsAllowed: petsAllowed || null,
            touristTip: touristTip || null,
            mustSee: mustSee || null,
            attractionTypes: attractionTypes || [],
            experienceRating: experienceRating || null,
            accessibilityRating: accessibilityRating || null,
            conservationRating: conservationRating || null,
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

fastify.get('/posts/:id', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { id } = request.params
    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            user: { select: { name: true, username: true, avatar: true } }
        }
    })
    if (!post) return reply.status(404).send({ error: 'Post não encontrado' })
    return post
})

fastify.put('/posts/:id', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { id } = request.params
    
    const post = await prisma.post.findFirst({ where: { id, userId: request.user.id } })
    if (!post) return reply.status(403).send({ error: 'Não autorizado' })

    const {
        caption, rating, placeName, placeId, latitude, longitude,
        // Campos de restaurante
        cuisineTypes, priceRange, occasions, mealTimes,
        wouldReturn, bestDish, tip, foodRating, serviceRating, ambienceRating, valueRating,
        // Campos de ponto turístico
        visitDuration, bestSeason, bestTimeOfDay, crowdLevel, howToGetThere,
        wheelchairAccess, petsAllowed, touristTip, mustSee, attractionTypes,
        experienceRating, accessibilityRating, conservationRating
    } = request.body

    const updatedPost = await prisma.post.update({
        where: { id },
        data: {
            caption: caption !== undefined ? caption : post.caption,
            rating: rating !== undefined ? rating : post.rating,
            placeName: placeName !== undefined ? placeName : post.placeName,
            placeId: placeId !== undefined ? placeId : post.placeId,
            latitude: latitude !== undefined ? latitude : post.latitude,
            longitude: longitude !== undefined ? longitude : post.longitude,
            // Restaurante
            cuisineTypes: cuisineTypes || post.cuisineTypes,
            priceRange: priceRange !== undefined ? priceRange : post.priceRange,
            occasions: occasions || post.occasions,
            mealTimes: mealTimes || post.mealTimes,
            wouldReturn: wouldReturn !== undefined ? wouldReturn : post.wouldReturn,
            bestDish: bestDish !== undefined ? bestDish : post.bestDish,
            tip: tip !== undefined ? tip : post.tip,
            foodRating: foodRating !== undefined ? foodRating : post.foodRating,
            serviceRating: serviceRating !== undefined ? serviceRating : post.serviceRating,
            ambienceRating: ambienceRating !== undefined ? ambienceRating : post.ambienceRating,
            valueRating: valueRating !== undefined ? valueRating : post.valueRating,
            // Ponto turístico
            visitDuration: visitDuration !== undefined ? visitDuration : post.visitDuration,
            bestSeason: bestSeason || post.bestSeason,
            bestTimeOfDay: bestTimeOfDay || post.bestTimeOfDay,
            crowdLevel: crowdLevel !== undefined ? crowdLevel : post.crowdLevel,
            howToGetThere: howToGetThere || post.howToGetThere,
            wheelchairAccess: wheelchairAccess !== undefined ? wheelchairAccess : post.wheelchairAccess,
            petsAllowed: petsAllowed !== undefined ? petsAllowed : post.petsAllowed,
            touristTip: touristTip !== undefined ? touristTip : post.touristTip,
            mustSee: mustSee !== undefined ? mustSee : post.mustSee,
            attractionTypes: attractionTypes || post.attractionTypes,
            experienceRating: experienceRating !== undefined ? experienceRating : post.experienceRating,
            accessibilityRating: accessibilityRating !== undefined ? accessibilityRating : post.accessibilityRating,
            conservationRating: conservationRating !== undefined ? conservationRating : post.conservationRating,
        }
    })

    return updatedPost
})

fastify.delete('/posts/:id', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { id } = request.params
    
    // Verify if place exists and is owned by user
    const post = await prisma.post.findFirst({ where: { id, userId: request.user.id } })
    if (!post) return reply.status(403).send({ error: 'Post não encontrado ou você não tem permissão para excluí-lo' })
    
    // Deletes the post (and cascades to ListItem etc if DB schema has it, or just deletes it)
    await prisma.post.delete({ where: { id } })
    return { success: true }
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

fastify.put('/lists/:listId', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { listId } = request.params
    const { title, description, emoji, color } = request.body

    const list = await prisma.list.findFirst({ where: { id: listId, userId: request.user.id } })
    if (!list) return reply.status(403).send({ error: 'Não autorizado' })

    const updatedList = await prisma.list.update({
        where: { id: listId },
        data: {
            title: title || list.title,
            description: description !== undefined ? description : list.description,
            emoji: emoji || list.emoji,
            color: color || list.color,
        }
    })

    return updatedList
})

fastify.delete('/lists/:listId', { preHandler: [authenticateToken] }, async (request, reply) => {
    const { listId } = request.params

    const list = await prisma.list.findFirst({ where: { id: listId, userId: request.user.id } })
    if (!list) return reply.status(403).send({ error: 'Não autorizado' })

    await prisma.list.delete({ where: { id: listId } })
    return { success: true }
})

// ── Rota Web Pública ────────────────────────────────────────

fastify.get('/p/:username', async (request, reply) => {
    const { username } = request.params
    
    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            _count: { select: { posts: true, followers: true, following: true } },
            posts: {
                take: 9,
                orderBy: { createdAt: 'desc' },
                select: { id: true, photoUrl: true, placeName: true, latitude: true, longitude: true }
            }
        }
    })

    if (!user) {
        return reply.header('Content-Type', 'text/html; charset=utf-8')
            .send('<html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family: sans-serif; text-align: center; padding: 50px;"><h1>404 - Perfil não encontrado</h1><p>O perfil que você tentou acessar não existe no GeoPost.</p></body></html>')
    }

    const { posts, _count } = user

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${user.name} (@${user.username}) no GeoPost</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #FFFFFF; color: #1C1C1E; padding-bottom: 80px; }
        .header { padding: 20px 16px; border-bottom: 1px solid #E5E5EA; text-align: center; }
        .logo { color: #F97316; font-weight: 800; font-size: 24px; margin-bottom: 16px; letter-spacing: -0.5px; }
        .avatar { width: 80px; height: 80px; border-radius: 40px; background-color: #F5F5F5; margin: 0 auto 12px; object-fit: cover; }
        .name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .username { color: #8E8E93; font-size: 15px; margin-bottom: 16px; }
        .stats { display: flex; justify-content: center; gap: 32px; margin-bottom: 16px; }
        .stat-item { text-align: center; }
        .stat-value { font-size: 17px; font-weight: 700; }
        .stat-label { font-size: 13px; color: #8E8E93; }
        
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; }
        .grid-item { aspect-ratio: 1; position: relative; overflow: hidden; background-color: #F5F5F5; display: block; text-decoration: none; }
        .grid-item img { width: 100%; height: 100%; object-fit: cover; border: none; }
        .place-name { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: white; font-size: 11px; padding: 12px 6px 6px; font-weight: 500; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
        
        .empty { padding: 40px 20px; text-align: center; color: #8E8E93; font-size: 15px; }

        .cta-bottom { position: fixed; bottom: 0; left: 0; right: 0; background-color: rgba(255, 255, 255, 0.95); padding: 16px; border-top: 1px solid #E5E5EA; backdrop-filter: blur(10px); z-index: 100; display: flex; justify-content: center; }
        .cta-button { background-color: #F97316; color: white; text-decoration: none; font-weight: 700; font-size: 16px; width: 100%; max-width: 400px; text-align: center; padding: 14px 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
    </style>
</head>
<body>
    <header class="header">
        <div class="logo">GeoPost</div>
        <img src="${user.avatar || 'https://via.placeholder.com/80?text=' + user.username.charAt(0).toUpperCase()}" alt="${user.name}" class="avatar" />
        <h1 class="name">${user.name}</h1>
        <p class="username">@${user.username}</p>
        
        <div class="stats">
            <div class="stat-item">
                <div class="stat-value">${_count.posts}</div>
                <div class="stat-label">posts</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${_count.followers}</div>
                <div class="stat-label">seguidores</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${_count.following}</div>
                <div class="stat-label">seguindo</div>
            </div>
        </div>
    </header>

    <main>
        ${posts.length === 0 ? '<div class="empty">Nenhum post ainda.</div>' : `
        <div class="grid">
            ${posts.map(p => `
            <a href="https://maps.google.com/?q=${p.latitude},${p.longitude}" target="_blank" class="grid-item">
                <img src="${p.photoUrl}" alt="${p.placeName}" loading="lazy" />
                <div class="place-name">${p.placeName}</div>
            </a>
            `).join('')}
        </div>
        `}
    </main>

    <div class="cta-bottom">
        <a href="https://geopost-production.up.railway.app" class="cta-button">Baixar o GeoPost</a>
    </div>
</body>
</html>
    `

    reply.header('Content-Type', 'text/html; charset=utf-8').send(html)
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