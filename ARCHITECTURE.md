# 🏗️ Arquitetura do Magic Recipe Builder

## Visão Geral

O Magic Recipe Builder é uma aplicação web fullstack construída com:
- **Frontend:** React + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth)
- **Build:** Vite
- **Styling:** Tailwind CSS com tema customizado

```
┌─────────────────────────────────────────────────────────┐
│                   Cliente Web (React)                    │
├─────────────────────────────────────────────────────────┤
│  • Pages (Login, Dashboard, Projects, etc)              │
│  • Components (UI, Layout, Auth)                        │
│  • Hooks (useAuth, Custom hooks)                        │
│  • Context (Auth Provider)                              │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/WebSocket
                     ↓
┌─────────────────────────────────────────────────────────┐
│            Supabase / PostgreSQL Backend                │
├─────────────────────────────────────────────────────────┤
│  • Authentication (JWT)                                 │
│  • Database (Profiles, Projects, Tasks)                │
│  • Real-time Subscriptions                             │
│  • Row Level Security (RLS)                            │
└─────────────────────────────────────────────────────────┘
```

---

## Estrutura de Pastas

```
magic-recipe-builder/
│
├── src/
│   ├── components/
│   │   ├── auth/                 # Componentes de autenticação
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ForgotPasswordForm.tsx
│   │   │
│   │   ├── layout/               # Layout da aplicação
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── Navbar.tsx
│   │   │
│   │   ├── ui/                   # Componentes UI (Shadcn)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── ... outros
│   │   │
│   │   ├── recipes/              # Componentes de receitas
│   │   │   ├── RecipeCard.tsx
│   │   │   ├── RecipeForm.tsx
│   │   │   └── RecipeList.tsx
│   │   │
│   │   ├── projects/             # Componentes de projetos
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ProjectList.tsx
│   │   │
│   │   └── dev/                  # Componentes de desenvolvimento
│   │       └── DatabaseDiagnostics.tsx
│   │
│   ├── pages/
│   │   ├── auth/                 # Páginas de autenticação
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── Projects.tsx           # Página de projetos
│   │   ├── Index.tsx              # Página inicial
│   │   └── NotFound.tsx           # Página 404
│   │
│   ├── hooks/
│   │   └── useAuth.tsx            # Hook de autenticação
│   │
│   ├── integrations/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Cliente Supabase configurado
│   │   │   └── types.ts           # Tipos gerados
│   │   │
│   │   └── database/
│   │       └── client.ts          # Cliente de banco local
│   │
│   ├── utils/
│   │   ├── database-check.ts      # Verificador de conexão
│   │   └── ... outros utilitários
│   │
│   ├── App.tsx                    # Componente raiz com routing
│   ├── main.tsx                   # Entrada da aplicação
│   └── index.css                  # Estilos globais
│
├── public/                         # Assets estáticos
│   ├── favicon.ico
│   └── ... imagens
│
├── scripts/
│   └── init-database.sql          # Script de inicialização
│
├── .env                           # Variáveis de ambiente (não commitar)
├── .env.example                   # Exemplo de variáveis
├── vite.config.ts                 # Configuração Vite
├── tailwind.config.ts             # Configuração Tailwind
├── tsconfig.json                  # Configuração TypeScript
├── package.json                   # Dependências
└── README_PT.md                   # Documentação
```

---

## Fluxo de Autenticação

```
┌─────────────────────────────────────────────────────────┐
│  Utilizador não autenticado                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
         ┌─────────────────────────┐
         │  Página de Login/Reg    │
         │  (Login.tsx/Register)   │
         └────────────┬────────────┘
                      │
                      ↓
    ┌─────────────────────────────────────┐
    │  useAuth Hook                       │
    │  - signUp()                         │
    │  - signIn()                         │
    │  - signOut()                        │
    └────────────┬────────────────────────┘
                 │
                 ↓
    ┌─────────────────────────────────────┐
    │  Supabase Auth                      │
    │  - JWT gerado                       │
    │  - Session criada                   │
    │  - Profile carregado                │
    └────────────┬────────────────────────┘
                 │
                 ↓
    ┌─────────────────────────────────────┐
    │  AuthContext.Provider               │
    │  - user                             │
    │  - session                          │
    │  - profile                          │
    │  - loading                          │
    └────────────┬────────────────────────┘
                 │
                 ↓
    ┌─────────────────────────────────────┐
    │  ProtectedRoute                     │
    │  - Redireciona se não autenticado   │
    │  - Mostra Dashboard se autenticado  │
    └─────────────────────────────────────┘
```

---

## Fluxo de Dados

### 1. Carregar Projetos
```
Dashboard.tsx
    ↓
useEffect (on mount)
    ↓
supabase.from('projects').select(...)
    ↓
setProjects(data)
    ↓
Renderizar ProjectCard[]
    ↓
Atualização em tempo real via RLS
```

### 2. Criar Novo Projeto
```
ProjectForm.tsx
    ↓
handleSubmit()
    ↓
supabase.from('projects').insert(newProject)
    ↓
Atualizar estado local ou refetch
    ↓
Sucesso/Erro feedback
    ↓
Navigate to Projects page
```

