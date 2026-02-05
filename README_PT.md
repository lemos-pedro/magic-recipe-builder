# 🍳 Magic Recipe Builder

Uma aplicação web moderna para gerenciar receitas e projectos culinários com autenticação segura e banco de dados PostgreSQL.

## ✨ Características

- ✅ **Autenticação Segura** - Sistema de login/registro com Supabase
- ✅ **Banco de Dados PostgreSQL** - Suporte para localhost e remoto
- ✅ **Dashboard Intuitivo** - Visualize seus projetos e tarefas
- ✅ **Gestor de Receitas** - Organize suas receitas
- ✅ **Interface Responsiva** - Funciona em desktop, tablet e mobile
- ✅ **Código TypeScript** - Type-safe e robusto

## 🚀 Início Rápido

### Requisitos

- Node.js 18+ 
- npm ou yarn
- Docker (para Supabase local)

### Instalação

1. **Clone o repositório**
```bash
git clone <url>
cd magic-recipe-builder
npm install
```

2. **Configure o banco de dados**
```bash
# Instale Supabase CLI (primeira vez)
npm install -g supabase

# Inicie o Supabase local
supabase start
```

3. **Configure variáveis de ambiente**
Crie um arquivo `.env` na raiz com as credenciais do Supabase:
```env
VITE_DATABASE_URL="http://localhost:54321"
VITE_ANON_KEY="sua-chave-aqui"
```

4. **Inicie o servidor**
```bash
npm run dev
```

A aplicação estará em: **http://localhost:5173**

---

## 📚 Documentação

- **[🚀 Guia de Início Rápido](./QUICK_START.md)** - Comece em 5 minutos
- **[🗄️ Configuração do Banco Local](./DATABASE_LOCAL.md)** - Guia completo de banco de dados
- **[🔧 Referência API](./docs/API.md)** - Endpoints e funções

---

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── auth/              # Componentes de autenticação
│   ├── layout/            # Layout (Sidebar, Header, etc)
│   ├── recipes/           # Componentes de receitas
│   └── dev/               # Componentes de desenvolvimento
├── pages/
│   ├── auth/              # Login, Register, ForgotPassword
│   ├── Dashboard.tsx      # Dashboard principal
│   ├── Projects.tsx       # Gestor de projetos
│   └── Index.tsx          # Página inicial
├── hooks/
│   └── useAuth.tsx        # Hook de autenticação
├── integrations/
│   ├── supabase/          # Cliente Supabase
│   └── database/          # Cliente do banco local
├── utils/
│   └── database-check.ts  # Verificador de conexão
└── App.tsx                # Componente principal
```

---

## 🛠️ Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev          # Iniciar servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build

# Qualidade de código
npm run lint         # Verificar estilos de código
npm run type-check   # Verificar tipos TypeScript

# Banco de dados
supabase start       # Iniciar Supabase local
supabase stop        # Parar Supabase local
supabase status      # Ver status
supabase db reset    # Resetar banco (cuidado!)
```

---

## 🔐 Autenticação

O projeto usa Supabase Auth com os seguintes recursos:

- ✅ Registro com email e senha
- ✅ Login seguro
- ✅ Recuperação de senha
- ✅ Persistência de sessão
- ✅ Logout

### Usar o Hook de Autenticação

```tsx
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, profile, signIn, signOut } = useAuth();
  
  return (
    <div>
      {user ? `Olá, ${profile?.display_name}` : 'Por favor, faça login'}
    </div>
  );
}
```

---

## 📊 Banco de Dados

### Tabelas Principais

- `profiles` - Perfil dos utilizadores
- `projects` - Projetos de receitas
- `tasks` - Tarefas associadas aos projetos

### Diagnosticar Conexão

Para verificar se o banco está funcionando, use o componente de diagnóstico:

```tsx
import { DatabaseDiagnostics } from '@/components/dev/DatabaseDiagnostics';

export default function Dashboard() {
  return (
    <div>
      <DatabaseDiagnostics />
      {/* resto do componente */}
    </div>
  );
}
```

---

## 🎨 Customização

### Estilos

O projeto usa **Tailwind CSS**. Modifique:
- `src/index.css` - Estilos globais
- `tailwind.config.ts` - Configuração Tailwind

### Componentes

Todos os componentes estão em `src/components/`. Para adicionar novos:

```tsx
export function MyComponent() {
  return <div>Meu componente</div>;
}
```

---

## 🐛 Troubleshooting

### Erro: "Connection refused"
```bash
# Verifique se Supabase está rodando
supabase status

# Se não, inicie
supabase start
```

### Erro: "VITE_DATABASE_URL not found"
- Crie o arquivo `.env` na raiz do projeto
- Adicione as variáveis de ambiente
- Reinicie o servidor (`npm run dev`)

### Erro ao fazer login
1. Abra Supabase Studio: http://localhost:54323
2. Crie um utilizador na tabela `auth.users`
3. Verifique as credenciais em `.env`

---

## 📝 Licença

Este projeto é licenciado sob a MIT License.

---

## 👥 Contribuindo

1. Faça fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique a [documentação de início rápido](./QUICK_START.md)
2. Consulte [Configuração do Banco Local](./DATABASE_LOCAL.md)
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ para gerenciar suas receitas**
