# 🚀 Guia de Início Rápido - Magic Recipe Builder

## Para Usar com Banco de Dados Local

### 1. Instalar Dependências Globais (primeira vez)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Ou usando Homebrew (macOS)
brew install supabase/tap/supabase
```

### 2. Clonar e Configurar o Projeto

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd magic-recipe-builder

# Instalar dependências do projeto
npm install
```

### 3. Iniciar o Banco de Dados Local

```bash
# Inicia o Supabase local (Docker)
supabase start

# Vai exibir as credenciais, copie-as para o arquivo .env
```

### 4. Configurar Variáveis de Ambiente

Abra o arquivo `.env` e adicione (ou atualize) as variáveis exibidas após `supabase start`:

```env
VITE_DATABASE_URL="http://localhost:54321"
VITE_ANON_KEY="sua-chave-aqui"
```

### 5. Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em: **http://localhost:5173**

---

## URLs Importantes

| Serviço | URL |
|---------|-----|
| App | http://localhost:5173 |
| Supabase Studio (Admin) | http://localhost:54323 |
| Banco de Dados | localhost:54322 |

---

## Comandos Úteis

```bash
# Desenvolver
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint (verificar código)
npm run lint

# Ver status do Supabase local
supabase status

# Parar o Supabase local
supabase stop

# Resetar o banco (cuidado!)
supabase db reset

# Ver logs do banco
supabase logs --db
```

---

## Troubleshooting

### ❌ "Erro de conexão recusada"

```bash
# Verificar se Supabase está rodando
supabase status

# Se não estiver, iniciar:
supabase start
```

### ❌ "VITE_DATABASE_URL não encontrado"

- Verifique se o arquivo `.env` existe na raiz do projeto
- Reinicie o servidor: `npm run dev`

### ❌ "Erro ao fazer login"

1. Abra o Supabase Studio: http://localhost:54323
2. Crie um novo usuário na tabela `auth.users`
3. Ou veja as credenciais de teste nos logs

### ❌ "Tabelas não existem"

```bash
# Resetar o banco (cria as tabelas padrão)
supabase db reset
```

---

## Estrutura do Projeto

```
magic-recipe-builder/
├── src/
│   ├── components/        # Componentes React
│   ├── pages/            # Páginas da aplicação
│   ├── hooks/            # Hooks customizados (useAuth, etc)
│   ├── integrations/     # Integrações externas
│   │   └── supabase/    # Cliente Supabase
│   ├── utils/            # Utilitários
│   ├── App.tsx           # App principal
│   └── main.tsx          # Entrada da aplicação
├── .env                  # Variáveis de ambiente
├── .env.example          # Exemplo de variáveis
├── tailwind.config.ts    # Config Tailwind CSS
└── vite.config.ts        # Config Vite
```

---

## Próximas Etapas

1. **Explorar o Supabase Studio**: Crie tabelas e adicione dados
2. **Modificar a autenticação**: `src/hooks/useAuth.tsx`
3. **Adicionar novas páginas**: Crie em `src/pages/`
4. **Customizar estilos**: Modifique `src/index.css` e use Tailwind CSS

---

## Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação React](https://react.dev)
- [Documentação Tailwind CSS](https://tailwindcss.com)
- [Arquivo DATABASE_LOCAL.md](./DATABASE_LOCAL.md) - Configuração avançada

---

**Dúvidas?** Verifique o arquivo `DATABASE_LOCAL.md` para mais detalhes sobre configurações avançadas.
