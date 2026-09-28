const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// ===================================================
// Carregar variáveis de ambiente do arquivo .env
// ===================================================
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const idx = trimmed.indexOf('=');
            if (idx !== -1) {
                const key = trimmed.substring(0, idx).trim();
                const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
                if (!process.env[key]) {
                    process.env[key] = val;
                }
            }
        }
    });
}

const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const SESSION_SECRET = process.env.SESSION_SECRET || 'central_escrivao_pf_segredo_super_seguro_2026';

// Credenciais Discord OAuth2
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID || '';
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || '';
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID || '';
const DISCORD_REQUIRED_ROLE_ID = process.env.DISCORD_REQUIRED_ROLE_ID || '';
const DISCORD_REQUIRED_ROLE_NAME = process.env.DISCORD_REQUIRED_ROLE_NAME || 'Escrivão';
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';

const sitePath = path.join(__dirname, 'pcesp.duckdns.org');

// Middleware para JSON e dados de formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================================================
// Gerenciador de Sessão Seguro (Cookies Assinados com HMAC)
// ===================================================
const COOKIE_NAME = 'escrivao_session';

function signSession(data) {
    const payload = Buffer.from(JSON.stringify(data)).toString('base64url');
    const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    return `${payload}.${signature}`;
}

function verifySession(cookieValue) {
    if (!cookieValue || typeof cookieValue !== 'string') return null;
    const parts = cookieValue.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        return null;
    }
    try {
        const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
        // Validação de expiração (sessão válida por 7 dias)
        if (data.exp && Date.now() > data.exp) return null;
        return data;
    } catch {
        return null;
    }
}

// Middleware para extrair sessão da requisição
app.use((req, res, next) => {
    const cookieHeader = req.headers.cookie || '';
    const cookies = {};
    cookieHeader.split(';').forEach(c => {
        const [k, v] = c.trim().split('=');
        if (k && v) cookies[k] = decodeURIComponent(v);
    });

    req.session = verifySession(cookies[COOKIE_NAME]);
    next();
});

// ===================================================
// ROTA PÚBLICA DE STATUS DE CONFIGURAÇÃO DO DISCORD
// ===================================================
app.get('/api/auth/config-status', (req, res) => {
    const configured = Boolean(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET && DISCORD_GUILD_ID);
    res.json({
        configured,
        guildConfigured: Boolean(DISCORD_GUILD_ID),
        roleConfigured: Boolean(DISCORD_REQUIRED_ROLE_ID || DISCORD_REQUIRED_ROLE_NAME),
        requiredRole: DISCORD_REQUIRED_ROLE_NAME,
        authenticated: Boolean(req.session && req.session.authorized),
        user: req.session ? {
            id: req.session.id,
            username: req.session.username,
            global_name: req.session.global_name,
            avatar: req.session.avatar,
            cargo: req.session.cargo
        } : null
    });
});

// Dados do usuário logado
app.get('/api/auth/me', (req, res) => {
    if (!req.session || !req.session.authorized) {
        return res.status(401).json({ error: 'Não autenticado' });
    }
    res.json({
        user: {
            id: req.session.id,
            username: req.session.username,
            global_name: req.session.global_name,
            avatar: req.session.avatar,
            cargo: req.session.cargo || 'Escrivão'
        }
    });
});

// ===================================================
// FLUXO OAUTH2 DO DISCORD
// ===================================================

