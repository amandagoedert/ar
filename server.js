import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolver diretório raiz do projeto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname; // este arquivo está na raiz do projeto

// Importar handlers das rotas API (formato Vercel)
import apiHandler from './api/api.js';
import verificaHandler from './api/verifica.js';
import pagamentoHandler from './api/pagamento.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (frontend)
app.use(express.static(rootDir));

// Helper para adaptar Express req/res ao handler (req, res) estilo Vercel
function adapt(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error('Erro no handler:', err);
      res.status(500).json({ success: false, error: true, message: err.message || 'Erro interno' });
    }
  };
}

// Rotas API (sem extensão para compatibilidade)
app.post('/api/api', adapt(apiHandler));
app.options('/api/api', adapt(apiHandler));

app.get('/api/verifica', adapt(verificaHandler));
app.options('/api/verifica', adapt(verificaHandler));

app.get('/api/pagamento', adapt(pagamentoHandler));

// Fallback para páginas conhecidas
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'Index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
  console.log('Abra: http://localhost:3000/Index.html');
});
