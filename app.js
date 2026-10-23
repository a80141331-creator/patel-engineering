// 1. FIREBASE CONFIGURATION
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
} catch(e) { console.warn("Firebase note:", e); }

let masterSecurityPasscode = localStorage.getItem('pe_master_passcode') || "RJ06CC7194";

// 2. AUDIO & TOASTS
let audioCtx = null;
function playAppSound(type = 'click') {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(), now = audioCtx.currentTime;
        osc.connect(gain); gain.connect(audioCtx.destination);
        if (type === 'click') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);
            gain.gain.setValueAtTime(0.08, now); gain.gain.linearRampToValueAtTime(0.001, now + 0.04);
            osc.start(now); osc.stop(now + 0.04);
        } else if (type === 'chime') {
            osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now);
            osc.frequency.setValueAtTime(659.25, now + 0.08); osc.frequency.setValueAtTime(783.99, now + 0.16);
            gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            osc.start(now); osc.stop(now + 0.35);
        }
    } catch(e) {}
}

function showCorporateToast(msg, icon = '✓') {
    const box = document.getElementById('appToastContainer'); if (!box) return;
    const toast = document.createElement('div'); toast.className = 'toast-message';
    toast.innerHTML = `<span style="color:#38bdf8;font-size:16px;">${icon}</span><span>${msg}</span>`;
    box.appendChild(toast); playAppSound('chime');
    setTimeout(() => { toast.classList.add('toast-fade-out'); setTimeout(() => toast.remove(), 320); }, 2800);
}
function scrollPreviewPane(d) { const vp = document.getElementById('viewportWrap'); if (vp) { vp.scrollBy({ top: d, behavior: 'smooth' }); playAppSound('click'); triggerHaptic(10); } }
function scrollCivilPreviewPane(d) { const vp = document.getElementById('civilViewportWrap'); if (vp) { vp.scrollBy({ top: d, behavior: 'smooth' }); playAppSound('click'); triggerHaptic(10); } }

