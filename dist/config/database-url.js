"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDatabaseUrl = normalizeDatabaseUrl;
exports.resolveDirectUrl = resolveDirectUrl;
const DEFAULT_CONNECT_TIMEOUT_SECONDS = '15';
function ensureUrl(rawUrl, envName) {
    try {
        return new URL(rawUrl);
    }
    catch {
        throw new Error(`Invalid ${envName}: expected a valid PostgreSQL connection string`);
    }
}
function stripWrappingQuotes(value) {
    return value.replace(/^"(.*)"$/, '$1');
}
function ensureSearchParam(url, key, value) {
    if (!url.searchParams.has(key)) {
        url.searchParams.set(key, value);
    }
}
function isNeonPoolerHost(hostname) {
    return hostname.includes('-pooler.');
}
function toDirectNeonHost(hostname) {
    return hostname.replace('-pooler', '').replace(/\.c-\d+\./, '.');
}
function normalizeDatabaseUrl(rawUrl) {
    const url = ensureUrl(stripWrappingQuotes(rawUrl), 'DATABASE_URL');
    if (isNeonPoolerHost(url.hostname)) {
        ensureSearchParam(url, 'sslmode', 'require');
        ensureSearchParam(url, 'pgbouncer', 'true');
        ensureSearchParam(url, 'connect_timeout', DEFAULT_CONNECT_TIMEOUT_SECONDS);
    }
    return url.toString();
}
function resolveDirectUrl(rawDirectUrl, rawDatabaseUrl) {
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
