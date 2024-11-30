'use client';

import useSWR from 'swr';

async function fetchStatus(key: string) {
  const response = await fetch(key);
  const responseBody = await response.json();

  return responseBody;
}

export default function Page() {
  return (
    <div>
      <h1 className="my-4 text-4xl font-bold">Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </div>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR('/api/v1/status', fetchStatus, {
    refreshInterval: 2000,
  });

  return (
    <div>
      Última atualização:{' '}
      {isLoading
        ? 'Carregando...'
        : new Date(data.updated_at).toLocaleString('pt-BR')}
    </div>
  );
}

function DatabaseStatus() {
  const { isLoading, data } = useSWR('/api/v1/status', fetchStatus, {
    refreshInterval: 2000,
  });

  return (
    <div>
      <h1 className="my-4 text-4xl font-bold">Database</h1>

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div>
          <div>Versão: {data.dependencies.database.version}</div>
          <div>
            Conexões abertas: {data.dependencies.database.opened_connections}
          </div>
          <div>
            Conexões máximas: {data.dependencies.database.max_connections}
          </div>
        </div>
      )}
    </div>
  );
}
