// ========================================================
// 1. FIREBASE CONFIGURATION & INITIALIZATION
// ========================================================
const firebaseConfig = {
    apiKey: "AIzaSyB_b6KlFizZGALLEZnRcJ0Pd16NUEF6QY8",
    authDomain: "patel-engineering-3b4c4.firebaseapp.com",
    databaseURL: "https://patel-engineering-3b4c4-default-rtdb.firebaseio.com",
    projectId: "patel-engineering-3b4c4",
    storageBucket: "patel-engineering-3b4c4.firebasestorage.app",
    messagingSenderId: "261245424222",
    appId: "1:261245424222:web:126273db274b515f8cdacf"
};

let db = null, isFirebaseConnected = false, isCloudInitialSyncDone = false;
try {
    if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        isFirebaseConnected = true;
    }
} catch (e) {
    console.warn("Firebase initialization note:", e);
}

let masterSecurityPasscode = localStorage.getItem('pe_master_passcode') || "RJ06CC7194";

// ========================================================
// 2. AUDIO FEEDBACK & FLOATING TOASTS
// ========================================================
let audioCtx = null;
function playAppSound(type = 'click') {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;

        if (type === 'click') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'chime') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.08);
            osc.frequency.setValueAtTime(783.99, now + 0.16);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.start(now);
            osc.stop(now + 0.35);
        }
    } catch(e) {}
}

function showCorporateToast(message, icon = '✓') {
    const box = document.getElementById('appToastContainer');
    if (!box) return;
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<span style="color:#38bdf8; font-size:16px;">${icon}</span><span>${message}</span>`;
    box.appendChild(toast);
    playAppSound('chime');
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => toast.remove(), 320);
    }, 2800);
}

// ⭐ SMOOTH SCROLL ARROWS (PREVIEW ONLY) ⭐
function scrollPreviewPane(delta) {
    const vp = document.getElementById('viewportWrap');
    if (vp) {
        vp.scrollBy({ top: delta, behavior: 'smooth' });
        playAppSound('click');
        triggerHaptic(10);
    }
}

function scrollCivilPreviewPane(delta) {
    const vp = document.getElementById('civilViewportWrap');
    if (vp) {
        vp.scrollBy({ top: delta, behavior: 'smooth' });
        playAppSound('click');
        triggerHaptic(10);
    }
}

// ========================================================
// 3. MASTER BLUEPRINT & AUTO-LEARNING ENGINE
// ========================================================
const defaultMasterBlueprint = {
    primCustomLine: "Fabrication with FE 345 Steel, Cutting, Welding, 1 Coat Primer",
    primSpecs: [
        { text: "Fabrication with FE", selected: true },
        { text: "345 Steel", selected: true },
        { text: "Cutting", selected: true },
        { text: "Welding", selected: true },
        { text: "1 Coat Primer", selected: true }
    ],
    primUnit: "Kg",
    secCustomLine: "Z Purlin 200 & 150 - 2.0mm Galvanized 120 GSM, Girts & Bracings",
    secSpecs: [
        { text: "Z Purlin 200 & 150", selected: true },
        { text: "2.0mm Galvanized 120 GSM", selected: true },
        { text: "Girts & Bracings", selected: true }
    ],
    secUnit: "Kg",
    cladCustomLine: "0.50mm TATA BlueScope / JSW Colour Coated Sheet",
    cladThickness: "0.50 mm",
    cladUnit: "Sq.Ft",
    accCustomLine: "Turbo Ventilators, Gutters, Down Pipes, Anchor Bolts, Nuts & Bolts",
    accessories: [
        { name: "Turbo Ventilators", qty: "", unit: "Nos", rate: "", selected: true },
        { name: "Gutters", qty: "", unit: "R.Ft", rate: "", selected: true },
        { name: "Down Pipes", qty: "", unit: "Set", rate: "", selected: true },
        { name: "Anchor Bolts", qty: "", unit: "Lot", rate: "", selected: true },
        { name: "Nuts & Bolts", qty: "", unit: "Lot", rate: "", selected: true }
    ],
    erectCustomLine: "Crane, Hydra, Welding Machine, Labour",
    erectSpecs: [
        { text: "Crane", selected: true },
        { text: "Hydra", selected: true },
        { text: "Welding Machine", selected: true },
        { text: "Labour", selected: true }
    ],
    erectUnit: "Kg",
    moduleOrder: ['prim', 'sec', 'clad', 'acc', 'erect'],
    customModules: [],
    civilScopeDesc: "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS",
    civilData: {
        foundation: {
            title: "1. FOUNDATION & RCC COLUMN DETAILS",
            enabled: true,
            items: [
                { id: "f1", name: "Column Foundation / Footing Work", qty: "", unit: "Nos", rate: "", enabled: true },
                { id: "f2", name: "RCC Column Shuttering & Casting", qty: "", unit: "Sq.Ft", rate: "", enabled: true },
                { id: "f3", name: "Reinforcement Steel Bars", qty: "", unit: "Nos", rate: "", enabled: true },
                { id: "f4", name: "Stirrups / Ring Binding Work", qty: "", unit: "Lot", rate: "", enabled: true },
                { id: "f5", name: "Column Grid Alignment & Spacing", qty: "", unit: "Ft", rate: "", enabled: true }
            ]
        },
        brickWall: {
            title: "2. BRICK WALL, DPC & PLASTER DETAILS",
            enabled: true,
            items: [
                { id: "b1", name: "Stone Masonry Foundation Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true },
                { id: "b2", name: "Plinth / Brick Foundation Work", qty: "", unit: "R.Ft", rate: "", enabled: true },
                { id: "b3", name: "DPC (Damp Proof Course) Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true },
                { id: "b4", name: "Brick Wall Superstructure Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true },
                { id: "b5", name: "Cement Plaster Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true }
            ]
        },
        flooring: {
            title: "3. FLOORING & PCC WORK DETAILS",
            enabled: true,
            items: [
                { id: "fl1", name: "Soil Filling & Stone Soling Work", qty: "", unit: "Cu.Ft", rate: "", enabled: true },
                { id: "fl2", name: "PCC Concrete Flooring (M25) Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true }
            ]
        }
    },
    civilCustomCategories: []
};

const defaultBannerSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 700 240' width='700' height='240'><g fill='%230f172a'><path d='M30,120 Q30,30 160,30 L260,30 Q330,30 330,80 Q330,125 250,130 L110,130 L110,210 L30,210 Z M110,75 L110,95 L220,95 Q250,95 250,85 Q250,75 220,75 Z'/><path d='M340,30 L430,30 L430,210 L340,210 Z M430,30 L600,30 L600,75 L430,75 Z M430,105 L560,105 L560,145 L430,145 Z M430,170 L600,170 L600,210 L430,210 Z'/><rect x='30' y='218' width='640' height='8' fill='%230c1e30'/><text x='350' y='240' font-family='Arial,sans-serif' font-weight='900' font-size='22' letter-spacing='14' text-anchor='middle'>PATEL ENGINEERING</text></g><g stroke='%230c1e30' stroke-width='4' fill='none'><path d='M250 15 L500 5 L680 25 L680 130 L250 130 Z'/><path d='M320 20 L500 12 L640 28 L640 130'/><path d='M500 12 L500 130 M410 16 L410 130 M570 20 L570 130' stroke-dasharray='5,5'/></g></svg>`;

const defaultAppSettings = {
    ownerName: "PATEL ENGINEERING",
    companyAddr: "Bhawani Nagar, Bhilwara - 311001 (Rajasthan, India)",
    companyGst: "08AHFPL0222M2ZF",
    phones: ["+91 9799635249", "+91 7737734122", "+91 9829111111"],
    companyEmail: "info@patelengineering.com",
    footerWeb: "www.patelengineering.com",
    startingQuoteSeq: 1,
    paymentTerms: "• 40% Advance along with Purchase Order & Foundation drawing approval.\n• 50% Progressive payment against proforma invoice before dispatch.\n• 10% Final payment after successful completion of erection on site.",
    termsCond: "• Delivery within 4-6 weeks from approval of anchor drawings.\n• Uninterrupted water & 3-phase electricity at site under client scope.\n• All structural steel weights are estimated as per standard engineering tolerance.",
    civilPaymentTerms: "• 30% Advance along with formal Civil Work order confirmation.\n• 50% Running progressive payment based on site progress (Plinth/DPC/Wall).\n• 20% Final payment upon successful completion of Flooring & PCC work.",
    civilTermsCond: "• Water & 3-phase electricity connection to be provided free of charge by client at site.\n• Unforeseen hard-rock excavation or dewatering if required will be extra as per mutual consent.\n• Adequate secured storage space for cement & steel reinforcement to be provided at site.",
    pdfRibbonTitle: "QUOTATION",
    civilPdfRibbonTitle: "QUOTATION",
    companyDesc: "PEB Structure | Industrial Sheds | Roofing Solutions",
    pdfScopeTitle: "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - KG BASIS",
    projectSizeHeading: "📐 PROJECT SIZE / SHED DIMENSIONS:",
    btnNamePrim: "1. Primary",
    btnNameSec: "2. Secondary",
    btnNameClad: "3. Cladding",
    btnNameAcc: "4. Accessories",
    btnNameErect: "5. Erection",
    btnNameFoundation: "1. Foundation Details",
    btnNameBrick: "2. Brick Wall Details",
    btnNameFlooring: "3. Flooring Details",
    headerLine1: "1. ESTIMATED STEEL WEIGHT:",
    milestoneHeading: "TOTAL STRUCTURE WEIGHT (PRIMARY + SECONDARY):",
    headerLine2: "2. PRICE BREAKUP AS PER KG RATE:",
    accSectionHeading: "3. BUILDING ACCESSORIES ITEM-WISE BREAKDOWN:",
    civilJobTitle: "JOB DETAILS & TECHNICAL SPECIFICATIONS",
    civilFoundTitle: "1. FOUNDATION & RCC COLUMN DETAILS:",
    civilBrickTitle: "2. BRICK WALL, DPC & PLASTER DETAILS:",
    civilFloorTitle: "3. FLOORING & PCC WORK DETAILS:",
    termsTitle: "Terms & Conditions:",
    civilTermsTitle: "Civil Work Terms & Conditions:",
    thankYouText: "THANK YOU FOR YOUR BUSINESS WITH US.",
    civilThankYouText: "THANK YOU FOR YOUR CIVIL CONTRACT.",
    custAcceptanceTitle: "CUSTOMER ACCEPTANCE",
    custAcceptanceSub: "Authorized Signature & Stamp",
    signCompHeader: "FOR PATEL ENGINEERING",
    pdfSignatoryText: "Authorized Signatory",
    signatureData: "",
    logoData: "",
    savedPdfScale: 1.0
};

let masterBlueprint = JSON.parse(localStorage.getItem('patel_master_blueprint') || JSON.stringify(defaultMasterBlueprint));
let appSettings = JSON.parse(localStorage.getItem('patel_app_settings') || JSON.stringify(defaultAppSettings));
if (!appSettings.phones || !Array.isArray(appSettings.phones)) {
    appSettings.phones = [appSettings.phone1, appSettings.phone2, appSettings.phone3].filter(Boolean);
    if (appSettings.phones.length === 0) appSettings.phones = ["+91 9799635249", "+91 7737734122"];
}

let sites = JSON.parse(localStorage.getItem('patel_app_sites') || '[]');
let currentSiteId = null;

function syncSiteStructureToMasterBlueprint(site) {
    if (!site) return;
    try {
        masterBlueprint.primCustomLine = site.primCustomLine || masterBlueprint.primCustomLine;
        if (site.primSpecs) masterBlueprint.primSpecs = JSON.parse(JSON.stringify(site.primSpecs));
        masterBlueprint.primUnit = site.primUnit || "Kg";

        masterBlueprint.secCustomLine = site.secCustomLine || masterBlueprint.secCustomLine;
        if (site.secSpecs) masterBlueprint.secSpecs = JSON.parse(JSON.stringify(site.secSpecs));
        masterBlueprint.secUnit = site.secUnit || "Kg";

        masterBlueprint.cladCustomLine = site.cladCustomLine || masterBlueprint.cladCustomLine;
        masterBlueprint.cladThickness = site.cladThickness || masterBlueprint.cladThickness;
        masterBlueprint.cladUnit = site.cladUnit || "Sq.Ft";

        masterBlueprint.accCustomLine = site.accCustomLine || masterBlueprint.accCustomLine;
        if (site.accessories) {
            masterBlueprint.accessories = site.accessories.map(a => ({
                name: a.name, qty: "", unit: a.unit || "Nos", rate: "", selected: a.selected !== false
            }));
        }

        masterBlueprint.erectCustomLine = site.erectCustomLine || masterBlueprint.erectCustomLine;
        if (site.erectSpecs) masterBlueprint.erectSpecs = JSON.parse(JSON.stringify(site.erectSpecs));
        masterBlueprint.erectUnit = site.erectUnit || "Kg";

        if (site.moduleOrder) masterBlueprint.moduleOrder = [...site.moduleOrder];
        if (site.customModules) {
            masterBlueprint.customModules = site.customModules.map(m => ({
                id: m.id, title: m.title, desc: m.desc || "", unit: m.unit || "Lot", qty: "", rate: "", total: 0, enabled: m.enabled !== false
            }));
        }

        masterBlueprint.civilScopeDesc = site.civilScopeDesc || masterBlueprint.civilScopeDesc;

        if (site.civilData) {
            ['foundation', 'brickWall', 'flooring'].forEach(sec => {
                if (site.civilData[sec]) {
                    if (!masterBlueprint.civilData[sec]) masterBlueprint.civilData[sec] = { title: "", enabled: true, items: [] };
                    masterBlueprint.civilData[sec].title = site.civilData[sec].title;
                    masterBlueprint.civilData[sec].enabled = site.civilData[sec].enabled !== false;
                    masterBlueprint.civilData[sec].items = (site.civilData[sec].items || []).map(it => ({
                        id: it.id, name: it.name, unit: it.unit || "Lot", qty: "", rate: "", enabled: it.enabled !== false
                    }));
                }
            });
        }

        if (site.civilCustomCategories) {
            masterBlueprint.civilCustomCategories = site.civilCustomCategories.map(c => ({
                id: c.id,
                categoryName: c.categoryName,
                enabled: c.enabled !== false,
                items: (c.items || []).map(it => ({
                    name: it.name, unit: it.unit || "Lot", qty: "", rate: "", enabled: it.enabled !== false
                }))
            }));
        }

        localStorage.setItem('patel_master_blueprint', JSON.stringify(masterBlueprint));
        if (db && isFirebaseConnected) {
            db.ref('patel_master_blueprint').set(masterBlueprint).catch(() => {});
        }
    } catch(err) {
        console.warn("Master blueprint sync notice:", err);
    }
}

// ========================================================
// 4. CLOUD SYNC & MASTER PROTECTION
// ========================================================
function syncDataToCloud(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
        console.warn("Storage quota warning for " + key, err);
    }
    if (db && isFirebaseConnected && isCloudInitialSyncDone) {
        db.ref(key).set(data).catch(err => console.warn("Cloud sync write error:", err));
    }
}

function initCloudFirstMasterSync() {
    if (!db || !isFirebaseConnected) {
        isCloudInitialSyncDone = true;
        return;
    }
    const syncBadge = document.getElementById('cloudSyncIndicator');
    if (syncBadge) syncBadge.innerHTML = `<span class="pulse-dot">●</span> Connecting to Cloud Master...`;

    db.ref('pe_master_passcode').on('value', (snapshot) => {
        const cloudPass = snapshot.val();
        if (cloudPass) {
            masterSecurityPasscode = cloudPass;
            localStorage.setItem('pe_master_passcode', cloudPass);
            const localAuthToken = localStorage.getItem('pe_app_auth_token');
            if (localAuthToken && localAuthToken !== cloudPass) {
                localStorage.removeItem('pe_app_auth_token');
                checkFirstTimeAuthentication(true);
            }
        }
    });

    db.ref('patel_app_settings').on('value', (snapshot) => {
        const cloudSettings = snapshot.val();
        if (cloudSettings && typeof cloudSettings === 'object') {
            appSettings = Object.assign({}, defaultAppSettings, cloudSettings);
            if (!appSettings.phones || !Array.isArray(appSettings.phones)) {
                appSettings.phones = [appSettings.phone1, appSettings.phone2, appSettings.phone3].filter(Boolean);
            }
            try {
                localStorage.setItem('patel_app_settings', JSON.stringify(appSettings));
            } catch(e) {}
            loadPhoneSettingsUI();
            applyCustomButtonNamesUI();
            updateHeaderBannersUI();
            refreshLivePdfPreviewSheet(true);
        }
    });

    db.ref('patel_master_blueprint').on('value', (snapshot) => {
        const cloudBlueprint = snapshot.val();
        if (cloudBlueprint && typeof cloudBlueprint === 'object') {
            masterBlueprint = cloudBlueprint;
            try {
                localStorage.setItem('patel_master_blueprint', JSON.stringify(masterBlueprint));
            } catch(e) {}
        }
    });

    db.ref('patel_app_sites').on('value', (snapshot) => {
        const cloudSites = snapshot.val();
        if (cloudSites) {
            let loadedSites = [];
            if (Array.isArray(cloudSites)) loadedSites = cloudSites.filter(Boolean);
            else if (typeof cloudSites === 'object') loadedSites = Object.values(cloudSites).filter(Boolean);
            if (loadedSites.length > 0) {
                sites = loadedSites;
                try {
                    localStorage.setItem('patel_app_sites', JSON.stringify(sites));
                } catch(e) {}
                renderHomeScreen();
                loadPhoneSettingsUI();
                if (currentSiteId && sites.find(s => s.id === currentSiteId)) {
                    refreshLivePdfPreviewSheet(true);
                }
            }
        }
        isCloudInitialSyncDone = true;
        if (syncBadge) syncBadge.innerHTML = `<span class="pulse-dot">●</span> 100% Cloud Synced (All Devices Connected)`;
    });
}

function updateHeaderBannersUI() {
    const bannerSrc = appSettings.logoData || defaultBannerSvg;
    const p1Img = document.getElementById('pdfHeaderBannerImg');
    const p2Img = document.getElementById('civilPdfHeaderBannerImg');
    if (p1Img) p1Img.src = bannerSrc;
    if (p2Img) p2Img.src = bannerSrc;

    const mirrorP1 = document.querySelector('#printableA4Sheet_civilDisplayMirror #pdfHeaderBannerImg');
    const mirrorP2 = document.querySelector('#printableA4Sheet_civilDisplayMirror #civilPdfHeaderBannerImg');
    if (mirrorP1) mirrorP1.src = bannerSrc;
    if (mirrorP2) mirrorP2.src = bannerSrc;

    if (appSettings.logoData) {
        safeSetHtml('settingsLogoPreview', `<img src="${appSettings.logoData}" style="width:100%;height:100%;object-fit:cover;">`);
        safeSetHtml('appLogoBadge', `<img src="${appSettings.logoData}" style="width:100%;height:100%;object-fit:cover;">`);
    }
}

// ========================================================
// 5. MASTER PASSCODE GATEWAY
// ========================================================
function checkFirstTimeAuthentication(isRemoteKick = false) {
    const savedToken = localStorage.getItem('pe_app_auth_token');
    const lockScreen = document.getElementById('appFirstTimeLockScreen');
    if (!lockScreen) return;

    if (savedToken === masterSecurityPasscode) {
        lockScreen.style.display = 'none';
    } else {
        lockScreen.style.display = 'flex';
        lockScreen.style.opacity = '1';
        const errorEl = document.getElementById('authErrorMsg');
        if (isRemoteKick && errorEl) {
            errorEl.innerText = "⚠️ Passcode was updated by Admin. Re-enter new passcode.";
            errorEl.style.display = 'block';
        }
        document.getElementById('inpMasterPasscode')?.focus();
    }
}

function verifyMasterPasscode() {
    const entered = (document.getElementById('inpMasterPasscode')?.value || "").trim().toUpperCase();
    const errorEl = document.getElementById('authErrorMsg');
    if (entered === masterSecurityPasscode) {
        triggerHaptic(50);
        playAppSound('chime');
        fireConfettiCelebration();
        localStorage.setItem('pe_app_auth_token', masterSecurityPasscode);
        const lockScreen = document.getElementById('appFirstTimeLockScreen');
        if (lockScreen) {
            lockScreen.style.opacity = '0';
            setTimeout(() => { lockScreen.style.display = 'none'; }, 400);
        }
    } else {
        triggerHaptic(100);
        if (errorEl) {
            errorEl.innerText = "⚠️ Invalid Passcode. Access Denied!";
            errorEl.style.display = 'block';
            setTimeout(() => { errorEl.style.display = 'none'; }, 3000);
        }
    }
}

