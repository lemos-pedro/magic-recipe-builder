// Verificador de conexão com o banco de dados
import { supabase } from '@/integrations/supabase/client';

export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  details?: any;
}> {
  try {
    // Tentar fazer uma query simples
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      // Verificar se é erro de autenticação
      if (error.code === 'PGRST301') {
        return {
          connected: false,
          message: '❌ Erro de autenticação. Verifique suas credenciais no arquivo .env',
          details: error,
        };
      }

      // Verificar se é erro de conexão
      if (error.message.includes('connection refused') || error.message.includes('ECONNREFUSED')) {
        return {
          connected: false,
          message: '❌ Banco de dados não está acessível. Certifique-se de que está rodando em localhost:54321 ou localhost:5432',
          details: error,
        };
      }

      // Outros erros
      return {
        connected: false,
        message: `❌ Erro ao conectar ao banco: ${error.message}`,
        details: error,
      };
    }

    // Sucesso
    return {
      connected: true,
      message: '✅ Conexão com banco de dados estabelecida com sucesso!',
      details: { rowsFound: data?.length || 0 },
    };
  } catch (error) {
    return {
      connected: false,
      message: `❌ Erro ao verificar conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: error,
    };
  }
}

// Função para testar autenticação
export async function checkAuthConfiguration(): Promise<{
  configured: boolean;
  message: string;
  details?: any;
}> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        configured: false,
        message: `⚠️ Erro ao verificar sessão: ${error.message}`,
        details: error,
      };
    }

    if (data.session) {
      return {
        configured: true,
        message: '✅ Usuário já está autenticado',
        details: { user: data.session.user.email },
      };
    }

    return {
      configured: true,
      message: '✅ Autenticação configurada corretamente (sem usuário ativo)',
      details: null,
    };
  } catch (error) {
    return {
      configured: false,
      message: `❌ Erro ao verificar autenticação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      details: error,
    };
  }
}

// Função para diagnostic completo
export async function runFullDatabaseDiagnostics() {
  console.log('🔍 Iniciando diagnóstico do banco de dados...\n');

  // Verificar variáveis de ambiente
  console.log('📋 Variáveis de Ambiente:');
  console.log(`- VITE_DATABASE_URL: ${import.meta.env.VITE_DATABASE_URL ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log(`- VITE_ANON_KEY: ${import.meta.env.VITE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}`);
  console.log('');

  // Verificar conexão
  const dbCheck = await checkDatabaseConnection();
  console.log('🔌 Conexão do Banco de Dados:');
  console.log(`- ${dbCheck.message}`);
  if (dbCheck.details?.error) {
    console.log(`  Erro: ${JSON.stringify(dbCheck.details.error, null, 2)}`);
  }
  console.log('');

  // Verificar autenticação
  const authCheck = await checkAuthConfiguration();
  console.log('🔐 Configuração de Autenticação:');
  console.log(`- ${authCheck.message}`);
  console.log('');

  return {
    database: dbCheck.connected,
    auth: authCheck.configured,
  };
}
