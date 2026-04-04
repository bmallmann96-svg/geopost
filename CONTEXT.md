# GeoPost — Contexto do projeto

## Stack
- Mobile: React Native + Expo (pasta /app)
- Backend: Node.js + Fastify + Prisma (pasta /api)
- Banco: PostgreSQL + PostGIS + Redis
- Infra local: Docker (pasta /infra)
- **Ambiente de produção: Railway** → `https://geopost-production.up.railway.app`

## Como rodar o projeto
1. Abrir Docker Desktop
2. Terminal 1: `cd infra` → `docker-compose up -d`
3. Terminal 2: `cd api` → `node server.js`
4. Terminal 3: `cd app` → `$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.0.15"; npx expo start --clear`

> **Nota:** O app mobile aponta para a API de **produção no Railway** (`https://geopost-production.up.railway.app`). O servidor local (`node server.js`) é usado apenas para desenvolvimento/debug da API.

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

## Estrutura de navegação atual
A organização nativa (React Navigation) no arquivo `/app/App.js` gerencia as hierarquias e visibilidades em "stacks" (pilhas) compostas:

1. **`MainAppNavigator`**: É o grande "Switch" do app. Se `!user` avalia como verdadeiro, injeta a stack de autenticação (`AuthNavigator`). Caso o usuário esteja logado com sucesso, monta a `MainStack`.

2. **`AuthNavigator` (`Stack.Navigator`)**: A tela inicial não-logada.
   - Telas filhas: `LoginScreen`, `RegisterScreen`.

3. **`MainStack` (`Stack.Navigator` com `presentation: 'fullScreenModal'`)**: O invólucro do app autenticado. Usamos Native Stack e o modo modal para permitir preencher a tela inteira com as features imersivas.
   - **Camada base (`MainTabs`)**: Engata a `Tab.Navigator` com todas as funcionalidades comuns nativas preservando sua barra. Opção setada para `'card'` para preservar a elevação natural no topo. 
   - **Camada imersiva superior (`StoryViewer`, `StoryCreator`)**: Abre em `modal` tela-cheia ignorando o `MainTabs` e as barras persistentes e ocultando a tela de trás.

4. **`MainTabs` (`Tab.Navigator`)**: Barra inferior primária persistente.
   - Permanece vísivel: `Feed`, `Explorar`, e `Perfil`.
   - Modificadores de interface: 
     - **Central Plus Botão (`NewPost`)**: Estilizado manualmente fora da tab usando margem negativa. Esconde dinamicamente a Bottom Bar quando o fluxo de câmera e detalhes for ativado.
     - **Sub-Fluxo Invisível (`PostDetails`)**: Registrada na `Tab.Navigator` com paramêtros visuais bloqueados (`tabBarButton: () => null`). Omitida propositalmente da grade da barra gráfica para ser acionada em sequência da `NewPost`.

## Arquivos importantes
- /app/app.config.js — configuração global (Maps API setup)
- /app/App.js — navegação hierárquica (MainStack Modals + MainTabs + AuthStack)
- /app/src/context/AuthContext.js — gerenciamento de estado do usuário
- /app/src/components/StarsRating.js — componente auxiliar de reputação
- /app/src/components/StoryBar.js — componente interativo do feed para stories
- /app/src/components/PostCard.js — componente de listagens do Feed (expandível, com Google Maps)
- /app/src/screens/LoginScreen.js — tela de login (social + email)
- /app/src/screens/RegisterScreen.js — tela de criar conta com formulário
- /app/src/screens/NewPostScreen.js — fluxo de criar post
- /app/src/screens/PostDetailsScreen.js — detalhes do novo post
- /app/src/screens/FeedScreen.js — tela de feed com Story Bar
- /app/src/screens/ExploreScreen.js — tela de explorar em formato TikTok vertical
- /app/src/screens/ProfileScreen.js — Perfil completo (Modo Mapa interativo e Modo Grade em tabs)
- /app/src/screens/SettingsScreen.js — Opções da conta e logout (Acessível via perfil)
- /app/src/screens/StoryViewerScreen.js — Visualizador imersivo e temporizado
- /app/src/screens/StoryCreatorScreen.js — Mock de câmera flexível e marcação de lugar
- /app/src/theme/colors.js — cores do app
- /api/server.js — servidor principal
- /api/prisma/schema.prisma — modelo do banco
- /infra/docker-compose.yml — banco e redis

## Rotas da API

### Auth
- `POST /auth/register` — cadastro de usuário
- `POST /auth/login` — login com email/senha
- `GET /auth/me` — retorna usuário logado (requer token)

### Posts
- `POST /posts` — cria novo post; aceita todos os campos de restaurante: `mediaType`, `cuisineTypes[]`, `priceRange`, `occasions[]`, `mealTimes[]`, `wouldReturn`, `bestDish`, `tip`, `foodRating`, `serviceRating`, `ambienceRating`, `valueRating` (requer token)
- `GET /posts/feed` — feed inteligente dos últimos 30 dias: posts de usuários seguidos aparecem primeiro (priority=1), depois os demais (priority=2); ordenado por prioridade e recente; limite de 20 (requer token)
- `GET /posts/user/:userId` — posts de um usuário específico; retorna todos os campos incluindo os de restaurante (requer token)