function togglePassVisibility(inputId) {
    const el = document.getElementById(inputId);
    if (el) el.type = el.type === 'password' ? 'text' : 'password';
}

function openChangePasscodeModal() {
    safeSetVal('inpCurrentPass', "");
    safeSetVal('inpNewPass', "");
    openModalWithHistory('changePasscodeModal');
}
function closeChangePasscodeModal() { closeModalSafe('changePasscodeModal'); }

function saveNewMasterPasscode() {
    const cur = (document.getElementById('inpCurrentPass')?.value || "").trim().toUpperCase();
    const nw = (document.getElementById('inpNewPass')?.value || "").trim().toUpperCase();
    if (cur !== masterSecurityPasscode) return showAppAlert("⚠️ Security Error", "Current passcode galat hai!");
    if (!nw || nw.length < 4) return showAppAlert("⚠️ Invalid", "Passcode kam se kam 4 characters ka ho.");
    masterSecurityPasscode = nw;
    localStorage.setItem('pe_master_passcode', nw);
    localStorage.setItem('pe_app_auth_token', nw);
    if (db && isFirebaseConnected) db.ref('pe_master_passcode').set(nw);
    closeChangePasscodeModal();
    showCorporateToast(`Master Passcode updated: ${nw}`);
}

// ========================================================
// 6. NAVIGATION & 3-TIER DEVICE MODE SYSTEM
// ========================================================
window.addEventListener('popstate', () => handleDeviceBackButton());

function handleDeviceBackButton() {
    const openModals = document.querySelectorAll('.modal.active, .confirm-dialog-modal.active');
    if (openModals.length > 0) {
        openModals.forEach(m => m.classList.remove('active'));
        return;
    }
    const screenCivil = document.getElementById('screenCivilDashboard');
    if (screenCivil && screenCivil.classList.contains('active')) {
        handleCivilBackNav();
        return;
    }
    const screenSite = document.getElementById('screenSiteDashboard');
    const screenCreate = document.getElementById('screenCreateSite');
    const screenSettings = document.getElementById('screenSettings');
    if ((screenSite && screenSite.classList.contains('active')) ||
        (screenCreate && screenCreate.classList.contains('active')) ||
        (screenSettings && screenSettings.classList.contains('active'))) {
        openScreen('screenHome', false);
    }
}

function handleCivilBackNav() {
    const site = getCurrentSite();
    if (site && site.quoteType === 'civil') {
        openScreen('screenHome', false);
    } else {
        openScreen('screenSiteDashboard', false);
    }
}

function openModalWithHistory(modalId) {
    const m = document.getElementById(modalId);
    if (m) {
        m.classList.add('active');
        if (window.history && window.history.pushState) history.pushState({ modal: modalId }, "");
    }
}

function closeModalSafe(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove('active');
}

function openScreen(screenId, pushHistory = true) {
    try {
        if (pushHistory && window.history && window.history.pushState) history.pushState({ screen: screenId }, "");
    } catch(e) {}
    document.querySelectorAll('.app-view').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
        if (screenId === 'screenSiteDashboard' || screenId === 'screenCivilDashboard') {
            setTimeout(autoFitPreview, 60);
        }
    }
}

let currentDeviceMode = "phone", manualDeviceModeOverride = false;
function setDeviceViewMode(mode, isManual = false) {
    if (isManual) manualDeviceModeOverride = true;
    currentDeviceMode = mode;
    document.body.className = "mode-" + mode;
    document.querySelectorAll('.btn-device-mode').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.btn-device-' + mode).forEach(b => b.classList.add('active'));
    setTimeout(autoFitPreview, 50);
}

function autoDetectDeviceMode() {
    if (manualDeviceModeOverride) return;
    const w = window.innerWidth;
    if (w >= 1025) setDeviceViewMode('desktop', false);
    else if (w >= 768) setDeviceViewMode('tab', false);
    else setDeviceViewMode('phone', false);
}

// ========================================================
// 7. DOM HELPERS, FORMATTERS & 1200MS NUMBER ROLL
// ========================================================
function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = (text !== undefined && text !== null) ? text : '';
}
function safeSetHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = (html !== undefined && html !== null) ? html : '';
}
function safeSetVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = (val !== undefined && val !== null) ? val : '';
}
function formatRawOrDash(val) {
    if (val === "" || val === null || val === undefined) return "-";
    const num = parseFloat(val);
    if (isNaN(num) || num === 0) return "-";
    return val;
}
function showAppAlert(title, message) {
    safeSetText('alertModalTitle', title || "Alert");
    safeSetText('alertModalDesc', message || "");
    openModalWithHistory('customAlertModal');
}
function closeAppAlert() { closeModalSafe('customAlertModal'); }

function triggerHaptic(duration = 15) {
    if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(duration);
}
function fireConfettiCelebration() {
    if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
}

