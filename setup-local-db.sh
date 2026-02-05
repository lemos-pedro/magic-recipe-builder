#!/bin/bash

# Script para configurar banco de dados local
# Uso: bash setup-local-db.sh

echo "🚀 Configurando Magic Recipe Builder com banco local..."
echo ""

# Verificar se o docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se o supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "📦 Instalando Supabase CLI..."
    npm install -g supabase
fi

echo "✅ Dependências verificadas"
echo ""

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado"
else
    echo "✅ Arquivo .env já existe"
fi

echo ""
echo "🐳 Iniciando Supabase local..."
echo ""

# Iniciar Supabase
supabase start

echo ""
echo "✅ Supabase iniciado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Copie as credenciais acima para o arquivo .env"
echo "2. Execute: npm install"
echo "3. Execute: npm run dev"
echo ""
echo "🌐 Supabase Studio (UI de administração): http://localhost:54323"
echo "🔌 Banco de dados: http://localhost:54322"
echo ""
