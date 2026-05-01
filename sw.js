/**
 * FluffyQuest Service Worker
 * Provides offline caching for fast repeat loads and offline play.
 *
 * Cache strategy:
 *   - PRECACHE: versioned shell (index.html, game.js, phaser, icons)
 *   - ASSETS:   cache-first for all game assets
 *   - RUNTIME:  network-first fallback for everything else
 *
 * Bump CACHE_VERSION on every new deployment so stale caches are pruned.
 */

const CACHE_VERSION = 'v1.0.0';
const PRECACHE      = `fluffyquest-shell-${CACHE_VERSION}`;
const ASSETS_CACHE  = `fluffyquest-assets-${CACHE_VERSION}`;

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/game.js',
    '/phaser.min.js',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// All image/audio assets the game loads — caching here lets the game run
// fully offline after the first visit.
const ASSET_URLS = [
    // Tile types
    '/assets/health.png',
    '/assets/magic.png',
    '/assets/ranged.png',
    '/assets/physical.png',
    '/assets/gold.png',
    // Special tiles
    '/assets/FrostTile.png',
    '/assets/ZapTile.png',
    '/assets/flametile.png',
    // UI
    '/assets/Shoppkeeper.png',
    // Backgrounds / screens
    '/assets/Screens/Load Screen.jpg',
    '/assets/Screens/Town.png',
    '/assets/Screens/Forest.png',
    // Hero sprites
    '/assets/sprites/warrior_anim.png',
    '/assets/sprites/rangersheet.png',
    '/assets/sprites/wizardsheet.png',
    // Enemy sprites
    '/assets/sprites/redsquirrel_anim.png',
    '/assets/sprites/skinnypiggoblin_anim.png',
    '/assets/sprites/orcpig_anim.png',
    '/assets/sprites/slothtroll_anim.png',
    '/assets/sprites/bunnywarlock_anim.png',
    '/assets/sprites/hamsterskeleton_anim.png',
    '/assets/sprites/guineapiglich.png',
    '/assets/sprites/raccoonbandit.png',
    // Rescue cutscene
    '/assets/sprites/Rescues.png',
    // Skill icons
    '/assets/Skills/CleaveSkill.png',
    '/assets/Skills/MinuteMisslesSkill.png',
    '/assets/Skills/MultishotSkill.png',
    '/assets/Skills/Duckandrollskill.png',
    '/assets/Skills/EnergyBeamskill.png',
    '/assets/Skills/RecklessAttackSkill.png',
    '/assets/Skills/CloakofFlamesskill.png',
    '/assets/Skills/Shockandaweskill.png',
    '/assets/Skills/Blizzard.png',
    '/assets/Skills/heartofgoldskill.png',
    '/assets/Skills/FrostbiteSkill.png',
    '/assets/Skills/BurstLightningSkill.png',
    '/assets/Skills/KindlingSkill.png',
    '/assets/Skills/Echosupport.png',
    '/assets/Skills/Focussupport.png',
    '/assets/Skills/brutalitysupport.png',
    '/assets/Skills/addedlightning.png',
    '/assets/Skills/addedcold.png',
    '/assets/Skills/addedfire.png',
    // Music
    '/assets/music/townsong.mp3',
    '/assets/music/battlesong.mp3'
];

// ─── Install: precache shell + assets ────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(PRECACHE).then(cache => cache.addAll(PRECACHE_URLS)),
            caches.open(ASSETS_CACHE).then(cache => cache.addAll(ASSET_URLS))
        ]).then(() => self.skipWaiting())
    );
});

// ─── Activate: prune old caches ───────────────────────────────────────────────
self.addEventListener('activate', event => {
    const allowed = [PRECACHE, ASSETS_CACHE];
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => !allowed.includes(k)).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// ─── Fetch: serve from cache where possible ───────────────────────────────────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Only handle same-origin GET requests
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    const pathname = url.pathname;

    // Assets → cache-first (they change rarely)
    if (pathname.startsWith('/assets/')) {
        event.respondWith(
            caches.open(ASSETS_CACHE).then(cache =>
                cache.match(event.request).then(cached => {
                    if (cached) return cached;
                    return fetch(event.request).then(response => {
                        if (response.ok) cache.put(event.request, response.clone());
                        return response;
                    });
                })
            )
        );
        return;
    }

    // Shell (index, game.js, phaser) → stale-while-revalidate
    event.respondWith(
        caches.open(PRECACHE).then(cache =>
            cache.match(event.request).then(cached => {
                const networkFetch = fetch(event.request).then(response => {
                    if (response.ok) cache.put(event.request, response.clone());
                    return response;
                }).catch(() => cached); // fall back to cache if offline
                // Return cached immediately; update cache in background
                return cached || networkFetch;
            })
        )
    );
});