function animateNumberRoll(elemId, targetNumber, prefix = "₹ ", suffix = "") {
    const el = document.getElementById(elemId);
    if (!el) return;
    const target = Math.round(targetNumber) || 0;
    if (target === 0) { el.innerText = "-"; return; }
    const currentText = el.innerText.replace(/[^0-9]/g, '');
    const start = parseInt(currentText, 10) || 0;
    if (start === target) { el.innerText = prefix + target.toLocaleString('en-IN') + suffix; return; }

    const duration = 1200;
    const startTime = performance.now();
    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(start + (target - start) * ease);
        el.innerText = prefix + (progress < 1 ? currentVal.toLocaleString('en-IN') : target.toLocaleString('en-IN')) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function triggerTotalBarShimmer() {
    const bars = document.querySelectorAll('.solid-navy-total-bar');
    bars.forEach(bar => {
        bar.classList.remove('shimmer-active');
        void bar.offsetWidth;
        bar.classList.add('shimmer-active');
    });
}

function handlePreviewInputFocus(el) {
    if (el && el.innerText.trim() === '-') {
        el.innerText = '';
    }
}

document.addEventListener('click', function(e) {
    const targetBtn = e.target.closest('.btn-ripple');
    if (!targetBtn) return;
    playAppSound('click');
    triggerHaptic(10);
    const rect = targetBtn.getBoundingClientRect();
    const circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${(e.clientX || rect.left + radius) - rect.left - radius}px`;
    circle.style.top = `${(e.clientY || rect.top + radius) - rect.top - radius}px`;
    circle.classList.add('ripple-wave');
    const old = targetBtn.querySelector('.ripple-wave');
    if (old) old.remove();
    targetBtn.appendChild(circle);
    setTimeout(() => { if (circle && circle.parentNode) circle.remove(); }, 500);
});

// ========================================================
// 8. DRAG & DROP REORDERING
// ========================================================
let activeTouchDragScope = null, activeTouchDragIndex = null, activeTouchDragParent = null, activeTouchDragElement = null;

function setupUniversalReorder(rowEl, handleEl, scope, index, parentCat = null) {
    if (!rowEl || !handleEl) return;
    rowEl.setAttribute('draggable', 'true');
    rowEl.classList.add('sortable-item');
    rowEl.dataset.sortIndex = index;
    rowEl.dataset.sortScope = scope;
    if (parentCat) rowEl.dataset.sortParent = parentCat;

    rowEl.addEventListener('dragstart', (e) => {
        activeTouchDragScope = scope;
        activeTouchDragIndex = parseInt(index, 10);
        activeTouchDragParent = parentCat;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', String(index));
        rowEl.classList.add('dragging');
    });

    rowEl.addEventListener('dragend', () => {
        rowEl.classList.remove('dragging');
        document.querySelectorAll('.sortable-item').forEach(i => i.classList.remove('drag-over'));
    });

    rowEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (activeTouchDragScope === scope && (parentCat === activeTouchDragParent)) {
            rowEl.classList.add('drag-over');
        }
    });

    rowEl.addEventListener('dragleave', () => rowEl.classList.remove('drag-over'));

    rowEl.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        rowEl.classList.remove('drag-over');
        const targetIdx = parseInt(rowEl.dataset.sortIndex, 10);
        if (activeTouchDragScope === scope && activeTouchDragIndex !== null && activeTouchDragIndex !== targetIdx && (parentCat === activeTouchDragParent)) {
            handleItemsReorder(scope, activeTouchDragIndex, targetIdx, parentCat);
        }
    });

    handleEl.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        activeTouchDragScope = scope;
        activeTouchDragIndex = parseInt(index, 10);
        activeTouchDragParent = parentCat;
        activeTouchDragElement = rowEl;
        rowEl.classList.add('dragging');
        triggerHaptic(30);
    }, { passive: false });

    handleEl.addEventListener('touchmove', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const touch = e.touches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const overRow = targetElement ? targetElement.closest('.sortable-item') : null;
        document.querySelectorAll('.sortable-item').forEach(r => r.classList.remove('drag-over'));
        if (overRow && overRow !== activeTouchDragElement && overRow.dataset.sortIndex !== undefined && overRow.dataset.sortScope === scope) {
            overRow.classList.add('drag-over');
        }
    }, { passive: false });

    handleEl.addEventListener('touchend', (e) => {
        e.stopPropagation();
        if (activeTouchDragElement) activeTouchDragElement.classList.remove('dragging');
        const touch = e.changedTouches[0];
        const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropRow = targetElement ? targetElement.closest('.sortable-item') : null;
        document.querySelectorAll('.sortable-item').forEach(r => r.classList.remove('drag-over'));
        if (dropRow && dropRow.dataset.sortIndex !== undefined && dropRow.dataset.sortScope === scope) {
            const targetIdx = parseInt(dropRow.dataset.sortIndex, 10);
            if (activeTouchDragScope === scope && activeTouchDragIndex !== null && activeTouchDragIndex !== targetIdx && (parentCat === activeTouchDragParent)) {
                handleItemsReorder(scope, activeTouchDragIndex, targetIdx, parentCat);
            }
        }
        activeTouchDragScope = activeTouchDragIndex = activeTouchDragParent = activeTouchDragElement = null;
    }, { passive: false });
}

function handleItemsReorder(scope, fromIndex, toIndex, parentCat = null) {
    const site = getCurrentSite();
    if (!site) return;
    const from = parseInt(fromIndex, 10), to = parseInt(toIndex, 10);
    if (scope === 'shed_modules') {
        const item = site.moduleOrder.splice(from, 1)[0];
        site.moduleOrder.splice(to, 0, item);
    } else if (scope === 'accessories') {
        const item = site.accessories.splice(from, 1)[0];
        site.accessories.splice(to, 0, item);
    } else if (scope === 'civil_items') {
        if (site.civilData[parentCat] && site.civilData[parentCat].items) {
            const item = site.civilData[parentCat].items.splice(from, 1)[0];
            site.civilData[parentCat].items.splice(to, 0, item);
        }
    }
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    triggerHaptic(25);
    const isCivilModalOpen = document.getElementById('civilParamModal')?.classList.contains('active');
    if (isCivilModalOpen && parentCat) {
        openCivilParamModal(parentCat);
    } else {
        calcModuleTotals();
        refreshLivePdfPreviewSheet();
    }
}

// ========================================================
// 9. BOOT ANIMATION & VIEW MODES
// ========================================================
let bootTimer = null;
function initSamsungBootAnimation() {
    const splash = document.getElementById('appBootSplashScreen');
    if (!splash) return;
    triggerHaptic(30);
    splash.classList.remove('boot-fade-out');
    splash.style.display = 'flex';
    if (bootTimer) clearTimeout(bootTimer);
    bootTimer = setTimeout(() => skipBootAnimation(), 2500);
}
function skipBootAnimation() {
    const splash = document.getElementById('appBootSplashScreen');
    if (!splash) return;
    if (bootTimer) clearTimeout(bootTimer);
    triggerHaptic(15);
    splash.classList.add('boot-fade-out');
    setTimeout(() => { splash.style.display = 'none'; }, 700);
}
function replaySamsungBootAnimation() {
    const splash = document.getElementById('appBootSplashScreen');
    if (!splash) return;
    splash.style.display = 'flex';
    splash.classList.remove('boot-fade-out');
    initSamsungBootAnimation();
}

const MASTER_UNITS = [
    "Ft", "Inch", "R.Ft", "mm", "Mtr", "Sq.Ft", "Sq.Mtr", "Cu.Ft", 
    "Cu.Mtr", "Nos", "Pcs", "Kg", "MT", "Lot", "Set", "Pair", 
    "Box", "Bundle", "Pkt", "Qtl", "Bags", "Rolls", "Sheets", "Hrs", "Days"
];

let activeUnitCallback = null;
function openThemeUnitPicker(currentUnit, callback) {
    activeUnitCallback = callback;
    const container = document.getElementById('unitPickerGrid');
    if (!container) return;
    container.innerHTML = "";
    MASTER_UNITS.forEach(u => {
        const isSelected = u.toLowerCase() === (currentUnit || '').toLowerCase();
        container.innerHTML += `
            <div class="unit-tile ${isSelected ? 'active' : ''} btn-ripple" onclick="selectUnitFromThemeModal('${u}')">
                <span>${u}</span>
                <span>${isSelected ? '✓' : ''}</span>
            </div>
        `;
    });
    openModalWithHistory('unitPickerModal');
}
function selectUnitFromThemeModal(unit) {
    if (activeUnitCallback) activeUnitCallback(unit);
    closeUnitPickerModal();
}
function closeUnitPickerModal() { closeModalSafe('unitPickerModal'); }

function getNextQuoteSequenceNumber() {
    let maxSeq = parseInt(appSettings.startingQuoteSeq || 1, 10) - 1;
    sites.forEach(s => {
        if (s.quoteNo) {
            const parts = s.quoteNo.split('/');
            const lastPart = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastPart) && lastPart > maxSeq) {
                maxSeq = lastPart;
            }
        }
    });
    return maxSeq + 1;
}

function saveStartingQuoteSeq(val) {
    const num = parseInt(val, 10);
    appSettings.startingQuoteSeq = (!isNaN(num) && num > 0) ? num : 1;
    syncDataToCloud('patel_app_settings', appSettings);
}

// ========================================================
// 10. PREVIEW SCALING & VIEWPORT FIT
// ========================================================
function changePdfScale(delta) {
    let cur = Math.round(((parseFloat(appSettings.savedPdfScale) || 1.0) + delta) * 100) / 100;
    appSettings.savedPdfScale = Math.min(Math.max(cur, 0.40), 2.20);
    syncDataToCloud('patel_app_settings', appSettings);
    applyScaleToSheet();
}

function resetPdfScale() {
    appSettings.savedPdfScale = 1.0;
    syncDataToCloud('patel_app_settings', appSettings);
    applyScaleToSheet();
}

function applyScaleToSheet() {
    const s = parseFloat(appSettings.savedPdfScale) || 1.0;
    document.documentElement.style.setProperty('--pdf-scale', s);

    const pSheet = document.getElementById('printableA4Sheet');
    if (pSheet) pSheet.style.setProperty('--pdf-scale', s);
    const cBox = document.getElementById('civilLiveSheetDisplayBox');
    if (cBox) cBox.style.setProperty('--pdf-scale', s);

    const pct = Math.round(s * 100) + '%';
    safeSetText('scaleIndicatorText', pct);
    safeSetText('civilScaleIndicatorText', pct);
    setTimeout(autoFitPreview, 30);
}

function autoFitPreview() {
    const userZoom = parseFloat(appSettings.savedPdfScale) || 1.0;
    const isDesktop = document.body.classList.contains('mode-desktop');

    const viewport = document.getElementById('viewportWrap');
    const wrapper = document.getElementById('scalingWrapper');
    const sheet = document.getElementById('printableA4Sheet');
    
    if (viewport && wrapper && sheet) {
        const availableWidth = viewport.clientWidth || viewport.offsetWidth;
        if (availableWidth > 0) {
            let baseFit = availableWidth < 746 ? (availableWidth / 746) : 1.0;
            let totalScale = Math.round(baseFit * userZoom * 100) / 100;
            
            wrapper.style.transformOrigin = 'top center';
            wrapper.style.transform = `scale(${totalScale})`;
            wrapper.style.setProperty('margin', '0 auto', 'important');
            
            if (!isDesktop) {
                const unscaledHeight = sheet.offsetHeight || wrapper.offsetHeight;
                const scaledHeight = Math.ceil(unscaledHeight * totalScale);
                if (scaledHeight > 0) {
                    viewport.style.height = `${scaledHeight + 35}px`;
                }
            } else {
                viewport.style.height = '100%';
            }
        }
    }

    const civilVp = document.getElementById('civilViewportWrap');
    const civilWrap = document.getElementById('civilScalingWrapper');
    const civilSheet = document.getElementById('civilLiveSheetDisplayBox');
    
    if (civilVp && civilWrap) {
        const cWidth = civilVp.clientWidth || civilVp.offsetWidth;
        if (cWidth > 0) {
            let cBaseFit = cWidth < 746 ? (cWidth / 746) : 1.0;
            let cTotalScale = Math.round(cBaseFit * userZoom * 100) / 100;
            
            civilWrap.style.transformOrigin = 'top center';
            civilWrap.style.transform = `scale(${cTotalScale})`;
            civilWrap.style.setProperty('margin', '0 auto', 'important');
            
            if (!isDesktop) {
                const cUnscaledHeight = (civilSheet && civilSheet.offsetHeight) ? civilSheet.offsetHeight : civilWrap.offsetHeight;
                const cScaledHeight = Math.ceil(cUnscaledHeight * cTotalScale);
                if (cScaledHeight > 0) {
                    civilVp.style.height = `${cScaledHeight + 35}px`;
                }
            } else {
                civilVp.style.height = '100%';
            }
        }
    }
}

let resizeObserverInstance = null;
function attachDynamicPreviewObserver() {
    if (window.ResizeObserver && !resizeObserverInstance) {
        resizeObserverInstance = new ResizeObserver(() => autoFitPreview());
        const t1 = document.getElementById('printableA4Sheet');
        const t2 = document.getElementById('civilLiveSheetDisplayBox');
        if (t1) resizeObserverInstance.observe(t1);
        if (t2) resizeObserverInstance.observe(t2);
    }
}

window.addEventListener('resize', () => {
    autoDetectDeviceMode();
    autoFitPreview();
});

// ========================================================
// 11. HOMEPAGE & PROPOSAL CREATION
// ========================================================
let tempNewQuoteType = 'both';
function setNewSiteQuoteType(type) {
    tempNewQuoteType = type;
    document.querySelectorAll('.quote-type-card').forEach(c => c.classList.remove('active'));
    document.getElementById('cardQuoteType_' + type)?.classList.add('active');
}

function renderHomeScreen() {
    safeSetText('appLogoName', appSettings.ownerName || "PATEL ENGINEERING");
    safeSetText('statTotalSites', sites.length);
    safeSetText('statActiveQuotes', sites.length);

    if (appSettings.logoData) {
        safeSetHtml('appLogoBadge', `<img src="${appSettings.logoData}" alt="Logo">`);
    }

    const container = document.getElementById('sitesListContainer');
    if (!container) return;
    container.innerHTML = "";

    if (sites.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding: 40px 20px; color: #64748b;">
                <p style="font-size: 38px; margin-bottom: 8px;">🏢</p>
                <p style="font-weight: 700; color: #000;">No proposals found.</p>
                <p style="font-size: 12.5px; margin-top: 4px;">Click the top button to create a new quotation.</p>
            </div>`;
        return;
    }

    sites.forEach(site => {
        const sqft = ((parseFloat(site.dimW) || 0) * (parseFloat(site.dimL) || 0));
        const modeBadge = site.quoteType === 'civil' ? '🧱 CIVIL ONLY' : site.quoteType === 'shed' ? '🏢 SHED ONLY' : '📑 COMBINED';
        container.innerHTML += `
            <div class="card card-3d" onclick="loadSiteToDashboard('${site.id}')" style="cursor:pointer;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="flex:1; padding-right:10px;">
                        <div style="display:flex; gap:6px; align-items:center;">
                            <span style="font-size: 10px; font-weight: 800; color: #92400e; background:#fef3c7; padding: 2px 7px; border-radius: 4px;">${site.quoteNo || 'DRAFT'}</span>
                            <span style="font-size: 9.5px; font-weight: 800; color: #1e40af; background:#dbeafe; padding: 2px 6px; border-radius: 4px;">${modeBadge}</span>
                        </div>
                        <h3 style="font-size: 15px; font-weight: 800; color: #000; margin-top: 5px;">${site.clientName || 'Untitled Client'}</h3>
                        <p style="font-size: 12px; color: #64748b; margin-top: 2px;">📍 ${site.custAddress || 'Project Site'}</p>
                        ${site.quoteType !== 'civil' ? `<p style="font-size: 11.5px; font-weight: 600; color: #475569; margin-top: 3px;">Area: ${sqft > 0 ? sqft.toLocaleString('en-IN') + ' Sq.Ft' : '-'}</p>` : ''}
                    </div>
                    <div style="display:flex; gap:6px; align-items:center;">
                        <button class="btn-site-delete btn-ripple" onclick="event.stopPropagation(); triggerCustomDelete('${site.id}', '${site.clientName}')">🗑️</button>
                        <span style="font-size: 13px; font-weight: 800; color: var(--header-bg); background: #f8fafc; border: 1.5px solid #cbd5e1; padding: 7px 11px; border-radius: 8px;">Open ➔</span>
                    </div>
                </div>
            </div>`;
    });
}

let pendingDeleteId = null;
function triggerCustomDelete(siteId, clientName) {
    pendingDeleteId = siteId;
    safeSetText('confirmTitle', "Delete Quotation?");
    safeSetText('confirmDesc', `Permanently delete "${clientName || 'this proposal'}"?`);
    openModalWithHistory('customConfirmModal');
}
function resolveCustomConfirm(isConfirmed) {
    if (isConfirmed && pendingDeleteId) {
        sites = sites.filter(s => s.id !== pendingDeleteId);
        syncDataToCloud('patel_app_sites', sites);
        renderHomeScreen();
        loadPhoneSettingsUI();
        showCorporateToast("Quotation deleted successfully", "🗑️");
    }
    pendingDeleteId = null;
    closeModalSafe('customConfirmModal');
}

function openCreateSiteScreen() {
    safeSetVal('custName', "");
    safeSetVal('custContactPerson', "");
    safeSetVal('custRole', "");
    safeSetVal('custNumber1', "");
    safeSetVal('custNumber2', "");
    safeSetVal('custAddress', "");
    safeSetVal('custGST', "");
    safeSetVal('custEmail', "");
    setNewSiteQuoteType('both');
    openScreen('screenCreateSite');
}

function saveNewBlankSiteAndOpen() {
    const clientNameInput = (document.getElementById('custName')?.value || "").trim();
    if (!clientNameInput) return showAppAlert("⚠️ Client Name Required", "Please enter Client Name.");

    const currentYear = new Date().getFullYear();
    const nextSeq = getNextQuoteSequenceNumber();
    const autoQuoteNumber = "PE/" + currentYear + "/" + nextSeq;
    const bp = JSON.parse(JSON.stringify(masterBlueprint));

    const newSite = {
        id: 'site_' + Date.now(),
        clientName: clientNameInput,
        custContactPerson: (document.getElementById('custContactPerson')?.value || "").trim(),
        custRole: (document.getElementById('custRole')?.value || "").trim(),
        quoteNo: autoQuoteNumber,
        quoteType: tempNewQuoteType,
        custNumber1: (document.getElementById('custNumber1')?.value || "").trim(),
        custNumber2: (document.getElementById('custNumber2')?.value || "").trim(),
        custAddress: (document.getElementById('custAddress')?.value || "").trim() || "",
        custGST: (document.getElementById('custGST')?.value || "").trim(),
        custEmail: (document.getElementById('custEmail')?.value || "").trim(),
        selectedTaxId: "gst18_split",
        civilSelectedTaxId: "gst18_split",
        rateOnlyMode: false,
        civilRateOnlyMode: false,
        
        civilEnabled: tempNewQuoteType === 'both' || tempNewQuoteType === 'civil',
        shedEnabled: tempNewQuoteType === 'both' || tempNewQuoteType === 'shed',
        
        dimW: "", dimL: "", dimH: "",
        primEnabled: true,
        secEnabled: true,
        cladEnabled: true,
        accEnabled: true,
        erectEnabled: true,

        foundEnabled: true,
        brickEnabled: true,
        floorEnabled: true,

        primCustomLine: bp.primCustomLine,
        primSpecs: bp.primSpecs ? JSON.parse(JSON.stringify(bp.primSpecs)) : [],
        primWeight: "", primRate: "", primUnit: bp.primUnit || "Kg",
        secCustomLine: bp.secCustomLine,
        secSpecs: bp.secSpecs ? JSON.parse(JSON.stringify(bp.secSpecs)) : [],
        secWeight: "", secRate: "", secUnit: bp.secUnit || "Kg",
        cladCustomLine: bp.cladCustomLine,
        cladThickness: bp.cladThickness || "",
        cladSqFt: "", cladRate: "", cladUnit: bp.cladUnit || "Sq.Ft",
        accCustomLine: bp.accCustomLine,
        accessories: (bp.accessories || []).map(a => ({ name: a.name, qty: "", unit: a.unit, rate: "", selected: a.selected !== false })),
        erectCustomLine: bp.erectCustomLine,
        erectSpecs: bp.erectSpecs ? JSON.parse(JSON.stringify(bp.erectSpecs)) : [],
        erectRate: "", erectUnit: bp.erectUnit || "Kg",
        moduleOrder: bp.moduleOrder ? [...bp.moduleOrder] : ['prim', 'sec', 'clad', 'acc', 'erect'],
        customModules: (bp.customModules || []).map(m => ({ ...m, qty: "", rate: "", total: 0 })),
        civilScopeDesc: bp.civilScopeDesc,
        civilData: bp.civilData ? JSON.parse(JSON.stringify(bp.civilData)) : {},
        civilCustomCategories: (bp.civilCustomCategories || []).map(c => ({
            ...c, enabled: true, items: (c.items || []).map(it => ({ ...it, qty: "", rate: "", total: 0, enabled: it.enabled !== false }))
        }))
    };

    if (tempNewQuoteType === 'shed') {
        newSite.civilEnabled = false;
        newSite.shedEnabled = true;
    } else if (tempNewQuoteType === 'civil') {
        newSite.civilEnabled = true;
        newSite.shedEnabled = false;
    }

    sites.unshift(newSite);
    syncDataToCloud('patel_app_sites', sites);
    renderHomeScreen();
    loadPhoneSettingsUI();
    loadSiteToDashboard(newSite.id);
    showCorporateToast(`New Proposal ${autoQuoteNumber} created!`);
}

function getCurrentSite() { return sites.find(s => s.id === currentSiteId); }

function loadSiteToDashboard(siteId) {
    currentSiteId = siteId;
    const site = getCurrentSite();
    if (!site) return;

    if (!site.moduleOrder) site.moduleOrder = ['prim', 'sec', 'clad', 'acc', 'erect'];
    if (!site.customModules) site.customModules = [];
    if (!site.quoteType) site.quoteType = 'both';
    if (site.civilRateOnlyMode === undefined) site.civilRateOnlyMode = false;
    
    site.civilEnabled = (site.quoteType === 'both' || site.quoteType === 'civil');
    site.shedEnabled = (site.quoteType === 'both' || site.quoteType === 'shed');

    if (site.primEnabled === undefined) site.primEnabled = true;
    if (site.secEnabled === undefined) site.secEnabled = true;
    if (site.cladEnabled === undefined) site.cladEnabled = true;
    if (site.accEnabled === undefined) site.accEnabled = true;
    if (site.erectEnabled === undefined) site.erectEnabled = true;

    if (site.foundEnabled === undefined) site.foundEnabled = true;
    if (site.brickEnabled === undefined) site.brickEnabled = true;
    if (site.floorEnabled === undefined) site.floorEnabled = true;

    if (!site.civilScopeDesc) site.civilScopeDesc = masterBlueprint.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS";
    if (!site.selectedTaxId) site.selectedTaxId = "gst18_split";
    if (!site.civilSelectedTaxId) site.civilSelectedTaxId = "gst18_split";
    ensureCivilDataOnSite(site);
    if (!site.civilCustomCategories) site.civilCustomCategories = [];

    safeSetText('dashSiteName', site.clientName || "Untitled Client");
    safeSetText('dashQuoteNo', site.quoteNo + (site.custAddress ? (" | " + site.custAddress) : ""));
    safeSetVal('dimW', site.dimW || "");
    safeSetVal('dimL', site.dimL || "");
    safeSetVal('dimH', site.dimH || "");

    updatePillTogglesUI();
    updateModulePillBadgesUI();
    updateCivilModulePillBadgesUI();
    updateTaxDisplay();
    updateHeaderBannersUI();
    renderCustomModulesDashboardList();
    renderCivilCustomCategoriesUI();
    renderDynamicPdfActionsBar();
    calcModuleTotals();
    applyCustomButtonNamesUI();
    refreshLivePdfPreviewSheet();

    if (site.quoteType === 'civil') {
        openCivilDashboardScreen();
    } else {
        openScreen('screenSiteDashboard');
    }
    setTimeout(attachDynamicPreviewObserver, 150);
}

// ========================================================
// 12. EDIT CUSTOMER DETAILS
// ========================================================
let tempEditQuoteType = 'both';
function openEditCustomerModal() {
    const site = getCurrentSite();
    if (!site) return;

    safeSetVal('editCustName', site.clientName || "");
    safeSetVal('editCustContactPerson', site.custContactPerson || "");
    safeSetVal('editCustRole', site.custRole || "");
    safeSetVal('editCustNumber1', site.custNumber1 || "");
    safeSetVal('editCustNumber2', site.custNumber2 || "");
    safeSetVal('editCustAddress', site.custAddress || "");
    safeSetVal('editCustGST', site.custGST || "");
    safeSetVal('editCustEmail', site.custEmail || "");

    setEditSiteQuoteType(site.quoteType || 'both');
    openModalWithHistory('editCustomerModal');
}
function closeEditCustomerModal() { closeModalSafe('editCustomerModal'); }

function setEditSiteQuoteType(type) {
    tempEditQuoteType = type;
    document.querySelectorAll('#editCustomerModal .quote-type-card').forEach(c => c.classList.remove('active'));
    document.getElementById('editCardQuoteType_' + type)?.classList.add('active');
}

function saveEditCustomerDetails() {
    const site = getCurrentSite();
    if (!site) return;

    const name = (document.getElementById('editCustName')?.value || "").trim();
    if (!name) return showAppAlert("⚠️ Client Name Required", "Please enter Client Name.");

    site.clientName = name;
    site.custContactPerson = (document.getElementById('editCustContactPerson')?.value || "").trim();
    site.custRole = (document.getElementById('editCustRole')?.value || "").trim();
    site.custNumber1 = (document.getElementById('editCustNumber1')?.value || "").trim();
    site.custNumber2 = (document.getElementById('editCustNumber2')?.value || "").trim();
    site.custAddress = (document.getElementById('editCustAddress')?.value || "").trim();
    site.custGST = (document.getElementById('editCustGST')?.value || "").trim();
    site.custEmail = (document.getElementById('editCustEmail')?.value || "").trim();
    
    site.quoteType = tempEditQuoteType;
    site.civilEnabled = (site.quoteType === 'both' || site.quoteType === 'civil');
    site.shedEnabled = (site.quoteType === 'both' || site.quoteType === 'shed');

    syncDataToCloud('patel_app_sites', sites);

    safeSetText('dashSiteName', site.clientName);
    safeSetText('dashQuoteNo', site.quoteNo + (site.custAddress ? (" | " + site.custAddress) : ""));
    safeSetText('civilDashSiteName', site.clientName);
    safeSetText('civilDashQuoteNo', site.quoteNo);

    updatePillTogglesUI();
    renderDynamicPdfActionsBar();
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
    closeEditCustomerModal();

    if (site.quoteType === 'civil') {
        openCivilDashboardScreen();
    } else {
        openScreen('screenSiteDashboard');
    }

    showCorporateToast("Quotation & Customer Details Updated!", "👤");
}

function syncPreviewCustEdit(field, el) {
    const site = getCurrentSite();
    if (!site) return;
    site[field] = el.innerText.trim();
    syncDataToCloud('patel_app_sites', sites);
    safeSetText('dashSiteName', site.clientName);
    safeSetText('civilDashSiteName', site.clientName);
    refreshLivePdfPreviewSheet(true);
}

// ========================================================
// 13. CIVIL DATA & TOGGLES
// ========================================================
function ensureCivilDataOnSite(site) {
    if (!site.civilData) site.civilData = JSON.parse(JSON.stringify(masterBlueprint.civilData));
    ['foundation', 'brickWall', 'flooring'].forEach(sec => {
        if (!site.civilData[sec]) site.civilData[sec] = JSON.parse(JSON.stringify(masterBlueprint.civilData[sec]));
        if (!site.civilData[sec].items) site.civilData[sec].items = JSON.parse(JSON.stringify(masterBlueprint.civilData[sec].items));
        site.civilData[sec].items.forEach(it => {
            if (it.enabled === undefined) it.enabled = true;
        });
    });
}

function renderDynamicPdfActionsBar() {
    const site = getCurrentSite();
    const bar = document.getElementById('dynamicPdfDownloadActionsBar');
    if (!bar || !site) return;

    bar.innerHTML = "";
    if (site.quoteType === 'both') {
        bar.innerHTML = `
            <button class="btn-main btn-3d-main btn-ripple" style="flex:2; padding:13px;" onclick="downloadPDFDirectly('both')">
                <span style="font-size:17px;">📑</span> COMBINED PDF (PAGE 1 & 2)
            </button>
            <button class="btn-secondary btn-3d-secondary btn-ripple" style="flex:1; justify-content:center; padding:13px; font-weight:900;" onclick="downloadPDFDirectly('civil')">
                🧱 Civil Only
            </button>
            <button class="btn-secondary btn-3d-secondary btn-ripple" style="flex:1; justify-content:center; padding:13px; font-weight:900;" onclick="downloadPDFDirectly('shed')">
                🏢 Shed Only
            </button>
        `;
    } else if (site.quoteType === 'civil') {
        bar.innerHTML = `
            <button class="btn-main btn-3d-green btn-ripple" style="width:100%; padding:14px;" onclick="downloadPDFDirectly('civil')">
                <span style="font-size:18px;">⬇️</span> DOWNLOAD CIVIL QUOTATION PDF (0.25" MARGIN)
            </button>
        `;
    } else {
        bar.innerHTML = `
            <button class="btn-main btn-3d-main btn-ripple" style="width:100%; padding:14px;" onclick="downloadPDFDirectly('shed')">
                <span style="font-size:18px;">⬇️</span> DOWNLOAD SHED QUOTATION PDF (0.25" MARGIN)
            </button>
        `;
    }
}

function applyCustomButtonNamesUI() {
    safeSetText('dashBtnTitlePrim', appSettings.btnNamePrim || "1. Primary");
    safeSetText('dashBtnTitleSec', appSettings.btnNameSec || "2. Secondary");
    safeSetText('dashBtnTitleClad', appSettings.btnNameClad || "3. Cladding");
    safeSetText('dashBtnTitleAcc', appSettings.btnNameAcc || "4. Accessories");
    safeSetText('dashBtnTitleErect', appSettings.btnNameErect || "5. Erection");
    safeSetText('dashBtnTitleFoundation', appSettings.btnNameFoundation || "1. Foundation Details");
    safeSetText('dashBtnTitleBrick', appSettings.btnNameBrick || "2. Brick Wall Details");
    safeSetText('dashBtnTitleFlooring', appSettings.btnNameFlooring || "3. Flooring Details");
}

function toggleModuleActiveState(modKey) {
    const site = getCurrentSite();
    if (!site) return;
    if (modKey === 'prim') site.primEnabled = !site.primEnabled;
    else if (modKey === 'sec') site.secEnabled = !site.secEnabled;
    else if (modKey === 'clad') site.cladEnabled = !site.cladEnabled;
    else if (modKey === 'acc') site.accEnabled = !site.accEnabled;
    else if (modKey === 'erect') site.erectEnabled = !site.erectEnabled;

    syncDataToCloud('patel_app_sites', sites);
    updateModulePillBadgesUI();
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function updateModulePillBadgesUI() {
    const site = getCurrentSite();
    if (!site) return;

    const setBadge = (id, cardId, isEnabled) => {
        const badge = document.getElementById(id);
        const card = document.getElementById(cardId);
        if (badge) {
            badge.innerText = isEnabled ? "ON" : "OFF";
            badge.className = "mod-switch-pill " + (isEnabled ? "on" : "");
        }
        if (card) {
            if (!isEnabled) card.classList.add('disabled-mod');
            else card.classList.remove('disabled-mod');
        }
    };

    setBadge('badgePrimStatus', 'cardModPrim', site.primEnabled !== false);
    setBadge('badgeSecStatus', 'cardModSec', site.secEnabled !== false);
    setBadge('badgeCladStatus', 'cardModClad', site.cladEnabled !== false);
    setBadge('badgeAccStatus', 'cardModAcc', site.accEnabled !== false);
    setBadge('badgeErectStatus', 'cardModErect', site.erectEnabled !== false);
}

function toggleCivilModuleActiveState(secKey) {
    const site = getCurrentSite();
    if (!site) return;
    if (secKey === 'foundation') site.foundEnabled = !site.foundEnabled;
    else if (secKey === 'brickWall') site.brickEnabled = !site.brickEnabled;
    else if (secKey === 'flooring') site.floorEnabled = !site.floorEnabled;

    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    updateCivilModulePillBadgesUI();
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function updateCivilModulePillBadgesUI() {
    const site = getCurrentSite();
    if (!site) return;

    const setCivBadge = (badgeId, cardId, isEnabled) => {
        const badge = document.getElementById(badgeId);
        const card = document.getElementById(cardId);
        if (badge) {
            badge.innerText = isEnabled ? "ON" : "OFF";
            badge.className = "mod-switch-pill " + (isEnabled ? "on" : "");
        }
        if (card) {
            if (!isEnabled) card.classList.add('disabled-mod');
            else card.classList.remove('disabled-mod');
        }
    };

    setCivBadge('badgeCivFoundStatus', 'cardCivFound', site.foundEnabled !== false);
    setCivBadge('badgeCivBrickStatus', 'cardCivBrick', site.brickEnabled !== false);
    setCivBadge('badgeCivFloorStatus', 'cardCivFloor', site.floorEnabled !== false);
}

function toggleRateOnlyMode() {
    const site = getCurrentSite();
    if (!site) return;
    site.rateOnlyMode = !site.rateOnlyMode;
    syncDataToCloud('patel_app_sites', sites);
    updatePillTogglesUI();
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function toggleCivilRateOnlyMode() {
    const site = getCurrentSite();
    if (!site) return;
    site.civilRateOnlyMode = !site.civilRateOnlyMode;
    syncDataToCloud('patel_app_sites', sites);
    updatePillTogglesUI();
    refreshLivePdfPreviewSheet();
}

function updatePillTogglesUI() {
    const site = getCurrentSite();
    if (!site) return;

    const btnRate = document.getElementById('pillBtnRateMode');
    const txtRate = document.getElementById('pillTxtRateMode');
    const btnCivRate = document.getElementById('pillBtnCivilRateMode');
    const txtCivRate = document.getElementById('pillTxtCivilRateMode');
    const boxCiv = document.getElementById('civilSectionsContainer');

    if (btnRate && txtRate) {
        btnRate.classList.toggle('active', !!site.rateOnlyMode);
        txtRate.innerText = site.rateOnlyMode ? "Shed Rates (ON)" : "Shed BOQ";
    }

    if (btnCivRate && txtCivRate) {
        btnCivRate.classList.toggle('active', !!site.civilRateOnlyMode);
        txtCivRate.innerText = site.civilRateOnlyMode ? "Civil Rates (ON)" : "Civil BOQ";
        btnCivRate.style.display = (site.quoteType === 'both') ? 'flex' : 'none';
    }

    if (boxCiv) boxCiv.style.display = (site.quoteType === 'both') ? 'block' : 'none';

    const civPillCivRate = document.getElementById('pillBtnCivilScreenCivRateMode');
    const civTxtCivRate = document.getElementById('pillTxtCivilScreenCivRateMode');
    if (civPillCivRate && civTxtCivRate) {
        civPillCivRate.classList.toggle('active', !!site.civilRateOnlyMode);
        civTxtCivRate.innerText = site.civilRateOnlyMode ? "Civil Rates (ON)" : "Civil BOQ";
    }
}

// ========================================================
// 14. CIVIL DASHBOARD
// ========================================================
function openCivilDashboardScreen() {
    const site = getCurrentSite();
    if (!site) return;

    safeSetText('civilDashSiteName', site.clientName || "Untitled Client");
    safeSetText('civilDashQuoteNo', site.quoteNo || "#PE/2026/01");
    safeSetText('civilScopeDescPreviewTxt', site.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS");

    renderCivilCustomCategoriesUI();
    updatePillTogglesUI();
    updateCivilModulePillBadgesUI();
    updateTaxDisplay();
    updateHeaderBannersUI();
    calcModuleTotals();
    openScreen('screenCivilDashboard');

    setTimeout(() => {
        refreshLivePdfPreviewSheet();
        syncCivilLivePreviewBox();
        autoFitPreview();
    }, 80);
}

function syncCivilLivePreviewBox() {
    const pSheet = document.getElementById('printableA4Sheet');
    const civilLiveBox = document.getElementById('civilLiveSheetDisplayBox');
    if (pSheet && civilLiveBox) {
        civilLiveBox.innerHTML = "";
        const clone = pSheet.cloneNode(true);
        clone.id = 'printableA4Sheet_civilDisplayMirror';
        clone.style.display = 'flow-root';

        const cloneShed = clone.querySelector('#page1MsStructure');
        const cloneCivil = clone.querySelector('#civilDedicatedPageSheet');
        const cloneGap = clone.querySelector('#civilPageGapDivider');

        const site = getCurrentSite();
        const isShed = site && (site.quoteType === 'both' || site.quoteType === 'shed');
        const isCivil = site && (site.quoteType === 'both' || site.quoteType === 'civil');

        if (!isShed && cloneShed) cloneShed.remove();
        if (!isCivil && cloneCivil) cloneCivil.remove();
        if ((!isShed || !isCivil) && cloneGap) cloneGap.remove();

        civilLiveBox.appendChild(clone);
    }
}

function openCivilScopeModal() {
    const site = getCurrentSite();
    safeSetVal('inp_civilScopeDescModal', site?.civilScopeDesc || masterBlueprint.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS");
    openModalWithHistory('civilScopeModal');
}
function closeCivilScopeModal() { closeModalSafe('civilScopeModal'); }

function saveCivilScopeModal() {
    const site = getCurrentSite();
    if (!site) return;
    const nw = (document.getElementById('inp_civilScopeDescModal')?.value || "").trim();
    site.civilScopeDesc = nw;
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    safeSetText('civilScopeDescPreviewTxt', nw);
    closeCivilScopeModal();
    refreshLivePdfPreviewSheet();
    setTimeout(() => openCivilDashboardScreen(), 50);
}

// ========================================================
// 15. CIVIL PARAMETERS MODAL
// ========================================================
let activeCivilModalType = null;
function openCivilParamModal(type) {
    activeCivilModalType = type;
    const site = getCurrentSite();
    if (!site) return;
    ensureCivilDataOnSite(site);

    const container = document.getElementById('civilModalRowsContainer');
    const title = document.getElementById('civilModalTitle');
    if (!container || !title) return;

    const secData = site.civilData[type];
    title.innerHTML = `🧱 <input type="text" class="modal-title-edit" value="${secData.title}" oninput="updateCivilSecTitle('${type}', this.value)">`;

    let html = "";
    (secData.items || []).forEach((item, idx) => {
        const isSelected = item.enabled !== false;
        const lineTotal = isSelected ? ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)) : 0;
        html += `
            <div class="civil-calc-card card-3d sortable-item ${isSelected ? '' : 'disabled-mod'}" id="civCard_${type}_${idx}" data-sort-index="${idx}">
                <div class="acc-top-row">
                    <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;" onclick="toggleCivilItemTick('${type}', ${idx})">
                        <span class="drag-handle" id="handle_civ_${type}_${idx}" onclick="event.stopPropagation()" title="Drag to reorder">⋮⋮</span>
                        <div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation(); toggleCivilItemTick('${type}', ${idx})">${isSelected ? '✓' : ''}</div>
                        <strong style="font-size:12px; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${idx + 1}. ${item.name}</strong>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                        <span class="acc-total-pill">${lineTotal > 0 ? '₹ ' + Math.round(lineTotal).toLocaleString('en-IN') : (isSelected ? '-' : 'OFF')}</span>
                        <button type="button" class="btn-del-pro btn-ripple" onclick="deleteCivilItem('${type}', ${idx})">🗑️</button>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:8px;">
                    <label>Item Description</label>
                    <input type="text" value="${item.name}" oninput="updateCivilItemField('${type}', ${idx}, 'name', this.value)">
                </div>
                <div class="row-3">
                    <div class="form-group" style="margin:0;">
                        <label>Qty / Area</label>
                        <input type="number" inputmode="decimal" step="any" value="${item.qty}" oninput="updateCivilItemField('${type}', ${idx}, 'qty', this.value)">
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label>Unit</label>
                        <button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPicker('${item.unit}', (u) => { updateCivilItemField('${type}', ${idx}, 'unit', u); openCivilParamModal('${type}'); })">${item.unit || 'Lot'} ▾</button>
                    </div>
                    <div class="form-group" style="margin:0;">
                        <label>Rate (₹)</label>
                        <input type="number" inputmode="decimal" step="any" value="${item.rate}" oninput="updateCivilItemField('${type}', ${idx}, 'rate', this.value)">
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html;

    (secData.items || []).forEach((_, idx) => {
        const row = document.getElementById(`civCard_${type}_${idx}`);
        const handle = document.getElementById(`handle_civ_${type}_${idx}`);
        if (row && handle) setupUniversalReorder(row, handle, 'civil_items', idx, type);
    });
    openModalWithHistory('civilParamModal');
}

function toggleCivilItemTick(type, idx) {
    const site = getCurrentSite();
    if (!site?.civilData[type]?.items[idx]) return;
    site.civilData[type].items[idx].enabled = !(site.civilData[type].items[idx].enabled !== false);
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    openCivilParamModal(type);
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function deleteCivilItem(type, idx) {
    const site = getCurrentSite();
    if (!site?.civilData[type]?.items) return;
    site.civilData[type].items.splice(idx, 1);
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    openCivilParamModal(type);
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function updateCivilSecTitle(section, val) {
    const site = getCurrentSite();
    if (!site) return;
    site.civilData[section].title = val;
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    refreshLivePdfPreviewSheet();
}

function updateCivilItemField(section, idx, field, val) {
    const site = getCurrentSite();
    if (!site?.civilData[section]?.items[idx]) return;
    site.civilData[section].items[idx][field] = val;
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function addCivilRowDirectly(secKey) {
    const site = getCurrentSite();
    if (!site) return;
    ensureCivilDataOnSite(site);
    const targetList = site.civilData[secKey].items;
    targetList.push({
        id: 'citem_' + Date.now(),
        name: "New Civil Work Item #" + (targetList.length + 1),
        qty: "",
        unit: "Lot",
        rate: "",
        enabled: true
    });
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function addCustomRowToActiveCivilSection() {
    if (!activeCivilModalType) return;
    addCivilRowDirectly(activeCivilModalType);
    openCivilParamModal(activeCivilModalType);
}

function closeCivilParamModal() {
    closeModalSafe('civilParamModal');
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
    setTimeout(() => openCivilDashboardScreen(), 50);
}

// ========================================================
// 16. UNIVERSAL MODULE ADDER
// ========================================================
let universalModMode = 'shed', universalModUnit = 'Lot';

function openAddUniversalModuleModal(mode) {
    universalModMode = mode;
    universalModUnit = 'Lot';
    safeSetText('universalModHeading', mode === 'civil' ? "➕ Add Civil Module" : "➕ Add Custom Module");
    safeSetVal('umod_title', "");
    safeSetVal('umod_desc', "");
    safeSetVal('umod_qty', "1");
    safeSetVal('umod_rate', "0");
    safeSetText('btn_umod_unit', "Lot ▾");
    recalcUmodPreviewAmount();
    openModalWithHistory('universalModuleModal');
}

function recalcUmodPreviewAmount() {
    const q = parseFloat(document.getElementById('umod_qty')?.value) || 0;
    const r = parseFloat(document.getElementById('umod_rate')?.value) || 0;
    safeSetText('umodCalculatedAmtText', (q * r) > 0 ? '₹ ' + Math.round(q * r).toLocaleString('en-IN') : '-');
}

function openThemeUnitPickerForUniversalMod() {
    openThemeUnitPicker(universalModUnit, (u) => {
        universalModUnit = u;
        safeSetText('btn_umod_unit', u + " ▾");
    });
}

function closeUniversalModuleModal() { closeModalSafe('universalModuleModal'); }

function saveUniversalModule() {
    const site = getCurrentSite();
    if (!site) return;
    const title = (document.getElementById('umod_title')?.value || "").trim();
    if (!title) return showAppAlert("⚠️ Required", "Please enter Module Title!");

    const descVal = (document.getElementById('umod_desc')?.value || "").trim();
    const qtyVal = parseFloat(document.getElementById('umod_qty')?.value) || 1;
    const rateVal = parseFloat(document.getElementById('umod_rate')?.value) || 0;
    const totalVal = qtyVal * rateVal;

    if (universalModMode === 'civil') {
        if (!site.civilCustomCategories) site.civilCustomCategories = [];
        site.civilCustomCategories.push({
            id: 'civcat_' + Date.now(),
            categoryName: title,
            enabled: true,
            items: [{ name: descVal || title, qty: qtyVal, unit: universalModUnit, rate: rateVal, total: totalVal, enabled: true }]
        });
        renderCivilCustomCategoriesUI();
    } else {
        if (!site.customModules) site.customModules = [];
        const newModId = 'cmod_' + Date.now();
        site.customModules.push({
            id: newModId,
            title,
            desc: descVal,
            unit: universalModUnit,
            qty: qtyVal,
            rate: rateVal,
            total: totalVal,
            enabled: true
        });
        if (!site.moduleOrder) site.moduleOrder = ['prim', 'sec', 'clad', 'acc', 'erect'];
        site.moduleOrder.push(newModId);
        renderCustomModulesDashboardList();
    }
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    calcModuleTotals();
    closeUniversalModuleModal();
    refreshLivePdfPreviewSheet();
    showCorporateToast(`Module "${title}" Added!`);
}

function renderCivilCustomCategoriesUI() {
    const site = getCurrentSite();
    const box = document.getElementById('civilCustomCategoriesGrid');
    if (!box || !site) return;
    box.innerHTML = "";
    (site.civilCustomCategories || []).forEach((cat, cIdx) => {
        const isEnabled = cat.enabled !== false;
        box.innerHTML += `
            <div class="module-grid-card card-3d-press btn-ripple ${!isEnabled ? 'disabled-mod' : ''}" style="border-left: 4px solid #16a34a;">
                <span class="mod-switch-pill ${isEnabled ? 'on' : ''}" onclick="event.stopPropagation(); toggleCustomCivilCategoryActive(${cIdx})">${isEnabled ? 'ON' : 'OFF'}</span>
                <div>
                    <div class="mod-card-top"><span class="mod-card-icon">🏗️</span><span class="mod-card-title">${4 + cIdx}. ${cat.categoryName}</span></div>
                    <span class="mod-card-tag">${(cat.items || []).length} Items</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="mod-card-badge" style="background:#166534;">Configured</span>
                    <button class="btn-del-pro btn-ripple" onclick="deleteCustomCivilCategory(${cIdx})">🗑️</button>
                </div>
            </div>`;
    });
}

function toggleCustomCivilCategoryActive(cIdx) {
    const site = getCurrentSite();
    if (!site?.civilCustomCategories[cIdx]) return;
    site.civilCustomCategories[cIdx].enabled = !(site.civilCustomCategories[cIdx].enabled !== false);
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    renderCivilCustomCategoriesUI();
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function deleteCustomCivilCategory(cIdx) {
    const site = getCurrentSite();
    if (!site?.civilCustomCategories) return;
    site.civilCustomCategories.splice(cIdx, 1);
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    renderCivilCustomCategoriesUI();
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function renderCustomModulesDashboardList() {
    const site = getCurrentSite();
    const container = document.getElementById('customModulesListContainer');
    if (!container || !site) return;
    container.innerHTML = "";
    (site.customModules || []).forEach((mod, idx) => {
        const amt = (parseFloat(mod.qty) || 0) * (parseFloat(mod.rate) || 0);
        const isEnabled = mod.enabled !== false;
        container.innerHTML += `
            <div class="module-grid-card card-3d-press ${!isEnabled ? 'disabled-mod' : ''} btn-ripple" style="border-left: 4px solid var(--header-bg);">
                <span class="mod-switch-pill ${isEnabled ? 'on' : ''}" onclick="event.stopPropagation(); toggleCustomModuleActive('${mod.id}')">${isEnabled ? 'ON' : 'OFF'}</span>
                <div>
                    <div class="mod-card-top"><span class="mod-card-icon">✨</span><span class="mod-card-title">${6 + idx}. ${mod.title}</span></div>
                    <span class="mod-card-tag">${mod.desc || (mod.qty + ' ' + mod.unit + ' @ ₹' + mod.rate)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span class="mod-card-badge">${site.rateOnlyMode ? ('₹ ' + (mod.rate || '-') + '/' + mod.unit) : (amt > 0 ? 'Rs. ' + Math.round(amt).toLocaleString('en-IN') : '-')}</span>
                    <button class="btn-del-pro btn-ripple" onclick="event.stopPropagation(); deleteCustomModule('${mod.id}')">🗑️</button>
                </div>
            </div>`;
    });
}

function toggleCustomModuleActive(modId) {
    const site = getCurrentSite();
    const mod = (site?.customModules || []).find(m => m.id === modId);
    if (mod) {
        mod.enabled = !(mod.enabled !== false);
        syncDataToCloud('patel_app_sites', sites);
        syncSiteStructureToMasterBlueprint(site);
        renderCustomModulesDashboardList();
        calcModuleTotals();
        refreshLivePdfPreviewSheet();
    }
}

function deleteCustomModule(modId) {
    const site = getCurrentSite();
    if (!site) return;
    site.customModules = (site.customModules || []).filter(m => m.id !== modId);
    if (site.moduleOrder) site.moduleOrder = site.moduleOrder.filter(id => id !== modId);
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    renderCustomModulesDashboardList();
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function autoSaveAndUpdate() {
    const site = getCurrentSite();
    if (!site) return;
    site.dimW = document.getElementById('dimW')?.value || "";
    site.dimL = document.getElementById('dimL')?.value || "";
    site.dimH = document.getElementById('dimH')?.value || "";
    const sqft = (parseFloat(site.dimW) || 0) * (parseFloat(site.dimL) || 0);
    safeSetText('dashSqFtText', sqft > 0 ? sqft.toLocaleString('en-IN') + " Sq.Ft" : "0 Sq.Ft");
    syncDataToCloud('patel_app_sites', sites);
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

// ========================================================
// 17. STRUCTURE MODULE MODALS
// ========================================================
let activeModType = null;
function openModuleModal(type) {
    activeModType = type;
    const site = getCurrentSite();
    if (!site) return;
    const modalTitle = document.getElementById('modModalTitle');
    const customLineInput = document.getElementById('modalInputCustomLine');
    const inputsBox = document.getElementById('modInputsBox');
    const checklistTitle = document.getElementById('lblChecklistTitle');
    const addRowBox = document.getElementById('addItemRowBox');
    safeSetVal('customItemInput', "");

    if (type === 'prim') {
        modalTitle.innerHTML = `🏗️ 1. Primary Framing Structure`;
        customLineInput.value = site.primCustomLine || "";
        checklistTitle.innerText = "Checklist Specifications:";
        checklistTitle.style.display = addRowBox.style.display = 'block';
        inputsBox.innerHTML = `
            <div class="row-3">
                <div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPickerForMod('prim')">${site.primUnit || 'Kg'} ▾</button></div>
                <div class="form-group" style="margin:0;"><label>Weight / Qty</label><input type="number" inputmode="decimal" step="any" id="modalInputWt" value="${site.primWeight}" oninput="autoSaveModuleChanges()"></div>
                <div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.primRate}" oninput="autoSaveModuleChanges()"></div>
            </div>`;
        renderStandardChecklist(site.primSpecs);
    } else if (type === 'sec') {
        modalTitle.innerHTML = `⚙️ 2. Secondary Framing`;
        customLineInput.value = site.secCustomLine || "";
        checklistTitle.innerText = "Specifications:";
        checklistTitle.style.display = addRowBox.style.display = 'block';
        inputsBox.innerHTML = `
            <div class="row-3">
                <div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPickerForMod('sec')">${site.secUnit || 'Kg'} ▾</button></div>
                <div class="form-group" style="margin:0;"><label>Weight / Qty</label><input type="number" inputmode="decimal" step="any" id="modalInputWt" value="${site.secWeight}" oninput="autoSaveModuleChanges()"></div>
                <div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.secRate}" oninput="autoSaveModuleChanges()"></div>
            </div>`;
        renderStandardChecklist(site.secSpecs);
    } else if (type === 'clad') {
        modalTitle.innerHTML = `🛡️ 3. Roofing & Cladding System`;
        customLineInput.value = site.cladCustomLine || "";
        checklistTitle.style.display = addRowBox.style.display = 'none';
        inputsBox.innerHTML = `
            <div class="form-group"><label>Sheet Thickness (e.g. 0.50 mm)</label><input type="text" id="modalInputThick" value="${site.cladThickness || ''}" placeholder="0.50 mm" oninput="autoSaveModuleChanges()"></div>
            <div class="row-3">
                <div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPickerForMod('clad')">${site.cladUnit || 'Sq.Ft'} ▾</button></div>
                <div class="form-group" style="margin:0;"><label>Total Coverage</label><input type="number" inputmode="decimal" step="any" id="modalInputSqFt" value="${site.cladSqFt}" oninput="autoSaveModuleChanges()"></div>
                <div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.cladRate}" oninput="autoSaveModuleChanges()"></div>
            </div>`;
        document.getElementById('modItemsCheckContainer').innerHTML = `<div style="font-size:12px; color:#64748b; padding:10px 0;">💡 Sheeting parameters sync automatically.</div>`;
    } else if (type === 'acc') {
        modalTitle.innerHTML = `📦 4. Building Accessories`;
        customLineInput.value = site.accCustomLine || "";
        checklistTitle.innerText = "Accessories List:";
        checklistTitle.style.display = addRowBox.style.display = 'block';
        inputsBox.innerHTML = `<p style="font-size:12px; color:#475569; margin:0;">Tick to include:</p>`;
        renderAccessoriesChecklist();
    } else if (type === 'erect') {
        modalTitle.innerHTML = `🚜 5. Turnkey Erection`;
        customLineInput.value = site.erectCustomLine || "";
        checklistTitle.innerText = "Scope Specifications:";
        checklistTitle.style.display = addRowBox.style.display = 'block';
        inputsBox.innerHTML = `
            <div class="form-group" style="margin:0;">
                <label>Erection Rate (₹ / Kg)</label>
                <input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.erectRate}" oninput="autoSaveModuleChanges()">
            </div>`;
        renderStandardChecklist(site.erectSpecs);
    }
    openModalWithHistory('moduleSelectionModal');
}

function openThemeUnitPickerForMod(modType) {
    const site = getCurrentSite();
    if (!site) return;
    const curUnit = modType === 'prim' ? site.primUnit : modType === 'sec' ? site.secUnit : modType === 'clad' ? site.cladUnit : site.erectUnit;
    openThemeUnitPicker(curUnit || 'Kg', (u) => {
        if (modType === 'prim') site.primUnit = u;
        else if (modType === 'sec') site.secUnit = u;
        else if (modType === 'clad') site.cladUnit = u;
        else if (modType === 'erect') site.erectUnit = u;
        syncDataToCloud('patel_app_sites', sites);
        syncSiteStructureToMasterBlueprint(site);
        openModuleModal(modType);
        calcModuleTotals();
        refreshLivePdfPreviewSheet();
    });
}
function closeModuleModal() { 
    closeModalSafe('moduleSelectionModal'); 
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function renderStandardChecklist(list) {
    const container = document.getElementById('modItemsCheckContainer');
    if (!container) return;
    container.innerHTML = "";
    if (!list || list.length === 0) {
        container.innerHTML = `<div style="font-size:12.5px; color:#a1a1aa; padding:12px 0;">No items found. Add below.</div>`;
        return;
    }
    list.forEach((item, idx) => {
        const isSelected = item.selected === true;
        const itemName = item.text !== undefined ? item.text : item;
        container.innerHTML += `
            <div class="tick-item-card ${isSelected ? 'selected' : ''}" onclick="toggleItemTick(${idx})">
                <div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation(); toggleItemTick(${idx})">${isSelected ? '✓' : ''}</div>
                <input type="text" value="${itemName}" onclick="event.stopPropagation()" oninput="updateStandardChecklistItemName(${idx}, this.value)" style="flex:1; border:none; background:transparent; font-size:13px; font-weight:800; color:#0f172a; outline:none;">
                <button class="btn-del-pro btn-ripple" onclick="event.stopPropagation(); deleteItemFromModule(${idx})">🗑️</button>
            </div>`;
    });
}

function updateStandardChecklistItemName(idx, newText) {
    const site = getCurrentSite();
    let targetList = activeModType === 'prim' ? site.primSpecs : activeModType === 'sec' ? site.secSpecs : site.erectSpecs;
    if (targetList[idx]) {
        targetList[idx].text = newText;
        syncDataToCloud('patel_app_sites', sites);
        syncSiteStructureToMasterBlueprint(site);
        refreshLivePdfPreviewSheet();
    }
}
function toggleItemTick(idx) {
    const site = getCurrentSite();
    let targetList = activeModType === 'prim' ? site.primSpecs : activeModType === 'sec' ? site.secSpecs : site.erectSpecs;
    targetList[idx].selected = !targetList[idx].selected;
    renderStandardChecklist(targetList);
    autoSaveModuleChanges();
}
function deleteItemFromModule(idx) {
    const site = getCurrentSite();
    let targetList = activeModType === 'prim' ? site.primSpecs : activeModType === 'sec' ? site.secSpecs : site.erectSpecs;
    targetList.splice(idx, 1);
    renderStandardChecklist(targetList);
    autoSaveModuleChanges();
}
function addNewItemToModule() {
    const val = (document.getElementById('customItemInput')?.value || "").trim();
    if (!val) return;
    const site = getCurrentSite();
    if (activeModType === 'prim') (site.primSpecs = site.primSpecs || []).push({ text: val, selected: true });
    else if (activeModType === 'sec') (site.secSpecs = site.secSpecs || []).push({ text: val, selected: true });
    else if (activeModType === 'acc') (site.accessories = site.accessories || []).push({ name: val, qty: "", unit: "Nos", rate: "", selected: true });
    else if (activeModType === 'erect') (site.erectSpecs = site.erectSpecs || []).push({ text: val, selected: true });
    safeSetVal('customItemInput', "");
    autoSaveModuleChanges();
}

function renderAccessoriesChecklist() {
    const container = document.getElementById('modItemsCheckContainer');
    if (!container) return;
    container.innerHTML = "";
    const site = getCurrentSite();
    if (!site?.accessories || site.accessories.length === 0) {
        container.innerHTML = `<div style="font-size:12.5px; color:#a1a1aa; padding:12px 0;">No accessories added.</div>`;
        return;
    }
    site.accessories.forEach((acc, idx) => {
        const isSelected = acc.selected === true;
        const lineTotal = (parseFloat(acc.qty) || 0) * (parseFloat(acc.rate) || 0);
        container.innerHTML += `
            <div class="acc-item-card ${isSelected ? 'selected' : ''}" id="accCardBox_${idx}">
                <div class="acc-top-row">
                    <div style="display:flex; align-items:center; gap:8px; flex:1; min-width:0;" onclick="toggleAccessoryTick(${idx})">
                        <div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation(); toggleAccessoryTick(${idx})">${isSelected ? '✓' : ''}</div>
                        <input type="text" value="${acc.name}" onclick="event.stopPropagation()" oninput="updateAccessoryFieldFast(${idx}, 'name', this.value)" style="border:none; background:transparent; font-size:13px; font-weight:800; color:#0f172a; flex:1; min-width:0; outline:none;">
                    </div>
                    <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
                        <span class="acc-total-pill" id="accBadgePill_${idx}">${lineTotal > 0 ? '₹ ' + Math.round(lineTotal).toLocaleString('en-IN') : '-'}</span>
                        <button class="btn-del-pro btn-ripple" onclick="deleteAccessoryItem(${idx})">🗑️</button>
                    </div>
                </div>
                <div class="acc-inputs-row">
                    <div class="acc-input-cell"><input type="number" inputmode="decimal" step="any" placeholder="Qty" value="${acc.qty || ''}" oninput="updateAccessoryFieldFast(${idx}, 'qty', this.value)"></div>
                    <div class="acc-unit-cell"><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" id="accBtnUnit_${idx}" onclick="openThemeUnitPickerForAcc(${idx})">${acc.unit || 'Nos'} ▾</button></div>
                    <div class="acc-input-cell"><input type="number" inputmode="decimal" step="any" placeholder="Rate (₹)" value="${acc.rate || ''}" oninput="updateAccessoryFieldFast(${idx}, 'rate', this.value)"></div>
                    <div class="acc-calc-txt" id="accCalcTxt_${idx}"> = ${lineTotal > 0 ? '₹ ' + Math.round(lineTotal).toLocaleString('en-IN') : '-'}</div>
                </div>
            </div>`;
    });
}

function updateAccessoryFieldFast(idx, field, val) {
    const site = getCurrentSite();
    site.accessories[idx][field] = val;
    const lineTot = (parseFloat(site.accessories[idx].qty) || 0) * (parseFloat(site.accessories[idx].rate) || 0);
    safeSetText('accBadgePill_' + idx, lineTot > 0 ? '₹ ' + Math.round(lineTot).toLocaleString('en-IN') : '-');
    safeSetText('accCalcTxt_' + idx, lineTot > 0 ? '= ₹ ' + Math.round(lineTot).toLocaleString('en-IN') : '= -');
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function openThemeUnitPickerForAcc(accIdx) {
    const site = getCurrentSite();
    if (!site?.accessories[accIdx]) return;
    openThemeUnitPicker(site.accessories[accIdx].unit || 'Nos', (u) => {
        site.accessories[accIdx].unit = u;
        safeSetText('accBtnUnit_' + accIdx, u + " ▾");
        syncDataToCloud('patel_app_sites', sites);
        syncSiteStructureToMasterBlueprint(site);
        calcModuleTotals();
        refreshLivePdfPreviewSheet();
    });
}
function toggleAccessoryTick(idx) {
    const site = getCurrentSite();
    site.accessories[idx].selected = !site.accessories[idx].selected;
    renderAccessoriesChecklist();
    autoSaveModuleChanges();
}
function deleteAccessoryItem(idx) {
    const site = getCurrentSite();
    site.accessories.splice(idx, 1);
    renderAccessoriesChecklist();
    autoSaveModuleChanges();
}

function autoSaveModuleChanges() {
    const site = getCurrentSite();
    if (!site) return;
    const customLineVal = (document.getElementById('modalInputCustomLine')?.value || "").trim();
    if (activeModType === 'prim') {
        site.primCustomLine = customLineVal;
        site.primWeight = document.getElementById('modalInputWt')?.value || "";
        site.primRate = document.getElementById('modalInputRt')?.value || "";
    } else if (activeModType === 'sec') {
        site.secCustomLine = customLineVal;
        site.secWeight = document.getElementById('modalInputWt')?.value || "";
        site.secRate = document.getElementById('modalInputRt')?.value || "";
    } else if (activeModType === 'clad') {
        site.cladCustomLine = customLineVal;
        site.cladThickness = document.getElementById('modalInputThick')?.value || "";
        site.cladSqFt = document.getElementById('modalInputSqFt')?.value || "";
        site.cladRate = document.getElementById('modalInputRt')?.value || "";
    } else if (activeModType === 'acc') {
        site.accCustomLine = customLineVal;
    } else if (activeModType === 'erect') {
        site.erectCustomLine = customLineVal;
        site.erectRate = document.getElementById('modalInputRt')?.value || "";
    }
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

// ========================================================
// 18. TAX SELECTION & CALCULATIONS
// ========================================================
const TAX_SLABS = [
    { id: "gst18_split", name: "GST @ 18% (CGST 9% + SGST 9%)", rate: 0.18, split: true, cgstRate: 0.09, sgstRate: 0.09, desc: "Standard Intra-State (CGST 9% + SGST 9%)" },
    { id: "igst18", name: "IGST @ 18% (Inter-State)", rate: 0.18, split: false, desc: "Outside State Inter-State Supply" },
    { id: "gst12_works", name: "GST @ 12% (CGST 6% + SGST 6%)", rate: 0.12, split: true, cgstRate: 0.06, sgstRate: 0.06, desc: "Works Contract Scheme" },
    { id: "gst28_high", name: "GST @ 28% (CGST 14% + SGST 14%)", rate: 0.28, split: true, cgstRate: 0.14, sgstRate: 0.14, desc: "High Slab Rate" },
    { id: "gst5_jobwork", name: "GST @ 5% (CGST 2.5% + SGST 2.5%)", rate: 0.05, split: true, cgstRate: 0.025, sgstRate: 0.025, desc: "Jobwork / Concessional Rate" },
    { id: "zero_export", name: "0% GST (Zero Tax)", rate: 0.00, split: false, desc: "Zero Tax Billing" }
];

let activeTaxPickerTarget = 'shed';
function openTaxPickerModal(target = 'shed') {
    activeTaxPickerTarget = target;
    const site = getCurrentSite();
    const currentTaxId = target === 'civil' ? (site.civilSelectedTaxId || "gst18_split") : (site.selectedTaxId || "gst18_split");
    safeSetText('taxModalHeadingTitle', target === 'civil' ? "Civil Tax Slab" : "Shed Tax Slab");
    const container = document.getElementById('taxSlabListContainer');
    if (!container) return;
    container.innerHTML = "";
    TAX_SLABS.forEach(tax => {
        const isSelected = tax.id === currentTaxId;
        container.innerHTML += `
            <div class="tick-item-card card-3d ${isSelected ? 'selected' : ''} btn-ripple" onclick="selectTaxSlab('${tax.id}')">
                <div class="tick-box-ui ${isSelected ? 'checked' : ''}">${isSelected ? '✓' : ''}</div>
                <div style="flex:1;">
                    <strong style="font-size:13px; color: #000; display:block;">${tax.name}</strong>
                    <span style="font-size:11px; color: #64748b;">${tax.desc}</span>
                </div>
            </div>`;
    });
    openModalWithHistory('taxModal');
}
function closeTaxPickerModal() { closeModalSafe('taxModal'); }

function selectTaxSlab(taxId) {
    const site = getCurrentSite();
    if (site) {
        if (activeTaxPickerTarget === 'civil') site.civilSelectedTaxId = taxId;
        else site.selectedTaxId = taxId;
        syncDataToCloud('patel_app_sites', sites);
        updateTaxDisplay();
        calcModuleTotals();
        refreshLivePdfPreviewSheet();
    }
    closeTaxPickerModal();
}
function getActiveTaxSlab(target = 'shed') {
    const site = getCurrentSite();
    const taxId = site ? (target === 'civil' ? (site.civilSelectedTaxId || "gst18_split") : (site.selectedTaxId || "gst18_split")) : "gst18_split";
    return TAX_SLABS.find(t => t.id === taxId) || TAX_SLABS[0];
}
function updateTaxDisplay() {
    const shedTax = getActiveTaxSlab('shed');
    const civilTax = getActiveTaxSlab('civil');
    safeSetText('selectedTaxNameText', shedTax.name);
    safeSetText('selectedTaxDescText', shedTax.desc);
    safeSetText('civilSelectedTaxNameText', civilTax.name);
    safeSetText('civilSelectedTaxDescText', civilTax.desc);
}

function calcModuleTotals() {
    const site = getCurrentSite();
    if (!site) return;
    const isRateOnly = site.rateOnlyMode;

    const pTot = (site.primEnabled !== false) ? (parseFloat(site.primWeight) || 0) * (parseFloat(site.primRate) || 0) : 0;
    if (site.primEnabled === false) safeSetText('badgePrimTotal', 'Disabled');
    else if (isRateOnly) safeSetText('badgePrimTotal', '₹ ' + (site.primRate || '-') + '/Kg');
    else animateNumberRoll('badgePrimTotal', pTot, "Rs. ");

    const sTot = (site.secEnabled !== false) ? (parseFloat(site.secWeight) || 0) * (parseFloat(site.secRate) || 0) : 0;
    if (site.secEnabled === false) safeSetText('badgeSecTotal', 'Disabled');
    else if (isRateOnly) safeSetText('badgeSecTotal', '₹ ' + (site.secRate || '-') + '/Kg');
    else animateNumberRoll('badgeSecTotal', sTot, "Rs. ");

    const cTot = (site.cladEnabled !== false) ? (parseFloat(site.cladSqFt) || 0) * (parseFloat(site.cladRate) || 0) : 0;
    if (site.cladEnabled === false) safeSetText('badgeCladTotal', 'Disabled');
    else if (isRateOnly) safeSetText('badgeCladTotal', '₹ ' + (site.cladRate || '-') + '/Sq.Ft');
    else animateNumberRoll('badgeCladTotal', cTot, "Rs. ");

    let aTot = 0;
    if (site.accEnabled !== false) {
        (site.accessories || []).forEach(a => {
            if (a.selected === true) aTot += (parseFloat(a.qty) || 0) * (parseFloat(a.rate) || 0);
        });
    }
    if (site.accEnabled === false) safeSetText('badgeAccTotal', 'Disabled');
    else if (isRateOnly) safeSetText('badgeAccTotal', 'Package');
    else animateNumberRoll('badgeAccTotal', aTot, "Rs. ");

    const autoWt = ((site.primEnabled !== false) ? (parseFloat(site.primWeight) || 0) : 0) + ((site.secEnabled !== false) ? (parseFloat(site.secWeight) || 0) : 0);
    const eTot = (site.erectEnabled !== false) ? autoWt * (parseFloat(site.erectRate) || 0) : 0;
    if (site.erectEnabled === false) safeSetText('badgeErectTotal', 'Disabled');
    else if (isRateOnly) safeSetText('badgeErectTotal', '₹ ' + (site.erectRate || '-') + '/Kg');
    else animateNumberRoll('badgeErectTotal', eTot, "Rs. ");

    if (site.civilData) {
        const getSecTotal = (secKey) => {
            let tot = 0;
            (site.civilData[secKey]?.items || []).forEach(it => {
                if (it.enabled !== false) tot += (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0);
            });
            return tot;
        };

        const fTot = getSecTotal('foundation');
        const bTot = getSecTotal('brickWall');
        const flTot = getSecTotal('flooring');

        if (site.foundEnabled === false) safeSetText('badgeCivFoundTotal', 'Disabled');
        else if (site.civilRateOnlyMode) safeSetText('badgeCivFoundTotal', 'Unit Rates');
        else if (fTot > 0) animateNumberRoll('badgeCivFoundTotal', fTot, "Rs. ");
        else safeSetText('badgeCivFoundTotal', 'Edit ➔');

        if (site.brickEnabled === false) safeSetText('badgeCivBrickTotal', 'Disabled');
        else if (site.civilRateOnlyMode) safeSetText('badgeCivBrickTotal', 'Unit Rates');
        else if (bTot > 0) animateNumberRoll('badgeCivBrickTotal', bTot, "Rs. ");
        else safeSetText('badgeCivBrickTotal', 'Edit ➔');

        if (site.floorEnabled === false) safeSetText('badgeCivFloorTotal', 'Disabled');
        else if (site.civilRateOnlyMode) safeSetText('badgeCivFloorTotal', 'Unit Rates');
        else if (flTot > 0) animateNumberRoll('badgeCivFloorTotal', flTot, "Rs. ");
        else safeSetText('badgeCivFloorTotal', 'Edit ➔');
    }
}

// ========================================================
// 19. IN-PREVIEW LIVE SYNC
// ========================================================
function openCivilUnitPicker(secKey, idx) {
    const site = getCurrentSite();
    if (!site?.civilData[secKey]?.items[idx]) return;
    openThemeUnitPicker(site.civilData[secKey].items[idx].unit, (newUnit) => {
        site.civilData[secKey].items[idx].unit = newUnit;
        syncDataToCloud('patel_app_sites', sites);
        syncSiteStructureToMasterBlueprint(site);
        refreshLivePdfPreviewSheet();
    });
}
function openCivilCustomCatUnitPicker(catIdx, itemIdx) {
    const site = getCurrentSite();
    if (!site?.civilCustomCategories[catIdx]?.items[itemIdx]) return;
    openThemeUnitPicker(site.civilCustomCategories[catIdx].items[itemIdx].unit, (newUnit) => {
        site.civilCustomCategories[catIdx].items[itemIdx].unit = newUnit;
        syncDataToCloud('patel_app_sites', sites);
        syncSiteStructureToMasterBlueprint(site);
        refreshLivePdfPreviewSheet();
    });
}
function openShedUnitPicker(modKey) {
    const site = getCurrentSite();
    if (!site) return;
    const cur = modKey === 'prim' ? site.primUnit : modKey === 'sec' ? site.secUnit : modKey === 'clad' ? site.cladUnit : site.erectUnit;
    openThemeUnitPicker(cur || 'Kg', (newUnit) => {
        if (modKey === 'prim') site.primUnit = newUnit;
        else if (modKey === 'sec') site.secUnit = newUnit;
        else if (modKey === 'clad') site.cladUnit = newUnit;
        else if (modKey === 'erect') site.erectUnit = newUnit;
        syncDataToCloud('patel_app_sites', sites);
        syncSiteStructureToMasterBlueprint(site);
        refreshLivePdfPreviewSheet();
    });
}

function syncPreviewTitleEdit(el, modKey, cModId = null) {
    const site = getCurrentSite();
    if (!site) return;
    const newTitle = el.innerText.trim();
    if (modKey === 'prim') site.primCustomLine = newTitle;
    else if (modKey === 'sec') site.secCustomLine = newTitle;
    else if (modKey === 'clad') site.cladCustomLine = newTitle;
    else if (modKey === 'erect') site.erectCustomLine = newTitle;
    else if (modKey === 'custom' && cModId) {
        const mod = (site.customModules || []).find(m => m.id === cModId);
        if (mod) mod.title = newTitle;
    }
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
}

function syncCivilTitleEdit(el, secKey, idx) {
    const site = getCurrentSite();
    if (!site?.civilData[secKey]?.items[idx]) return;
    site.civilData[secKey].items[idx].name = el.innerText.trim();
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
}

function syncPreviewEdit(el, targetField) {
    const site = getCurrentSite();
    if (!site) return;
    const textVal = el.innerText.trim().replace(/[^0-9.]/g, '');

    if (targetField === 'primRate') site.primRate = textVal;
    else if (targetField === 'primWeight') site.primWeight = textVal;
    else if (targetField === 'secRate') site.secRate = textVal;
    else if (targetField === 'secWeight') site.secWeight = textVal;
    else if (targetField === 'cladRate') site.cladRate = textVal;
    else if (targetField === 'cladWeight' || targetField === 'cladSqFt') site.cladSqFt = textVal;
    else if (targetField === 'erectRate') site.erectRate = textVal;
    else if (targetField.startsWith('civ_')) {
        const parts = targetField.split('_');
        const sec = parts[1];
        const idx = parseInt(parts[2], 10);
        const fld = parts[3];
        if (site.civilData[sec]?.items[idx]) site.civilData[sec].items[idx][fld] = textVal;
    } else if (targetField.startsWith('civcat_')) {
        const parts = targetField.split('_');
        const cIdx = parseInt(parts[1], 10);
        const itIdx = parseInt(parts[2], 10);
        const fld = parts[3];
        if (site.civilCustomCategories[cIdx]?.items[itIdx]) site.civilCustomCategories[cIdx].items[itIdx][fld] = textVal;
    }
    syncDataToCloud('patel_app_sites', sites);
    calcModuleTotals();
    refreshLivePdfPreviewSheet(true);
}

function syncPreviewAccEdit(idx, field, el) {
    const site = getCurrentSite();
    if (!site?.accessories[idx]) return;
    site.accessories[idx][field] = el.innerText.trim().replace(/[^0-9.]/g, '');
    syncDataToCloud('patel_app_sites', sites);
    calcModuleTotals();
    refreshLivePdfPreviewSheet(true);
}

function syncAccTitleEdit(idx, el) {
    const site = getCurrentSite();
    if (!site?.accessories[idx]) return;
    site.accessories[idx].name = el.innerText.trim();
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
}

function syncPreviewTermsEdit(key, el) {
    const val = el.innerText.trim();
    appSettings[key] = val;
    syncDataToCloud('patel_app_settings', appSettings);
}

function addNewAccessoryDirectly() {
    const site = getCurrentSite();
    if (!site) return;
    (site.accessories = site.accessories || []).push({
        name: "New Accessory Item #" + (site.accessories.length + 1),
        qty: "1",
        unit: "Nos",
        rate: "0",
        selected: true
    });
    syncDataToCloud('patel_app_sites', sites);
    syncSiteStructureToMasterBlueprint(site);
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}

function renderVerticalTaxRowsHtml(basicCost, taxSlab) {
    if (!taxSlab || taxSlab.rate === 0 || basicCost === 0) {
        return `<div class="tax-split-row"><span class="tax-lbl">GST:</span><span class="tax-amt">-</span></div>`;
    }
    if (taxSlab.split) {
        const cgstAmt = Math.round(basicCost * taxSlab.cgstRate);
        const sgstAmt = Math.round(basicCost * taxSlab.sgstRate);
        const cgstPct = (taxSlab.cgstRate * 100).toFixed(1).replace('.0', '');
        const sgstPct = (taxSlab.sgstRate * 100).toFixed(1).replace('.0', '');
        return `
            <div class="tax-split-row"><span class="tax-lbl">CGST @ ${cgstPct}%:</span><span class="tax-amt">${cgstAmt > 0 ? '₹ ' + cgstAmt.toLocaleString('en-IN') : '-'}</span></div>
            <div class="tax-split-row"><span class="tax-lbl">SGST @ ${sgstPct}%:</span><span class="tax-amt">${sgstAmt > 0 ? '₹ ' + sgstAmt.toLocaleString('en-IN') : '-'}</span></div>`;
    }
    const taxAmt = Math.round(basicCost * taxSlab.rate);
    return `<div class="tax-split-row"><span class="tax-lbl">${taxSlab.name}:</span><span class="tax-amt">${taxAmt > 0 ? '₹ ' + taxAmt.toLocaleString('en-IN') : '-'}</span></div>`;
}

// ========================================================
// 20. LIVE PREVIEW ENGINE
// ========================================================
function refreshLivePdfPreviewSheet(isSoftRefresh = false) {
    const site = getCurrentSite();
    if (!site) return;
    const isRateOnly = site.rateOnlyMode === true;
    const isCivilRateOnly = site.civilRateOnlyMode === true;

    const compAddr = appSettings.companyAddr || "Bhawani Nagar, Bhilwara - 311001 (Rajasthan, India)";
    const compGst = appSettings.companyGst || "08AHFPL0222M2ZF";
    const compPhones = (appSettings.phones || []).filter(Boolean).join(", ") || "+91 9799635249";
    const compEmail = (appSettings.companyEmail || "").trim();
    const compWeb = (appSettings.footerWeb || "").trim();

    safeSetText('pdfSubstripAddr', compAddr);
    safeSetText('civilPdfSubstripAddr', compAddr);
    safeSetText('pdfSubstripGst', compGst);
    safeSetText('civilPdfSubstripGst', compGst);

    safeSetText('pdfFooterPhones', compPhones);
    safeSetText('civilPdfFooterPhones', compPhones);
    safeSetText('pdfCompanyGst', compGst);
    safeSetText('civilPdfCompanyGst', compGst);
    safeSetText('pdfFooterAddrMini', compAddr);
    safeSetText('civilPdfFooterAddrMini', compAddr);

    const pEmailWrap = document.getElementById('pdfFooterEmailWrap');
    const cEmailWrap = document.getElementById('civilPdfFooterEmailWrap');
    if (compEmail) {
        safeSetText('pdfFooterEmail', compEmail);
        safeSetText('civilPdfFooterEmail', compEmail);
        if (pEmailWrap) pEmailWrap.style.display = 'inline-flex';
        if (cEmailWrap) cEmailWrap.style.display = 'inline-flex';
    } else {
        if (pEmailWrap) pEmailWrap.style.display = 'none';
        if (cEmailWrap) cEmailWrap.style.display = 'none';
    }

    const pWebWrap = document.getElementById('pdfFooterWebWrap');
    const cWebWrap = document.getElementById('civilPdfFooterWebWrap');
    if (compWeb) {
        safeSetText('pdfFooterWebDisplay', compWeb);
        safeSetText('civilPdfFooterWebDisplay', compWeb);
        if (pWebWrap) pWebWrap.style.display = 'inline-flex';
        if (cWebWrap) cWebWrap.style.display = 'inline-flex';
    } else {
        if (pWebWrap) pWebWrap.style.display = 'none';
        if (cWebWrap) cWebWrap.style.display = 'none';
    }

    updateHeaderBannersUI();

    safeSetText('pdfRibbonTitle', "QUOTATION");
    safeSetText('civilPdfRibbonTitle', "QUOTATION");
    safeSetText('pdfQuoteNo', site.quoteNo || "PE/2026/01");
    safeSetText('civilPdfQuoteNo', site.quoteNo || "PE/2026/01");

    const issueDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    safeSetText('pdfCurrentDate', issueDateStr);
    safeSetText('civilPdfCurrentDate', issueDateStr);

    safeSetText('pdfScopeTitle', appSettings.pdfScopeTitle || "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - KG BASIS");
    safeSetText('pdfProjectSizeHeading', appSettings.projectSizeHeading || "📐 PROJECT SIZE / SHED DIMENSIONS:");
    safeSetText('civilPdfScopeTitle', site.civilScopeDesc || masterBlueprint.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS");

    const sqft = (parseFloat(site.dimW) || 0) * (parseFloat(site.dimL) || 0);
    safeSetText('dimWVal', site.dimW ? site.dimW + " Ft" : "-");
    safeSetText('dimLVal', site.dimL ? site.dimL + " Ft" : "-");
    safeSetText('dimHVal', site.dimH ? site.dimH + " Ft" : "-");
    safeSetText('dimAreaVal', sqft > 0 ? sqft.toLocaleString('en-IN') + " Sq.Ft" : "-");

    const contactPersonLine = [site.custContactPerson, site.custRole ? ('(' + site.custRole + ')') : ''].filter(Boolean).join(' ') || "-";
    const clientPhones = [site.custNumber1, site.custNumber2].filter(Boolean).join(" / ") || "-";
    safeSetText('pdfClientName', site.clientName || "-");
    safeSetText('pdfContactPersonDisplay', contactPersonLine);
    safeSetText('pdfClientPhone', clientPhones);
    safeSetText('pdfClientGst', site.custGST || "-");
    safeSetText('pdfClientAddr', site.custAddress || "-");

    safeSetText('civilPdfClientName', site.clientName || "-");
    safeSetText('civilPdfContactPersonDisplay', contactPersonLine);
    safeSetText('civilPdfClientPhone', clientPhones);
    safeSetText('civilPdfClientGst', site.custGST || "-");
    safeSetText('civilPdfClientAddr', site.custAddress || "-");

    const isShedActive = (site.quoteType === 'both' || site.quoteType === 'shed');
    const isCivilActive = (site.quoteType === 'both' || site.quoteType === 'civil');

    // PAGE 1: SHED
    const page1ShedSheet = document.getElementById('page1MsStructure');
    let shedGrandTotal = 0;
    let autoTotalSteelWeightKg = 0;

    if (!isShedActive) {
        if (page1ShedSheet) page1ShedSheet.style.setProperty('display', 'none', 'important');
    } else {
        if (page1ShedSheet) page1ShedSheet.style.setProperty('display', 'flow-root', 'important');
        safeSetText('displayHeaderLine1', appSettings.headerLine1 || "1. ESTIMATED STEEL WEIGHT:");

        const s1Tbody = document.getElementById('pdfSection1TableBody');
        if (s1Tbody) {
            s1Tbody.innerHTML = "";
            if (site.primEnabled !== false) {
                const pWt = parseFloat(site.primWeight) || 0;
                const pUnit = site.primUnit || "Kg";
                const inKg = pUnit.toLowerCase() === 'mt' ? (pWt * 1000) : pWt;
                autoTotalSteelWeightKg += inKg;
                s1Tbody.innerHTML += `
                    <tr>
                        <td style="font-size:10px !important;"><b>Primary Structure:</b> <span class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this, 'prim')">${(site.primCustomLine || "").trim()}</span></td>
                        <td style="text-align: right; font-weight: 700; font-size:10px !important;">${pWt > 0 ? `${pWt.toLocaleString('en-IN')} <span class="unit-locked-text">${pUnit}</span> (${(inKg/1000).toFixed(1)} MT)` : "-"}</td>
                    </tr>`;
            }

            if (site.secEnabled !== false) {
                const sWt = parseFloat(site.secWeight) || 0;
                const sUnit = site.secUnit || "Kg";
                const inKg = sUnit.toLowerCase() === 'mt' ? (sWt * 1000) : sWt;
                autoTotalSteelWeightKg += inKg;
                s1Tbody.innerHTML += `
                    <tr>
                        <td style="font-size:10px !important;"><b>Secondary Structure:</b> <span class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this, 'sec')">${(site.secCustomLine || "").trim()}</span></td>
                        <td style="text-align: right; font-weight: 700; font-size:10px !important;">${sWt > 0 ? `${sWt.toLocaleString('en-IN')} <span class="unit-locked-text">${sUnit}</span> (${(inKg/1000).toFixed(1)} MT)` : "-"}</td>
                    </tr>`;
            }

            s1Tbody.innerHTML += `
                <tr class="executive-weight-total-row">
                    <td style="font-size:10px !important;"><div class="exec-wt-title" id="pdfMilestoneHeading">${appSettings.milestoneHeading || "TOTAL STRUCTURE WEIGHT (PRIMARY + SECONDARY):"}</div></td>
                    <td style="text-align: right; font-size:10px !important;"><span class="exec-wt-val">${autoTotalSteelWeightKg > 0 ? `${autoTotalSteelWeightKg.toLocaleString('en-IN')} Kg (${(autoTotalSteelWeightKg/1000).toFixed(1)} MT)` : "-"}</span></td>
                </tr>`;

            if (site.cladEnabled !== false) {
                const cSq = parseFloat(site.cladSqFt) || 0;
                const cUnit = site.cladUnit || "Sq.Ft";
                const thickBadge = site.cladThickness ? `<span class="spec-highlight-pill" style="margin-left:6px;">📐 Thickness: ${site.cladThickness}</span>` : '';
                s1Tbody.innerHTML += `
                    <tr>
                        <td style="font-size:10px !important;"><b>Roof & Wall Cladding:</b> <span class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this, 'clad')">${(site.cladCustomLine || "").trim()}</span>${thickBadge}</td>
                        <td style="text-align: right; font-weight: 700; font-size:10px !important;"><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this, 'cladSqFt')">${cSq > 0 ? cSq : '-'}</span> <span class="unit-locked-text">${cUnit}</span></td>
                    </tr>`;
            }
        }

        safeSetText('displayHeaderLine2', appSettings.headerLine2 || "2. PRICE BREAKUP AS PER KG RATE:");
        const thead = document.getElementById('pdfTableHead');
        if (thead) {
            thead.innerHTML = isRateOnly ?
                `<tr><th style="width: 7%; text-align: center;">S.NO</th><th style="width: 55%; text-align: left;">DESCRIPTION</th><th style="width: 14%; text-align: center;">UNIT</th><th style="width: 24%; text-align: right;">CONTRACT RATE (₹)</th></tr>` :
                `<tr><th style="width: 7%; text-align: center;">S.NO</th><th style="width: 45%; text-align: left;">DESCRIPTION</th><th style="width: 13%; text-align: center;">QUANTITY</th><th style="width: 10%; text-align: center;">UNIT</th><th style="width: 12%; text-align: right;">RATE (₹)</th><th style="width: 13%; text-align: right;">AMOUNT (INR)</th></tr>`;
        }

        const pWt = (site.primEnabled !== false) ? (parseFloat(site.primWeight) || 0) : 0;
        const pRt = parseFloat(site.primRate) || 0;
        const pTot = pWt * pRt;
        const pUnit = site.primUnit || "Kg";

        const sWt = (site.secEnabled !== false) ? (parseFloat(site.secWeight) || 0) : 0;
        const sRt = parseFloat(site.secRate) || 0;
        const sTot = sWt * sRt;
        const sUnit = site.secUnit || "Kg";

        const cSq = (site.cladEnabled !== false) ? (parseFloat(site.cladSqFt) || 0) : 0;
        const cRt = parseFloat(site.cladRate) || 0;
        const cTot = cSq * cRt;
        const cUnit = site.cladUnit || "Sq.Ft";

        let aTot = 0;
        let selectedAccCount = 0;
        const breakdownTbody = document.getElementById('pdfAccBreakdownBody');
        const breakdownThead = document.getElementById('pdfAccTableHead');
        if (breakdownTbody) breakdownTbody.innerHTML = "";
        if (breakdownThead) {
            breakdownThead.innerHTML = isRateOnly ?
                `<tr><th style="width: 60%; text-align: left;">ACCESSORY ITEM</th><th style="width: 20%; text-align: center;">UNIT</th><th style="width: 20%; text-align: right;">CONTRACT RATE (₹)</th></tr>` :
                `<tr><th style="width: 47%; text-align: left;">ACCESSORY ITEM</th><th style="width: 13%; text-align: center;">QTY</th><th style="width: 12%; text-align: center;">UNIT</th><th style="width: 13%; text-align: right;">RATE (₹)</th><th style="width: 15%; text-align: right;">AMOUNT (₹)</th></tr>`;
        }

        if (site.accEnabled !== false) {
            (site.accessories || []).forEach((a, aIdx) => {
                if (a.selected === true) {
                    selectedAccCount++;
                    const q = parseFloat(a.qty) || 0;
                    const r = parseFloat(a.rate) || 0;
                    const lineTot = q * r;
                    aTot += lineTot;
                    if (breakdownTbody) {
                        const tr = document.createElement('tr');
                        tr.className = "sortable-item";
                        tr.dataset.sortIndex = aIdx;
                        tr.innerHTML = isRateOnly ?
                            `<td><span class="drag-handle" id="handle_acc_${aIdx}" title="Drag to reorder">⋮⋮</span> <b class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncAccTitleEdit(${aIdx}, this)">${a.name}</b></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openThemeUnitPickerForAcc(${aIdx})">${a.unit || 'Nos'} ▾</span></td><td style="text-align:right; font-weight:700;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewAccEdit(${aIdx}, 'rate', this)">${formatRawOrDash(a.rate)}</span></td>` :
                            `<td><span class="drag-handle" id="handle_acc_${aIdx}" title="Drag to reorder">⋮⋮</span> <b class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncAccTitleEdit(${aIdx}, this)">${a.name}</b></td><td style="text-align:center; font-weight:700;"><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewAccEdit(${aIdx}, 'qty', this)">${formatRawOrDash(a.qty)}</span></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openThemeUnitPickerForAcc(${aIdx})">${a.unit || 'Nos'} ▾</span></td><td style="text-align:right;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewAccEdit(${aIdx}, 'rate', this)">${formatRawOrDash(a.rate)}</span></td><td style="text-align:right; font-weight:700;">${lineTot > 0 ? '₹ ' + Math.round(lineTot).toLocaleString('en-IN') : '-'}</td>`;
                        breakdownTbody.appendChild(tr);
                        setupUniversalReorder(tr, tr.querySelector('.drag-handle'), 'accessories', aIdx);
                    }
                }
            });
        }
        safeSetText('pdfAccSectionHeading', appSettings.accSectionHeading || "3. BUILDING ACCESSORIES ITEM-WISE BREAKDOWN:");
        const accContainer = document.getElementById('pdfAccBreakdownContainer');
        if (accContainer) accContainer.style.display = (site.accEnabled !== false && selectedAccCount > 0) ? 'block' : 'none';

        const eWt = (site.erectEnabled !== false) ? autoTotalSteelWeightKg : 0;
        const eRt = parseFloat(site.erectRate) || 0;
        const eTot = eWt * eRt;
        const eUnit = site.erectUnit || "Kg";

        const tbody = document.getElementById('pdfTableBody');
        let customTot = 0, sNoCounter = 1;

        if (tbody) {
            tbody.innerHTML = "";
            const helperSpecs = (specs) => (!specs || !Array.isArray(specs)) ? "" : `<div class="item-specs-bullets">${specs.filter(s => s.selected === true).map(s => `<span>• ${s.text || s}</span>`).join('')}</div>`;
            const addRow = (catTitle, line, uRate, qty, amt, fPrefix, uLabel, isCust = false, bullets = "", mKey = "") => {
                const descHtml = `<div class="row-item-title">${catTitle}:</div><div class="row-item-subtitle editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this, '${fPrefix}', '${mKey}')">${(line || "").trim()}</div>${bullets}`;
                const tr = document.createElement('tr');
                tr.className = "sortable-item";
                tr.dataset.sortIndex = sNoCounter - 1;
                tr.innerHTML = isRateOnly ?
                    `<td style="text-align:center; font-weight:700;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${sNoCounter++}</td><td>${descHtml}</td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="${isCust ? '' : `openShedUnitPicker('${fPrefix}')`}">${uLabel || '-'} ▾</span></td><td style="text-align: right; font-weight: 700;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this, '${fPrefix}Rate')">${formatRawOrDash(uRate)}</span></td>` :
                    `<td style="text-align:center; font-weight:700;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${sNoCounter++}</td><td>${descHtml}</td><td style="text-align: center; font-weight: 700;"><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this, '${fPrefix === 'clad' ? 'cladSqFt' : `${fPrefix}Weight`}')">${formatRawOrDash(qty)}</span></td><td style="text-align: center;"><span class="preview-unit-pill btn-ripple" onclick="${isCust ? '' : `openShedUnitPicker('${fPrefix}')`}">${uLabel || '-'} ▾</span></td><td style="text-align: right; font-weight: 700;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this, '${fPrefix}Rate')">${formatRawOrDash(uRate)}</span></td><td style="text-align: right; font-weight: 700;">${amt > 0 ? 'Rs. ' + Math.round(amt).toLocaleString('en-IN') : '-'}</td>`;
                tbody.appendChild(tr);

                const curIdx = site.moduleOrder.indexOf(mKey);
                if (curIdx !== -1) {
                    const handle = tr.querySelector('.drag-handle');
                    setupUniversalReorder(tr, handle, 'shed_modules', curIdx);
                }
            };

            (site.moduleOrder || ['prim', 'sec', 'clad', 'acc', 'erect']).forEach(mKey => {
                if (mKey === 'prim' && site.primEnabled !== false) addRow("Primary Structure", site.primCustomLine, pRt, pWt, pTot, 'prim', pUnit, false, helperSpecs(site.primSpecs), 'prim');
                else if (mKey === 'sec' && site.secEnabled !== false) addRow("Secondary Structure", site.secCustomLine, sRt, sWt, sTot, 'sec', sUnit, false, helperSpecs(site.secSpecs), 'sec');
                else if (mKey === 'clad' && site.cladEnabled !== false) {
                    const thickBullet = site.cladThickness ? `<div class="item-specs-bullets"><span class="spec-highlight-pill">📐 Thickness: ${site.cladThickness}</span></div>` : '';
                    addRow("Roof & Wall Cladding", site.cladCustomLine, cRt, cSq, cTot, 'clad', cUnit, false, thickBullet, 'clad');
                }
                else if (mKey === 'acc' && site.accEnabled !== false) addRow("Accessories Package", site.accCustomLine, `Itemized Below`, `Package`, aTot, 'acc', '', false, "", 'acc');
                else if (mKey === 'erect' && site.erectEnabled !== false) addRow("Erection & Installation", site.erectCustomLine, eRt, eWt, eTot, 'erect', eUnit, false, helperSpecs(site.erectSpecs), 'erect');
                else {
                    const c = (site.customModules || []).find(m => m.id === mKey);
                    if (c && c.enabled !== false) {
                        const tot = (parseFloat(c.qty) || 0) * (parseFloat(c.rate) || 0);
                        customTot += tot;
                        addRow(c.title, c.desc || '-', c.rate, c.qty, tot, 'custom', c.unit || 'Lot', true, "", c.id);
                    }
                }
            });

            const basic = pTot + sTot + cTot + aTot + eTot + customTot;
            const tax = getActiveTaxSlab('shed');
            const taxAmt = basic * tax.rate;
            const grand = basic + taxAmt;
            shedGrandTotal = grand;

            animateNumberRoll('pdfFinBasic', basic, "Rs. ");
            safeSetHtml('pdfTaxBreakdownRows', renderVerticalTaxRowsHtml(basic, tax));
            animateNumberRoll('pdfFinGrand', grand, "Rs. ");
            triggerTotalBarShimmer();

            const shedAvgBox = document.getElementById('pdfShedAvgRateBox');
            if (shedAvgBox) {
                if (sqft > 0 && !isRateOnly && grand > 0) {
                    safeSetText('pdfShedAvgRateVal', `₹ ${Math.round(grand / sqft).toLocaleString('en-IN')} / Sq.Ft`);
                    shedAvgBox.style.display = 'flex';
                } else shedAvgBox.style.display = 'none';
            }
            const finBox = document.getElementById('financialStandardBox');
            const rateNotice = document.getElementById('rateOnlyNoticeBox');
            if (finBox && rateNotice) {
                finBox.style.display = isRateOnly ? 'none' : 'block';
                rateNotice.style.display = isRateOnly ? 'block' : 'none';
            }
        }

        safeSetHtml('pdfTermsContainer', `
            <div class="payment-terms-block"><p>1. <b>Payment Terms:</b><br><span contenteditable="true" onblur="syncPreviewTermsEdit('paymentTerms', this)">${(appSettings.paymentTerms || '').replace(/\n/g, '<br>')}</span></p></div>
            <div class="general-terms-block"><p>2. <b>General Terms:</b><br><span contenteditable="true" onblur="syncPreviewTermsEdit('termsCond', this)">${(appSettings.termsCond || '').replace(/\n/g, '<br>')}</span></p></div>`);
        safeSetText('pdfTermsHeaderDisplay', appSettings.termsTitle || "Terms & Conditions:");
        safeSetText('pdfThankYouDisplay', appSettings.thankYouText || "THANK YOU FOR YOUR BUSINESS WITH US.");
        safeSetText('pdfCustSignHeader', appSettings.custAcceptanceTitle || "CUSTOMER ACCEPTANCE");
        safeSetText('pdfCustSignSub', appSettings.custAcceptanceSub || "Authorized Signature & Stamp");
        safeSetText('pdfSignCompanyHeader', appSettings.signCompHeader || ("FOR " + (appSettings.ownerName || "PATEL ENGINEERING")));
        safeSetText('pdfSignatoryTitleDisplay', appSettings.pdfSignatoryText || "Authorized Signatory");

        safeSetHtml('pdfSignImgBox', appSettings.signatureData ? `<img src="${appSettings.signatureData}" style="max-height: 24px; width:auto; display:block; margin: 0 auto;">` : '');
    }

    // PAGE 2: CIVIL
    const civilPageBlock = document.getElementById('civilDedicatedPageSheet');
    const pageGapDivider = document.getElementById('civilPageGapDivider');
    let civilGrandTotal = 0;

    if (!isCivilActive) {
        if (civilPageBlock) civilPageBlock.style.setProperty('display', 'none', 'important');
        if (pageGapDivider) pageGapDivider.style.setProperty('display', 'none', 'important');
    } else {
        if (civilPageBlock) civilPageBlock.style.setProperty('display', 'flow-root', 'important');
        if (pageGapDivider) pageGapDivider.style.setProperty('display', (isShedActive ? 'block' : 'none'), 'important');
        ensureCivilDataOnSite(site);
        const civ = site.civilData;
        let civilTotalBasic = 0;

        safeSetText('civilJobTitleDisplay', appSettings.civilJobTitle || "JOB DETAILS & TECHNICAL SPECIFICATIONS");
        const cleanCivHead = isCivilRateOnly ?
            `<tr><th style="width: 8%; text-align: center;">S.N</th><th style="width: 56%; text-align: left;">ITEM / WORK DESCRIPTION</th><th style="width: 14%; text-align: center;">UNIT</th><th style="width: 22%; text-align: right;">CONTRACT RATE (₹)</th></tr>` :
            `<tr><th style="width: 7%; text-align: center;">S.N</th><th style="width: 45%; text-align: left;">ITEM / WORK DESCRIPTION</th><th style="width: 14%; text-align: center;">QTY / AREA</th><th style="width: 10%; text-align: center;">UNIT</th><th style="width: 11%; text-align: right;">RATE (₹)</th><th style="width: 13%; text-align: right;">AMOUNT (₹)</th></tr>`;
        safeSetHtml('civilFoundationTableHead', cleanCivHead);
        safeSetHtml('civilBrickWallTableHead', cleanCivHead);
        safeSetHtml('civilFlooringTableHead', cleanCivHead);

        const renderCivSection = (secKey, secPrefix, tbodyId, titleKey, defaultTitle, isEnabled) => {
            const sec = civ[secKey];
            const finalTitle = appSettings[titleKey] || sec.title || defaultTitle;
            safeSetText(titleKey, finalTitle);
            const titleEl = document.getElementById(titleKey)?.parentElement;
            const tbody = document.getElementById(tbodyId);
            const tblWrap = tbody?.closest('.table-wrapper');

            if (!isEnabled) {
                if (titleEl) titleEl.style.display = 'none';
                if (tblWrap) tblWrap.style.display = 'none';
                return;
            }
            if (titleEl) titleEl.style.display = 'flex';
            if (tblWrap) tblWrap.style.display = 'block';

            if (!tbody) return;
            tbody.innerHTML = "";
            let sIdx = 1;
            (sec.items || []).forEach((item, idx) => {
                if (item.enabled !== false) {
                    const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                    civilTotalBasic += amt;
                    const tr = document.createElement('tr');
                    tr.className = "sortable-item";
                    tr.dataset.sortIndex = idx;
                    tr.innerHTML = isCivilRateOnly ?
                        `<td style="text-align:center; font-weight:700;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${secPrefix}.${sIdx++}</td><td><div class="civil-item-title editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncCivilTitleEdit(this, '${secKey}', ${idx})">${item.name}</div></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openCivilUnitPicker('${secKey}', ${idx})">${item.unit || 'Lot'} ▾</span></td><td style="text-align:right;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this, 'civ_${secKey}_${idx}_rate')">${formatRawOrDash(item.rate)}</span></td>` :
                        `<td style="text-align:center; font-weight:700;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${secPrefix}.${sIdx++}</td><td><div class="civil-item-title editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncCivilTitleEdit(this, '${secKey}', ${idx})">${item.name}</div></td><td style="text-align:center; font-weight:700;"><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this, 'civ_${secKey}_${idx}_qty')">${formatRawOrDash(item.qty)}</span></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openCivilUnitPicker('${secKey}', ${idx})">${item.unit || 'Lot'} ▾</span></td><td style="text-align:right;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this, 'civ_${secKey}_${idx}_rate')">${formatRawOrDash(item.rate)}</span></td><td class="civil-amt-cell" style="font-weight:700;">${amt > 0 ? '₹ ' + Math.round(amt).toLocaleString('en-IN') : '-'}</td>`;
                    tbody.appendChild(tr);
                    setupUniversalReorder(tr, tr.querySelector('.drag-handle'), 'civil_items', idx, secKey);
                }
            });
        };

        renderCivSection('foundation', '1', 'civilFoundationTableBody', 'civilFoundTitle', "1. FOUNDATION & RCC COLUMN DETAILS:", site.foundEnabled !== false);
        renderCivSection('brickWall', '2', 'civilBrickWallTableBody', 'civilBrickTitle', "2. BRICK WALL, DPC & PLASTER DETAILS:", site.brickEnabled !== false);
        renderCivSection('flooring', '3', 'civilFlooringTableBody', 'civilFloorTitle', "3. FLOORING & PCC WORK DETAILS:", site.floorEnabled !== false);

        const customCivWrapper = document.getElementById('civilCustomCategoriesPage2Wrapper');
        if (customCivWrapper) {
            customCivWrapper.innerHTML = "";
            (site.civilCustomCategories || []).forEach((cat, cIdx) => {
                if (cat.enabled !== false) {
                    let rowsHtml = "";
                    (cat.items || []).forEach((it, idx) => {
                        if (it.enabled !== false) {
                            const tot = (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0);
                            civilTotalBasic += tot;
                            rowsHtml += isCivilRateOnly ?
                                `<tr><td style="text-align:center; font-weight:700;">${idx + 1}</td><td><div class="civil-item-title editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)">${it.name}</div></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openCivilCustomCatUnitPicker(${cIdx}, ${idx})">${it.unit || 'Lot'} ▾</span></td><td style="text-align:right; font-weight:700;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this, 'civcat_${cIdx}_${idx}_rate')">${formatRawOrDash(it.rate)}</span></td></tr>` :
                                `<tr><td style="text-align:center; font-weight:700;">${idx + 1}</td><td><div class="civil-item-title editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)">${it.name}</div></td><td style="text-align:center; font-weight:700;"><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this, 'civcat_${cIdx}_${idx}_qty')">${formatRawOrDash(it.qty)}</span></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openCivilCustomCatUnitPicker(${cIdx}, ${idx})">${it.unit || 'Lot'} ▾</span></td><td style="text-align:right;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this, 'civcat_${cIdx}_${idx}_rate')">${formatRawOrDash(it.rate)}</span></td><td class="civil-amt-cell" style="font-weight:700;">${tot > 0 ? '₹ ' + Math.round(tot).toLocaleString('en-IN') : '-'}</td></tr>`;
                        }
                    });
                    customCivWrapper.innerHTML += `<div class="civil-category-title-bar"><span>${cat.categoryName}:</span></div><div class="table-wrapper"><table class="civil-schedule-table"><thead>${cleanCivHead}</thead><tbody>${rowsHtml}</tbody></table></div>`;
                }
            });
        }

        safeSetHtml('civilPdfTermsContainer', `
            <div class="payment-terms-block"><p>1. <b>Civil Schedule:</b><br><span contenteditable="true" onblur="syncPreviewTermsEdit('civilPaymentTerms', this)">${(appSettings.civilPaymentTerms || '').replace(/\n/g, '<br>')}</span></p></div>
            <div class="general-terms-block"><p>2. <b>Civil Terms:</b><br><span contenteditable="true" onblur="syncPreviewTermsEdit('civilTermsCond', this)">${(appSettings.civilTermsCond || '').replace(/\n/g, '<br>')}</span></p></div>`);
        safeSetText('civilPdfTermsHeaderDisplay', appSettings.civilTermsTitle || "Civil Work Terms & Conditions:");
        safeSetText('civilPdfThankYouDisplay', appSettings.civilThankYouText || "THANK YOU FOR YOUR CIVIL CONTRACT.");

        const civilTax = getActiveTaxSlab('civil');
        const civGrand = civilTotalBasic + (civilTotalBasic * civilTax.rate);
        civilGrandTotal = civGrand;
        animateNumberRoll('civilFinBasic', civilTotalBasic, "Rs. ");
        safeSetHtml('civilPdfTaxBreakdownRows', renderVerticalTaxRowsHtml(civilTotalBasic, civilTax));
        animateNumberRoll('civilFinGrand', civGrand, "Rs. ");
        triggerTotalBarShimmer();

        const civFinBox = document.getElementById('civilFinancialBox');
        const civRateNotice = document.getElementById('civilRateOnlyNoticeBox');
        if (civFinBox && civRateNotice) {
            civFinBox.style.display = isCivilRateOnly ? 'none' : 'block';
            civRateNotice.style.display = isCivilRateOnly ? 'block' : 'none';
        }
        safeSetText('civilCustSignHeader', appSettings.custAcceptanceTitle || "CUSTOMER ACCEPTANCE");
        safeSetText('civilCustSignSub', appSettings.custAcceptanceSub || "Authorized Signature & Stamp");
        safeSetText('civilSignCompanyHeader', appSettings.signCompHeader || ("FOR " + (appSettings.ownerName || "PATEL ENGINEERING")));
        safeSetText('civilSignatoryTitleDisplay', appSettings.pdfSignatoryText || "Authorized Signatory");

        safeSetHtml('civilPdfSignImgBox', appSettings.signatureData ? `<img src="${appSettings.signatureData}" style="max-height: 24px; width:auto; display:block; margin: 0 auto;">` : '');
    }

    // COMBINED PACKAGE STRIP
    const p1CombBox = document.getElementById('pdfCombinedPackageBox');
    const p2CombBox = document.getElementById('civilPdfCombinedPackageBox');
    if (isShedActive && isCivilActive) {
        const totalComb = shedGrandTotal + civilGrandTotal;
        const combRate = sqft > 0 ? Math.round(totalComb / sqft) : 0;
        const combHtml = `
            <div class="comb-row">
                <span>Shed Project Area:</span>
                <b>${sqft > 0 ? sqft.toLocaleString('en-IN') + ' Sq.Ft' : '-'}</b>
            </div>
            <div class="comb-row">
                <span>Combined Contract Total (Shed + Civil):</span>
                <b>${totalComb > 0 ? '₹ ' + Math.round(totalComb).toLocaleString('en-IN') : '-'}</b>
            </div>
            <div class="comb-rate-pill">
                <span>COMBINED RATE / SQ.FT:</span>
                <b>${combRate > 0 ? '₹ ' + combRate.toLocaleString('en-IN') : '-'} / Sq.Ft</b>
            </div>`;
        if (p1CombBox) { p1CombBox.innerHTML = combHtml; p1CombBox.style.display = isRateOnly ? 'none' : 'flex'; }
        if (p2CombBox) { p2CombBox.innerHTML = combHtml; p2CombBox.style.display = isCivilRateOnly ? 'none' : 'flex'; }
    } else {
        if (p1CombBox) p1CombBox.style.display = 'none';
        if (p2CombBox) p2CombBox.style.display = 'none';
    }

    syncCivilLivePreviewBox();

    if (!isSoftRefresh) setTimeout(autoFitPreview, 35);
}