// 3. MASTER BLUEPRINTS
const defaultMasterBlueprint = {
    primCustomLine: "Fabrication with FE 345 Steel, Cutting, Welding, 1 Coat Primer",
    primSpecs: [{ text: "Fabrication with FE", selected: true }, { text: "345 Steel", selected: true }, { text: "Cutting", selected: true }, { text: "Welding", selected: true }, { text: "1 Coat Primer", selected: true }],
    primUnit: "Kg", secCustomLine: "Z Purlin 200 & 150 - 2.0mm Galvanized 120 GSM, Girts & Bracings",
    secSpecs: [{ text: "Z Purlin 200 & 150", selected: true }, { text: "2.0mm Galvanized 120 GSM", selected: true }, { text: "Girts & Bracings", selected: true }],
    secUnit: "Kg", cladCustomLine: "0.50mm TATA BlueScope / JSW Colour Coated Sheet", cladThickness: "0.50 mm", cladUnit: "Sq.Ft",
    accCustomLine: "Turbo Ventilators, Gutters, Down Pipes, Anchor Bolts, Nuts & Bolts",
    accessories: [
        { name: "Turbo Ventilators", qty: "", unit: "Nos", rate: "", selected: true },
        { name: "Gutters", qty: "", unit: "R.Ft", rate: "", selected: true },
        { name: "Down Pipes", qty: "", unit: "Set", rate: "", selected: true },
        { name: "Anchor Bolts", qty: "", unit: "Lot", rate: "", selected: true },
        { name: "Nuts & Bolts", qty: "", unit: "Lot", rate: "", selected: true }
    ],
    erectCustomLine: "Crane, Hydra, Welding Machine, Labour",
    erectSpecs: [{ text: "Crane", selected: true }, { text: "Hydra", selected: true }, { text: "Welding Machine", selected: true }, { text: "Labour", selected: true }],
    erectUnit: "Kg", moduleOrder: ['prim', 'sec', 'clad', 'acc', 'erect'], customModules: [],
    civilScopeDesc: "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS",
    civilData: {
        foundation: { title: "1. FOUNDATION & RCC COLUMN DETAILS", enabled: true, items: [
            { id: "f1", name: "Column Foundation / Footing Work", qty: "", unit: "Nos", rate: "", enabled: true },
            { id: "f2", name: "RCC Column Shuttering & Casting", qty: "", unit: "Sq.Ft", rate: "", enabled: true },
            { id: "f3", name: "Reinforcement Steel Bars", qty: "", unit: "Nos", rate: "", enabled: true },
            { id: "f4", name: "Stirrups / Ring Binding Work", qty: "", unit: "Lot", rate: "", enabled: true },
            { id: "f5", name: "Column Grid Alignment & Spacing", qty: "", unit: "Ft", rate: "", enabled: true }
        ]},
        brickWall: { title: "2. BRICK WALL, DPC & PLASTER DETAILS", enabled: true, items: [
            { id: "b1", name: "Stone Masonry Foundation Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true },
            { id: "b2", name: "Plinth / Brick Foundation Work", qty: "", unit: "R.Ft", rate: "", enabled: true },
            { id: "b3", name: "DPC (Damp Proof Course) Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true },
            { id: "b4", name: "Brick Wall Superstructure Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true },
            { id: "b5", name: "Cement Plaster Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true }
        ]},
        flooring: { title: "3. FLOORING & PCC WORK DETAILS", enabled: true, items: [
            { id: "fl1", name: "Soil Filling & Stone Soling Work", qty: "", unit: "Cu.Ft", rate: "", enabled: true },
            { id: "fl2", name: "PCC Concrete Flooring (M25) Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true }
        ]}
    },
    civilCustomCategories: []
};

// DEDICATED SQ.FT BLUEPRINT
const defaultSqftMasterBlueprint = {
    sqftScopeDesc: "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - SQ.FT BASIS",
    sqftTableDesc: "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:",
    primSpecs: [
        { text: "Columns (Main Stanchions)", length: "22", width: "300", dimUnit: "mm", selected: true },
        { text: "Truss / Rafter Framing", length: "50", width: "250", dimUnit: "mm", selected: true },
        { text: "Tie Beams & Bracings", length: "15", width: "150", dimUnit: "mm", selected: true },
        { text: "Canopy & Tie Members", length: "10", width: "100", dimUnit: "mm", selected: true }
    ],
    cladThickness: "0.50 mm", cladCustomLine: "0.50mm TATA BlueScope / JSW Colour Coated Profile Sheet",
    accessories: [
        { name: "Turbo Ventilators", selected: true }, { name: "Rainwater Gutters", selected: true },
        { name: "Down Pipes (PVC)", selected: true }, { name: "Anchor Fastener Bolts", selected: true }
    ],
    erectSpecs: [{ text: "Crane", selected: true }, { text: "Hydra", selected: true }, { text: "Welding Machine", selected: true }, { text: "Labour", selected: true }]
};

const defaultBannerSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 700 240' width='700' height='240'><g fill='%230f172a'><path d='M30,120 Q30,30 160,30 L260,30 Q330,30 330,80 Q330,125 250,130 L110,130 L110,210 L30,210 Z'/><rect x='30' y='218' width='640' height='8' fill='%230c1e30'/><text x='350' y='240' font-family='Arial,sans-serif' font-weight='900' font-size='22' letter-spacing='14' text-anchor='middle'>PATEL ENGINEERING</text></g></svg>`;

const defaultAppSettings = {
    ownerName: "PATEL ENGINEERING", companyAddr: "Bhawani Nagar, Bhilwara - 311001 (Rajasthan, India)",
    companyGst: "08AHFPL0222M2ZF", phones: ["+91 9799635249", "+91 7737734122", "+91 9829111111"],
    companyEmail: "info@patelengineering.com", footerWeb: "www.patelengineering.com", startingQuoteSeq: 1,
    paymentTerms: "• 40% Advance along with Purchase Order & Foundation drawing approval.\n• 50% Progressive payment against proforma invoice before dispatch.\n• 10% Final payment after successful completion of erection on site.",
    termsCond: "• Delivery within 4-6 weeks from approval of anchor drawings.\n• Uninterrupted water & 3-phase electricity at site under client scope.\n• All structural steel weights are estimated as per standard engineering tolerance.",
    sqftPaymentTerms: "• 35% Advance with Order Confirmation & Foundation Drawing Approval.\n• 50% Progressive payment stage-wise against site delivery of structure & sheets.\n• 15% Final payment after complete handover of shed structure.",
    sqftTermsCond: "• Total covered shed area billing as per actual agreed layout dimensions.\n• Civil foundations, uninterrupted water & 3-phase power under client scope.\n• All framing & roofing work executed under turnkey single-contract rate.",
    civilPaymentTerms: "• 30% Advance along with formal Civil Work order confirmation.\n• 50% Running progressive payment based on site progress (Plinth/DPC/Wall).\n• 20% Final payment upon successful completion of Flooring & PCC work.",
    civilTermsCond: "• Water & 3-phase electricity connection to be provided free of charge by client at site.\n• Unforeseen hard-rock excavation or dewatering if required will be extra as per mutual consent.\n• Adequate secured storage space for cement & steel reinforcement to be provided at site.",
    pdfRibbonTitle: "QUOTATION", sqftPdfRibbonTitle: "QUOTATION", civilPdfRibbonTitle: "QUOTATION", companyDesc: "PEB Structure | Industrial Sheds | Roofing Solutions",
    pdfScopeTitle: "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - KG BASIS",
    sqftPdfScopeTitle: "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - SQ.FT BASIS",
    projectSizeHeading: "📐 PROJECT SIZE / SHED DIMENSIONS:",
    btnNamePrim: "1. Primary", btnNameSec: "2. Secondary", btnNameClad: "3. Cladding", btnNameAcc: "4. Accessories", btnNameErect: "5. Erection",
    btnNameFoundation: "1. Foundation Details", btnNameBrick: "2. Brick Wall Details", btnNameFlooring: "3. Flooring Details",
    headerLine1: "1. ESTIMATED STEEL WEIGHT:", milestoneHeading: "TOTAL STRUCTURE WEIGHT (PRIMARY + SECONDARY):",
    headerLine2: "2. PRICE BREAKUP AS PER KG RATE:",
    sqftHeaderLine1: "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:",
    sqftContractBarTitle: "COMPLETE PEB SHED CONTRACT (ON SQ.FT COVERED AREA BASIS)",
    sqftPrimLabel: "Primary Structural Framing", sqftCladLabel: "Roof & Wall Cladding System", sqftAccLabel: "Building Accessories Package", sqftErectLabel: "Turnkey Erection & Installation",
    accSectionHeading: "3. BUILDING ACCESSORIES ITEM-WISE BREAKDOWN:",
    civilJobTitle: "JOB DETAILS & TECHNICAL SPECIFICATIONS", civilFoundTitle: "1. FOUNDATION & RCC COLUMN DETAILS:",
    civilBrickTitle: "2. BRICK WALL, DPC & PLASTER DETAILS:", civilFloorTitle: "3. FLOORING & PCC WORK DETAILS:",
    termsTitle: "Terms & Conditions:", civilTermsTitle: "Civil Work Terms & Conditions:",
    thankYouText: "THANK YOU FOR YOUR BUSINESS WITH US.", civilThankYouText: "THANK YOU FOR YOUR CIVIL CONTRACT.",
    custAcceptanceTitle: "CUSTOMER ACCEPTANCE", custAcceptanceSub: "Authorized Signature & Stamp",
    signCompHeader: "FOR PATEL ENGINEERING", pdfSignatoryText: "Authorized Signatory",
    signatureData: "", logoData: "", savedPdfFontScale: 1.0,
    bankName: "", bankAccName: "", bankAccNo: "", bankIfsc: "", bankBranch: "", bankUpi: ""
};

let masterBlueprint = JSON.parse(localStorage.getItem('patel_master_blueprint') || JSON.stringify(defaultMasterBlueprint));
let sqftMasterBlueprint = JSON.parse(localStorage.getItem('patel_sqft_master_blueprint') || JSON.stringify(defaultSqftMasterBlueprint));
let appSettings = JSON.parse(localStorage.getItem('patel_app_settings') || JSON.stringify(defaultAppSettings));
if (!appSettings.phones || !Array.isArray(appSettings.phones)) {
    appSettings.phones = [appSettings.phone1, appSettings.phone2, appSettings.phone3].filter(Boolean);
    if (!appSettings.phones.length) appSettings.phones = ["+91 9799635249", "+91 7737734122"];
}
if (!appSettings.savedPdfFontScale) appSettings.savedPdfFontScale = appSettings.savedPdfScale || 1.0;

let sites = JSON.parse(localStorage.getItem('patel_app_sites') || '[]');
let currentSiteId = null;

function isSqftMode(s) { return s && (s.quoteType === 'shed_sqft' || s.quoteType === 'both_sqft'); }
function hasCivilMode(s) { return s && (s.quoteType === 'both' || s.quoteType === 'both_sqft' || s.quoteType === 'civil'); }
function hasShedMode(s) { return s && (s.quoteType === 'both' || s.quoteType === 'both_sqft' || s.quoteType === 'shed' || s.quoteType === 'shed_sqft'); }

function syncSiteStructureToMasterBlueprint(s) {
    if (!s) return;
    try {
        if (isSqftMode(s)) {
            if (s.sqftPrimSpecs) sqftMasterBlueprint.primSpecs = JSON.parse(JSON.stringify(s.sqftPrimSpecs));
            if (s.sqftAccessories) sqftMasterBlueprint.accessories = JSON.parse(JSON.stringify(s.sqftAccessories));
            sqftMasterBlueprint.sqftScopeDesc = s.sqftScopeDesc || sqftMasterBlueprint.sqftScopeDesc;
            sqftMasterBlueprint.sqftTableDesc = s.sqftTableDesc || sqftMasterBlueprint.sqftTableDesc;
            localStorage.setItem('patel_sqft_master_blueprint', JSON.stringify(sqftMasterBlueprint));
            if (db && isFirebaseConnected) db.ref('patel_sqft_master_blueprint').set(sqftMasterBlueprint).catch(() => {});
        } else {
            masterBlueprint.primCustomLine = s.primCustomLine || masterBlueprint.primCustomLine;
            if (s.primSpecs) masterBlueprint.primSpecs = JSON.parse(JSON.stringify(s.primSpecs));
            masterBlueprint.primUnit = s.primUnit || "Kg";
            masterBlueprint.secCustomLine = s.secCustomLine || masterBlueprint.secCustomLine;
            if (s.secSpecs) masterBlueprint.secSpecs = JSON.parse(JSON.stringify(s.secSpecs));
            masterBlueprint.secUnit = s.secUnit || "Kg";
            masterBlueprint.cladCustomLine = s.cladCustomLine || masterBlueprint.cladCustomLine;
            masterBlueprint.cladThickness = s.cladThickness || masterBlueprint.cladThickness;
            masterBlueprint.cladUnit = s.cladUnit || "Sq.Ft";
            masterBlueprint.accCustomLine = s.accCustomLine || masterBlueprint.accCustomLine;
            if (s.accessories) masterBlueprint.accessories = s.accessories.map(a => ({ name: a.name, qty: "", unit: a.unit || "Nos", rate: "", selected: a.selected !== false }));
            masterBlueprint.erectCustomLine = s.erectCustomLine || masterBlueprint.erectCustomLine;
            if (s.erectSpecs) masterBlueprint.erectSpecs = JSON.parse(JSON.stringify(s.erectSpecs));
            masterBlueprint.erectUnit = s.erectUnit || "Kg";
            if (s.moduleOrder) masterBlueprint.moduleOrder = [...s.moduleOrder];
            localStorage.setItem('patel_master_blueprint', JSON.stringify(masterBlueprint));
            if (db && isFirebaseConnected) db.ref('patel_master_blueprint').set(masterBlueprint).catch(() => {});
        }
        if (s.civilData) {
            masterBlueprint.civilScopeDesc = s.civilScopeDesc || masterBlueprint.civilScopeDesc;
            ['foundation', 'brickWall', 'flooring'].forEach(sec => {
                if (s.civilData[sec]) {
                    if (!masterBlueprint.civilData[sec]) masterBlueprint.civilData[sec] = { title: "", enabled: true, items: [] };
                    masterBlueprint.civilData[sec].title = s.civilData[sec].title;
                    masterBlueprint.civilData[sec].enabled = s.civilData[sec].enabled !== false;
                    masterBlueprint.civilData[sec].items = (s.civilData[sec].items || []).map(it => ({ id: it.id, name: it.name, unit: it.unit || "Lot", qty: "", rate: "", enabled: it.enabled !== false }));
                }
            });
            localStorage.setItem('patel_master_blueprint', JSON.stringify(masterBlueprint));
            if (db && isFirebaseConnected) db.ref('patel_master_blueprint').set(masterBlueprint).catch(() => {});
        }
    } catch(err) { console.warn("Master blueprint sync notice:", err); }
}

// 4. CLOUD SYNC & MASTER PROTECTION
function syncDataToCloud(k, d) {
    try { localStorage.setItem(k, JSON.stringify(d)); } catch(e) {}
    if (db && isFirebaseConnected && isCloudInitialSyncDone) db.ref(k).set(d).catch(() => {});
}

function initCloudFirstMasterSync() {
    if (!db || !isFirebaseConnected) { isCloudInitialSyncDone = true; return; }
    const syncBadge = document.getElementById('cloudSyncIndicator');
    if (syncBadge) syncBadge.innerHTML = `<span class="pulse-dot">●</span> 100% Cloud Synced (All Devices Connected)`;

    db.ref('pe_master_passcode').on('value', (s) => {
        const val = s.val(); if (val) { masterSecurityPasscode = val; localStorage.setItem('pe_master_passcode', val); const t = localStorage.getItem('pe_app_auth_token'); if (t && t !== val) { localStorage.removeItem('pe_app_auth_token'); checkFirstTimeAuthentication(true); } }
    });
    db.ref('patel_app_settings').on('value', (s) => {
        const val = s.val(); if (val && typeof val === 'object') { appSettings = Object.assign({}, defaultAppSettings, val); if (!appSettings.phones || !Array.isArray(appSettings.phones)) appSettings.phones = [appSettings.phone1, appSettings.phone2, appSettings.phone3].filter(Boolean); if (!appSettings.savedPdfFontScale) appSettings.savedPdfFontScale = 1.0; try { localStorage.setItem('patel_app_settings', JSON.stringify(appSettings)); } catch(e) {} loadPhoneSettingsUI(); applyCustomButtonNamesUI(); updateHeaderBannersUI(); applyScaleToSheet(); refreshLivePdfPreviewSheet(true); }
    });
    db.ref('patel_master_blueprint').on('value', (s) => {
        const val = s.val(); if (val && typeof val === 'object') { masterBlueprint = val; try { localStorage.setItem('patel_master_blueprint', JSON.stringify(masterBlueprint)); } catch(e) {} }
    });
    db.ref('patel_sqft_master_blueprint').on('value', (s) => {
        const val = s.val(); if (val && typeof val === 'object') { sqftMasterBlueprint = val; try { localStorage.setItem('patel_sqft_master_blueprint', JSON.stringify(sqftMasterBlueprint)); } catch(e) {} }
    });
    db.ref('patel_app_sites').on('value', (s) => {
        const val = s.val(); if (val) { let loaded = Array.isArray(val) ? val.filter(Boolean) : (typeof val === 'object' ? Object.values(val).filter(Boolean) : []); if (loaded.length > 0) { sites = loaded; try { localStorage.setItem('patel_app_sites', JSON.stringify(sites)); } catch(e) {} renderHomeScreen(); loadPhoneSettingsUI(); if (currentSiteId && sites.find(x => x.id === currentSiteId)) refreshLivePdfPreviewSheet(true); } }
        isCloudInitialSyncDone = true; if (syncBadge) syncBadge.innerHTML = `<span class="pulse-dot">●</span> 100% Cloud Synced (All Devices Connected)`;
    });
}

function updateHeaderBannersUI() {
    const bannerSrc = appSettings.logoData || defaultBannerSvg;
    ['pdfHeaderBannerImg', 'civilPdfHeaderBannerImg'].forEach(id => { const img = document.getElementById(id); if (img) img.src = bannerSrc; });
    const mirrorP1 = document.querySelector('#printableA4Sheet_civilDisplayMirror #pdfHeaderBannerImg');
    const mirrorP2 = document.querySelector('#printableA4Sheet_civilDisplayMirror #civilPdfHeaderBannerImg');
    if (mirrorP1) mirrorP1.src = bannerSrc; if (mirrorP2) mirrorP2.src = bannerSrc;
    if (appSettings.logoData) { safeSetHtml('settingsLogoPreview', `<img src="${appSettings.logoData}" style="width:100%;height:100%;object-fit:cover;">`); safeSetHtml('appLogoBadge', `<img src="${appSettings.logoData}" style="width:100%;height:100%;object-fit:cover;">`); }
}

// 5. MASTER PASSCODE GATEWAY
function checkFirstTimeAuthentication(isRemoteKick = false) {
    const savedToken = localStorage.getItem('pe_app_auth_token');
    const lockScreen = document.getElementById('appFirstTimeLockScreen'); if (!lockScreen) return;
    if (savedToken === masterSecurityPasscode) lockScreen.style.display = 'none';
    else {
        lockScreen.style.display = 'flex'; lockScreen.style.opacity = '1';
        const err = document.getElementById('authErrorMsg'); if (isRemoteKick && err) { err.innerText = "⚠️ Passcode updated by Admin. Re-enter new passcode."; err.style.display = 'block'; }
        document.getElementById('inpMasterPasscode')?.focus();
    }
}
function verifyMasterPasscode() {
    const entered = (document.getElementById('inpMasterPasscode')?.value || "").trim().toUpperCase();
    const err = document.getElementById('authErrorMsg');
    if (entered === masterSecurityPasscode) {
        triggerHaptic(50); playAppSound('chime'); fireConfettiCelebration();
        localStorage.setItem('pe_app_auth_token', masterSecurityPasscode);
        const lock = document.getElementById('appFirstTimeLockScreen');
        if (lock) { lock.style.opacity = '0'; setTimeout(() => { lock.style.display = 'none'; }, 400); }
    } else {
        triggerHaptic(100); if (err) { err.innerText = "⚠️ Invalid Passcode. Access Denied!"; err.style.display = 'block'; setTimeout(() => { err.style.display = 'none'; }, 3000); }
    }
}
function togglePassVisibility(id) { const el = document.getElementById(id); if (el) el.type = el.type === 'password' ? 'text' : 'password'; }
function openChangePasscodeModal() { safeSetVal('inpCurrentPass', ""); safeSetVal('inpNewPass', ""); openModalWithHistory('changePasscodeModal'); }
function closeChangePasscodeModal() { closeModalSafe('changePasscodeModal'); }
function saveNewMasterPasscode() {
    const cur = (document.getElementById('inpCurrentPass')?.value || "").trim().toUpperCase();
    const nw = (document.getElementById('inpNewPass')?.value || "").trim().toUpperCase();
    if (cur !== masterSecurityPasscode) return showAppAlert("⚠️ Security Error", "Current passcode galat hai!");
    if (!nw || nw.length < 4) return showAppAlert("⚠️ Invalid", "Passcode kam se kam 4 characters ka ho.");
    masterSecurityPasscode = nw; localStorage.setItem('pe_master_passcode', nw); localStorage.setItem('pe_app_auth_token', nw);
    if (db && isFirebaseConnected) db.ref('pe_master_passcode').set(nw);
    closeChangePasscodeModal(); showCorporateToast(`Master Passcode updated: ${nw}`);
}

// 6. NAVIGATION & MODES
window.addEventListener('popstate', () => handleDeviceBackButton());
function handleDeviceBackButton() {
    const openModals = document.querySelectorAll('.modal.active, .confirm-dialog-modal.active');
    if (openModals.length > 0) { openModals.forEach(m => m.classList.remove('active')); return; }
    const screenCivil = document.getElementById('screenCivilDashboard');
    if (screenCivil && screenCivil.classList.contains('active')) { handleCivilBackNav(); return; }
    const screenSite = document.getElementById('screenSiteDashboard'), screenCreate = document.getElementById('screenCreateSite'), screenSettings = document.getElementById('screenSettings');
    if ((screenSite && screenSite.classList.contains('active')) || (screenCreate && screenCreate.classList.contains('active')) || (screenSettings && screenSettings.classList.contains('active'))) {
        openScreen('screenHome', false);
    }
}
function handleCivilBackNav() {
    const site = getCurrentSite();
    if (site && site.quoteType === 'civil') openScreen('screenHome', false);
    else openScreen('screenSiteDashboard', false);
}
function openModalWithHistory(mId) { const m = document.getElementById(mId); if (m) { m.classList.add('active'); if (window.history && window.history.pushState) history.pushState({ modal: mId }, ""); } }
function closeModalSafe(mId) { const m = document.getElementById(mId); if (m) m.classList.remove('active'); }
function openScreen(sId, push = true) {
    try { if (push && window.history && window.history.pushState) history.pushState({ screen: sId }, ""); } catch(e) {}
    document.querySelectorAll('.app-view').forEach(s => s.classList.remove('active'));
    const t = document.getElementById(sId);
    if (t) { t.classList.add('active'); window.scrollTo(0, 0); if (sId === 'screenSiteDashboard' || sId === 'screenCivilDashboard') setTimeout(autoFitPreview, 60); }
}
let currentDeviceMode = "phone", manualDeviceModeOverride = false;
function setDeviceViewMode(mode, isManual = false) {
    if (isManual) manualDeviceModeOverride = true;
    currentDeviceMode = mode; document.body.className = "mode-" + mode;
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

// 7. DOM HELPERS & FORMATTERS
function safeSetText(id, t) { const el = document.getElementById(id); if (el) el.innerText = (t !== undefined && t !== null) ? t : ''; }
function safeSetHtml(id, h) { const el = document.getElementById(id); if (el) el.innerHTML = (h !== undefined && h !== null) ? h : ''; }
function safeSetVal(id, v) { const el = document.getElementById(id); if (el) el.value = (v !== undefined && v !== null) ? v : ''; }
function formatRawOrDash(v) { if (v === "" || v === null || v === undefined) return "-"; const n = parseFloat(v); return (isNaN(n) || n === 0) ? "-" : v; }
function showAppAlert(title, msg) { safeSetText('alertModalTitle', title || "Alert"); safeSetText('alertModalDesc', msg || ""); openModalWithHistory('customAlertModal'); }
function closeAppAlert() { closeModalSafe('customAlertModal'); }
function triggerHaptic(d = 15) { if (window.navigator && window.navigator.vibrate) window.navigator.vibrate(d); }
function fireConfettiCelebration() { if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); }

function animateNumberRoll(elemId, targetNumber, prefix = "₹ ", suffix = "") {
    const el = document.getElementById(elemId); if (!el) return;
    const target = Math.round(targetNumber) || 0;
    if (target === 0) { el.innerText = "-"; return; }
    const currentText = el.innerText.replace(/[^0-9]/g, ''), start = parseInt(currentText, 10) || 0;
    if (start === target) { el.innerText = prefix + target.toLocaleString('en-IN') + suffix; return; }
    const duration = 1000, startTime = performance.now();
    function step(currentTime) {
        const elapsed = currentTime - startTime, progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3), currentVal = Math.floor(start + (target - start) * ease);
        el.innerText = prefix + (progress < 1 ? currentVal.toLocaleString('en-IN') : target.toLocaleString('en-IN')) + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}
function triggerTotalBarShimmer() {
    document.querySelectorAll('.solid-navy-total-bar').forEach(bar => {
        bar.classList.remove('shimmer-active'); void bar.offsetWidth; bar.classList.add('shimmer-active');
    });
}
function handlePreviewInputFocus(el) { if (el && el.innerText.trim() === '-') el.innerText = ''; }

document.addEventListener('click', function(e) {
    const targetBtn = e.target.closest('.btn-ripple'); if (!targetBtn) return;
    playAppSound('click'); triggerHaptic(10);
    const rect = targetBtn.getBoundingClientRect(), circle = document.createElement('span');
    const diameter = Math.max(rect.width, rect.height), radius = diameter / 2;
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${(e.clientX || rect.left + radius) - rect.left - radius}px`;
    circle.style.top = `${(e.clientY || rect.top + radius) - rect.top - radius}px`;
    circle.classList.add('ripple-wave');
    const old = targetBtn.querySelector('.ripple-wave'); if (old) old.remove();
    targetBtn.appendChild(circle);
    setTimeout(() => { if (circle && circle.parentNode) circle.remove(); }, 500);
});

// 8. DRAG & DROP REORDERING
let activeTouchDragScope = null, activeTouchDragIndex = null, activeTouchDragParent = null, activeTouchDragElement = null;
function setupUniversalReorder(rowEl, handleEl, scope, index, parentCat = null) {
    if (!rowEl || !handleEl) return;
    rowEl.setAttribute('draggable', 'true'); rowEl.classList.add('sortable-item');
    rowEl.dataset.sortIndex = index; rowEl.dataset.sortScope = scope;
    if (parentCat) rowEl.dataset.sortParent = parentCat;

    rowEl.addEventListener('dragstart', (e) => {
        activeTouchDragScope = scope; activeTouchDragIndex = parseInt(index, 10); activeTouchDragParent = parentCat;
        e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(index)); rowEl.classList.add('dragging');
    });
    rowEl.addEventListener('dragend', () => { rowEl.classList.remove('dragging'); document.querySelectorAll('.sortable-item').forEach(i => i.classList.remove('drag-over')); });
    rowEl.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (activeTouchDragScope === scope && (parentCat === activeTouchDragParent)) rowEl.classList.add('drag-over'); });
    rowEl.addEventListener('dragleave', () => rowEl.classList.remove('drag-over'));
    rowEl.addEventListener('drop', (e) => {
        e.preventDefault(); e.stopPropagation(); rowEl.classList.remove('drag-over');
        const targetIdx = parseInt(rowEl.dataset.sortIndex, 10);
        if (activeTouchDragScope === scope && activeTouchDragIndex !== null && activeTouchDragIndex !== targetIdx && (parentCat === activeTouchDragParent)) {
            handleItemsReorder(scope, activeTouchDragIndex, targetIdx, parentCat);
        }
    });

    handleEl.addEventListener('touchstart', (e) => {
        e.stopPropagation(); activeTouchDragScope = scope; activeTouchDragIndex = parseInt(index, 10);
        activeTouchDragParent = parentCat; activeTouchDragElement = rowEl; rowEl.classList.add('dragging'); triggerHaptic(30);
    }, { passive: false });
    handleEl.addEventListener('touchmove', (e) => {
        e.preventDefault(); e.stopPropagation();
        const touch = e.touches[0], targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
        const overRow = targetElement ? targetElement.closest('.sortable-item') : null;
        document.querySelectorAll('.sortable-item').forEach(r => r.classList.remove('drag-over'));
        if (overRow && overRow !== activeTouchDragElement && overRow.dataset.sortIndex !== undefined && overRow.dataset.sortScope === scope) overRow.classList.add('drag-over');
    }, { passive: false });
    handleEl.addEventListener('touchend', (e) => {
        e.stopPropagation(); if (activeTouchDragElement) activeTouchDragElement.classList.remove('dragging');
        const touch = e.changedTouches[0], targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
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
    const site = getCurrentSite(); if (!site) return;
    const from = parseInt(fromIndex, 10), to = parseInt(toIndex, 10);
    if (scope === 'shed_modules') {
        const item = site.moduleOrder.splice(from, 1)[0]; site.moduleOrder.splice(to, 0, item);
    } else if (scope === 'accessories') {
        const item = site.accessories.splice(from, 1)[0]; site.accessories.splice(to, 0, item);
    } else if (scope === 'sqft_prim_specs') {
        if (site.sqftPrimSpecs) { const item = site.sqftPrimSpecs.splice(from, 1)[0]; site.sqftPrimSpecs.splice(to, 0, item); }
    } else if (scope === 'civil_items') {
        if (site.civilData[parentCat] && site.civilData[parentCat].items) {
            const item = site.civilData[parentCat].items.splice(from, 1)[0]; site.civilData[parentCat].items.splice(to, 0, item);
        }
    }
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); triggerHaptic(25);
    const isCivilModalOpen = document.getElementById('civilParamModal')?.classList.contains('active');
    if (isCivilModalOpen && parentCat) openCivilParamModal(parentCat);
    else { calcModuleTotals(); refreshLivePdfPreviewSheet(); }
}

// 9. BOOT SPLASH & REPLAY
let bootTimer = null;
function initSamsungBootAnimation() {
    const splash = document.getElementById('appBootSplashScreen'); if (!splash) return;
    triggerHaptic(30); splash.classList.remove('boot-fade-out'); splash.style.display = 'flex';
    if (bootTimer) clearTimeout(bootTimer);
    bootTimer = setTimeout(() => skipBootAnimation(), 2400);
}
function skipBootAnimation() {
    const splash = document.getElementById('appBootSplashScreen'); if (!splash) return;
    if (bootTimer) clearTimeout(bootTimer);
    triggerHaptic(15); splash.classList.add('boot-fade-out');
    setTimeout(() => { splash.style.display = 'none'; }, 600);
}
function replaySamsungBootAnimation() {
    const splash = document.getElementById('appBootSplashScreen'); if (!splash) return;
    splash.style.display = 'flex'; splash.classList.remove('boot-fade-out'); initSamsungBootAnimation();
}

const MASTER_UNITS = ["Ft", "Inch", "R.Ft", "mm", "Mtr", "Sq.Ft", "Sq.Mtr", "Cu.Ft", "Cu.Mtr", "Nos", "Pcs", "Kg", "MT", "Lot", "Set", "Pair", "Box", "Bundle", "Pkt", "Qtl", "Bags", "Rolls", "Sheets", "Hrs", "Days"];
let activeUnitCallback = null;
function openThemeUnitPicker(currentUnit, callback) {
    activeUnitCallback = callback; const container = document.getElementById('unitPickerGrid'); if (!container) return;
    container.innerHTML = "";
    MASTER_UNITS.forEach(u => {
        const isSelected = u.toLowerCase() === (currentUnit || '').toLowerCase();
        container.innerHTML += `<div class="unit-tile ${isSelected ? 'active' : ''} btn-ripple" onclick="selectUnitFromThemeModal('${u}')"><span>${u}</span><span>${isSelected ? '✓' : ''}</span></div>`;
    });
    openModalWithHistory('unitPickerModal');
}
function selectUnitFromThemeModal(u) { if (activeUnitCallback) activeUnitCallback(u); closeUnitPickerModal(); }
function closeUnitPickerModal() { closeModalSafe('unitPickerModal'); }

function getNextQuoteSequenceNumber() {
    let maxSeq = parseInt(appSettings.startingQuoteSeq || 1, 10) - 1;
    sites.forEach(s => {
        if (s.quoteNo) {
            const parts = s.quoteNo.split('/'), lastPart = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(lastPart) && lastPart > maxSeq) maxSeq = lastPart;
        }
    });
    return maxSeq + 1;
}
function saveStartingQuoteSeq(val) {
    const num = parseInt(val, 10); appSettings.startingQuoteSeq = (!isNaN(num) && num > 0) ? num : 1;
    syncDataToCloud('patel_app_settings', appSettings);
}

// 10. PREVIEW SCALING & AUTOFIT
function changePdfScale(delta) {
    let cur = Math.round(((parseFloat(appSettings.savedPdfFontScale) || 1.0) + delta) * 100) / 100;
    appSettings.savedPdfFontScale = Math.min(Math.max(cur, 0.50), 1.60);
    syncDataToCloud('patel_app_settings', appSettings); applyScaleToSheet();
}
function resetPdfScale() {
    appSettings.savedPdfFontScale = 1.0; syncDataToCloud('patel_app_settings', appSettings); applyScaleToSheet();
}
function applyScaleToSheet() {
    const s = parseFloat(appSettings.savedPdfFontScale) || 1.0;
    document.documentElement.style.setProperty('--pdf-font-scale', s);
    const pct = Math.round(s * 100) + '%';
    safeSetText('scaleIndicatorText', pct); safeSetText('civilScaleIndicatorText', pct);
    setTimeout(autoFitPreview, 30);
}

function autoFitPreview() {
    const isDesktop = document.body.classList.contains('mode-desktop');
    const viewport = document.getElementById('viewportWrap'), wrapper = document.getElementById('scalingWrapper'), sheet = document.getElementById('printableA4Sheet');
    if (viewport && wrapper && sheet) {
        const availableWidth = viewport.clientWidth || viewport.offsetWidth;
        if (availableWidth > 0) {
            let baseFit = availableWidth / 746;
            if (baseFit > 1.15 && isDesktop) { baseFit = 1.0; wrapper.style.marginLeft = `${Math.round((availableWidth - 746) / 2)}px`; }
            else { wrapper.style.marginLeft = '0px'; }
            wrapper.style.transformOrigin = 'top left'; wrapper.style.transform = `scale(${baseFit})`;
            const unscaledHeight = sheet.offsetHeight || wrapper.offsetHeight;
            wrapper.style.marginBottom = (baseFit !== 1.0 && unscaledHeight > 0) ? `-${Math.round(unscaledHeight * (1 - baseFit))}px` : '0px';
            if (!isDesktop) { viewport.style.setProperty('height', 'auto', 'important'); viewport.style.setProperty('max-height', 'none', 'important'); viewport.style.setProperty('overflow-y', 'visible', 'important'); }
            else { viewport.style.setProperty('height', '100%', 'important'); viewport.style.setProperty('max-height', 'none', 'important'); viewport.style.setProperty('overflow-y', 'auto', 'important'); }
        }
    }
    const civilVp = document.getElementById('civilViewportWrap'), civilWrap = document.getElementById('civilScalingWrapper'), civilSheet = document.getElementById('civilLiveSheetDisplayBox');
    if (civilVp && civilWrap) {
        const cWidth = civilVp.clientWidth || civilVp.offsetWidth;
        if (cWidth > 0) {
            let cBaseFit = cWidth / 746;
            if (cBaseFit > 1.15 && isDesktop) { cBaseFit = 1.0; civilWrap.style.marginLeft = `${Math.round((cWidth - 746) / 2)}px`; }
            else { civilWrap.style.marginLeft = '0px'; }
            civilWrap.style.transformOrigin = 'top left'; civilWrap.style.transform = `scale(${cBaseFit})`;
            const cUnscaledHeight = (civilSheet && civilSheet.offsetHeight) ? civilSheet.offsetHeight : civilWrap.offsetHeight;
            civilWrap.style.marginBottom = (cBaseFit !== 1.0 && cUnscaledHeight > 0) ? `-${Math.round(cUnscaledHeight * (1 - cBaseFit))}px` : '0px';
            if (!isDesktop) { civilVp.style.setProperty('height', 'auto', 'important'); civilVp.style.setProperty('max-height', 'none', 'important'); civilVp.style.setProperty('overflow-y', 'visible', 'important'); }
            else { civilVp.style.setProperty('height', '100%', 'important'); civilVp.style.setProperty('max-height', 'none', 'important'); civilVp.style.setProperty('overflow-y', 'auto', 'important'); }
        }
    }
}

let resizeObserverInstance = null;
function attachDynamicPreviewObserver() {
    if (window.ResizeObserver && !resizeObserverInstance) {
        resizeObserverInstance = new ResizeObserver(() => autoFitPreview());
        const t1 = document.getElementById('printableA4Sheet'), t2 = document.getElementById('civilLiveSheetDisplayBox');
        if (t1) resizeObserverInstance.observe(t1); if (t2) resizeObserverInstance.observe(t2);
    }
}
window.addEventListener('resize', () => { autoDetectDeviceMode(); autoFitPreview(); });

// 11. CLIENT DIRECTORY & MULTI-QUOTE GROUPING (DIRECT TOUCH CARD - NO OPEN BUTTON)
function getClientGroupKey(s) {
    const name = (s.clientName || '').trim().toLowerCase(), gst = (s.custGST || '').trim().toLowerCase();
    return (name && gst) ? `${name}__${gst}` : (name || 'untitled');
}

function getUniqueSavedClients() {
    const map = new Map();
    sites.forEach(s => {
        const key = getClientGroupKey(s);
        if (!map.has(key) && s.clientName) {
            map.set(key, {
                clientName: s.clientName, custContactPerson: s.custContactPerson || "", custRole: s.custRole || "",
                custNumber1: s.custNumber1 || "", custNumber2: s.custNumber2 || "", custAddress: s.custAddress || "",
                custGST: s.custGST || "", custEmail: s.custEmail || ""
            });
        }
    });
    return Array.from(map.values());
}

let activeClientGroupKey = null;
function openClientQuotationsModal(groupKey) {
    activeClientGroupKey = groupKey;
    const clientQuotes = sites.filter(s => getClientGroupKey(s) === groupKey); if (!clientQuotes.length) return;
    const clientName = clientQuotes[0].clientName || "Client Project", clientGST = clientQuotes[0].custGST || "-";
    safeSetText('clientGroupModalTitle', `📂 Quotations for: ${clientName}`);
    safeSetText('clientGroupModalSubtitle', `GSTIN: ${clientGST} | Total Proposals: ${clientQuotes.length}`);
    const container = document.getElementById('clientGroupQuotesList'); if (!container) return;
    container.innerHTML = "";
    clientQuotes.forEach(site => {
        let modeBadge = '📑 COMBINED (KG)';
        if (site.quoteType === 'civil') modeBadge = '🧱 CIVIL ONLY';
        else if (site.quoteType === 'shed') modeBadge = '⚖️ SHED (KG)';
        else if (site.quoteType === 'shed_sqft') modeBadge = '🏢 SHED (SQ.FT)';
        else if (site.quoteType === 'both_sqft') modeBadge = '📐 COMB. (SQ.FT)';

        container.innerHTML += `
            <div class="client-group-card btn-ripple" onclick="loadSiteToDashboard('${site.id}'); closeModalSafe('clientQuotesModal');" style="cursor:pointer;">
                <div style="flex:1;">
                    <div style="display:flex;gap:6px;align-items:center;">
                        <span style="font-size:10px;font-weight:800;background:#fef3c7;color:#92400e;padding:2px 6px;border-radius:4px;">${site.quoteNo || 'DRAFT'}</span>
                        <span style="font-size:9.5px;font-weight:800;background:#dbeafe;color:#1e40af;padding:2px 6px;border-radius:4px;">${modeBadge}</span>
                    </div>
                    <strong style="font-size:13px;color:#0f172a;display:block;margin-top:3px;">📍 ${site.custAddress || 'Site Location'}</strong>
                    <span style="font-size:11px;color:#000;font-weight:700;">Contact: ${site.custContactPerson || '-'} (${site.custNumber1 || '-'})</span>
                </div>
                <div style="display:flex;gap:6px;align-items:center;">
                    <button class="btn-site-delete btn-ripple" onclick="event.stopPropagation();triggerCustomDelete('${site.id}','${site.clientName}');">🗑️</button>
                </div>
            </div>`;
    });
    openModalWithHistory('clientQuotesModal');
}

function createNewQuoteForCurrentGroup() {
    if (!activeClientGroupKey) return;
    const clientQuotes = sites.filter(s => getClientGroupKey(s) === activeClientGroupKey);
    closeModalSafe('clientQuotesModal'); openCreateSiteScreen();
    if (clientQuotes.length > 0) {
        const c = clientQuotes[0];
        safeSetVal('custName', c.clientName || ''); safeSetVal('custContactPerson', c.custContactPerson || '');
        safeSetVal('custRole', c.custRole || ''); safeSetVal('custNumber1', c.custNumber1 || '');
        safeSetVal('custNumber2', c.custNumber2 || ''); safeSetVal('custAddress', c.custAddress || '');
        safeSetVal('custGST', c.custGST || ''); safeSetVal('custEmail', c.custEmail || '');
        showCorporateToast(`Creating repeat quote for "${c.clientName}"`, "➕");
    }
}

// 12. HOMEPAGE (DIRECT TOUCH TO OPEN - NO "OPEN ➔" BUTTON)
let tempNewQuoteType = 'both';
function setNewSiteQuoteType(type) {
    tempNewQuoteType = type;
    document.querySelectorAll('#createQuoteTypeGrid .quote-type-card').forEach(c => c.classList.remove('active'));
    document.getElementById('cardQuoteType_' + type)?.classList.add('active');
}

function renderHomeScreen() {
    safeSetText('appLogoName', appSettings.ownerName || "PATEL ENGINEERING");
    safeSetText('statTotalSites', sites.length); safeSetText('statActiveQuotes', sites.length);
    if (appSettings.logoData) safeSetHtml('appLogoBadge', `<img src="${appSettings.logoData}" alt="Logo">`);
    const container = document.getElementById('sitesListContainer'); if (!container) return;
    container.innerHTML = "";
    if (sites.length === 0) {
        container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:#000;"><p style="font-size:38px;margin-bottom:8px;">🏢</p><p style="font-weight:900;color:#000;">No proposals found.</p><p style="font-size:12.5px;margin-top:4px;font-weight:700;">Click the top button to create a new quotation.</p></div>`;
        return;
    }
    const clientGroups = {};
    sites.forEach(s => {
        const key = getClientGroupKey(s);
        if (!clientGroups[key]) clientGroups[key] = [];
        clientGroups[key].push(s);
    });
    Object.keys(clientGroups).forEach(groupKey => {
        const group = clientGroups[groupKey];
        if (group.length === 1) {
            const site = group[0], sqft = ((parseFloat(site.dimW) || 0) * (parseFloat(site.dimL) || 0));
            let modeBadge = '📑 COMBINED (KG)';
            if (site.quoteType === 'civil') modeBadge = '🧱 CIVIL ONLY';
            else if (site.quoteType === 'shed') modeBadge = '⚖️ SHED (KG)';
            else if (site.quoteType === 'shed_sqft') modeBadge = '🏢 SHED (SQ.FT)';
            else if (site.quoteType === 'both_sqft') modeBadge = '📐 COMB. (SQ.FT)';

            // DIRECT TOUCH CARD - NO OPEN BUTTON
            container.innerHTML += `
                <div class="card card-3d btn-ripple" onclick="loadSiteToDashboard('${site.id}')" style="cursor:pointer;user-select:none;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="flex:1;padding-right:10px;">
                            <div style="display:flex;gap:6px;align-items:center;">
                                <span style="font-size:10px;font-weight:900;color:#92400e;background:#fef3c7;padding:2px 7px;border-radius:4px;">${site.quoteNo || 'DRAFT'}</span>
                                <span style="font-size:9.5px;font-weight:900;color:#1e40af;background:#dbeafe;padding:2px 6px;border-radius:4px;">${modeBadge}</span>
                            </div>
                            <h3 style="font-size:15px;font-weight:900;color:#000;margin-top:5px;">${site.clientName || 'Untitled Client'}</h3>
                            <p style="font-size:12px;color:#000;font-weight:700;margin-top:2px;">📍 ${site.custAddress || 'Project Site'}</p>
                            ${site.quoteType !== 'civil' ? `<p style="font-size:11.5px;font-weight:900;color:#0c1e30;margin-top:3px;">Area: ${sqft > 0 ? sqft.toLocaleString('en-IN') + ' Sq.Ft' : '-'}</p>` : ''}
                        </div>
                        <div style="display:flex;gap:6px;align-items:center;">
                            <button class="btn-site-delete btn-ripple" onclick="event.stopPropagation();triggerCustomDelete('${site.id}','${site.clientName}')">🗑️</button>
                        </div>
                    </div>
                </div>`;
        } else {
            const leadSite = group[0];
            container.innerHTML += `
                <div class="card card-3d btn-ripple" onclick="openClientQuotationsModal('${groupKey}')" style="cursor:pointer;border-left:5px solid #2563eb !important;background:linear-gradient(135deg,#ffffff 0%,#f0f7ff 100%);user-select:none;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="flex:1;padding-right:10px;">
                            <div style="display:flex;gap:6px;align-items:center;">
                                <span style="font-size:10px;font-weight:900;color:#ffffff;background:#2563eb;padding:2px 8px;border-radius:4px;">📂 ${group.length} PROPOSALS</span>
                                ${leadSite.custGST ? `<span style="font-size:9.5px;font-weight:900;color:#0f172a;background:#e2e8f0;padding:2px 6px;border-radius:4px;">GST: ${leadSite.custGST}</span>` : ''}
                            </div>
                            <h3 style="font-size:15px;font-weight:900;color:#0c1e30;margin-top:5px;">${leadSite.clientName}</h3>
                            <p style="font-size:12px;color:#000;font-weight:700;margin-top:2px;">📍 ${leadSite.custAddress || 'Project Client'}</p>
                            <p style="font-size:11.5px;font-weight:900;color:#2563eb;margin-top:3px;">Tap to view all ${group.length} quotations</p>
                        </div>
                    </div>
                </div>`;
        }
    });
}

let pendingDeleteId = null;
function triggerCustomDelete(siteId, clientName) {
    pendingDeleteId = siteId; safeSetText('confirmTitle', "Delete Quotation?"); safeSetText('confirmDesc', `Permanently delete "${clientName || 'this proposal'}"?`);
    openModalWithHistory('customConfirmModal');
}
function resolveCustomConfirm(isConfirmed) {
    if (isConfirmed && pendingDeleteId) {
        sites = sites.filter(s => s.id !== pendingDeleteId);
        syncDataToCloud('patel_app_sites', sites); renderHomeScreen(); loadPhoneSettingsUI(); showCorporateToast("Quotation deleted successfully", "🗑️");
        if (activeClientGroupKey) openClientQuotationsModal(activeClientGroupKey);
    }
    pendingDeleteId = null; closeModalSafe('customConfirmModal');
}

function openCreateSiteScreen() {
    safeSetVal('custName', ""); safeSetVal('custContactPerson', ""); safeSetVal('custRole', ""); safeSetVal('custNumber1', "");
    safeSetVal('custNumber2', ""); safeSetVal('custAddress', ""); safeSetVal('custGST', ""); safeSetVal('custEmail', "");
    setNewSiteQuoteType('both'); openScreen('screenCreateSite');
}

function saveNewBlankSiteAndOpen() {
    const clientNameInput = (document.getElementById('custName')?.value || "").trim();
    if (!clientNameInput) return showAppAlert("⚠️ Client Name Required", "Please enter Client Name.");
    const currentYear = new Date().getFullYear(), nextSeq = getNextQuoteSequenceNumber(), autoQuoteNumber = "PE/" + currentYear + "/" + nextSeq;
    const bp = JSON.parse(JSON.stringify(masterBlueprint)), sqBp = JSON.parse(JSON.stringify(sqftMasterBlueprint));

    const newSite = {
        id: 'site_' + Date.now(), clientName: clientNameInput,
        custContactPerson: (document.getElementById('custContactPerson')?.value || "").trim(),
        custRole: (document.getElementById('custRole')?.value || "").trim(), quoteNo: autoQuoteNumber, quoteType: tempNewQuoteType,
        custNumber1: (document.getElementById('custNumber1')?.value || "").trim(), custNumber2: (document.getElementById('custNumber2')?.value || "").trim(),
        custAddress: (document.getElementById('custAddress')?.value || "").trim() || "", custGST: (document.getElementById('custGST')?.value || "").trim(),
        custEmail: (document.getElementById('custEmail')?.value || "").trim(), selectedTaxId: "gst18_split", civilSelectedTaxId: "gst18_split",
        rateOnlyMode: false, civilRateOnlyMode: false,
        civilEnabled: hasCivilMode({ quoteType: tempNewQuoteType }), shedEnabled: hasShedMode({ quoteType: tempNewQuoteType }),
        dimW: "", dimL: "", dimH: "", shedSqftRate: "",
        sqftScopeDesc: sqBp.sqftScopeDesc || "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - SQ.FT BASIS",
        sqftTableDesc: sqBp.sqftTableDesc || "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:",
        sqftPrimSpecs: JSON.parse(JSON.stringify(sqBp.primSpecs || [])),
        sqftAccessories: JSON.parse(JSON.stringify(sqBp.accessories || [])),
        primEnabled: true, secEnabled: true, cladEnabled: true, accEnabled: true, erectEnabled: true,
        foundEnabled: true, brickEnabled: true, floorEnabled: true, primCustomLine: bp.primCustomLine,
        primSpecs: bp.primSpecs ? JSON.parse(JSON.stringify(bp.primSpecs)) : [], primWeight: "", primRate: "", primUnit: bp.primUnit || "Kg",
        secCustomLine: bp.secCustomLine, secSpecs: bp.secSpecs ? JSON.parse(JSON.stringify(bp.secSpecs)) : [], secWeight: "", secRate: "", secUnit: bp.secUnit || "Kg",
        cladCustomLine: bp.cladCustomLine, cladThickness: bp.cladThickness || "", cladSqFt: "", cladRate: "", cladUnit: bp.cladUnit || "Sq.Ft",
        accCustomLine: bp.accCustomLine, accessories: (bp.accessories || []).map(a => ({ name: a.name, qty: "", unit: a.unit, rate: "", selected: a.selected !== false })),
        erectCustomLine: bp.erectCustomLine, erectSpecs: bp.erectSpecs ? JSON.parse(JSON.stringify(bp.erectSpecs)) : [], erectRate: "", erectUnit: bp.erectUnit || "Kg",
        moduleOrder: bp.moduleOrder ? [...bp.moduleOrder] : ['prim', 'sec', 'clad', 'acc', 'erect'],
        customModules: (bp.customModules || []).map(m => ({ ...m, qty: "", rate: "", total: 0 })), civilScopeDesc: bp.civilScopeDesc,
        civilData: bp.civilData ? JSON.parse(JSON.stringify(bp.civilData)) : {},
        civilCustomCategories: (bp.civilCustomCategories || []).map(c => ({
            ...c, enabled: true, items: (c.items || []).map(it => ({ ...it, qty: "", rate: "", total: 0, enabled: it.enabled !== false }))
        }))
    };

    ['foundation', 'brickWall', 'flooring'].forEach(sec => {
        if (newSite.civilData[sec] && newSite.civilData[sec].items) newSite.civilData[sec].items.forEach(it => { it.qty = ""; it.rate = ""; });
    });

    sites.unshift(newSite); syncDataToCloud('patel_app_sites', sites);
    renderHomeScreen(); loadPhoneSettingsUI(); loadSiteToDashboard(newSite.id); showCorporateToast(`New Proposal ${autoQuoteNumber} created!`);
}

function getCurrentSite() { return sites.find(s => s.id === currentSiteId); }

function loadSiteToDashboard(siteId) {
    currentSiteId = siteId; const site = getCurrentSite(); if (!site) return;
    if (!site.moduleOrder) site.moduleOrder = ['prim', 'sec', 'clad', 'acc', 'erect'];
    if (!site.customModules) site.customModules = [];
    if (!site.quoteType) site.quoteType = 'both';
    if (site.civilRateOnlyMode === undefined) site.civilRateOnlyMode = false;
    site.civilEnabled = hasCivilMode(site); site.shedEnabled = hasShedMode(site);

    ['prim', 'sec', 'clad', 'acc', 'erect'].forEach(k => { if (site[k + 'Enabled'] === undefined) site[k + 'Enabled'] = true; });
    if (site.foundEnabled === undefined) site.foundEnabled = true;
    if (site.brickEnabled === undefined) site.brickEnabled = true;
    if (site.floorEnabled === undefined) site.floorEnabled = true;

    if (!site.sqftScopeDesc) site.sqftScopeDesc = appSettings.sqftPdfScopeTitle || sqftMasterBlueprint.sqftScopeDesc || "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - SQ.FT BASIS";
    if (!site.sqftTableDesc) site.sqftTableDesc = appSettings.sqftHeaderLine1 || sqftMasterBlueprint.sqftTableDesc || "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:";
    if (!site.sqftPrimSpecs) site.sqftPrimSpecs = JSON.parse(JSON.stringify(sqftMasterBlueprint.primSpecs || []));
    if (!site.sqftAccessories) site.sqftAccessories = JSON.parse(JSON.stringify(sqftMasterBlueprint.accessories || []));

    if (!site.civilScopeDesc) site.civilScopeDesc = masterBlueprint.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS";
    if (!site.selectedTaxId) site.selectedTaxId = "gst18_split";
    if (!site.civilSelectedTaxId) site.civilSelectedTaxId = "gst18_split";
    ensureCivilDataOnSite(site);
    if (!site.civilCustomCategories) site.civilCustomCategories = [];

    safeSetText('dashSiteName', site.clientName || "Untitled Client");
    safeSetText('dashQuoteNo', site.quoteNo + (site.custAddress ? (" | " + site.custAddress) : ""));
    safeSetVal('dimW', site.dimW || ""); safeSetVal('dimL', site.dimL || ""); safeSetVal('dimH', site.dimH || "");
    safeSetVal('shedSqftRateInput', site.shedSqftRate || "");

    const isSqft = isSqftMode(site);
    const sqftRateRow = document.getElementById('shedSqftRateInputRow');
    const secCard = document.getElementById('cardModSec');
    const addPrimBtn = document.getElementById('btnPreviewAddSqftPrimItem');

    if (sqftRateRow) sqftRateRow.style.display = isSqft ? 'block' : 'none';
    if (secCard) secCard.style.display = isSqft ? 'none' : 'flex';
    if (addPrimBtn) addPrimBtn.style.display = isSqft ? 'inline-block' : 'none';

    updatePillTogglesUI(); updateModulePillBadgesUI(); updateCivilModulePillBadgesUI(); updateTaxDisplay();
    updateHeaderBannersUI(); renderCustomModulesDashboardList(); renderCivilCustomCategoriesUI();
    renderDynamicPdfActionsBar(); calcModuleTotals(); applyCustomButtonNamesUI(); refreshLivePdfPreviewSheet();

    if (site.quoteType === 'civil') openCivilDashboardScreen(); else openScreen('screenSiteDashboard');
    setTimeout(attachDynamicPreviewObserver, 150);
}

// 13. EDIT CUSTOMER & DESCRIPTIONS
let tempEditQuoteType = 'both';
function openEditCustomerModal() {
    const site = getCurrentSite(); if (!site) return;
    safeSetVal('editCustName', site.clientName || ""); safeSetVal('editCustContactPerson', site.custContactPerson || "");
    safeSetVal('editCustRole', site.custRole || ""); safeSetVal('editCustNumber1', site.custNumber1 || "");
    safeSetVal('editCustNumber2', site.custNumber2 || ""); safeSetVal('editCustAddress', site.custAddress || "");
    safeSetVal('editCustGST', site.custGST || ""); safeSetVal('editCustEmail', site.custEmail || "");
    setEditSiteQuoteType(site.quoteType || 'both'); openModalWithHistory('editCustomerModal');
}
function closeEditCustomerModal() { closeModalSafe('editCustomerModal'); }

function setEditSiteQuoteType(type) {
    tempEditQuoteType = type;
    document.querySelectorAll('#editQuoteTypeGrid .quote-type-card').forEach(c => c.classList.remove('active'));
    document.getElementById('editCardQuoteType_' + type)?.classList.add('active');
}

function saveEditCustomerDetails() {
    const site = getCurrentSite(); if (!site) return;
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
    site.civilEnabled = hasCivilMode(site); site.shedEnabled = hasShedMode(site);

    syncDataToCloud('patel_app_sites', sites);
    safeSetText('dashSiteName', site.clientName); safeSetText('dashQuoteNo', site.quoteNo + (site.custAddress ? (" | " + site.custAddress) : ""));
    safeSetText('civilDashSiteName', site.clientName); safeSetText('civilDashQuoteNo', site.quoteNo);

    const isSqft = isSqftMode(site);
    const sqftRateRow = document.getElementById('shedSqftRateInputRow');
    const secCard = document.getElementById('cardModSec');
    const addPrimBtn = document.getElementById('btnPreviewAddSqftPrimItem');

    if (sqftRateRow) sqftRateRow.style.display = isSqft ? 'block' : 'none';
    if (secCard) secCard.style.display = isSqft ? 'none' : 'flex';
    if (addPrimBtn) addPrimBtn.style.display = isSqft ? 'inline-block' : 'none';

    updatePillTogglesUI(); renderDynamicPdfActionsBar(); calcModuleTotals(); refreshLivePdfPreviewSheet(); closeEditCustomerModal();
    if (site.quoteType === 'civil') openCivilDashboardScreen(); else openScreen('screenSiteDashboard');
    showCorporateToast("Quotation & Customer Details Updated!", "👤");
}

// ROBUST LIVE PREVIEW DIRECT SYNC (WRITES IMMEDIATELY & AUTO-SAVES)
function syncPreviewCustEdit(field, el) {
    const site = getCurrentSite(); if (!site) return;
    site[field] = el.innerText.trim();
    syncDataToCloud('patel_app_sites', sites);
    safeSetText('dashSiteName', site.clientName); safeSetText('civilDashSiteName', site.clientName);
}
function syncPreviewRibbonTitle(el) {
    const site = getCurrentSite(); if (!site) return;
    const txt = el.innerText.trim();
    if (isSqftMode(site)) { appSettings.sqftPdfRibbonTitle = txt; syncDataToCloud('patel_app_settings', appSettings); }
    else { appSettings.pdfRibbonTitle = txt; syncDataToCloud('patel_app_settings', appSettings); }
}
function syncPreviewScopeDescLive(el) {
    const site = getCurrentSite(); if (!site) return;
    const txt = el.innerText.trim();
    if (isSqftMode(site)) { site.sqftScopeDesc = txt; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); }
    else { site.primCustomLine = txt; syncDataToCloud('patel_app_sites', sites); }
}
function syncPreviewTableDescLive(el) {
    const site = getCurrentSite(); if (!site) return;
    const txt = el.innerText.trim();
    if (isSqftMode(site)) { site.sqftTableDesc = txt; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); }
    else { appSettings.headerLine2 = txt; syncDataToCloud('patel_app_settings', appSettings); }
}
function syncSqftPrimNameLive(idx, el) {
    const site = getCurrentSite(); if (!site?.sqftPrimSpecs || !site.sqftPrimSpecs[idx]) return;
    site.sqftPrimSpecs[idx].text = el.innerText.trim();
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site);
}
function syncSqftPrimDimLive(idx, field, el) {
    const site = getCurrentSite(); if (!site?.sqftPrimSpecs || !site.sqftPrimSpecs[idx]) return;
    site.sqftPrimSpecs[idx][field] = el.innerText.trim();
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site);
}
function syncSqftAccLive(idx, el) {
    const site = getCurrentSite(); if (!site?.sqftAccessories || !site.sqftAccessories[idx]) return;
    site.sqftAccessories[idx].name = el.innerText.trim();
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site);
}

