const DEFAULT_CONNECT_TIMEOUT_SECONDS = '15';

function ensureUrl(rawUrl: string, envName: string) {
  try {
    return new URL(rawUrl);
  } catch {
    throw new Error(`Invalid ${envName}: expected a valid PostgreSQL connection string`);
  }
}

function stripWrappingQuotes(value: string) {
  return value.replace(/^"(.*)"$/, '$1');
}

function ensureSearchParam(url: URL, key: string, value: string) {
  if (!url.searchParams.has(key)) {
    url.searchParams.set(key, value);
  }
}

function isNeonPoolerHost(hostname: string) {
  return hostname.includes('-pooler.');
}

function toDirectNeonHost(hostname: string) {
  return hostname.replace('-pooler', '').replace(/\.c-\d+\./, '.');
}

export function normalizeDatabaseUrl(rawUrl: string) {
  const url = ensureUrl(stripWrappingQuotes(rawUrl), 'DATABASE_URL');

  if (isNeonPoolerHost(url.hostname)) {
    ensureSearchParam(url, 'sslmode', 'require');
    ensureSearchParam(url, 'pgbouncer', 'true');
    ensureSearchParam(url, 'connect_timeout', DEFAULT_CONNECT_TIMEOUT_SECONDS);
  }

  return url.toString();
}

export function resolveDirectUrl(rawDirectUrl: string | undefined, rawDatabaseUrl: string) {
  if (rawDirectUrl) {
    const directUrl = ensureUrl(stripWrappingQuotes(rawDirectUrl), 'DIRECT_URL');

    if (isNeonPoolerHost(directUrl.hostname)) {
      directUrl.hostname = toDirectNeonHost(directUrl.hostname);
      directUrl.searchParams.delete('pgbouncer');
      ensureSearchParam(directUrl, 'sslmode', 'require');
      ensureSearchParam(directUrl, 'connect_timeout', DEFAULT_CONNECT_TIMEOUT_SECONDS);
    }

    return directUrl.toString();
  }

  const databaseUrl = ensureUrl(stripWrappingQuotes(rawDatabaseUrl), 'DATABASE_URL');

  if (!isNeonPoolerHost(databaseUrl.hostname)) {
    return databaseUrl.toString();
  }

  databaseUrl.hostname = toDirectNeonHost(databaseUrl.hostname);
  databaseUrl.searchParams.delete('pgbouncer');
  ensureSearchParam(databaseUrl, 'sslmode', 'require');
  ensureSearchParam(databaseUrl, 'connect_timeout', DEFAULT_CONNECT_TIMEOUT_SECONDS);

  return databaseUrl.toString();
}