### 3. Atualizar Perfil
```
ProfileSettings.tsx
    ↓
handleProfileUpdate()
    ↓
useAuth().updateProfile(updates)
    ↓
supabase.from('profiles').update()
    ↓
setProfile(updated)
    ↓
Mostrar confirmação
```

---

## Segurança e RLS

### Row Level Security Policies

```sql
-- Profiles: Utilizador só vê seu perfil
SELECT * FROM profiles WHERE user_id = auth.uid()

-- Projects: Utilizador só vê seus projetos
SELECT * FROM projects WHERE user_id = auth.uid()

-- Tasks: Utilizador só vê suas tarefas
SELECT * FROM tasks WHERE user_id = auth.uid()

-- Team Members: Vê membros de seus projetos
SELECT * FROM team_members 
WHERE project_id IN (
  SELECT id FROM projects WHERE user_id = auth.uid()
)
```

### Autenticação
- JWT tokens via Supabase Auth
- Sessions persistidas em localStorage
- Auto-refresh de tokens expirados
- Logout limpa sessão e localStorage

---

## Estado da Aplicação

### 1. Estado Global (AuthContext)
```typescript
interface AuthContextType {
  user: User | null;              // Utilizador autenticado
  session: Session | null;        // Sessão Supabase
  profile: Profile | null;        // Perfil do utilizador
  loading: boolean;               // Estado de carregamento
  signUp: (...) => Promise;       // Registrar
  signIn: (...) => Promise;       // Login
  signOut: () => Promise;         // Logout
  updateProfile: (...) => Promise; // Atualizar perfil
}
```

### 2. Estado Local (Componentes)
```typescript
// Dashboard.tsx
const [stats, setStats] = useState({...});
const [projects, setProjects] = useState([]);
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(true);

// ProjectForm.tsx
const [name, setName] = useState('');
const [description, setDescription] = useState('');
const [status, setStatus] = useState('active');
```

---

## Integração com Supabase

### Cliente Supabase
```typescript
// src/integrations/supabase/client.ts

import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.VITE_DATABASE_URL,
  process.env.VITE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
```

### Operações Comuns

**Fetch (GET)**
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', userId);
```

**Create (POST)**
```typescript
const { data, error } = await supabase
  .from('projects')
  .insert(newProject);
```

**Update (PUT)**
```typescript
const { data, error } = await supabase
  .from('projects')
  .update(updates)
  .eq('id', projectId);
```

**Delete (DEL)**
```typescript
const { error } = await supabase
  .from('projects')
  .delete()
  .eq('id', projectId);
```

---

## Ciclo de Vida de um Componente

```
Componente Montado
    ↓
useEffect([]) - Carregar dados
    ↓
supabase query
    ↓
setData(resultado)
    ↓
Re-renderizar com dados
    ↓
Utilizador interage (clica, digita)
    ↓
Atualizar estado
    ↓
supabase mutation (insert/update/delete)
    ↓
Re-fetch ou update estado local
    ↓
Componente desmontado - Limpeza
```

---

## Performance Otimizações

### 1. Lazy Loading
```typescript
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Projects = lazy(() => import('./pages/Projects'));

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### 2. Memoização
```typescript
const ProjectCard = memo(({ project }) => (
  <div>...</div>
));
```

### 3. Índices no Banco
```sql
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
```

---

## Padrões de Design

### 1. Context API para Estado Global
```typescript
// AuthProvider fornece autenticação
// useAuth() para acessar
```

### 2. Custom Hooks
```typescript
// useAuth() para autenticação
// Possíveis: useProjects(), useTasks(), useRecipes()
```

### 3. Composição de Componentes
```typescript
<DashboardLayout>
  <Header />
  <Sidebar />
  <MainContent />
</DashboardLayout>
```

### 4. Protected Routes
```typescript
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

---

## Tratamento de Erros

```typescript
try {
  const { data, error } = await supabase
    .from('projects')
    .select('*');
  
  if (error) {
    console.error('Erro ao buscar projetos:', error);
    setError('Falha ao carregar projetos');
  } else {
    setProjects(data);
  }
} catch (err) {
  console.error('Erro inesperado:', err);
  setError('Erro ao conectar ao servidor');
}
```

---

## Escalabilidade Futura

### Possíveis Melhorias
1. **Real-time:** Adicionar subscriptions do Supabase
2. **Cache:** Implementar Redis cache
3. **Search:** Adicionar full-text search
4. **File Storage:** Supabase Storage para imagens
5. **Functions:** Edge functions para lógica serverless
6. **Notifications:** Sistema de notificações push
7. **Analytics:** Rastreamento de eventos
8. **Offline:** Service Workers para offline-first

---

## Deployment

### Vercel
```bash
# Push para main branch
git push origin main

# Vercel deploya automaticamente
```

### Variáveis de Produção
```env
VITE_DATABASE_URL=https://seu-supabase.supabase.co
VITE_ANON_KEY=sua-chave-de-producao
```

---

## Monitoramento e Logs

### Logs de Desenvolvimento
```bash
# Supabase
supabase logs --follow

# Browser Console
console.log('[APP]', message);
```

### Diagnosticar Problemas
```tsx
<DatabaseDiagnostics />
```

---

**Desenvolvido com ❤️ em React + TypeScript + Supabase**
