# Configuração do Banco de Dados Local

## Opção 1: Usando Supabase Local (Recomendado)

### Pré-requisitos
- Docker instalado
- Supabase CLI instalado: `npm install -g supabase`

### Passos

1. **Iniciar o Supabase local:**
```bash
supabase start
```

2. **As credenciais padrão serão exibidas. Copie-as para o arquivo `.env`:**
```env
VITE_DATABASE_URL="http://localhost:54321"
VITE_ANON_KEY="sua-chave-anon-aqui"
```

3. **Criar as tabelas necessárias:**
```bash
supabase db push
```

4. **Acessar o Supabase Studio (UI de administração):**
- URL: http://localhost:54323

---

## Opção 2: Usando PostgreSQL Direto

### Pré-requisitos
- PostgreSQL 14+ instalado localmente

### Passos

1. **Criar um banco de dados:**
```bash
createdb recipe_builder
```

2. **Atualizar o `.env`:**
```env
VITE_DATABASE_URL="postgresql://postgres:password@localhost:5432/recipe_builder"
```

3. **Executar as migrations (quando criadas):**
```bash
npm run migrate
```

---

## Estrutura de Tabelas Esperada

O projeto espera as seguintes tabelas:

### `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL,
  display_name VARCHAR(255),
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `projects`
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50),
  end_date DATE,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### `tasks`
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  project_id UUID REFERENCES projects(id),
  title VARCHAR(255) NOT NULL,
  priority VARCHAR(50),
  status VARCHAR(50),
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Testando a Conexão

Para verificar se tudo está funcionando:

1. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

2. Abra o console do navegador (F12) e verifique se há erros

3. Tente fazer login - você deve ser redirecionado para o dashboard se estiver conectado corretamente

---

## Parar o Banco Local (Supabase)

```bash
supabase stop
```

---

## Troubleshooting

**Erro: "Connection refused"**
- Certifique-se de que o Supabase está rodando: `supabase status`
- Ou que o PostgreSQL está rodando em localhost:5432

**Erro: "VITE_DATABASE_URL not found"**
- Verifique se o arquivo `.env` está na raiz do projeto
- Reinicie o servidor de desenvolvimento: `npm run dev`

**Erro ao fazer login**
- Se usando Supabase local, as credenciais de teste são exibidas ao iniciar
- Configure as variáveis de ambiente corretas
