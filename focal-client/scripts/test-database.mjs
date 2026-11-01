// Compare database identity, not credentials, protocol aliases or query options.
// This is defense in depth; callers still use a dedicated test DB and narrowly
// scoped generated-account cleanup. It cannot resolve arbitrary DNS aliases.
function identity(value) {
  const url = new URL(value);
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error('Unsupported database protocol.');
  let host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (['localhost', '127.0.0.1', '::1', ''].includes(host)) host = 'loopback';
  return { host, port: url.port || '5432', database: decodeURIComponent(url.pathname.slice(1)) };
}
export function requireTestDatabase(testUrl, developmentUrl) {
  try {
    if (typeof testUrl !== 'string') throw new Error('Missing test URL.');
    const test = identity(testUrl);
    if (!test.database.endsWith('_test')) throw new Error('Not a test database.');
    if (developmentUrl) {
      const dev = identity(developmentUrl);
      if (test.host === dev.host && test.port === dev.port && test.database === dev.database) throw new Error('Same database.');
    }
    return testUrl;
  } catch {
    // Never put either connection string or parser diagnostics in the error.
    throw new Error('E2E requires a separate PostgreSQL TEST_DATABASE_URL ending in _test.');
  }
}