// 14. CIVIL DATA & TOGGLES
function ensureCivilDataOnSite(site) {
    if (!site.civilData) site.civilData = JSON.parse(JSON.stringify(masterBlueprint.civilData));
    ['foundation', 'brickWall', 'flooring'].forEach(sec => {
        if (!site.civilData[sec]) site.civilData[sec] = JSON.parse(JSON.stringify(masterBlueprint.civilData[sec]));
        if (!site.civilData[sec].items) site.civilData[sec].items = JSON.parse(JSON.stringify(masterBlueprint.civilData[sec].items));
        site.civilData[sec].items.forEach(it => {
            if (it.enabled === undefined) it.enabled = true;
            if (it.qty === undefined) it.qty = "";
            if (it.rate === undefined) it.rate = "";
        });
    });
}

function renderDynamicPdfActionsBar() {
    const site = getCurrentSite(), bar = document.getElementById('dynamicPdfDownloadActionsBar'); if (!bar || !site) return;
    bar.innerHTML = "";
    if (site.quoteType === 'both' || site.quoteType === 'both_sqft') {
        bar.innerHTML = `
            <button class="btn-main btn-3d-main btn-ripple" style="flex:2;padding:13px;" onclick="downloadPDFDirectly('both')"><span style="font-size:17px;">📑</span> COMBINED PDF</button>
            <button class="btn-secondary btn-3d-secondary btn-ripple" style="flex:1;justify-content:center;padding:13px;font-weight:900;" onclick="downloadPDFDirectly('civil')">🧱 Civil Only</button>
            <button class="btn-secondary btn-3d-secondary btn-ripple" style="flex:1;justify-content:center;padding:13px;font-weight:900;" onclick="downloadPDFDirectly('shed')">🏢 Shed Only</button>`;
    } else if (site.quoteType === 'civil') {
        bar.innerHTML = `<button class="btn-main btn-3d-green btn-ripple" style="width:100%;padding:14px;" onclick="downloadPDFDirectly('civil')"><span style="font-size:18px;">⬇️</span> DOWNLOAD CIVIL PDF</button>`;
    } else {
        bar.innerHTML = `<button class="btn-main btn-3d-main btn-ripple" style="width:100%;padding:14px;" onclick="downloadPDFDirectly('shed')"><span style="font-size:18px;">⬇️</span> DOWNLOAD SHED PDF</button>`;
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
    const site = getCurrentSite(); if (!site) return;
    site[modKey + 'Enabled'] = !site[modKey + 'Enabled'];
    syncDataToCloud('patel_app_sites', sites); updateModulePillBadgesUI(); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function updateModulePillBadgesUI() {
    const site = getCurrentSite(); if (!site) return;
    const setBadge = (id, cardId, isEnabled) => {
        const badge = document.getElementById(id), card = document.getElementById(cardId);
        if (badge) { badge.innerText = isEnabled ? "ON" : "OFF"; badge.className = "mod-switch-pill " + (isEnabled ? "on" : ""); }
        if (card) { if (!isEnabled) card.classList.add('disabled-mod'); else card.classList.remove('disabled-mod'); }
    };
    setBadge('badgePrimStatus', 'cardModPrim', site.primEnabled !== false);
    setBadge('badgeSecStatus', 'cardModSec', site.secEnabled !== false);
    setBadge('badgeCladStatus', 'cardModClad', site.cladEnabled !== false);
    setBadge('badgeAccStatus', 'cardModAcc', site.accEnabled !== false);
    setBadge('badgeErectStatus', 'cardModErect', site.erectEnabled !== false);
}

function toggleCivilModuleActiveState(secKey) {
    const site = getCurrentSite(); if (!site) return;
    if (secKey === 'foundation') site.foundEnabled = !site.foundEnabled;
    else if (secKey === 'brickWall') site.brickEnabled = !site.brickEnabled;
    else if (secKey === 'flooring') site.floorEnabled = !site.floorEnabled;
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site);
    updateCivilModulePillBadgesUI(); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function updateCivilModulePillBadgesUI() {
    const site = getCurrentSite(); if (!site) return;
    const setCivBadge = (badgeId, cardId, isEnabled) => {
        const badge = document.getElementById(badgeId), card = document.getElementById(cardId);
        if (badge) { badge.innerText = isEnabled ? "ON" : "OFF"; badge.className = "mod-switch-pill " + (isEnabled ? "on" : ""); }
        if (card) { if (!isEnabled) card.classList.add('disabled-mod'); else card.classList.remove('disabled-mod'); }
    };
    setCivBadge('badgeCivFoundStatus', 'cardCivFound', site.foundEnabled !== false);
    setCivBadge('badgeCivBrickStatus', 'cardCivBrick', site.brickEnabled !== false);
    setCivBadge('badgeCivFloorStatus', 'cardCivFloor', site.floorEnabled !== false);
}

function toggleRateOnlyMode() {
    const site = getCurrentSite(); if (!site) return;
    site.rateOnlyMode = !site.rateOnlyMode; syncDataToCloud('patel_app_sites', sites);
    updatePillTogglesUI(); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function toggleCivilRateOnlyMode() {
    const site = getCurrentSite(); if (!site) return;
    site.civilRateOnlyMode = !site.civilRateOnlyMode; syncDataToCloud('patel_app_sites', sites);
    updatePillTogglesUI(); refreshLivePdfPreviewSheet();
}
function updatePillTogglesUI() {
    const site = getCurrentSite(); if (!site) return;
    const isBoth = (site.quoteType === 'both' || site.quoteType === 'both_sqft');
    const btnRate = document.getElementById('pillBtnRateMode'), txtRate = document.getElementById('pillTxtRateMode');
    const btnCivRate = document.getElementById('pillBtnCivilRateMode'), txtCivRate = document.getElementById('pillTxtCivilRateMode');
    const boxCiv = document.getElementById('civilSectionsContainer');
    if (btnRate && txtRate) { btnRate.classList.toggle('active', !!site.rateOnlyMode); txtRate.innerText = site.rateOnlyMode ? "Shed Rates (ON)" : "Shed BOQ"; }
    if (btnCivRate && txtCivRate) {
        btnCivRate.classList.toggle('active', !!site.civilRateOnlyMode); txtCivRate.innerText = site.civilRateOnlyMode ? "Civil Rates (ON)" : "Civil BOQ";
        btnCivRate.style.display = isBoth ? 'flex' : 'none';
    }
    if (boxCiv) boxCiv.style.display = isBoth ? 'block' : 'none';
    const civPillCivRate = document.getElementById('pillBtnCivilScreenCivRateMode'), civTxtCivRate = document.getElementById('pillTxtCivilScreenCivRateMode');
    if (civPillCivRate && civTxtCivRate) {
        civPillCivRate.classList.toggle('active', !!site.civilRateOnlyMode); civTxtCivRate.innerText = site.civilRateOnlyMode ? "Civil Rates (ON)" : "Civil BOQ";
    }
}

// 15. CIVIL DASHBOARD
function openCivilDashboardScreen() {
    const site = getCurrentSite(); if (!site) return;
    safeSetText('civilDashSiteName', site.clientName || "Untitled Client");
    safeSetText('civilDashQuoteNo', site.quoteNo || "#PE/2026/01");
    safeSetText('civilScopeDescPreviewTxt', site.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS");
    renderCivilCustomCategoriesUI(); updatePillTogglesUI(); updateCivilModulePillBadgesUI(); updateTaxDisplay();
    updateHeaderBannersUI(); calcModuleTotals(); openScreen('screenCivilDashboard');
    setTimeout(() => { refreshLivePdfPreviewSheet(); syncCivilLivePreviewBox(); autoFitPreview(); }, 80);
}

function syncCivilLivePreviewBox() {
    const pSheet = document.getElementById('printableA4Sheet'), civilLiveBox = document.getElementById('civilLiveSheetDisplayBox');
    if (pSheet && civilLiveBox) {
        civilLiveBox.innerHTML = ""; const clone = pSheet.cloneNode(true);
        clone.id = 'printableA4Sheet_civilDisplayMirror'; clone.style.display = 'flow-root';
        const cloneShed = clone.querySelector('#page1MsStructure');
        const cloneCivil = clone.querySelector('#civilDedicatedPageSheet');
        const cloneGap = clone.querySelector('#civilPageGapDivider');
        const site = getCurrentSite();

        if (cloneCivil) cloneCivil.style.setProperty('display', 'flow-root', 'important');
        if (site && site.quoteType === 'civil') {
            if (cloneShed) cloneShed.remove(); if (cloneGap) cloneGap.remove();
        } else if (site && (site.quoteType === 'shed' || site.quoteType === 'shed_sqft')) {
            if (cloneCivil) cloneCivil.remove(); if (cloneGap) cloneGap.remove();
        } else {
            if (!hasShedMode(site) && cloneShed) cloneShed.remove();
            if (!hasCivilMode(site) && cloneCivil) cloneCivil.remove();
            if ((!hasShedMode(site) || !hasCivilMode(site)) && cloneGap) cloneGap.remove();
        }
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
    const site = getCurrentSite(); if (!site) return;
    const nw = (document.getElementById('inp_civilScopeDescModal')?.value || "").trim();
    site.civilScopeDesc = nw; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site);
    safeSetText('civilScopeDescPreviewTxt', nw); closeCivilScopeModal(); refreshLivePdfPreviewSheet();
    setTimeout(() => openCivilDashboardScreen(), 50);
}

// 16. CIVIL PARAMETERS MODAL
let activeCivilModalType = null;
function openCivilParamModal(type) {
    activeCivilModalType = type; const site = getCurrentSite(); if (!site) return;
    ensureCivilDataOnSite(site);
    const container = document.getElementById('civilModalRowsContainer'), title = document.getElementById('civilModalTitle');
    if (!container || !title) return;
    const secData = site.civilData[type];
    title.innerHTML = `🧱 <input type="text" class="modal-title-edit" value="${secData.title}" oninput="updateCivilSecTitle('${type}',this.value)">`;

    let html = "";
    (secData.items || []).forEach((item, idx) => {
        const isSelected = item.enabled !== false, lineTotal = isSelected ? ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)) : 0;
        html += `
            <div class="civil-calc-card card-3d sortable-item ${isSelected ? '' : 'disabled-mod'}" id="civCard_${type}_${idx}" data-sort-index="${idx}">
                <div class="acc-top-row">
                    <div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;" onclick="toggleCivilItemTick('${type}',${idx})">
                        <span class="drag-handle" id="handle_civ_${type}_${idx}" onclick="event.stopPropagation()" title="Drag to reorder">⋮⋮</span>
                        <div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation();toggleCivilItemTick('${type}',${idx})">${isSelected ? '✓' : ''}</div>
                        <strong style="font-size:12px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${idx + 1}. ${item.name}</strong>
                    </div>
                    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                        <span class="acc-total-pill">${lineTotal > 0 ? '₹ ' + Math.round(lineTotal).toLocaleString('en-IN') : (isSelected ? '-' : 'OFF')}</span>
                        <button type="button" class="btn-del-pro btn-ripple" onclick="deleteCivilItem('${type}',${idx})">🗑️</button>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:8px;"><label>Item Description</label><input type="text" value="${item.name}" oninput="updateCivilItemField('${type}',${idx},'name',this.value)"></div>
                <div class="row-3">
                    <div class="form-group" style="margin:0;"><label>Qty / Area</label><input type="number" inputmode="decimal" step="any" placeholder="-" value="${item.qty || ''}" oninput="updateCivilItemField('${type}',${idx},'qty',this.value)"></div>
                    <div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPicker('${item.unit}',(u)=>{updateCivilItemField('${type}',${idx},'unit',u);openCivilParamModal('${type}');})">${item.unit || 'Lot'} ▾</button></div>
                    <div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" placeholder="-" value="${item.rate || ''}" oninput="updateCivilItemField('${type}',${idx},'rate',this.value)"></div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
    (secData.items || []).forEach((_, idx) => {
        const row = document.getElementById(`civCard_${type}_${idx}`), handle = document.getElementById(`handle_civ_${type}_${idx}`);
        if (row && handle) setupUniversalReorder(row, handle, 'civil_items', idx, type);
    });
    openModalWithHistory('civilParamModal');
}

function toggleCivilItemTick(type, idx) {
    const site = getCurrentSite(); if (!site?.civilData[type]?.items[idx]) return;
    site.civilData[type].items[idx].enabled = !(site.civilData[type].items[idx].enabled !== false);
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site);
    openCivilParamModal(type); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function deleteCivilItem(type, idx) {
    const site = getCurrentSite(); if (!site?.civilData[type]?.items) return;
    site.civilData[type].items.splice(idx, 1);
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site);
    openCivilParamModal(type); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function updateCivilSecTitle(section, val) {
    const site = getCurrentSite(); if (!site) return;
    site.civilData[section].title = val; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet();
}
function updateCivilItemField(section, idx, field, val) {
    const site = getCurrentSite(); if (!site?.civilData[section]?.items[idx]) return;
    site.civilData[section].items[idx][field] = val;
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function addCivilRowDirectly(secKey) {
    const site = getCurrentSite(); if (!site) return;
    ensureCivilDataOnSite(site); const targetList = site.civilData[secKey].items;
    targetList.push({ id: 'citem_' + Date.now(), name: "New Civil Work Item #" + (targetList.length + 1), qty: "", unit: "Lot", rate: "", enabled: true });
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function addCustomRowToActiveCivilSection() { if (!activeCivilModalType) return; addCivilRowDirectly(activeCivilModalType); openCivilParamModal(activeCivilModalType); }
function closeCivilParamModal() { closeModalSafe('civilParamModal'); calcModuleTotals(); refreshLivePdfPreviewSheet(); setTimeout(() => openCivilDashboardScreen(), 50); }

// 17. UNIVERSAL MODULE ADDER
let universalModMode = 'shed', universalModUnit = 'Lot';
function openAddUniversalModuleModal(mode) {
    universalModMode = mode; universalModUnit = 'Lot';
    safeSetText('universalModHeading', mode === 'civil' ? "➕ Add Civil Module" : "➕ Add Custom Module");
    safeSetVal('umod_title', ""); safeSetVal('umod_desc', ""); safeSetVal('umod_qty', ""); safeSetVal('umod_rate', "");
    safeSetText('btn_umod_unit', "Lot ▾"); recalcUmodPreviewAmount(); openModalWithHistory('universalModuleModal');
}
function recalcUmodPreviewAmount() {
    const q = parseFloat(document.getElementById('umod_qty')?.value) || 0, r = parseFloat(document.getElementById('umod_rate')?.value) || 0;
    safeSetText('umodCalculatedAmtText', (q * r) > 0 ? '₹ ' + Math.round(q * r).toLocaleString('en-IN') : '-');
}
function openThemeUnitPickerForUniversalMod() {
    openThemeUnitPicker(universalModUnit, (u) => { universalModUnit = u; safeSetText('btn_umod_unit', u + " ▾"); });
}
function closeUniversalModuleModal() { closeModalSafe('universalModuleModal'); }
function saveUniversalModule() {
    const site = getCurrentSite(); if (!site) return;
    const title = (document.getElementById('umod_title')?.value || "").trim();
    if (!title) return showAppAlert("⚠️ Required", "Please enter Module Title!");
    const descVal = (document.getElementById('umod_desc')?.value || "").trim();
    const qtyRaw = document.getElementById('umod_qty')?.value || "", rateRaw = document.getElementById('umod_rate')?.value || "";
    const qtyVal = parseFloat(qtyRaw) || 0, rateVal = parseFloat(rateRaw) || 0, totalVal = qtyVal * rateVal;

    if (universalModMode === 'civil') {
        if (!site.civilCustomCategories) site.civilCustomCategories = [];
        site.civilCustomCategories.push({
            id: 'civcat_' + Date.now(), categoryName: title, enabled: true,
            items: [{ name: descVal || title, qty: qtyRaw, unit: universalModUnit, rate: rateRaw, total: totalVal, enabled: true }]
        });
        renderCivilCustomCategoriesUI();
    } else {
        if (!site.customModules) site.customModules = [];
        const newModId = 'cmod_' + Date.now();
        site.customModules.push({ id: newModId, title, desc: descVal, unit: universalModUnit, qty: qtyRaw, rate: rateRaw, total: totalVal, enabled: true });
        if (!site.moduleOrder) site.moduleOrder = ['prim', 'sec', 'clad', 'acc', 'erect'];
        site.moduleOrder.push(newModId); renderCustomModulesDashboardList();
    }
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site);
    calcModuleTotals(); closeUniversalModuleModal(); refreshLivePdfPreviewSheet(); showCorporateToast(`Module "${title}" Added!`);
}

function renderCivilCustomCategoriesUI() {
    const site = getCurrentSite(), box = document.getElementById('civilCustomCategoriesGrid'); if (!box || !site) return;
    box.innerHTML = "";
    (site.civilCustomCategories || []).forEach((cat, cIdx) => {
        const isEnabled = cat.enabled !== false;
        box.innerHTML += `
            <div class="module-grid-card card-3d-press btn-ripple ${!isEnabled ? 'disabled-mod' : ''}" style="border-left:4px solid #16a34a;">
                <span class="mod-switch-pill ${isEnabled ? 'on' : ''}" onclick="event.stopPropagation();toggleCustomCivilCategoryActive(${cIdx})">${isEnabled ? 'ON' : 'OFF'}</span>
                <div><div class="mod-card-top"><span class="mod-card-icon">🏗️</span><span class="mod-card-title">${4 + cIdx}. ${cat.categoryName}</span></div><span class="mod-card-tag">${(cat.items || []).length} Items</span></div>
                <div style="display:flex;justify-content:space-between;align-items:center;"><span class="mod-card-badge" style="background:#166534;">Configured</span><button class="btn-del-pro btn-ripple" onclick="deleteCustomCivilCategory(${cIdx})">🗑️</button></div>
            </div>`;
    });
}
function toggleCustomCivilCategoryActive(cIdx) {
    const site = getCurrentSite(); if (!site?.civilCustomCategories[cIdx]) return;
    site.civilCustomCategories[cIdx].enabled = !(site.civilCustomCategories[cIdx].enabled !== false);
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); renderCivilCustomCategoriesUI(); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function deleteCustomCivilCategory(cIdx) {
    const site = getCurrentSite(); if (!site?.civilCustomCategories) return;
    site.civilCustomCategories.splice(cIdx, 1);
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); renderCivilCustomCategoriesUI(); calcModuleTotals(); refreshLivePdfPreviewSheet();
}

function renderCustomModulesDashboardList() {
    const site = getCurrentSite(), container = document.getElementById('customModulesListContainer'); if (!container || !site) return;
    container.innerHTML = "";
    (site.customModules || []).forEach((mod, idx) => {
        const amt = (parseFloat(mod.qty) || 0) * (parseFloat(mod.rate) || 0), isEnabled = mod.enabled !== false;
        container.innerHTML += `
            <div class="module-grid-card card-3d-press ${!isEnabled ? 'disabled-mod' : ''} btn-ripple" style="border-left:4px solid var(--header-bg);">
                <span class="mod-switch-pill ${isEnabled ? 'on' : ''}" onclick="event.stopPropagation();toggleCustomModuleActive('${mod.id}')">${isEnabled ? 'ON' : 'OFF'}</span>
                <div><div class="mod-card-top"><span class="mod-card-icon">✨</span><span class="mod-card-title">${6 + idx}. ${mod.title}</span></div><span class="mod-card-tag">${mod.desc || (mod.qty + ' ' + mod.unit + ' @ ₹' + mod.rate)}</span></div>
                <div style="display:flex;justify-content:space-between;align-items:center;"><span class="mod-card-badge">${site.rateOnlyMode ? ('₹ ' + (mod.rate || '-') + '/' + mod.unit) : (amt > 0 ? 'Rs. ' + Math.round(amt).toLocaleString('en-IN') : '-')}</span><button class="btn-del-pro btn-ripple" onclick="event.stopPropagation();deleteCustomModule('${mod.id}')">🗑️</button></div>
            </div>`;
    });
}
function toggleCustomModuleActive(modId) {
    const site = getCurrentSite(), mod = (site?.customModules || []).find(m => m.id === modId);
    if (mod) {
        mod.enabled = !(mod.enabled !== false);
        syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); renderCustomModulesDashboardList(); calcModuleTotals(); refreshLivePdfPreviewSheet();
    }
}
function deleteCustomModule(modId) {
    const site = getCurrentSite(); if (!site) return;
    site.customModules = (site.customModules || []).filter(m => m.id !== modId);
    if (site.moduleOrder) site.moduleOrder = site.moduleOrder.filter(id => id !== modId);
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); renderCustomModulesDashboardList(); calcModuleTotals(); refreshLivePdfPreviewSheet();
}

function autoSaveAndUpdate() {
    const site = getCurrentSite(); if (!site) return;
    site.dimW = document.getElementById('dimW')?.value || ""; 
    site.dimL = document.getElementById('dimL')?.value || ""; 
    site.dimH = document.getElementById('dimH')?.value || "";
    site.shedSqftRate = document.getElementById('shedSqftRateInput')?.value || "";

    const sqft = (parseFloat(site.dimW) || 0) * (parseFloat(site.dimL) || 0);
    safeSetText('dashSqFtText', sqft > 0 ? sqft.toLocaleString('en-IN') + " Sq.Ft" : "0 Sq.Ft");

    if (isSqftMode(site)) {
        const sqRate = parseFloat(site.shedSqftRate) || 0;
        const autoCost = sqft * sqRate;
        safeSetText('shedSqftAutoCostBadge', autoCost > 0 ? "₹ " + Math.round(autoCost).toLocaleString('en-IN') : "-");
        const tax = getActiveTaxSlab('shed');
        const withTaxRate = (tax.rate > 0 && sqRate > 0) ? (sqRate + (sqRate * tax.rate)) : 0;
        safeSetText('shedSqftWithTaxRateBadge', withTaxRate > 0 ? `₹ ${withTaxRate.toFixed(2)} / Sq.Ft` : (sqRate > 0 ? `₹ ${sqRate.toFixed(2)} / Sq.Ft (No Tax)` : "-"));
    }
    syncDataToCloud('patel_app_sites', sites); calcModuleTotals(); refreshLivePdfPreviewSheet();
}

// 18. STRUCTURE MODULE MODALS & UNLIMITED ITEM ADDING FIX
let activeModType = null;
function openModuleModal(type) {
    activeModType = type; const site = getCurrentSite(); if (!site) return;
    const modalTitle = document.getElementById('modModalTitle'), customLineInput = document.getElementById('modalInputCustomLine');
    const inputsBox = document.getElementById('modInputsBox'), checklistTitle = document.getElementById('lblChecklistTitle'), addRowBox = document.getElementById('addItemRowBox');
    const subNotice = document.getElementById('modModalSubNotice');
    safeSetVal('customItemInput', "");
    const isSqft = isSqftMode(site);

    if (type === 'prim') {
        modalTitle.innerHTML = `🏗️ 1. Primary Framing Structure`;
        customLineInput.value = site.primCustomLine || "";
        checklistTitle.innerText = isSqft ? "Member Dimensions & Specifications:" : "Checklist Specifications:";
        checklistTitle.style.display = addRowBox.style.display = 'block';

        if (isSqft) {
            if (subNotice) subNotice.innerText = "Sq.Ft Mode: Overall shed rate applies. Enter Length, Width & Unit for each member.";
            inputsBox.innerHTML = `
                <div style="font-size:11px;font-weight:800;color:#0369a1;background:#e0f2fe;padding:6px 9px;border-radius:6px;border:1px solid #7dd3fc;">
                    ℹ️ Sq.Ft Mode Active: Individual member rates/amounts are excluded. Har member ki Length, Width aur Unit neeche fill karein.
                </div>`;
            renderSqftPrimaryChecklist(site.sqftPrimSpecs || []);
        } else {
            if (subNotice) subNotice.innerText = "Title, header line & specifications control";
            inputsBox.innerHTML = `
                <div class="row-3">
                    <div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPickerForMod('prim')">${site.primUnit || 'Kg'} ▾</button></div>
                    <div class="form-group" style="margin:0;"><label>Weight / Qty</label><input type="number" inputmode="decimal" step="any" id="modalInputWt" value="${site.primWeight}" oninput="autoSaveModuleChanges()"></div>
                    <div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.primRate}" oninput="autoSaveModuleChanges()"></div>
                </div>`;
            renderStandardChecklist(site.primSpecs);
        }
    } else if (type === 'sec') {
        modalTitle.innerHTML = `⚙️ 2. Secondary Framing`; customLineInput.value = site.secCustomLine || "";
        checklistTitle.innerText = "Specifications:"; checklistTitle.style.display = addRowBox.style.display = 'block';
        inputsBox.innerHTML = `
            <div class="row-3">
                <div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPickerForMod('sec')">${site.secUnit || 'Kg'} ▾</button></div>
                <div class="form-group" style="margin:0;"><label>Weight / Qty</label><input type="number" inputmode="decimal" step="any" id="modalInputWt" value="${site.secWeight}" oninput="autoSaveModuleChanges()"></div>
                <div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.secRate}" oninput="autoSaveModuleChanges()"></div>
            </div>`;
        renderStandardChecklist(site.secSpecs);
    } else if (type === 'clad') {
        modalTitle.innerHTML = `🛡️ 3. Roofing & Cladding System`; customLineInput.value = site.cladCustomLine || "";
        checklistTitle.style.display = addRowBox.style.display = 'none';
        if (isSqft) {
            inputsBox.innerHTML = `
                <div class="form-group"><label>Sheet Thickness (e.g. 0.50 mm)</label><input type="text" id="modalInputThick" value="${site.cladThickness || ''}" placeholder="0.50 mm" oninput="autoSaveModuleChanges()"></div>
                <div style="font-size:11px;font-weight:700;color:#475569;padding:4px 0;">💡 Sheeting parameters overall Sq.Ft contract ke sath sync rahenge.</div>`;
        } else {
            inputsBox.innerHTML = `
                <div class="form-group"><label>Sheet Thickness (e.g. 0.50 mm)</label><input type="text" id="modalInputThick" value="${site.cladThickness || ''}" placeholder="0.50 mm" oninput="autoSaveModuleChanges()"></div>
                <div class="row-3">
                    <div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPickerForMod('clad')">${site.cladUnit || 'Sq.Ft'} ▾</button></div>
                    <div class="form-group" style="margin:0;"><label>Total Coverage</label><input type="number" inputmode="decimal" step="any" id="modalInputSqFt" value="${site.cladSqFt}" oninput="autoSaveModuleChanges()"></div>
                    <div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.cladRate}" oninput="autoSaveModuleChanges()"></div>
                </div>`;
        }
        document.getElementById('modItemsCheckContainer').innerHTML = `<div style="font-size:12px;color:#64748b;padding:10px 0;">💡 Sheeting parameters sync automatically.</div>`;
    } else if (type === 'acc') {
        modalTitle.innerHTML = `📦 4. Building Accessories`; customLineInput.value = site.accCustomLine || "";
        checklistTitle.innerText = "Accessories List:"; checklistTitle.style.display = addRowBox.style.display = 'block';
        if (isSqft) {
            inputsBox.innerHTML = `<p style="font-size:11.5px;color:#0369a1;font-weight:800;margin:0;">💡 Sq.Ft Mode: Jo-jo accessory select hogi, wo PDF par Item Column me list ban kar dikhegi.</p>`;
            renderSqftAccessoriesChecklist();
        } else {
            inputsBox.innerHTML = `<p style="font-size:12px;color:#475569;margin:0;">Tick to include:</p>`;
            renderAccessoriesChecklist();
        }
    } else if (type === 'erect') {
        modalTitle.innerHTML = `🚜 5. Turnkey Erection`; customLineInput.value = site.erectCustomLine || "";
        checklistTitle.innerText = "Scope Specifications:"; checklistTitle.style.display = addRowBox.style.display = 'block';
        if (isSqft) {
            inputsBox.innerHTML = `<p style="font-size:11.5px;color:#475569;margin:0;">Turnkey Erection included in overall shed rate.</p>`;
        } else {
            inputsBox.innerHTML = `<div class="form-group" style="margin:0;"><label>Erection Rate (₹ / Kg)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.erectRate}" oninput="autoSaveModuleChanges()"></div>`;
        }
        renderStandardChecklist(site.erectSpecs);
    }
    openModalWithHistory('moduleSelectionModal');
}