// ========================================================
// 21. BULLETPROOF PAGINATION ENGINE (PC-ISOLATED GUARD)
// ========================================================
function createCleanPageBox() {
    const p = document.createElement('div');
    p.className = 'a4-page-box';
    p.style.cssText = 'width: 746px !important; max-width: 746px !important; min-width: 746px !important; margin: 0 auto !important; padding: 0 !important; background: #ffffff !important; box-sizing: border-box !important; display: flow-root !important; overflow: hidden !important;';
    return p;
}

function buildSectionPages(sectionEl, outputContainer, quoteNo, sectionType) {
    const isComputer = window.innerWidth >= 1025 && !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    // ⭐ TABLET & PHONE ENGINE (100% UNTOUCHED, RUNS AS-IS) ⭐
    if (!isComputer) {
        const testStage = document.createElement('div');
        testStage.style.cssText = 'width: 746px; position: absolute; left: -9999px; top: 0; background: #fff; padding: 0; margin: 0; display: flow-root;';
        const clone = sectionEl.cloneNode(true);
        clone.style.display = 'block';
        testStage.appendChild(clone);
        document.body.appendChild(testStage);
        const measuredHeight = clone.offsetHeight;
        document.body.removeChild(testStage);

        if (measuredHeight <= 1045) {
            const page = createCleanPageBox();
            page.appendChild(clone);
            outputContainer.appendChild(page);
            return;
        }

        if (sectionType === 'SHED') {
            const hero = sectionEl.querySelector('.geo-header-wrapper')?.cloneNode(true);
            const substrip = sectionEl.querySelector('.company-substrip-bar')?.cloneNode(true);
            const cust = sectionEl.querySelector('.customer-details-block')?.cloneNode(true);
            const sec1Head = sectionEl.querySelector('#displayHeaderLine1')?.parentElement?.cloneNode(true);
            const sec1Tbl = sectionEl.querySelector('#pdfSection1TableBody')?.closest('.table-wrapper')?.cloneNode(true);
            const sec2Head = sectionEl.querySelector('#displayHeaderLine2')?.parentElement?.cloneNode(true);
            const sec2Tbl = sectionEl.querySelector('#pdfTableBody')?.closest('.table-wrapper')?.cloneNode(true);
            const sec3Acc = sectionEl.querySelector('#pdfAccBreakdownContainer');
            const summary = sectionEl.querySelector('.theme-bottom-summary-grid')?.cloneNode(true);
            const sigs = sectionEl.querySelector('.signature-dual-grid')?.cloneNode(true);
            const footer = sectionEl.querySelector('.geo-footer-wrapper')?.cloneNode(true);

            const p1 = createCleanPageBox();
            if (hero) p1.appendChild(hero.cloneNode(true));
            if (substrip) p1.appendChild(substrip.cloneNode(true));
            if (cust) p1.appendChild(cust.cloneNode(true));
            if (sec1Head) p1.appendChild(sec1Head.cloneNode(true));
            if (sec1Tbl) p1.appendChild(sec1Tbl.cloneNode(true));
            if (sec2Head) p1.appendChild(sec2Head.cloneNode(true));
            if (sec2Tbl) p1.appendChild(sec2Tbl.cloneNode(true));
            outputContainer.appendChild(p1);

            const pb = document.createElement('div');
            pb.className = 'html2pdf__page-break';
            pb.style.cssText = 'page-break-after: always; height: 0; margin: 0; padding: 0;';
            outputContainer.appendChild(pb);

            const p2 = createCleanPageBox();
            const contBar = document.createElement('div');
            contBar.className = 'continuation-header-bar';
            contBar.innerHTML = `<span>PATEL ENGINEERING — SHED SPECIFICATIONS & SUMMARY</span><span class="ref-pill">Quote Ref: ${quoteNo}</span>`;
            p2.appendChild(contBar);

            if (sec3Acc && sec3Acc.style.display !== 'none') p2.appendChild(sec3Acc.cloneNode(true));
            if (summary) p2.appendChild(summary.cloneNode(true));
            if (sigs) p2.appendChild(sigs.cloneNode(true));
            if (footer) p2.appendChild(footer.cloneNode(true));
            outputContainer.appendChild(p2);

        } else if (sectionType === 'CIVIL') {
            const hero = sectionEl.querySelector('.geo-header-wrapper')?.cloneNode(true);
            const substrip = sectionEl.querySelector('.company-substrip-bar')?.cloneNode(true);
            const cust = sectionEl.querySelector('.customer-details-block')?.cloneNode(true);
            const jobRibbon = sectionEl.querySelector('.civil-job-details-ribbon')?.cloneNode(true);

            const secConfigs = [
                { titleEl: sectionEl.querySelector('#civilFoundTitle')?.parentElement, tblWrap: sectionEl.querySelector('#civilFoundationTableBody')?.closest('.table-wrapper') },
                { titleEl: sectionEl.querySelector('#civilBrickTitle')?.parentElement, tblWrap: sectionEl.querySelector('#civilBrickWallTableBody')?.closest('.table-wrapper') },
                { titleEl: sectionEl.querySelector('#civilFloorTitle')?.parentElement, tblWrap: sectionEl.querySelector('#civilFlooringTableBody')?.closest('.table-wrapper') }
            ];

            const summary = sectionEl.querySelector('.theme-bottom-summary-grid')?.cloneNode(true);
            const sigs = sectionEl.querySelector('.signature-dual-grid')?.cloneNode(true);
            const footer = sectionEl.querySelector('.geo-footer-wrapper')?.cloneNode(true);
            const customWrapper = sectionEl.querySelector('#civilCustomCategoriesPage2Wrapper');

            const p1 = createCleanPageBox();
            if (hero) p1.appendChild(hero.cloneNode(true));
            if (substrip) p1.appendChild(substrip.cloneNode(true));
            if (cust) p1.appendChild(cust.cloneNode(true));
            if (jobRibbon) p1.appendChild(jobRibbon.cloneNode(true));
            if (secConfigs[0].titleEl) p1.appendChild(secConfigs[0].titleEl.cloneNode(true));
            if (secConfigs[0].tblWrap) p1.appendChild(secConfigs[0].tblWrap.cloneNode(true));
            if (secConfigs[1].titleEl) p1.appendChild(secConfigs[1].titleEl.cloneNode(true));
            if (secConfigs[1].tblWrap) p1.appendChild(secConfigs[1].tblWrap.cloneNode(true));
            outputContainer.appendChild(p1);

            const pb = document.createElement('div');
            pb.className = 'html2pdf__page-break';
            pb.style.cssText = 'page-break-after: always; height: 0; margin: 0; padding: 0;';
            outputContainer.appendChild(pb);

            const p2 = createCleanPageBox();
            const contBar = document.createElement('div');
            contBar.className = 'continuation-header-bar';
            contBar.innerHTML = `<span>PATEL ENGINEERING — CIVIL SPECIFICATIONS & COMMERCIALS</span><span class="ref-pill">Quote Ref: ${quoteNo}</span>`;
            p2.appendChild(contBar);

            if (secConfigs[2].titleEl) p2.appendChild(secConfigs[2].titleEl.cloneNode(true));
            if (secConfigs[2].tblWrap) p2.appendChild(secConfigs[2].tblWrap.cloneNode(true));
            if (customWrapper && customWrapper.children.length > 0) p2.appendChild(customWrapper.cloneNode(true));
            if (summary) p2.appendChild(summary.cloneNode(true));
            if (sigs) p2.appendChild(sigs.cloneNode(true));
            if (footer) p2.appendChild(footer.cloneNode(true));
            outputContainer.appendChild(p2);
        }
        return;
    }

    // ⭐ COMPUTER (PC/LAPTOP) SPECIFIC ISOLATED ENGINE ⭐
    // Neutralizes Windows 125%/150% scaling so PC creates exact same 4 pages without breaks
    if (sectionType === 'SHED') {
        const hero = sectionEl.querySelector('.geo-header-wrapper')?.cloneNode(true);
        const substrip = sectionEl.querySelector('.company-substrip-bar')?.cloneNode(true);
        const cust = sectionEl.querySelector('.customer-details-block')?.cloneNode(true);
        const sec1Head = sectionEl.querySelector('#displayHeaderLine1')?.parentElement?.cloneNode(true);
        const sec1Tbl = sectionEl.querySelector('#pdfSection1TableBody')?.closest('.table-wrapper')?.cloneNode(true);
        const sec2Head = sectionEl.querySelector('#displayHeaderLine2')?.parentElement?.cloneNode(true);
        const sec2Tbl = sectionEl.querySelector('#pdfTableBody')?.closest('.table-wrapper')?.cloneNode(true);
        const sec3Acc = sectionEl.querySelector('#pdfAccBreakdownContainer');
        const summary = sectionEl.querySelector('.theme-bottom-summary-grid')?.cloneNode(true);
        const sigs = sectionEl.querySelector('.signature-dual-grid')?.cloneNode(true);
        const footer = sectionEl.querySelector('.geo-footer-wrapper')?.cloneNode(true);

        // PC Page 1 (Shed Main)
        const p1 = createCleanPageBox();
        p1.classList.add('pc-render-mode');
        if (hero) p1.appendChild(hero.cloneNode(true));
        if (substrip) p1.appendChild(substrip.cloneNode(true));
        if (cust) p1.appendChild(cust.cloneNode(true));
        if (sec1Head) p1.appendChild(sec1Head.cloneNode(true));
        if (sec1Tbl) p1.appendChild(sec1Tbl.cloneNode(true));
        if (sec2Head) p1.appendChild(sec2Head.cloneNode(true));
        if (sec2Tbl) p1.appendChild(sec2Tbl.cloneNode(true));
        outputContainer.appendChild(p1);

        const pb = document.createElement('div');
        pb.className = 'html2pdf__page-break';
        pb.style.cssText = 'page-break-after: always; height: 0; margin: 0; padding: 0;';
        outputContainer.appendChild(pb);

        // PC Page 2 (Shed Summary)
        const p2 = createCleanPageBox();
        p2.classList.add('pc-render-mode');
        const contBar = document.createElement('div');
        contBar.className = 'continuation-header-bar';
        contBar.innerHTML = `<span>PATEL ENGINEERING — SHED SPECIFICATIONS & SUMMARY</span><span class="ref-pill">Quote Ref: ${quoteNo}</span>`;
        p2.appendChild(contBar);

        if (sec3Acc && sec3Acc.style.display !== 'none') p2.appendChild(sec3Acc.cloneNode(true));
        if (summary) p2.appendChild(summary.cloneNode(true));
        if (sigs) p2.appendChild(sigs.cloneNode(true));
        if (footer) p2.appendChild(footer.cloneNode(true));
        outputContainer.appendChild(p2);

    } else if (sectionType === 'CIVIL') {
        const hero = sectionEl.querySelector('.geo-header-wrapper')?.cloneNode(true);
        const substrip = sectionEl.querySelector('.company-substrip-bar')?.cloneNode(true);
        const cust = sectionEl.querySelector('.customer-details-block')?.cloneNode(true);
        const jobRibbon = sectionEl.querySelector('.civil-job-details-ribbon')?.cloneNode(true);

        const secConfigs = [
            { titleEl: sectionEl.querySelector('#civilFoundTitle')?.parentElement, tblWrap: sectionEl.querySelector('#civilFoundationTableBody')?.closest('.table-wrapper') },
            { titleEl: sectionEl.querySelector('#civilBrickTitle')?.parentElement, tblWrap: sectionEl.querySelector('#civilBrickWallTableBody')?.closest('.table-wrapper') },
            { titleEl: sectionEl.querySelector('#civilFloorTitle')?.parentElement, tblWrap: sectionEl.querySelector('#civilFlooringTableBody')?.closest('.table-wrapper') }
        ];

        const summary = sectionEl.querySelector('.theme-bottom-summary-grid')?.cloneNode(true);
        const sigs = sectionEl.querySelector('.signature-dual-grid')?.cloneNode(true);
        const footer = sectionEl.querySelector('.geo-footer-wrapper')?.cloneNode(true);
        const customWrapper = sectionEl.querySelector('#civilCustomCategoriesPage2Wrapper');

        // PC Page 3 (Civil Page 1: Foundation + Full Brick Wall)
        const p1 = createCleanPageBox();
        p1.classList.add('pc-render-mode');
        if (hero) p1.appendChild(hero.cloneNode(true));
        if (substrip) p1.appendChild(substrip.cloneNode(true));
        if (cust) p1.appendChild(cust.cloneNode(true));
        if (jobRibbon) p1.appendChild(jobRibbon.cloneNode(true));
        if (secConfigs[0].titleEl) p1.appendChild(secConfigs[0].titleEl.cloneNode(true));
        if (secConfigs[0].tblWrap) p1.appendChild(secConfigs[0].tblWrap.cloneNode(true));
        if (secConfigs[1].titleEl) p1.appendChild(secConfigs[1].titleEl.cloneNode(true));
        if (secConfigs[1].tblWrap) p1.appendChild(secConfigs[1].tblWrap.cloneNode(true));
        outputContainer.appendChild(p1);

        const pb = document.createElement('div');
        pb.className = 'html2pdf__page-break';
        pb.style.cssText = 'page-break-after: always; height: 0; margin: 0; padding: 0;';
        outputContainer.appendChild(pb);

        // PC Page 4 (Civil Page 2: Flooring + Terms + Summary + Signatures + Footer)
        const p2 = createCleanPageBox();
        p2.classList.add('pc-render-mode');
        const contBar = document.createElement('div');
        contBar.className = 'continuation-header-bar';
        contBar.innerHTML = `<span>PATEL ENGINEERING — CIVIL SPECIFICATIONS & COMMERCIALS</span><span class="ref-pill">Quote Ref: ${quoteNo}</span>`;
        p2.appendChild(contBar);

        if (secConfigs[2].titleEl) p2.appendChild(secConfigs[2].titleEl.cloneNode(true));
        if (secConfigs[2].tblWrap) p2.appendChild(secConfigs[2].tblWrap.cloneNode(true));
        if (customWrapper && customWrapper.children.length > 0) p2.appendChild(customWrapper.cloneNode(true));
        if (summary) p2.appendChild(summary.cloneNode(true));
        if (sigs) p2.appendChild(sigs.cloneNode(true));
        if (footer) p2.appendChild(footer.cloneNode(true));
        outputContainer.appendChild(p2);
    }
}

