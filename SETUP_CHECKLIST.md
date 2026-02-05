# ✅ Checklist de Configuração Inicial

Use este checklist para garantir que tudo está configurado corretamente.

## 📋 Fase 1: Instalação de Dependências Globais

- [ ] Node.js 18+ instalado
  ```bash
  node --version
  ```

- [ ] npm 9+ instalado
  ```bash
  npm --version
  ```

- [ ] Docker instalado (para Supabase local)
  ```bash
  docker --version
  ```

- [ ] Supabase CLI instalado
  ```bash
  npm install -g supabase
  supabase --version
  ```

- [ ] Git instalado
  ```bash
  git --version
  ```

---

## 📋 Fase 2: Configurar Repositório

- [ ] Repositório clonado
  ```bash
  git clone <url>
  cd magic-recipe-builder
  ```

- [ ] Branch correta (main)
  ```bash
  git branch
  git checkout main
  ```

- [ ] Dependências do projeto instaladas
  ```bash
  npm install
  ```

- [ ] Arquivo .env criado
  ```bash
  cp .env.example .env
  ```

---

## 📋 Fase 3: Banco de Dados

### Opção A: Supabase Local (Recomendado)

- [ ] Supabase iniciado
  ```bash
  supabase start
  ```

- [ ] Credenciais copiadas para .env
  ```bash
  # Procure estas linhas na saída:
  # DB URL: ...
  # anon key: ...
  ```

- [ ] Verificar status
  ```bash
  supabase status
  ```

- [ ] Banco de dados criado (opcional, automático)
  ```bash
  supabase db push
  ```

- [ ] Tabelas criadas com sucesso
  - Abrir Supabase Studio: http://localhost:54323
  - Verificar na aba Database
  - Devem existir: profiles, projects, tasks

### Opção B: PostgreSQL Local

- [ ] PostgreSQL instalado
  ```bash
  psql --version
  ```

- [ ] Banco de dados criado
  ```bash
  createdb recipe_builder
  ```

- [ ] Arquivo .env atualizado
  ```env
  VITE_DATABASE_URL="postgresql://postgres:password@localhost:5432/recipe_builder"
  ```

- [ ] Tabelas criadas
  ```bash
  psql recipe_builder < scripts/init-database.sql
  ```

---

## 📋 Fase 4: Variáveis de Ambiente

- [ ] Arquivo .env configurado
  ```bash
  cat .env
  ```

- [ ] VITE_DATABASE_URL presente e preenchida
  ```env
  VITE_DATABASE_URL=http://localhost:54321
  ```

- [ ] VITE_ANON_KEY presente e preenchida
  ```env
  VITE_ANON_KEY=sua-chave-aqui
  ```

- [ ] Nenhuma variável está vazia
  - Abra .env e verifique todos os campos

- [ ] Arquivo .env NÃO foi commitado (verificar .gitignore)
  ```bash
  grep ".env" .gitignore
  ```

---

## 📋 Fase 5: Servidor de Desenvolvimento

- [ ] Servidor iniciado
  ```bash
  npm run dev
  ```

- [ ] Terminal mostra a URL: http://localhost:5173
  ```
  ✓ VITE v... built in ...
  ➜  Local:   http://localhost:5173/
  ```

- [ ] Página inicial carrega
  - Abra http://localhost:5173 no navegador
  - Deve ver a página inicial com botões "Entrar" e "Começar Agora"

- [ ] Sem erros de conexão no console
  - Abra DevTools (F12)
  - Verifique a aba Console
  - Não deve haver erros vermelhos

---

## 📋 Fase 6: Autenticação

- [ ] Criar primeiro utilizador no Supabase Studio
  - URL: http://localhost:54323
  - Navegue para: Authentication > Users
  - Clique em "Add user"
  - Email: test@example.com
  - Password: password123
  - Clique "Create user"

- [ ] Fazer login na aplicação
  - URL: http://localhost:5173/login
  - Email: test@example.com
  - Password: password123
  - Clique "Entrar"

- [ ] Redirecionado para Dashboard
  - Deve aparecer a página de Dashboard
  - Deve ver "Olá, Test" ou similar no header

