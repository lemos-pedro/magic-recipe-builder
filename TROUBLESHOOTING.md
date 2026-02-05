# 🔧 Guia de Troubleshooting - Magic Recipe Builder

## Problemas Comuns e Soluções

### 🔴 "Erro: Connection refused"

**Causa:** O banco de dados não está acessível.

**Solução:**
```bash
# 1. Verifique se Supabase está rodando
supabase status

# Se não estiver rodando, inicie
supabase start

# Se estiver com Docker parado
docker ps

# Verifique a porta (deve ser 54321 ou 5432)
netstat -an | grep 5432
netstat -an | grep 54321
```

---

### 🔴 "Erro: VITE_DATABASE_URL não encontrado"

**Causa:** Arquivo `.env` não existe ou não está configurado.

**Solução:**
```bash
# 1. Crie o arquivo .env na raiz do projeto
cp .env.example .env

# 2. Adicione as variáveis corretas (após rodar 'supabase start')
# VITE_DATABASE_URL="http://localhost:54321"
# VITE_ANON_KEY="sua-chave-aqui"

# 3. Reinicie o servidor
npm run dev
```

---

### 🔴 "Erro: ANON_KEY inválida"

**Causa:** A chave anon incorreta ou vencida.

**Solução:**
```bash
# 1. Pare o Supabase
supabase stop

# 2. Remova os volumes locais
supabase db reset

# 3. Inicie novamente
supabase start

# 4. Copie a nova chave para .env
```

---

### 🔴 "Erro ao fazer login: Invalid login credentials"

**Causa:** Utilizador não existe ou credenciais incorretas.

**Solução:**
```bash
# 1. Abra o Supabase Studio
# http://localhost:54323

# 2. Navegue para: Authentication > Users

# 3. Crie um novo utilizador

# 4. Use essas credenciais para fazer login na aplicação
```

---

### 🔴 "Erro: Tabelas não existem"

**Causa:** Banco de dados vazio, sem schema.

**Solução:**
```bash
# Se usando Supabase local:
supabase db push

# Se usando PostgreSQL direto:
# 1. Abra um terminal PostgreSQL
psql -U postgres -d recipe_builder

# 2. Execute o script SQL
\i scripts/init-database.sql

# 3. Saia
\q
```

---

### 🔴 "Erro: Database 'recipe_builder' does not exist"

**Causa:** Banco de dados não foi criado.

**Solução (PostgreSQL):**
```bash
# Crie o banco
createdb recipe_builder

# Ou pela linha de comando PostgreSQL
psql -U postgres
CREATE DATABASE recipe_builder;
\q
```

---

### 🔴 "Erro: Blank screen no login"

**Causa:** Erro de JavaScript ou problema de autenticação.

**Solução:**
```bash
# 1. Abra a consola do navegador (F12)
# 2. Verifique se há mensagens de erro
# 3. Tente acessar o Supabase Studio
# 4. Se o Studio não carregar, Supabase não está rodando

# Verifique os logs
supabase logs --db
supabase logs --auth
```

---

### 🔴 "Erro: Permissão negada ao conectar ao banco"

**Causa:** Utilizador PostgreSQL sem permissão.

**Solução (PostgreSQL):**
```bash
# Conecte como admin
psql -U postgres

# Crie um novo utilizador com permissões
CREATE USER recipe_user WITH PASSWORD 'password123';

# Dê permissões
ALTER USER recipe_user CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE recipe_builder TO recipe_user;

# Saia
\q

# Atualize o .env
# VITE_DATABASE_URL="postgresql://recipe_user:password123@localhost:5432/recipe_builder"
```

---

### 🔴 "Erro: Port já está em uso"

**Causa:** Supabase ou outro serviço já está rodando na porta.

**Solução:**
```bash
# Identifique o processo
lsof -i :54321

# Ou no Windows
netstat -ano | findstr :54321

# Mate o processo
kill -9 <PID>

# No Windows
taskkill /PID <PID> /F

# Inicie Supabase novamente
supabase start
```

---

### 🔴 "Erro: Docker não está instalado"

**Causa:** Docker é necessário para Supabase local.

**Solução:**