function renderSqftPrimaryChecklist(list) {
    const container = document.getElementById('modItemsCheckContainer'); if (!container) return;
    container.innerHTML = "";
    if (!list || list.length === 0) { container.innerHTML = `<div style="font-size:12.5px;color:#a1a1aa;padding:12px 0;">No items found. Add below.</div>`; return; }

    list.forEach((item, idx) => {
        const isSelected = item.selected !== false, itemName = item.text !== undefined ? item.text : item, curUnit = item.dimUnit || "mm";
        container.innerHTML += `
            <div class="sqft-prim-spec-card ${!isSelected ? 'disabled-mod' : ''}" id="sqftPrimCard_${idx}">
                <div class="sqft-prim-spec-top">
                    <div style="display:flex;align-items:center;gap:8px;flex:1;" onclick="toggleItemTick(${idx})">
                        <div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation();toggleItemTick(${idx})">${isSelected ? '✓' : ''}</div>
                        <input type="text" value="${itemName}" onclick="event.stopPropagation()" oninput="updateStandardChecklistItemName(${idx},this.value)" style="border:none;background:transparent;font-size:12.5px;font-weight:800;color:#0f172a;flex:1;outline:none;">
                    </div>
                    <button class="btn-del-pro btn-ripple" onclick="event.stopPropagation();deleteItemFromModule(${idx})">🗑️</button>
                </div>
                <div class="sqft-prim-dim-grid">
                    <div><label>Length</label><input type="text" placeholder="e.g. 22" value="${item.length || ''}" oninput="updatePrimaryDimField(${idx},'length',this.value)"></div>
                    <div><label>Width / Size</label><input type="text" placeholder="e.g. 300" value="${item.width || ''}" oninput="updatePrimaryDimField(${idx},'width',this.value)"></div>
                    <div><label>Unit</label><select onchange="updatePrimaryDimField(${idx},'dimUnit',this.value)"><option value="mm" ${curUnit === 'mm' ? 'selected' : ''}>mm</option><option value="Ft" ${curUnit === 'Ft' ? 'selected' : ''}>Ft</option><option value="Inch" ${curUnit === 'Inch' ? 'selected' : ''}>Inch</option><option value="Mtr" ${curUnit === 'Mtr' ? 'selected' : ''}>Mtr</option></select></div>
                </div>
            </div>`;
    });
}

