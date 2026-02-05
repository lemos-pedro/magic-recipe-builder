import { useState, useEffect } from 'react';
import { checkDatabaseConnection, checkAuthConfiguration } from '@/utils/database-check';

interface DiagnosticResult {
  database: {
    connected: boolean;
    message: string;
  };
  auth: {
    configured: boolean;
    message: string;
  };
  timestamp: string;
}

export function DatabaseDiagnostics() {
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const dbCheck = await checkDatabaseConnection();
      const authCheck = await checkAuthConfiguration();

      setResults({
        database: {
          connected: dbCheck.connected,
          message: dbCheck.message,
        },
        auth: {
          configured: authCheck.configured,
          message: authCheck.message,
        },
        timestamp: new Date().toLocaleTimeString('pt-AO'),
      });
    } catch (error) {
      console.error('Erro ao executar diagnóstico:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg my-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Diagnóstico do Banco de Dados</h3>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Atualizar'}
        </button>
      </div>

      {results && (
        <div className="space-y-3">
          <div className="text-xs text-gray-500 mb-3">
            Última verificação: {results.timestamp}
          </div>

          {/* Database Status */}
          <div className="p-3 bg-white border border-gray-200 rounded">
            <div className="flex items-start space-x-2">
              <div
                className={`w-3 h-3 rounded-full mt-0.5 ${
                  results.database.connected ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">Banco de Dados</p>
                <p className="text-xs text-gray-600 mt-1">{results.database.message}</p>
              </div>
            </div>
          </div>

          {/* Auth Status */}
          <div className="p-3 bg-white border border-gray-200 rounded">
            <div className="flex items-start space-x-2">
              <div
                className={`w-3 h-3 rounded-full mt-0.5 ${
                  results.auth.configured ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-700">Autenticação</p>
                <p className="text-xs text-gray-600 mt-1">{results.auth.message}</p>
              </div>
            </div>
          </div>

          {/* Overall Status */}
          <div
            className={`p-2 text-xs rounded text-center font-medium ${
              results.database.connected && results.auth.configured
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
            }`}
          >
            {results.database.connected && results.auth.configured
              ? '✅ Sistema pronto para usar'
              : '⚠️ Existem problemas a resolver'}
          </div>
        </div>
      )}
    </div>
  );
}
