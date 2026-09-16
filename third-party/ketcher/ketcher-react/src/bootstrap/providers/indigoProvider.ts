// Re-exported from ketcher-core so every package shares a single instance.
// Do not reintroduce a local copy: KetcherBuilder (react) writes it while
// ketcher-macromolecules reads it, and two copies would silently disconnect them.
export { IndigoProvider } from 'ketcher-core';