function updatePrimaryDimField(idx, field, val) {
    const site = getCurrentSite(); if (!site?.sqftPrimSpecs || !site.sqftPrimSpecs[idx]) return;
    site.sqftPrimSpecs[idx][field] = val;
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet();
}

function renderSqftAccessoriesChecklist() {
    const container = document.getElementById('modItemsCheckContainer'); if (!container) return;
    container.innerHTML = ""; const site = getCurrentSite();
    if (!site?.sqftAccessories || site.sqftAccessories.length === 0) { container.innerHTML = `<div style="font-size:12.5px;color:#a1a1aa;padding:12px 0;">No accessories added.</div>`; return; }
    site.sqftAccessories.forEach((acc, idx) => {
        const isSelected = acc.selected === true;
        container.innerHTML += `
            <div class="tick-item-card ${isSelected ? 'selected' : ''}" onclick="toggleAccessoryTick(${idx})">
                <div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation();toggleAccessoryTick(${idx})">${isSelected ? '✓' : ''}</div>
                <input type="text" value="${acc.name}" onclick="event.stopPropagation()" oninput="updateAccessoryFieldFast(${idx},'name',this.value)" style="border:none;background:transparent;font-size:13px;font-weight:800;color:#0f172a;flex:1;outline:none;">
                <button class="btn-del-pro btn-ripple" onclick="event.stopPropagation();deleteAccessoryItem(${idx})">🗑️</button>
            </div>`;
    });
}

