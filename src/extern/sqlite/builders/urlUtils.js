export function normalizeUrl(url) {
    if (!url) return '';
    
    // 1. Remove leading/trailing quotes (if any) and trim
    let nUrl = url.trim().replace(/^['"]|['"]$/g, '');
    
    // 2. Ensure it starts with '/'
    if (!nUrl.startsWith('/')) {
        nUrl = '/' + nUrl;
    }
    
    // 3. Replace any variable placeholders like {something} with {}
    nUrl = nUrl.replace(/\{[^}]*\}/g, '{}');
    
    // 4. Replace known channel codes (mb, ib, cb, ob, etc) with {}
    // We only want to replace them if they are full path segments (e.g. /mb/)
    nUrl = nUrl.replace(/\/(mb|ib|cb|ob)\//ig, '/{}/');
    
    // 5. Remove multiple slashes
    nUrl = nUrl.replace(/\/+/g, '/');
    
    return nUrl;
}