**Windows/Mac:**
- Baixe [Docker Desktop](https://www.docker.com/products/docker-desktop)
- Instale e reinicie o computador

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install docker.io

# Adicione seu utilizador ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Verifique a instalação
docker --version
```

---

### 🔴 "Erro: Perfil não encontrado no login"

**Causa:** Tabela de profiles vazia ou profile_id incorreto.

**Solução:**
```bash
# 1. Verifique a tabela de profiles
# No Supabase Studio: Database > profiles

# 2. Se estiver vazia, crie um profile manualmente
INSERT INTO profiles (user_id, display_name)
VALUES ('uuid-do-usuario', 'Seu Nome');

# 3. Ou recrie a tabela com o script
\i scripts/init-database.sql
```

---

### 🔴 "Erro: "useAuth must be used within an AuthProvider"

**Causa:** Componente não está dentro do AuthProvider.

**Solução:**
```tsx
// Verifique em src/main.tsx que o App está envolvido por AuthProvider

<AuthProvider>
  <App />
</AuthProvider>
```

---

### 🔴 "Erro: Build falha com "Cannot find module""

**Causa:** Dependência não instalada.

**Solução:**
```bash
# Limpe node_modules e reinstale
rm -rf node_modules
npm install

# Ou (se usar yarn)
rm -rf node_modules
yarn install

# Limpe o cache
npm cache clean --force
```

---

### 🔴 "Erro: CORS error ao conectar ao banco"

**Causa:** Configuração de CORS incorreta no Supabase.

**Solução:**
```bash
# 1. No Supabase Studio, vá para Settings > API

# 2. Adicione seu localhost aos origins permitidos:
# - http://localhost:5173
# - http://127.0.0.1:5173
# - http://localhost:3000

# 3. Clique em "Save"
```

---

## 🔍 Ferramentas de Diagnóstico

### Verificador Automático
```tsx
import { DatabaseDiagnostics } from '@/components/dev/DatabaseDiagnostics';

export default function MyPage() {
  return (
    <div>
      <DatabaseDiagnostics />
    </div>
  );
}
```

### Diagnóstico Manual
```tsx
import { runFullDatabaseDiagnostics } from '@/utils/database-check';

// No console do navegador (F12) ou em uma página:
await runFullDatabaseDiagnostics();
```

### Verificar Logs do Supabase
```bash
# Logs do banco
supabase logs --db

# Logs de autenticação
supabase logs --auth

# Logs de função
supabase logs --function

# Ver todos
supabase logs
```

---

## 📊 Verificações de Saúde

### 1. Banco de Dados
```bash
# Conecte e teste
psql -U postgres -d recipe_builder -c "SELECT version();"

# Ou via Supabase CLI
supabase db ps
```

### 2. Variáveis de Ambiente
```bash
# Verifique o arquivo .env
cat .env

# Deve conter:
# VITE_DATABASE_URL
# VITE_ANON_KEY
```

### 3. Conexão de Rede
```bash
# Teste se o porto está aberto
nc -zv localhost 54321

# Ou no Windows
Test-NetConnection -ComputerName localhost -Port 54321
```

### 4. Supabase Status
```bash
# Verifique o status
supabase status

# Saída esperada:
# supabase local development started
# ...
# DB URL: postgresql://postgres:postgres@localhost:54322/postgres
```

---

## 🆘 Ainda com Problemas?

1. **Verifique a documentação:**
   - [QUICK_START.md](./QUICK_START.md)
   - [DATABASE_LOCAL.md](./DATABASE_LOCAL.md)

2. **Veja os logs:**
   ```bash
   supabase logs
   ```

3. **Reset completo (último recurso):**
   ```bash
   # Parar tudo
   supabase stop

   # Limpar completamente
   rm -rf .supabase

   # Reiniciar
   supabase start
   ```

4. **Verificar versões:**
   ```bash
   node --version       # Deve ser 18+
   npm --version        # Deve ser 9+
   supabase --version
   docker --version
   ```

---

## 📞 Obtendo Ajuda

Se o problema persistir:

1. Copie a mensagem de erro completa
2. Execute `supabase logs` e compartilhe
3. Verifique o console do navegador (F12)
4. Procure a solução em: [Supabase Docs](https://supabase.com/docs)

---

**Dica:** Mantenha o arquivo de logs aberto em outro terminal enquanto desenvolve:
```bash
supabase logs --follow
```

Assim você verá erros em tempo real!