function openThemeUnitPickerForMod(modType) {
    const site = getCurrentSite(); if (!site) return;
    const curUnit = modType === 'prim' ? site.primUnit : modType === 'sec' ? site.secUnit : modType === 'clad' ? site.cladUnit : site.erectUnit;
    openThemeUnitPicker(curUnit || 'Kg', (u) => {
        if (modType === 'prim') site.primUnit = u; else if (modType === 'sec') site.secUnit = u;
        else if (modType === 'clad') site.cladUnit = u; else if (modType === 'erect') site.erectUnit = u;
        syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site);
        openModuleModal(modType); calcModuleTotals(); refreshLivePdfPreviewSheet();
    });
}
function closeModuleModal() { closeModalSafe('moduleSelectionModal'); calcModuleTotals(); refreshLivePdfPreviewSheet(); }

function renderStandardChecklist(list) {
    const container = document.getElementById('modItemsCheckContainer'); if (!container) return;
    container.innerHTML = "";
    if (!list || list.length === 0) { container.innerHTML = `<div style="font-size:12.5px;color:#a1a1aa;padding:12px 0;">No items found. Add below.</div>`; return; }
    list.forEach((item, idx) => {
        const isSelected = item.selected === true, itemName = item.text !== undefined ? item.text : item;
        container.innerHTML += `
            <div class="tick-item-card ${isSelected ? 'selected' : ''}" onclick="toggleItemTick(${idx})">
                <div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation();toggleItemTick(${idx})">${isSelected ? '✓' : ''}</div>
                <input type="text" value="${itemName}" onclick="event.stopPropagation()" oninput="updateStandardChecklistItemName(${idx},this.value)" style="flex:1;border:none;background:transparent;font-size:13px;font-weight:800;color:#0f172a;outline:none;">
                <button class="btn-del-pro btn-ripple" onclick="event.stopPropagation();deleteItemFromModule(${idx})">🗑️</button>
            </div>`;
    });
}
function updateStandardChecklistItemName(idx, newText) {
    const site = getCurrentSite();
    if (isSqftMode(site) && activeModType === 'prim') {
        if (site.sqftPrimSpecs[idx]) { site.sqftPrimSpecs[idx].text = newText; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet(); }
    } else {
        let targetList = activeModType === 'prim' ? site.primSpecs : activeModType === 'sec' ? site.secSpecs : site.erectSpecs;
        if (targetList[idx]) { targetList[idx].text = newText; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet(); }
    }
}
function toggleItemTick(idx) {
    const site = getCurrentSite();
    if (isSqftMode(site) && activeModType === 'prim') {
        site.sqftPrimSpecs[idx].selected = !(site.sqftPrimSpecs[idx].selected !== false);
        renderSqftPrimaryChecklist(site.sqftPrimSpecs);
    } else {
        let targetList = activeModType === 'prim' ? site.primSpecs : activeModType === 'sec' ? site.secSpecs : site.erectSpecs;
        targetList[idx].selected = !(targetList[idx].selected !== false);
        renderStandardChecklist(targetList);
    }
    autoSaveModuleChanges();
}
function deleteItemFromModule(idx) {
    const site = getCurrentSite();
    if (isSqftMode(site) && activeModType === 'prim') {
        site.sqftPrimSpecs.splice(idx, 1); renderSqftPrimaryChecklist(site.sqftPrimSpecs);
    } else {
        let targetList = activeModType === 'prim' ? site.primSpecs : activeModType === 'sec' ? site.secSpecs : site.erectSpecs;
        targetList.splice(idx, 1); renderStandardChecklist(targetList);
    }
    autoSaveModuleChanges();
}