// ========================================================
// 22. DIRECT DOWNLOAD ENGINE
// ========================================================
function downloadPDFDirectly(mode = 'both') {
    const site = getCurrentSite();
    const clientClean = (site?.clientName || 'Client').trim().replace(/[^a-zA-Z0-9]/g, '_');
    const quoteClean = (site?.quoteNo || 'Quote').trim().replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Patel_Engineering_${clientClean}_${quoteClean}_${mode.toUpperCase()}.pdf`;
    
    triggerHaptic(50);
    playAppSound('chime');
    fireConfettiCelebration();

    if (typeof html2pdf === 'undefined') {
        window.print();
        return;
    }
    const origScroll = window.scrollY || window.pageYOffset;
    window.scrollTo(0, 0);

    const source = document.getElementById('printableA4Sheet');
    if (!source) return;

    const isComputer = window.innerWidth >= 1025 && !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    // ISOLATED STAGE
    const stage = document.createElement('div');
    stage.style.cssText = 'position: fixed; left: 0; top: 0; width: 746px !important; max-width: 746px !important; background: #ffffff; z-index: -99999; margin: 0; padding: 0; overflow: hidden;';
    
    // PC-ONLY STYLE INJECTION (PHONE/TAB MEIN INJECT NAHI HOGA)
    if (isComputer) {
        const pcStyle = document.createElement('style');
        pcStyle.innerHTML = `
            .pc-render-mode { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important; }
            .pc-render-mode .theme-data-table td, .pc-render-mode .civil-schedule-table td { padding: 4px 6px !important; line-height: 1.25 !important; font-size: 9.5px !important; }
            .pc-render-mode .geo-header-wrapper { min-height: 120px !important; }
            .pc-render-mode .customer-details-block { padding: 7px 14px !important; }
            .pc-render-mode .theme-bottom-summary-grid { padding: 5px 14px !important; }
            .pc-render-mode .signature-dual-grid { padding: 5px 16px !important; }
        `;
        stage.appendChild(pcStyle);
    }

    const clone = source.cloneNode(true);
    clone.style.setProperty('--pdf-scale', '1.0');
    clone.querySelectorAll('button, .btn-preview-add-inline, .btn-acc-preview-add, .btn-del-pro, .drag-handle').forEach(el => el.remove());
    clone.querySelectorAll('.preview-unit-pill').forEach(pill => {
        pill.innerText = pill.innerText.replace('▾', '').trim();
        pill.style.cssText = 'color: #000; background: transparent; border: none; box-shadow: none; padding: 0; font-weight: 700;';
    });
    clone.querySelector('.page-physical-gap')?.remove();

    const outputContainer = document.createElement('div');
    outputContainer.style.cssText = 'width: 746px !important; min-width: 746px !important; max-width: 746px !important; margin: 0 !important; padding: 0 !important; display: block !important;';
    
    const p1 = clone.querySelector('#page1MsStructure');
    const p2 = clone.querySelector('#civilDedicatedPageSheet');

    const shouldIncludeShed = (site.quoteType === 'both' && (mode === 'shed' || mode === 'both')) || (site.quoteType === 'shed');
    const shouldIncludeCivil = (site.quoteType === 'both' && (mode === 'civil' || mode === 'both')) || (site.quoteType === 'civil');

    // 1. BUILD SHED
    if (shouldIncludeShed && p1) {
        buildSectionPages(p1, outputContainer, site.quoteNo, 'SHED');
    }

    // 2. HARD PAGE BREAK BETWEEN SHED AND CIVIL
    if (shouldIncludeShed && shouldIncludeCivil) {
        const breakBetween = document.createElement('div');
        breakBetween.className = 'html2pdf__page-break';
        breakBetween.style.cssText = 'page-break-after: always; height: 0; line-height: 0; margin: 0; padding: 0;';
        outputContainer.appendChild(breakBetween);
    }

    // 3. BUILD CIVIL
    if (shouldIncludeCivil && p2) {
        p2.style.display = 'block';
        buildSectionPages(p2, outputContainer, site.quoteNo, 'CIVIL');
    }

    stage.appendChild(outputContainer);
    document.body.appendChild(stage);

    const opt = {
        margin: [6.35, 6.35, 6.35, 6.35],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2.0,
            useCORS: true,
            letterRendering: true,
            scrollY: 0,
            scrollX: 0,
            width: 746,
            windowWidth: 746,
            x: 0,
            y: 0,
            logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak: { 
            mode: ['css', 'legacy'],
            after: '.html2pdf__page-break'
        }
    };

    html2pdf().set(opt).from(outputContainer).toPdf().get('pdf').then(function(pdfObj) {
        if (document.body.contains(stage)) document.body.removeChild(stage);
        window.scrollTo(0, origScroll);

        // Android Native Bridge
        if (window.PatelNativeEngine?.savePdfToPatelFolder) {
            const base64Data = pdfObj.output('datauristring').split(',')[1];
            window.PatelNativeEngine.savePdfToPatelFolder(base64Data, fileName);
            return;
        }

        // Browser Universal Direct Blob Download
        try {
            const blob = pdfObj.output('blob');
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = blobUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl);
            }, 1000);
            showCorporateToast("✓ PDF Downloaded Successfully!");
        } catch(e) {
            pdfObj.save(fileName);
        }
    }).catch(function(err) {
        if (document.body.contains(stage)) document.body.removeChild(stage);
        window.scrollTo(0, origScroll);
        html2pdf().set(opt).from(outputContainer).save().catch(() => window.print());
    });
}

// ========================================================
// 23. PERMANENT TEXTS MODAL & HEADINGS SYNC
// ========================================================
function openPermanentTextsModal() {
    safeSetVal('pt_companyDesc', appSettings.companyDesc || "");
    safeSetVal('pt_companyAddr', appSettings.companyAddr || "");
    safeSetVal('pt_companyGst', appSettings.companyGst || "");
    safeSetVal('pt_footerWeb', appSettings.footerWeb || "");

    safeSetVal('pt_pdfRibbonTitle', "QUOTATION");
    safeSetVal('pt_pdfScopeTitle', appSettings.pdfScopeTitle || "");
    safeSetVal('pt_projectSizeHeading', appSettings.projectSizeHeading || "📐 PROJECT SIZE / SHED DIMENSIONS:");
    safeSetVal('pt_headerLine1', appSettings.headerLine1 || "1. ESTIMATED STEEL WEIGHT:");
    safeSetVal('pt_milestoneHeading', appSettings.milestoneHeading || "TOTAL STRUCTURE WEIGHT (PRIMARY + SECONDARY):");
    safeSetVal('pt_headerLine2', appSettings.headerLine2 || "2. PRICE BREAKUP AS PER KG RATE:");
    safeSetVal('pt_accSectionHeading', appSettings.accSectionHeading || "3. BUILDING ACCESSORIES ITEM-WISE BREAKDOWN:");

    safeSetVal('pt_civilPdfRibbonTitle', "QUOTATION");
    safeSetVal('pt_civilJobTitle', appSettings.civilJobTitle || "JOB DETAILS & TECHNICAL SPECIFICATIONS");
    safeSetVal('pt_civilFoundTitle', appSettings.civilFoundTitle || "1. FOUNDATION & RCC COLUMN DETAILS:");
    safeSetVal('pt_civilBrickTitle', appSettings.civilBrickTitle || "2. BRICK WALL, DPC & PLASTER DETAILS:");
    safeSetVal('pt_civilFloorTitle', appSettings.civilFloorTitle || "3. FLOORING & PCC WORK DETAILS:");

    safeSetVal('pt_btnNamePrim', appSettings.btnNamePrim || "1. Primary");
    safeSetVal('pt_btnNameSec', appSettings.btnNameSec || "2. Secondary");
    safeSetVal('pt_btnNameClad', appSettings.btnNameClad || "3. Cladding");
    safeSetVal('pt_btnNameAcc', appSettings.btnNameAcc || "4. Accessories");
    safeSetVal('pt_btnNameErect', appSettings.btnNameErect || "5. Erection");
    safeSetVal('pt_btnNameFoundation', appSettings.btnNameFoundation || "1. Foundation Details");
    safeSetVal('pt_btnNameBrick', appSettings.btnNameBrick || "2. Brick Wall Details");
    safeSetVal('pt_btnNameFlooring', appSettings.btnNameFlooring || "3. Flooring Details");

    safeSetVal('pt_termsTitle', appSettings.termsTitle || "Terms & Conditions:");
    safeSetVal('pt_civilTermsTitle', appSettings.civilTermsTitle || "Civil Work Terms & Conditions:");
    safeSetVal('pt_thankYouText', appSettings.thankYouText || "THANK YOU FOR YOUR BUSINESS WITH US.");
    safeSetVal('pt_civilThankYouText', appSettings.civilThankYouText || "THANK YOU FOR YOUR CIVIL CONTRACT.");
    safeSetVal('pt_custAcceptanceTitle', appSettings.custAcceptanceTitle || "CUSTOMER ACCEPTANCE");
    safeSetVal('pt_custAcceptanceSub', appSettings.custAcceptanceSub || "Authorized Signature & Stamp");
    safeSetVal('pt_signCompHeader', appSettings.signCompHeader || "");
    safeSetVal('pt_pdfSignatoryText', appSettings.pdfSignatoryText || "Authorized Signatory");

    openModalWithHistory('permanentTextsModal');
}
function closePermanentTextsModal() { closeModalSafe('permanentTextsModal'); }

function autoSavePermanentText(fieldKey, val) {
    appSettings[fieldKey] = val;
    syncDataToCloud('patel_app_settings', appSettings);
    applyCustomButtonNamesUI();
    refreshLivePdfPreviewSheet();
}

function renderSettingsPhonesUI() {
    const box = document.getElementById('settingsPhonesListContainer');
    if (!box) return;
    box.innerHTML = "";

    (appSettings.phones || []).forEach((phone, idx) => {
        box.innerHTML += `
            <div class="phone-row-dynamic">
                <span class="phone-badge-prefix">📞 #${idx + 1}</span>
                <input type="tel" value="${phone}" placeholder="Enter phone number..." oninput="updatePhoneSetting(${idx}, this.value)">
                <button type="button" class="btn-del-pro btn-ripple" onclick="deletePhoneSetting(${idx})">🗑️</button>
            </div>
        `;
    });
}

function addPhoneRowInSettings() {
    if (!appSettings.phones) appSettings.phones = [];
    appSettings.phones.push("+91 ");
    syncDataToCloud('patel_app_settings', appSettings);
    renderSettingsPhonesUI();
    refreshLivePdfPreviewSheet();
}

function updatePhoneSetting(idx, val) {
    if (!appSettings.phones) appSettings.phones = [];
    appSettings.phones[idx] = val;
    syncDataToCloud('patel_app_settings', appSettings);
    refreshLivePdfPreviewSheet();
}

function deletePhoneSetting(idx) {
    if (!appSettings.phones) return;
    appSettings.phones.splice(idx, 1);
    syncDataToCloud('patel_app_settings', appSettings);
    renderSettingsPhonesUI();
    refreshLivePdfPreviewSheet();
}

function saveCompanyEmailSetting(val) {
    appSettings.companyEmail = val.trim();
    syncDataToCloud('patel_app_settings', appSettings);
    refreshLivePdfPreviewSheet();
}

function saveFooterWebSetting(val) {
    appSettings.footerWeb = val.trim();
    syncDataToCloud('patel_app_settings', appSettings);
    refreshLivePdfPreviewSheet();
}

function loadPhoneSettingsUI() {
    renderSettingsPhonesUI();
    safeSetVal('setCompanyEmail', appSettings.companyEmail || "");
    safeSetVal('setFooterWeb', appSettings.footerWeb || "");
    safeSetVal('setStartingQuoteNo', getNextQuoteSequenceNumber());
}

let currentSettingKey = '';
function openLargeInput(key, title) {
    currentSettingKey = key;
    safeSetText('largeInputTitle', title);
    safeSetVal('largeInputTextarea', appSettings[key] || "");
    openModalWithHistory('largeInputModal');
}
function closeLargeInput() { 
    closeModalSafe('largeInputModal'); 
    calcModuleTotals();
    refreshLivePdfPreviewSheet();
}
function autoSaveLargeInputLive() {
    appSettings[currentSettingKey] = document.getElementById('largeInputTextarea')?.value || "";
    syncDataToCloud('patel_app_settings', appSettings);
    loadPhoneSettingsUI();
    renderHomeScreen();
    refreshLivePdfPreviewSheet();
}

function compressAndOptimizeBanner(file, maxWidth, quality, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            const isPng = file.type === 'image/png';
            const optimizedBase64 = canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality);
            callback(optimizedBase64);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        compressAndOptimizeBanner(file, 1000, 0.85, function(optimizedBase64) {
            appSettings.logoData = optimizedBase64;
            syncDataToCloud('patel_app_settings', appSettings);
            
            updateHeaderBannersUI();
            refreshLivePdfPreviewSheet();
            
            const fav = document.getElementById('dynamicAppFavicon');
            const appleFav = document.getElementById('dynamicAppleIcon');
            if (fav) fav.href = optimizedBase64;
            if (appleFav) appleFav.href = optimizedBase64;
            
            showCorporateToast("Company Header Banner Updated!", "🖼️");
            input.value = '';
        });
    }
}

// ========================================================
// 24. DIGITAL SIGNATURE & WINDOW ONLOAD
// ========================================================
let canvas, ctx, isDrawing = false, sigEventsAttached = false;
function openSignatureModal() {
    openModalWithHistory('sigModal');
    canvas = document.getElementById('sigPad');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    if (!sigEventsAttached) {
        canvas.addEventListener('touchstart', (e) => {
            isDrawing = true;
            ctx.beginPath();
            const t = e.touches[0];
            const r = canvas.getBoundingClientRect();
            ctx.moveTo(t.clientX - r.left, t.clientY - r.top);
            e.preventDefault();
        }, {passive:false});
        canvas.addEventListener('touchmove', (e) => {
            if (!isDrawing) return;
            const t = e.touches[0];
            const r = canvas.getBoundingClientRect();
            ctx.lineTo(t.clientX - r.left, t.clientY - r.top);
            ctx.stroke();
            e.preventDefault();
        }, {passive:false});
        canvas.addEventListener('touchend', () => isDrawing = false);

        canvas.addEventListener('mousedown', (e) => {
            isDrawing = true;
            ctx.beginPath();
            ctx.moveTo(e.offsetX, e.offsetY);
        });
        canvas.addEventListener('mousemove', (e) => {
            if (isDrawing) {
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke();
            }
        });
        canvas.addEventListener('mouseup', () => isDrawing = false);
        sigEventsAttached = true;
    }
}
function clearSignature() {
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
}
function closeSigModal() { closeModalSafe('sigModal'); }
function saveSignature() {
    appSettings.signatureData = canvas.toDataURL();
    syncDataToCloud('patel_app_settings', appSettings);
    closeSigModal();
    refreshLivePdfPreviewSheet();
    showCorporateToast("Digital Signature Saved Successfully!", "✍️");
}

window.onload = function() {
    checkFirstTimeAuthentication();
    initCloudFirstMasterSync();
    renderHomeScreen();
    loadPhoneSettingsUI();
    applyScaleToSheet();
    autoDetectDeviceMode();
    updateHeaderBannersUI();
    if (appSettings.logoData) {
        const fav = document.getElementById('dynamicAppFavicon');
        const appleFav = document.getElementById('dynamicAppleIcon');
        if (fav) fav.href = appSettings.logoData;
        if (appleFav) appleFav.href = appSettings.logoData;
    }
    initSamsungBootAnimation();
    setTimeout(attachDynamicPreviewObserver, 200);
};
