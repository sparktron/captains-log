import '@testing-library/jest-dom'

// Minimal IndexedDB mock via fake-indexeddb is not available,
// so we reset the db singleton between tests via resetDb()
// and rely on the idb library's own in-memory fallback in jsdom.