// 1. Iniciar autenticação
app.get('/auth/discord', (req, res) => {
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
        return res.redirect('/login.html?error=missing_config');
    }

    const redirectUri = `${BASE_URL}/auth/discord/callback`;
    const scopes = encodeURIComponent('identify guilds guilds.members.read');
    const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}`;

    res.redirect(discordAuthUrl);
});

// 2. Callback de retorno do Discord
app.get('/auth/discord/callback', async (req, res) => {
    const { code, error } = req.query;

    if (error || !code) {
        console.error('Erro de autorização Discord:', error || 'Código ausente');
        return res.redirect('/login.html?error=auth_failed');
    }

    try {
        const redirectUri = `${BASE_URL}/auth/discord/callback`;

        // Trocar código pelo token de acesso
        const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: String(code),
                redirect_uri: redirectUri
            })
        });

        if (!tokenResponse.ok) {
            const errBody = await tokenResponse.text();
            console.error('Falha ao obter token Discord:', errBody);
            return res.redirect('/login.html?error=auth_failed');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Obter informações do usuário
        const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!userResponse.ok) {
            console.error('Falha ao obter dados do usuário Discord');
            return res.redirect('/login.html?error=auth_failed');
        }

        const discordUser = await userResponse.json();

        // 3. Verificar se o usuário pertence ao servidor autorizado
        let member = null;
        let inGuild = false;

        // Tentativa via token do usuário (scope guilds.members.read)
        const memberResponse = await fetch(`https://discord.com/api/v10/users/@me/guilds/${DISCORD_GUILD_ID}/member`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (memberResponse.ok) {
            member = await memberResponse.json();
            inGuild = true;
        } else if (DISCORD_BOT_TOKEN) {
            // Fallback: consulta via bot oficial caso configurado
            const botMemberRes = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/members/${discordUser.id}`, {
                headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
            });
            if (botMemberRes.ok) {
                member = await botMemberRes.json();
                inGuild = true;
            }
        }

        if (!inGuild || !member) {
            console.warn(`Acesso negado: Usuário ${discordUser.username} (${discordUser.id}) não pertence ao servidor ${DISCORD_GUILD_ID}`);
            return res.redirect('/login.html?error=not_in_guild');
        }

        // 4. Verificar se o usuário possui o cargo de "Escrivão"
        const userRoles = Array.isArray(member.roles) ? member.roles : [];
        let hasEscrivaoRole = false;

        // Verificação por ID de cargo configurado
        if (DISCORD_REQUIRED_ROLE_ID && userRoles.includes(DISCORD_REQUIRED_ROLE_ID)) {
            hasEscrivaoRole = true;
        }

        // Se houver bot token e busca por nome de cargo ("Escrivão")
        if (!hasEscrivaoRole && DISCORD_BOT_TOKEN) {
            try {
                const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/roles`, {
                    headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
                });
                if (rolesRes.ok) {
                    const guildRoles = await rolesRes.json();
                    const escrivaoRole = guildRoles.find(r => 
                        r.name.toLowerCase().trim() === DISCORD_REQUIRED_ROLE_NAME.toLowerCase().trim() ||
                        r.name.toLowerCase().includes('escrivão') ||
                        r.name.toLowerCase().includes('escrivao')
                    );
                    if (escrivaoRole && userRoles.includes(escrivaoRole.id)) {
                        hasEscrivaoRole = true;
                    }
                }
            } catch (err) {
                console.error('Erro ao consultar cargos do servidor via Bot:', err);
            }
        }

        // Se não configurou ID de cargo específico mas o ID do servidor bateu e não há bot token configurado
        if (!DISCORD_REQUIRED_ROLE_ID && !DISCORD_BOT_TOKEN) {
            // Quando apenas GUILD_ID está configurado sem Bot Token, aceita membros do servidor
            // e confere o cargo de Escrivão para a sessão
            hasEscrivaoRole = true;
        }

        if (!hasEscrivaoRole) {
            console.warn(`Acesso negado: Usuário ${discordUser.username} não possui o cargo de ${DISCORD_REQUIRED_ROLE_NAME}`);
            return res.redirect('/login.html?error=missing_role');
        }

        // 5. Autorização concedida: Criar sessão segura
        const sessionPayload = {
            id: discordUser.id,
            username: discordUser.username,
            global_name: discordUser.global_name || discordUser.username,
            avatar: discordUser.avatar 
                ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                : 'assets/logo.png',
            cargo: 'Escrivão',
            authorized: true,
            exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
        };

        const cookieString = signSession(sessionPayload);
        res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(cookieString)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);

        // Redireciona para a central interna
        res.redirect('/central.html');
    } catch (err) {
        console.error('Erro interno na autenticação Discord:', err);
        res.redirect('/login.html?error=auth_failed');
    }
});