// UNLIMITED ITEM ADDING FIX
function addNewItemToModule() {
    const val = (document.getElementById('customItemInput')?.value || "").trim(); if (!val) return;
    const site = getCurrentSite();
    if (isSqftMode(site) && activeModType === 'prim') {
        site.sqftPrimSpecs = site.sqftPrimSpecs || [];
        site.sqftPrimSpecs.push({ text: val, length: "", width: "", dimUnit: "mm", selected: true });
        renderSqftPrimaryChecklist(site.sqftPrimSpecs);
    } else if (activeModType === 'prim') {
        site.primSpecs = site.primSpecs || [];
        site.primSpecs.push({ text: val, selected: true });
        renderStandardChecklist(site.primSpecs);
    } else if (activeModType === 'sec') {
        site.secSpecs = site.secSpecs || [];
        site.secSpecs.push({ text: val, selected: true });
        renderStandardChecklist(site.secSpecs);
    } else if (activeModType === 'acc') {
        if (isSqftMode(site)) {
            site.sqftAccessories = site.sqftAccessories || [];
            site.sqftAccessories.push({ name: val, selected: true });
            renderSqftAccessoriesChecklist();
        } else {
            site.accessories = site.accessories || [];
            site.accessories.push({ name: val, qty: "", unit: "Nos", rate: "", selected: true });
            renderAccessoriesChecklist();
        }
    } else if (activeModType === 'erect') {
        site.erectSpecs = site.erectSpecs || [];
        site.erectSpecs.push({ text: val, selected: true });
        renderStandardChecklist(site.erectSpecs);
    }
    safeSetVal('customItemInput', ""); autoSaveModuleChanges();
}

