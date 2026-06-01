export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { ensureDbReady } = await import('./lib/init-db')
      await ensureDbReady()
    } catch (e) {
      console.error('[init-db] DB initialization failed:', e)
    }
  }
}
