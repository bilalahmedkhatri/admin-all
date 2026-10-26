// The scoped tinyglobby alias is supported only with Next's default cwd root.
// Its explicit-directory expansion differs from fast-glob's custom-root behavior.
export function assertDefaultNextRoot(configs) {
 for (const config of configs) {
  if (config.settings?.next?.rootDir !== undefined) {
   throw new Error("Custom settings.next.rootDir is unsupported while the scoped tinyglobby lint override is active. Verify glob compatibility before enabling custom roots.");
  }
 }
 return configs;
}