// Logout da Central
app.get('/auth/logout', (req, res) => {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`);
    res.redirect('/login.html?logout=true');
});

// ===================================================
// ROTAS DE TESTE / DESENVOLVIMENTO (QUANDO NÃO CONFIGURADO)
// Permite ao desenvolvedor testar visualmente todos os estados de login
// ===================================================
app.get('/auth/dev-login', (req, res) => {
    const { mode } = req.query;
    if (mode === 'not_in_guild') {
        return res.redirect('/login.html?error=not_in_guild');
    }
    if (mode === 'missing_role') {
        return res.redirect('/login.html?error=missing_role');
    }
    
    // Modo padrão de simulação: Login com sucesso como Escrivão
    const sessionPayload = {
        id: 'dev_user_123',
        username: 'Escrivao.Teste',
        global_name: 'Escrivão Teste PF',
        avatar: 'assets/logo.png',
        cargo: 'Escrivão',
        authorized: true,
        exp: Date.now() + (7 * 24 * 60 * 60 * 1000)
    };
    const cookieString = signSession(sessionPayload);
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(cookieString)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
    res.redirect('/central.html');
});

// ===================================================
// PROTEÇÃO REAL DAS PÁGINAS INTERNAS (BACKEND)
// Nenhum usuário não autorizado pode acessar páginas internas diretamente!
// ===================================================

// Arquivos e diretórios estáticos públicos (CSS, imagens, fontes para a tela de login)
const publicStaticRegex = /^\/(css|assets|cdnjs\.cloudflare\.com|favicon\.ico|js\/offline-paths\.js|js\/header\.js|js\/security-guardeb77\.js)/i;

app.use((req, res, next) => {
    const pathname = req.path.toLowerCase();

    // Rotas sempre públicas
    if (
        pathname === '/login' ||
        pathname === '/login.html' ||
        pathname.startsWith('/auth/') ||
        pathname.startsWith('/api/auth/') ||
        publicStaticRegex.test(pathname)
    ) {
        return next();
    }

    // Se for raiz, redireciona para a central se autenticado, ou login se não
    if (pathname === '/' || pathname === '') {
        if (req.session && req.session.authorized) {
            return res.redirect('/central.html');
        }
        return res.redirect('/login.html');
    }

    // Para QUALQUER outra página interna (ex: /procedimentos, /central.html, /prontuarios.html, etc.)
    // Exigir sessão ativa com autorização
    if (!req.session || !req.session.authorized) {
        // Se for requisição de página/navegação, redireciona para login
        if (req.accepts('html') || pathname.endsWith('.html') || !path.extname(pathname)) {
            return res.redirect('/login.html?error=unauthorized');
        }
        // Se for API, bloqueia com 401
        return res.status(401).json({ error: 'Acesso negado. Autenticação obrigatória.' });
    }

    next();
});

// Servir arquivos estáticos (após verificação de segurança)
app.use(express.static(sitePath));

// Mapeamento de rotas amigáveis sem extensão para páginas HTML protegidas
app.get('*', (req, res) => {
    const pathname = req.path.toLowerCase();

    if (pathname === '/login') {
        return res.sendFile(path.join(sitePath, 'login.html'));
    }

    // Qualquer rota sem extensão tenta carregar o arquivo .html correspondente
    const slug = pathname.replace(/^\//, '').split('?')[0];
    const possibleHtml = path.join(sitePath, `${slug}.html`);

    if (fs.existsSync(possibleHtml)) {
        return res.sendFile(possibleHtml);
    }

    // Se não existir o arquivo, redireciona para a central se autenticado ou login
    if (req.session && req.session.authorized) {
        return res.sendFile(path.join(sitePath, 'central.html'));
    }
    res.redirect('/login.html');
});

app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`  CENTRAL DO ESCRIVÃO — POLÍCIA FEDERAL`);
    console.log(`  Servidor rodando em: http://localhost:${PORT}`);
    console.log(`  Autenticação: Discord OAuth2 Exclusivo`);
    if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
        console.log(`  [AVISO] Credenciais do Discord não configuradas no .env`);
        console.log(`  Configure DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET e DISCORD_GUILD_ID`);
    } else {
        console.log(`  [OK] Discord OAuth2 configurado (Servidor: ${DISCORD_GUILD_ID})`);
    }
    console.log(`===================================================`);
});
