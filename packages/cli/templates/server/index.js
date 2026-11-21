// PolicyForges chunk server template.
// Change this file in packages/cli/templates/server to customize future builds.
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const CHUNK_PERMISSIONS = require('./chunk-permissions.json');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const CORS_ORIGIN = process.env.CORS_ORIGIN;
if (!JWT_SECRET) throw new Error('JWT_SECRET é obrigatório.');
if (!CORS_ORIGIN) throw new Error('CORS_ORIGIN é obrigatório.');

app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Token is read from Authorization, not from the browser cookie directly.
app.get('/api/secure-chunks/:chunkName.js', (req, res) => {
  const { chunkName } = req.params;
  const authHeader = req.headers.authorization;

  if (!Object.hasOwn(CHUNK_PERMISSIONS, chunkName)) {
    return res.status(404).json({ error: 'Módulo não encontrado.' });
  }
  // Ensure any name used in a file path stays within protected-chunks.
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(chunkName)) {
    return res.status(404).json({ error: 'Módulo não encontrado.' });
  }
  if (!authHeader || !/^Bearer\s+\S+$/i.test(authHeader)) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido ou inválido.' });
  }

  try {
    const token = authHeader.split(/\s+/)[1];
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
    const allowedRoles = CHUNK_PERMISSIONS[chunkName];
    const userRoles = decoded && typeof decoded === 'object' && Array.isArray(decoded.roles)
      ? decoded.roles : [];
    const hasRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({ error: 'Acesso negado a este módulo.' });
    }

    res.setHeader('Content-Type', 'application/javascript');
    return res.sendFile(path.join(__dirname, 'protected-chunks', `${chunkName}.js`));
  } catch (_error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
});

app.listen(PORT, () => {
  console.log(`🛡️ Servidor RBAC rodando na porta ${PORT}`);
});
