module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/firebase.ts [app-ssr] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "app",
    ()=>app,
    "auth",
    ()=>auth,
    "googleProvider",
    ()=>googleProvider,
    "isFirebaseConfigured",
    ()=>isFirebaseConfigured
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
'use client';
;
;
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAFH8ANO2iIxhNHqTcmmPsHOjlq1MVwGno',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'crystal-clicker-7d4a2.firebaseapp.com',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'crystal-clicker-7d4a2',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'crystal-clicker-7d4a2.firebasestorage.app',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '335849247057',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:335849247057:web:264db1e72a1178a7054370'
};
const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
const app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApps"])().length === 0 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getApps"])()[0];
const auth = ("TURBOPACK compile-time truthy", 1) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAuth"])(app) : "TURBOPACK unreachable";
const googleProvider = ("TURBOPACK compile-time truthy", 1) ? new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GoogleAuthProvider"]() : "TURBOPACK unreachable";
;
}),
"[project]/src/lib/auth-context.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/lib/firebase.ts [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/node-esm/index.js [app-ssr] (ecmascript)");
'use client';
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])(null);
const STORAGE_KEY = 'crystal_clicker_auth';
function generateGuestId() {
    return 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}
function persistAuth(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch  {}
}
function loadPersistedAuth() {
    try {
        if ("TURBOPACK compile-time truthy", 1) return null;
        //TURBOPACK unreachable
        ;
        const raw = undefined;
    } catch  {
        return null;
    }
}
function clearPersistedAuth() {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch  {}
}
function getInitialState() {
    // Always start loading on both server and client to avoid hydration mismatch.
    // The useEffect will resolve the actual auth state after mount.
    return {
        user: null,
        loading: true,
        isGuest: false,
        userId: null,
        displayName: null,
        photoURL: null
    };
}
function AuthProvider({ children }) {
    const [state, setState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(getInitialState);
    const initialized = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    // Resolve auth state after mount (avoids hydration mismatch)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (initialized.current) return;
        initialized.current = true;
        const persisted = loadPersistedAuth();
        // Guest session found — restore immediately
        if (persisted?.mode === 'guest') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setState({
                user: null,
                loading: false,
                isGuest: true,
                userId: persisted.userId,
                displayName: persisted.displayName || 'Guest Miner',
                photoURL: null
            });
            return;
        }
        // Google session persisted — verify with Firebase (with 3s timeout to prevent infinite loading)
        if (persisted?.mode === 'google' && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isFirebaseConfigured"] && __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["auth"]) {
            let settled = false;
            const finish = (s)=>{
                if (settled) return;
                settled = true;
                setState(s);
            };
            // Timeout: if Firebase can't connect within 3 seconds, clear session and show sign-in
            const timer = setTimeout(()=>{
                clearPersistedAuth();
                finish({
                    user: null,
                    loading: false,
                    isGuest: false,
                    userId: null,
                    displayName: null,
                    photoURL: null
                });
            }, 3000);
            const unsubscribe = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["auth"].onAuthStateChanged((firebaseUser)=>{
                clearTimeout(timer);
                if (firebaseUser) {
                    persistAuth({
                        mode: 'google',
                        userId: firebaseUser.uid,
                        displayName: firebaseUser.displayName || undefined,
                        photoURL: firebaseUser.photoURL || undefined
                    });
                    finish({
                        user: firebaseUser,
                        loading: false,
                        isGuest: false,
                        userId: firebaseUser.uid,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL
                    });
                } else {
                    // Google session expired — clear and show sign-in
                    clearPersistedAuth();
                    finish({
                        user: null,
                        loading: false,
                        isGuest: false,
                        userId: null,
                        displayName: null,
                        photoURL: null
                    });
                }
            });
            return ()=>{
                clearTimeout(timer);
                unsubscribe();
            };
        }
        // Google session persisted but Firebase not configured — clear it
        if (persisted?.mode === 'google' && !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isFirebaseConfigured"]) {
            clearPersistedAuth();
        }
        // No persisted session — show sign-in screen
        setState({
            user: null,
            loading: false,
            isGuest: false,
            userId: null,
            displayName: null,
            photoURL: null
        });
    }, []);
    const signInWithGoogle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (forceAccountPicker = false)=>{
        if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["isFirebaseConfigured"] || !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["auth"] || !__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["googleProvider"]) {
            return {
                success: false,
                error: 'Firebase is not configured. Please add your Firebase config to .env.local'
            };
        }
        try {
            // Auto-migrate: if currently a guest, save guest data for migration before signing in
            const persisted = loadPersistedAuth();
            if (persisted?.mode === 'guest' && persisted.userId) {
                try {
                    const guestSave = localStorage.getItem(`crystal_clicker_save_${persisted.userId}`);
                    if (guestSave) {
                        localStorage.setItem('crystal_clicker_migration', guestSave);
                    }
                } catch  {}
            }
            // Force Google to show account picker instead of auto-selecting last account
            if (forceAccountPicker) {
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["googleProvider"].setCustomParameters({
                    prompt: 'select_account'
                });
            }
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signInWithPopup"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["auth"], __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["googleProvider"]);
            const user = result.user;
            persistAuth({
                mode: 'google',
                userId: user.uid,
                displayName: user.displayName || undefined,
                photoURL: user.photoURL || undefined
            });
            setState({
                user,
                loading: false,
                isGuest: false,
                userId: user.uid,
                displayName: user.displayName,
                photoURL: user.photoURL
            });
            return {
                success: true
            };
        } catch (error) {
            const err = error;
            if (err.code === 'auth/unauthorized-domain') {
                return {
                    success: false,
                    error: 'This domain is not authorized for Firebase. Please add it to your Firebase Console.'
                };
            }
            if (err.code === 'auth/popup-closed-by-user') {
                return {
                    success: false,
                    error: 'Sign-in popup was closed.'
                };
            }
            // Clean up migration data on failure
            try {
                localStorage.removeItem('crystal_clicker_migration');
            } catch  {}
            return {
                success: false,
                error: err.message || 'Failed to sign in with Google'
            };
        }
    }, []);
    const playAsGuest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const guestId = generateGuestId();
        const guestName = 'Guest Miner';
        persistAuth({
            mode: 'guest',
            userId: guestId,
            displayName: guestName
        });
        setState({
            user: null,
            loading: false,
            isGuest: true,
            userId: guestId,
            displayName: guestName,
            photoURL: null
        });
    }, []);
    const logout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["auth"]) {
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["auth"]);
            } catch  {}
        }
        clearPersistedAuth();
        setState({
            user: null,
            loading: false,
            isGuest: false,
            userId: null,
            displayName: null,
            photoURL: null
        });
    }, []);
    const switchAccount = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        // Sign out first, then re-open Google popup with account picker
        if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["auth"]) {
            try {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$node$2d$esm$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["auth"]);
            } catch  {}
        }
        clearPersistedAuth();
        setState({
            user: null,
            loading: false,
            isGuest: false,
            userId: null,
            displayName: null,
            photoURL: null
        });
        // Now sign in with forced account picker
        return signInWithGoogle(true);
    }, [
        signInWithGoogle
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            ...state,
            signInWithGoogle,
            playAsGuest,
            logout,
            switchAccount
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/lib/auth-context.tsx",
        lineNumber: 212,
        columnNumber: 5
    }, this);
}
function useAuth() {
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cde1f416._.js.map