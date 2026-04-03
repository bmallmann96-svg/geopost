# GeoPost — Contexto do projeto

## Stack
- Mobile: React Native + Expo (pasta /app)
- Backend: Node.js + Fastify + Prisma (pasta /api)
- Banco: PostgreSQL + PostGIS + Redis
- Infra local: Docker (pasta /infra)

## Como rodar o projeto
1. Abrir Docker Desktop
2. Terminal 1: `cd infra` → `docker-compose up -d`
3. Terminal 2: `cd api` → `node server.js`
4. Terminal 3: `cd app` → `$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.0.15"; npx expo start --clear`

## O que está feito
- Ambiente completo configurado no Windows
- Banco PostgreSQL + PostGIS rodando no Docker na porta 5432
- Redis rodando no Docker na porta 6379
- Tabelas criadas: User, Post, Follow
- API base rodando na porta 3000 (rota /health funcionando)
- App mobile com 3 abas: Feed, Explorar, Perfil
- Navegação com bottom tabs funcionando no iPhone

## Design
- Cores: branco #FFFFFF + laranja #F97316
- Texto: #1C1C1E
- Texto secundário: #8E8E93
- Superfície: #F5F5F5
- Borda: #E5E5EA
- Público: jovens e adultos, sofisticado, clean

## Tipos de post definidos
- Restaurante/Bar: lugar + foto + avaliação estrelas + preço + horário + dicas
- Ponto turístico: lugar + foto + avaliação estrelas + custo entrada + horário + dicas
- Momento: lugar + foto + legenda (estilo Instagram, sem avaliação)
- Visibilidade: público para todos (privacidade fica para versão futura)

## Arquivos importantes
- /app/App.js — navegação principal
- /app/src/screens/ — telas do app
- /app/src/theme/colors.js — cores do app
- /api/server.js — servidor principal
- /api/prisma/schema.prisma — modelo do banco
- /infra/docker-compose.yml — banco e redis

## Próximos passos
- [ ] Tela de login com Google
- [ ] Fluxo de criar post (NewPostScreen + PostDetailsScreen)
- [ ] Feed funcionando com posts reais
- [ ] Mapa de exploração

## Observações técnicas
- IP da máquina na rede local: 192.168.0.15
- Sempre usar $env: no PowerShell (não use SET como no CMD)
- Todo arquivo React Native precisa ter `import React from 'react'` no topo
- Prisma versão 5.22.0 (não usar v7, tem bugs)