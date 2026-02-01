
/**
 * Resolve `{locale}` placeholders in asset paths.
 */
export function withLocale(pathTemplate: string, locale: string): string {
    return pathTemplate.replaceAll('{locale}', locale)
}
