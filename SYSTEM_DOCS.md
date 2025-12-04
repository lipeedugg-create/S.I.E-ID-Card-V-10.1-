# S.I.E - Documentação Técnica Completa

## 1. Visão Geral e Arquitetura
O S.I.E. (Sistema Inteligente Ativo) é uma aplicação Full-Stack projetada para a gestão de associações e comunidades.

- **Frontend:** Single-Page Application (SPA) construída com **React 18 + Vite**. Utiliza **TailwindCSS** para estilização e bibliotecas como `recharts` para gráficos e `leaflet` para mapas.
- **Backend:** API RESTful construída com **Node.js + Express**. É responsável pela lógica de negócios, autenticação e comunicação com o banco de dados.
- **Banco de Dados:** **MySQL 8.0**, um sistema relacional robusto para garantir a integridade dos dados.
- **Inteligência Artificial:** Integração com a API **Google Gemini** para funcionalidades como OCR (reconhecimento de texto em imagens) e geração de texto (Secretária Ativa).

### Fluxo de Dados
O frontend (rodando no navegador do usuário) nunca se comunica diretamente com o banco de dados. Todas as requisições (buscar usuários, salvar um lançamento financeiro) são feitas para a API do backend. O backend, por sua vez, valida a autenticação (via Token JWT), executa a lógica necessária e interage com o banco de dados MySQL.

## 2. Estrutura de Pastas
```
/
├── dist/               # Build de produção do Frontend (gerado por `npm run build`)
├── src/
│   ├── components/     # Componentes React (Módulos da aplicação)
│   ├── services/       # api.ts (Funções para chamar o backend)
│   ├── types.ts        # Definições de tipo (interfaces TypeScript)
│   ├── App.tsx         # Componente raiz, roteamento e layout
│   └── index.tsx       # Ponto de entrada do React
├── uploads/            # Pasta onde o backend salva os arquivos de upload
├── server.js           # Servidor da API (Node.js/Express)
├── database.sql        # Schema completo do banco de dados MySQL
├── DEPLOY.md           # Guia de deploy em produção
├── package.json        # Dependências e scripts do projeto
└── vite.config.ts      # Configuração do Vite (incluindo proxy para o backend)
```

## 3. Endpoints da API
A API é servida a partir do prefixo `/api`. Todas as rotas (exceto `/auth/login` e `/auth/register`) requerem um Token JWT no header `Authorization`.

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Autentica um usuário e retorna um token JWT. |
| POST | `/api/auth/register` | Cria uma solicitação de novo usuário. |
| GET | `/api/auth/me` | Retorna os dados do usuário logado. |
| GET, POST | `/api/users` | Lista ou cria novos usuários (moradores, staff). |
| PUT | `/api/users/:id` | Atualiza um usuário existente. |
| GET, POST | `/api/financials` | Lista ou cria um lançamento financeiro. |
| GET | `/api/dashboard/stats` | Retorna KPIs para a Visão Geral. |
| GET, POST | `/api/bills` | Lista boletos. |
| POST | `/api/bills/generate` | Gera boletos em massa para o mês. |
| GET, POST | `/api/reservations`, `/api/incidents`, `/api/visitors`| Rotas CRUD para o Módulo Operacional. |
| GET, POST | `/api/notices`, `/api/alerts` | Rotas CRUD para o Módulo de Comunicação. |
| GET, POST | `/api/surveys`, `/api/surveys/:id/response`| Rotas CRUD para Pesquisas e Censo. |
| GET, POST | `/api/agenda` | Rotas CRUD para a Agenda/Timeline. |
| GET, PUT | `/api/settings/system` | Gerencia informações globais da associação. |
| GET, PUT | `/api/settings/templates` | Gerencia os templates de carteirinha do Studio IA. |
| GET, POST, PUT, DELETE | `/api/documents` | Gerencia os documentos da Secretária Ativa. |
| POST | `/api/upload/avatar` | Rota para upload de fotos de perfil. |
| POST | `/api/ai/analyze-doc` | Proxy para Gemini analisar um documento (OCR). |
| POST | `/api/ai/generate-document`| Proxy para Gemini gerar texto para um documento. |

## 4. Requisitos de Instalação
- Node.js v18 ou superior
- MySQL v8.0 ou superior
- Credenciais de API do Google Gemini (salvas no `.env`)

## 5. Comandos
- **`npm install`**: Instala todas as dependências do frontend e backend.
- **`npm run dev`**: Inicia o servidor de desenvolvimento do Vite para o frontend.
- **`node server.js`**: Inicia o servidor da API.
- **`npm run build`**: Compila o frontend para produção (gera a pasta `dist`).
- **`node api-checker.js`**: Testa a saúde da API e a conexão com o banco.
- **`node --loader ts-node/esm config-checker.ts`**: Valida as variáveis de ambiente.