function addNewSqftPrimaryItemDirectly() {
    const site = getCurrentSite(); if (!site) return;
    site.sqftPrimSpecs = site.sqftPrimSpecs || [];
    site.sqftPrimSpecs.push({ text: "New Framing Member #" + (site.sqftPrimSpecs.length + 1), length: "10", width: "100", dimUnit: "mm", selected: true });
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet();
}

// CONTINUATION IN SAME CLEAN STYLE...
function openPermanentTextsModal() {
    safeSetVal('pt_companyDesc', appSettings.companyDesc || ""); 
    safeSetVal('pt_companyAddr', appSettings.companyAddr || "");
    safeSetVal('pt_companyGst', appSettings.companyGst || ""); 
    safeSetVal('pt_footerWeb', appSettings.footerWeb || "");
    safeSetVal('pt_pdfRibbonTitle', appSettings.pdfRibbonTitle || "QUOTATION"); 
    safeSetVal('pt_pdfScopeTitle', appSettings.pdfScopeTitle || "");
    safeSetVal('pt_headerLine1', appSettings.headerLine1 || "1. ESTIMATED STEEL WEIGHT:");
    safeSetVal('pt_milestoneHeading', appSettings.milestoneHeading || "TOTAL STRUCTURE WEIGHT (PRIMARY + SECONDARY):");
    safeSetVal('pt_headerLine2', appSettings.headerLine2 || "2. PRICE BREAKUP AS PER KG RATE:");
    safeSetVal('pt_accSectionHeading', appSettings.accSectionHeading || "3. BUILDING ACCESSORIES ITEM-WISE BREAKDOWN:");
    safeSetVal('pt_btnNamePrim', appSettings.btnNamePrim || "1. Primary");
    safeSetVal('pt_btnNameSec', appSettings.btnNameSec || "2. Secondary");
    safeSetVal('pt_btnNameClad', appSettings.btnNameClad || "3. Cladding");
    safeSetVal('pt_btnNameAcc', appSettings.btnNameAcc || "4. Accessories");
    safeSetVal('pt_btnNameErect', appSettings.btnNameErect || "5. Erection");
    safeSetVal('pt_sqftPdfRibbonTitle', appSettings.sqftPdfRibbonTitle || "QUOTATION");
    safeSetVal('pt_sqftPdfScopeTitle', appSettings.sqftPdfScopeTitle || "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - SQ.FT BASIS");
    safeSetVal('pt_sqftHeaderLine1', appSettings.sqftHeaderLine1 || "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:");
    safeSetVal('pt_sqftContractBarTitle', appSettings.sqftContractBarTitle || "COMPLETE PEB SHED CONTRACT (ON SQ.FT COVERED AREA BASIS)");
    safeSetVal('pt_civilPdfRibbonTitle', appSettings.civilPdfRibbonTitle || "QUOTATION");
    safeSetVal('pt_civilJobTitle', appSettings.civilJobTitle || "JOB DETAILS & TECHNICAL SPECIFICATIONS");
    safeSetVal('pt_civilFoundTitle', appSettings.civilFoundTitle || "1. FOUNDATION & RCC COLUMN DETAILS:");
    safeSetVal('pt_civilBrickTitle', appSettings.civilBrickTitle || "2. BRICK WALL, DPC & PLASTER DETAILS:");
    safeSetVal('pt_civilFloorTitle', appSettings.civilFloorTitle || "3. FLOORING & PCC WORK DETAILS:");
    safeSetVal('pt_btnNameFoundation', appSettings.btnNameFoundation || "1. Foundation Details");
    safeSetVal('pt_btnNameBrick', appSettings.btnNameBrick || "2. Brick Wall Details");
    safeSetVal('pt_btnNameFlooring', appSettings.btnNameFlooring || "3. Flooring Details");
    safeSetVal('pt_custAcceptanceTitle', appSettings.custAcceptanceTitle || "CUSTOMER ACCEPTANCE");
    safeSetVal('pt_custAcceptanceSub', appSettings.custAcceptanceSub || "Authorized Signature & Stamp");
    safeSetVal('pt_signCompHeader', appSettings.signCompHeader || "");
    safeSetVal('pt_pdfSignatoryText', appSettings.pdfSignatoryText || "Authorized Signatory");

    switchPermanentTextTab('kg');
    openModalWithHistory('permanentTextsModal');
}
function closePermanentTextsModal() { closeModalSafe('permanentTextsModal'); }
function autoSavePermanentText(fieldKey, val) {
    appSettings[fieldKey] = val; 
    syncDataToCloud('patel_app_settings', appSettings);
    applyCustomButtonNamesUI(); 
    refreshLivePdfPreviewSheet();
}
function switchPermanentTextTab(tabKey) {
    ['btnTabPtKg', 'btnTabPtSqft', 'btnTabPtCivil'].forEach(id => document.getElementById(id)?.classList.remove('active'));
    document.getElementById('ptPanelKg').style.display = 'none';
    document.getElementById('ptPanelSqft').style.display = 'none';
    document.getElementById('ptPanelCivil').style.display = 'none';

    if (tabKey === 'kg') {
        document.getElementById('btnTabPtKg')?.classList.add('active');
        document.getElementById('ptPanelKg').style.display = 'block';
    } else if (tabKey === 'sqft') {
        document.getElementById('btnTabPtSqft')?.classList.add('active');
        document.getElementById('ptPanelSqft').style.display = 'block';
    } else if (tabKey === 'civil') {
        document.getElementById('btnTabPtCivil')?.classList.add('active');
        document.getElementById('ptPanelCivil').style.display = 'block';
    }
}

function openBankDetailsModal() {
    safeSetVal('inpBankName', appSettings.bankName || "");
    safeSetVal('inpBankAccName', appSettings.bankAccName || "");
    safeSetVal('inpBankAccNo', appSettings.bankAccNo || "");
    safeSetVal('inpBankIfsc', appSettings.bankIfsc || "");
    safeSetVal('inpBankBranch', appSettings.bankBranch || "");
    safeSetVal('inpBankUpi', appSettings.bankUpi || "");
    openModalWithHistory('companyBankDetailsModal');
}
function closeBankDetailsModal() { closeModalSafe('companyBankDetailsModal'); }
function saveCompanyBankDetails() {
    appSettings.bankName = (document.getElementById('inpBankName')?.value || "").trim();
    appSettings.bankAccName = (document.getElementById('inpBankAccName')?.value || "").trim();
    appSettings.bankAccNo = (document.getElementById('inpBankAccNo')?.value || "").trim();
    appSettings.bankIfsc = (document.getElementById('inpBankIfsc')?.value || "").trim().toUpperCase();
    appSettings.bankBranch = (document.getElementById('inpBankBranch')?.value || "").trim();
    appSettings.bankUpi = (document.getElementById('inpBankUpi')?.value || "").trim();
    syncDataToCloud('patel_app_settings', appSettings);
    closeBankDetailsModal(); refreshLivePdfPreviewSheet();
    showCorporateToast("Bank Account Details Saved!", "🏦");
}
function clearCompanyBankDetails() {
    safeSetVal('inpBankName', ""); safeSetVal('inpBankAccName', ""); safeSetVal('inpBankAccNo', "");
    safeSetVal('inpBankIfsc', ""); safeSetVal('inpBankBranch', ""); safeSetVal('inpBankUpi', "");
    appSettings.bankName = ""; appSettings.bankAccName = ""; appSettings.bankAccNo = "";
    appSettings.bankIfsc = ""; appSettings.bankBranch = ""; appSettings.bankUpi = "";
    syncDataToCloud('patel_app_settings', appSettings);
    closeBankDetailsModal(); refreshLivePdfPreviewSheet();
    showCorporateToast("Bank Details cleared", "🗑️");
}

function renderSettingsPhonesUI() {
    const box = document.getElementById('settingsPhonesListContainer'); if (!box) return;
    box.innerHTML = "";
    (appSettings.phones || []).forEach((phone, idx) => {
        box.innerHTML += `
            <div class="phone-row-dynamic">
                <span class="phone-badge-prefix">📞 #${idx + 1}</span>
                <input type="tel" value="${phone}" placeholder="Enter phone number..." oninput="updatePhoneSetting(${idx},this.value)">
                <button type="button" class="btn-del-pro btn-ripple" onclick="deletePhoneSetting(${idx})">🗑️</button>
            </div>`;
    });
}
function addPhoneRowInSettings() {
    if (!appSettings.phones) appSettings.phones = [];
    appSettings.phones.push("+91 "); syncDataToCloud('patel_app_settings', appSettings); renderSettingsPhonesUI(); refreshLivePdfPreviewSheet();
}
function updatePhoneSetting(idx, val) {
    if (!appSettings.phones) appSettings.phones = [];
    appSettings.phones[idx] = val; syncDataToCloud('patel_app_settings', appSettings); refreshLivePdfPreviewSheet();
}
function deletePhoneSetting(idx) {
    if (!appSettings.phones) return;
    appSettings.phones.splice(idx, 1); syncDataToCloud('patel_app_settings', appSettings); renderSettingsPhonesUI(); refreshLivePdfPreviewSheet();
}
function saveCompanyEmailSetting(val) { appSettings.companyEmail = val.trim(); syncDataToCloud('patel_app_settings', appSettings); refreshLivePdfPreviewSheet(); }
function saveFooterWebSetting(val) { appSettings.footerWeb = val.trim(); syncDataToCloud('patel_app_settings', appSettings); refreshLivePdfPreviewSheet(); }
function loadPhoneSettingsUI() {
    renderSettingsPhonesUI(); safeSetVal('setCompanyEmail', appSettings.companyEmail || "");
    safeSetVal('setFooterWeb', appSettings.footerWeb || ""); safeSetVal('setStartingQuoteNo', getNextQuoteSequenceNumber());
}

let currentSettingKey = '';
function openLargeInput(key, title) {
    currentSettingKey = key; safeSetText('largeInputTitle', title);
    safeSetVal('largeInputTextarea', appSettings[key] || ""); openModalWithHistory('largeInputModal');
}
function closeLargeInput() { closeModalSafe('largeInputModal'); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function autoSaveLargeInputLive() {
    appSettings[currentSettingKey] = document.getElementById('largeInputTextarea')?.value || "";
    syncDataToCloud('patel_app_settings', appSettings); loadPhoneSettingsUI(); renderHomeScreen(); refreshLivePdfPreviewSheet();
}

function compressAndOptimizeBanner(file, maxWidth, quality, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            let width = img.width, height = img.height;
            if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const isPng = file.type === 'image/png';
            callback(canvas.toDataURL(isPng ? 'image/png' : 'image/jpeg', quality));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        compressAndOptimizeBanner(input.files[0], 1000, 0.85, function(optimizedBase64) {
            appSettings.logoData = optimizedBase64;
            syncDataToCloud('patel_app_settings', appSettings);
            updateHeaderBannersUI(); refreshLivePdfPreviewSheet();
            const fav = document.getElementById('dynamicAppFavicon');
            const appleFav = document.getElementById('dynamicAppleIcon');
            if (fav) fav.href = optimizedBase64;
            if (appleFav) appleFav.href = optimizedBase64;
            showCorporateToast("Company Header Banner Updated!", "🖼️");
            input.value = '';
        });
    }
}

// 25. DIGITAL SIGNATURE & WINDOW ONLOAD
let canvas, ctx, isDrawing = false, sigEventsAttached = false;
function openSignatureModal() {
    openModalWithHistory('sigModal');
    canvas = document.getElementById('sigPad');
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';

    if (!sigEventsAttached) {
        canvas.addEventListener('touchstart', (e) => {
            isDrawing = true; ctx.beginPath();
            const t = e.touches[0], r = canvas.getBoundingClientRect();
            ctx.moveTo(t.clientX - r.left, t.clientY - r.top);
            e.preventDefault();
        }, {passive:false});
        canvas.addEventListener('touchmove', (e) => {
            if (!isDrawing) return;
            const t = e.touches[0], r = canvas.getBoundingClientRect();
            ctx.lineTo(t.clientX - r.left, t.clientY - r.top);
            ctx.stroke(); e.preventDefault();
        }, {passive:false});
        canvas.addEventListener('touchend', () => isDrawing = false);

        canvas.addEventListener('mousedown', (e) => { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
        canvas.addEventListener('mousemove', (e) => { if (isDrawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } });
        canvas.addEventListener('mouseup', () => isDrawing = false);
        sigEventsAttached = true;
    }
}
function clearSignature() { if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height); }
function closeSigModal() { closeModalSafe('sigModal'); }
function saveSignature() {
    appSettings.signatureData = canvas.toDataURL();
    syncDataToCloud('patel_app_settings', appSettings);
    closeSigModal(); refreshLivePdfPreviewSheet();
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