### Usuários & Social
- `GET /users/search?q=termo` — busca usuários por nome/username; exclui o próprio usuário; retorna `isFollowing` (requer token)
- `GET /users/:userId` — perfil completo com `postsCount`, `followersCount`, `followingCount`, `isFollowing` (requer token)
- `POST /follows` — body: `{ followingId }`; cria relação de follow (requer token)
- `DELETE /follows/:userId` — remove relação de follow com o userId (requer token)

### Listas Curadas
- `POST /lists` — cria lista; body: `{ title, description?, emoji?, color? }` (requer token)
- `GET /lists/user/:userId` — listas de um usuário com contagem de itens e preview das 3 primeiras fotos (requer token)
- `GET /lists/:listId` — detalhe completo da lista com todos os posts (id, photoUrl, latitude, longitude, placeName, rating, category) (requer token)
- `POST /lists/:listId/items` — body: `{ postId }`; adiciona post à lista se pertencer ao usuário logado (requer token)
- `DELETE /lists/:listId/items/:postId` — remove post da lista (requer token)
- `DELETE /lists/:listId` — deleta lista inteira; só o dono pode (requer token)

## Estrutura da ExploreScreen
A tela Explorar foi completamente refatorada com:
- **Header fixo**: título "Explorar" + barra de busca com ícone de lupa (fundo #F5F5F5)
- **Debounce de 500ms**: pesquisa é disparada 500ms após o usuário parar de digitar
- **Pills horizontais**: filtros "Tudo", "Usuários", "Restaurantes", "Pontos Turísticos", "Momentos"
- **Estado vazio (sem pesquisa)**: alternador Mapa/Grade
  - Modo Mapa: MapView com localização real via `expo-location` e 5 pins mock próximos
  - Modo Grade: grade 2 colunas com 8 posts recomendados fake
- **Com pesquisa + filtro de lugar**: mensagem "Em breve" centralizada
- **Com pesquisa + filtro Usuários/Tudo**: lista com avatar, nome, username e botão "Seguir"/"Seguindo" (integrado às rotas `/follows`)

## Próximos passos
- [x] Tela de login com Google e Email
- [x] Conexão Real da API de Auth com JWT, Bcrypt e AsyncStorage
- [x] Fluxo Real de criar post c/ Upload Cloudinary (NewPostScreen + PostDetailsScreen consumindo Node POST)
- [x] Refatoração de Constants de Ambiente (Expo Constants / dotenv) para Cloudinary e API.
- [x] Feed listando PostCards formatados estilo rede social (Consumindo BD Real via API)
- [x] Mapa de exploração e TikTok style Explore
- [x] UI Completa de Perfil com Maps View global e Grid View populados com API (GET /posts/user/:id)
- [x] Migração de todas as URLs da API de `http://192.168.0.15:3000` para `https://geopost-production.up.railway.app` (produção Railway)
- [x] ExploreScreen refatorada: busca de usuários, follow/unfollow, filtros pill, modo mapa e grade
- [x] Tela de Configurações com seções Conta, Suporte e logout
- [x] Perfil de outro usuário (UserProfileScreen) com contadores reais e botão Seguir/Seguindo
- [x] Feed inteligente: posts de seguidos aparecem primeiro; separador visual "Outros posts" entre os grupos
- [x] Fluxo de criação de restaurante: formulário rico com avaliações por dimensão, chips de culinária/ocasião/horário, faixa de preço, melhor pedido, dica e "Visitaria novamente"
- [x] Suporte a vídeo no upload (NewPostScreen): seleção foto/vídeo, validação de 90s, preview com expo-av, upload para Cloudinary `/video/upload`
- [x] PostCard expandido exibe campos ricos de restaurante: notas por dimensão, chips, badge de retorno, dica em itálico, melhor pedido
- [x] Sistema de listas curadas: modelos List e ListItem no banco, 6 rotas de API, telas MyListsScreen/CreateListScreen/ListDetailScreen, aba Listas no perfil próprio e no perfil de outros usuários, pins coloridos por lista no mapa

## Observações técnicas
- IP da máquina na rede local: 192.168.0.15 (usado apenas para o Expo Packager)
- **URL da API de produção:** `https://geopost-production.up.railway.app`
- Sempre usar $env: no PowerShell (não use SET como no CMD)
- Todo arquivo React Native precisa ter `import React from 'react'` no topo
- Prisma versão 5.22.0 (não usar v7, tem bugs)

## Ideias futuras pós-MVP

### Monetização de influenciadores
- Curador Verificado: influenciadores criam listas curadas de lugares, estabelecimentos pagam para ser incluídos e influenciador recebe parte
- Revenue share por visualização de posts em lugares patrocinados
- Comissão por reserva: restaurante paga quando alguém vai após ver o post
- Pack de viagem: influenciador monta roteiro completo e vende como produto

### Diferenciais competitivos a reforçar
- Mapa pessoal do perfil (identidade geográfica do usuário)
- Avaliações estruturadas por categoria de lugar
- Planejamento de viagem integrado
- Dados agregados por lugar (algo que o Instagram nunca terá)

### Login
- Implementar Google e Apple reais antes do lançamento
- Email já implementado no MVP

### Identidade única
- GeoPost não é rede social de pessoas, é rede social de lugares
- Cada post é uma recomendação, não só uma foto
- Influenciadores são curadores de experiências, não só criadores de conteúdo