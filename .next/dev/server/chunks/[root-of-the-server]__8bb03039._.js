module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs, [project]/node_modules/@prisma/client)");
;
const globalForPrisma = globalThis;
const db = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$2c$__$5b$project$5d2f$node_modules$2f40$prisma$2f$client$29$__["PrismaClient"]({
    log: [
        'query'
    ]
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = db;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[project]/src/lib/firestore.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "firestoreLoad",
    ()=>firestoreLoad,
    "firestoreSave",
    ()=>firestoreSave,
    "isFirestoreConfigured",
    ()=>isFirestoreConfigured
]);
// Server-side Firestore via REST API with service account OAuth
// Uses google-auth-library to get a proper access token
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$google$2d$auth$2d$library$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/google-auth-library/build/src/index.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'crystal-clicker-7d4a2';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
let jwtClient = null;
let tokenCache = null;
function getServiceAccount() {
    const paths = [
        process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), 'firebase-service-account.json'),
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(process.cwd(), '..', 'firebase-service-account.json')
    ].filter(Boolean);
    for (const p of paths){
        try {
            const raw = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"])(p, 'utf-8');
            return JSON.parse(raw);
        } catch  {
            continue;
        }
    }
    return null;
}
async function getAccessToken() {
    if (tokenCache && Date.now() < tokenCache.expires) {
        return tokenCache.token;
    }
    if (!jwtClient) {
        const sa = getServiceAccount();
        if (!sa) return null;
        jwtClient = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$google$2d$auth$2d$library$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["JWT"]({
            email: sa.client_email,
            key: sa.private_key,
            scopes: [
                'https://www.googleapis.com/auth/datastore',
                'https://www.googleapis.com/auth/cloud-platform'
            ]
        });
    }
    try {
        const credentials = await jwtClient.authorize();
        tokenCache = {
            token: credentials.access_token,
            expires: Date.now() + (credentials.expiry_date - Date.now()) - 60000
        };
        return tokenCache.token;
    } catch (e) {
        console.error('Failed to get access token:', e);
        return null;
    }
}
function toFS(val) {
    if (val === null || val === undefined) return {
        nullValue: null
    };
    if (typeof val === 'number') return {
        doubleValue: val
    };
    if (typeof val === 'string') return {
        stringValue: val
    };
    if (typeof val === 'boolean') return {
        booleanValue: val
    };
    if (Array.isArray(val)) return {
        arrayValue: {
            values: val.map(toFS)
        }
    };
    if (typeof val === 'object') return {
        mapValue: {
            fields: Object.fromEntries(Object.entries(val).map(([k, v])=>[
                    k,
                    toFS(v)
                ]))
        }
    };
    return {
        stringValue: String(val)
    };
}
function fromFS(v) {
    if (v.nullValue !== undefined) return null;
    if (v.integerValue !== undefined) return Number(v.integerValue);
    if (v.doubleValue !== undefined) return v.doubleValue;
    if (v.stringValue !== undefined) return v.stringValue;
    if (v.booleanValue !== undefined) return v.booleanValue;
    if (v.arrayValue) return v.arrayValue.values?.map(fromFS) ?? [];
    if (v.mapValue) {
        const obj = {};
        for (const [k, fv] of Object.entries(v.mapValue.fields ?? {})){
            obj[k] = fromFS(fv);
        }
        return obj;
    }
    return null;
}
async function firestoreSave(userId, data) {
    const token = await getAccessToken();
    if (!token) return false;
    try {
        const fields = {};
        for (const [k, v] of Object.entries(data)){
            fields[k] = toFS(v);
        }
        const mask = Object.keys(data).map((k)=>`updateMask.fieldPaths=${k}`).join('&');
        const res = await fetch(`${BASE_URL}/saves/${userId}?${mask}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                fields
            })
        });
        if (!res.ok) {
            const text = await res.text();
            console.error('Firestore save failed:', res.status, text);
            return false;
        }
        return true;
    } catch (e) {
        console.error('Firestore save error:', e);
        return false;
    }
}
async function firestoreLoad(userId) {
    const token = await getAccessToken();
    if (!token) return null;
    try {
        const res = await fetch(`${BASE_URL}/saves/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (res.status === 404) return null;
        if (!res.ok) {
            const text = await res.text();
            console.error('Firestore load failed:', res.status, text);
            return null;
        }
        const doc = await res.json();
        const result = {};
        for (const [k, v] of Object.entries(doc.fields)){
            result[k] = fromFS(v);
        }
        return result;
    } catch (e) {
        console.error('Firestore load error:', e);
        return null;
    }
}
const isFirestoreConfigured = true;
}),
"[project]/src/app/api/clicker/save/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firestore.ts [app-route] (ecmascript)");
;
;
;
async function POST(request) {
    try {
        const body = await request.json();
        const userId = body.userId;
        if (!userId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                success: false,
                error: 'userId is required'
            }, {
                status: 400
            });
        }
        // Build the full save data object
        const saveData = {
            crystals: body.crystals,
            crystalsExp: body.crystalsExp ?? 0,
            totalClicks: body.totalClicks,
            totalEarned: body.totalEarned,
            totalEarnedExp: body.totalEarnedExp ?? 0,
            clickPower: body.clickPower,
            multiplier: body.multiplier,
            autoRate: body.autoRate,
            prestige: body.prestige,
            prestigePoints: body.prestigePoints,
            upgrades: body.upgrades,
            achievements: body.achievements,
            goldenClicks: body.goldenClicks,
            totalCrits: body.totalCrits ?? 0,
            maxCombo: body.maxCombo,
            lastOnlineTime: body.lastOnlineTime ?? Date.now(),
            totalEvents: body.totalEvents ?? 0,
            currentArea: body.currentArea ?? 'naica',
            unlockedAreas: body.unlockedAreas ?? [
                'naica'
            ]
        };
        // Sanitize numeric fields — NaN must never be written to DB
        const safe = (v, fallback)=>{
            const n = typeof v === 'number' ? v : Number(v);
            return isFinite(n) ? n : fallback;
        };
        // Write to SQLite (local server database)
        const sqliteData = {
            crystals: safe(saveData.crystals, 0),
            crystalsExp: safe(saveData.crystalsExp, 0),
            totalClicks: safe(saveData.totalClicks, 0),
            totalEarned: safe(saveData.totalEarned, 0),
            totalEarnedExp: safe(saveData.totalEarnedExp, 0),
            clickPower: safe(saveData.clickPower, 1),
            multiplier: safe(saveData.multiplier, 1),
            autoRate: safe(saveData.autoRate, 0),
            prestige: safe(saveData.prestige, 0),
            prestigePoints: safe(saveData.prestigePoints, 0),
            upgrades: JSON.stringify(saveData.upgrades),
            achievements: JSON.stringify(saveData.achievements),
            goldenClicks: safe(saveData.goldenClicks, 0),
            totalCrits: safe(saveData.totalCrits, 0),
            maxCombo: safe(saveData.maxCombo, 0),
            lastOnlineTime: safe(saveData.lastOnlineTime, Date.now()),
            totalEvents: safe(saveData.totalEvents, 0),
            currentArea: saveData.currentArea ?? 'naica',
            unlockedAreas: JSON.stringify(saveData.unlockedAreas ?? [
                'naica'
            ])
        };
        const existing = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].clickerSave.findUnique({
            where: {
                userId
            }
        });
        if (existing) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].clickerSave.update({
                where: {
                    userId
                },
                data: sqliteData
            });
        } else {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].clickerSave.create({
                data: {
                    ...sqliteData,
                    userId
                }
            });
        }
        // Write to Firestore (cloud database) — fire and forget, don't block response
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isFirestoreConfigured"]) {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firestore$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["firestoreSave"])(userId, saveData).catch((e)=>{
                console.error('Firestore save background error:', e);
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (error) {
        console.error('Save error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: 'Failed to save'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__8bb03039._.js.map