- [ ] Logout funciona
  - Clique no botão de Logout
  - Deve voltar para página inicial

- [ ] Registro funciona
  - Vá para http://localhost:5173/register
  - Preencha email e password
  - Clique "Criar Conta"
  - Deve fazer login automaticamente

---

## 📋 Fase 7: Banco de Dados Operacional

- [ ] Supabase Studio carrega
  - URL: http://localhost:54323
  - Deve ver interface de administração

- [ ] Tabelas visíveis
  - Navegue para: Database > Tables
  - Deve ver: profiles, projects, tasks, team_members, project_templates

- [ ] Dados de teste carregam
  - Navegue para: profiles
  - Deve ver pelo menos um perfil (do utilizador de teste)

- [ ] Queries funcionam no SQL Editor
  ```sql
  SELECT * FROM profiles;
  ```

- [ ] RLS está ativada (opcional, verificação)
  - Policies devem estar configuradas

---

## 📋 Fase 8: Funcionalidades Básicas

- [ ] Dashboard carrega sem erros
  - Deve mostrar estatísticas (Projects, Tasks, Teams)
  - Deve mostrar lista de projetos

- [ ] Criar novo projeto
  - Clique em "New Project"
  - Preencha formulário
  - Clique "Create"
  - Projeto deve aparecer na lista

- [ ] Ver detalhes do projeto
  - Clique em um projeto
  - Deve abrir página de detalhes

- [ ] Editar projeto
  - Clique em "Edit"
  - Mude algo (nome, descrição)
  - Clique "Save"
  - Mudanças devem ser salvas

- [ ] Deletar projeto
  - Clique em "Delete"
  - Confirme
  - Projeto deve desaparecer da lista

- [ ] Criar tarefa
  - Dentro de um projeto
  - Clique em "Add Task"
  - Preencha detalhes
  - Tarefa deve ser criada

---

## 📋 Fase 9: Código e Build

- [ ] Sem erros de TypeScript
  ```bash
  npm run type-check
  ```

- [ ] Sem warnings de ESLint
  ```bash
  npm run lint
  ```

- [ ] Build completa sem erros
  ```bash
  npm run build
  ```

- [ ] Build pode fazer preview
  ```bash
  npm run preview
  ```

- [ ] Preview carrega em http://localhost:4173

---

## 📋 Fase 10: Git e Controle de Versão

- [ ] Nenhum arquivo .env no git
  ```bash
  git status | grep .env
  ```

- [ ] Mudanças foram commitadas
  ```bash
  git add .
  git commit -m "Setup inicial completado"
  ```

- [ ] Branch foi atualizada
  ```bash
  git push origin main
  ```

- [ ] Não há conflitos de merge

---

## 📋 Troubleshooting Rápido

### Se algo não funciona:

1. **Erro de conexão**
   ```bash
   supabase status
   # Se não está rodando:
   supabase start
   ```

2. **Porta em uso**
   ```bash
   lsof -i :54321
   # Mate o processo e reinicie
   ```

3. **Variáveis não encontradas**
   ```bash
   # Verifique .env
   cat .env
   # Reinicie o servidor
   npm run dev
   ```

4. **Tabelas não existem**
   ```bash
   # Se usando PostgreSQL
   psql recipe_builder < scripts/init-database.sql
   # Se usando Supabase
   supabase db push
   ```

5. **Login não funciona**
   - Verifique se utilizador existe em Supabase Studio
   - Crie um novo utilizador manualmente
   - Tente novamente com essas credenciais

---

## 📋 Verificação Final

Todos os itens devem estar marcados (✅) antes de começar a desenvolver.

Se algum item não estiver marcado:
1. Leia as instruções correspondentes
2. Execute o comando mostrado
3. Marque quando completado

**Status:** [ ] Pronto para desenvolver

---

## 🎉 Próximas Etapas

Depois de completar este checklist:

1. Ler [QUICK_START.md](./QUICK_START.md)
2. Explorar [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Começar a desenvolver novas funcionalidades
4. Consultar [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) se tiver problemas

---

**Parabéns! Seu ambiente de desenvolvimento está pronto! 🚀**
