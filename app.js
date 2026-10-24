// ============================================================================
// PATEL ENGINEERING - 100% PURE VECTOR PDF ENGINE (REAL TEXT & VECTOR LINES)
// ============================================================================

// 1. FIREBASE CONFIGURATION
const firebaseConfig = { apiKey: "AIzaSyB_b6KlFizZGALLEZnRcJ0Pd16NUEF6QY8", authDomain: "patel-engineering-3b4c4.firebaseapp.com", databaseURL: "https://patel-engineering-3b4c4-default-rtdb.firebaseio.com", projectId: "patel-engineering-3b4c4", storageBucket: "patel-engineering-3b4c4.firebasestorage.app", messagingSenderId: "261245424222", appId: "1:261245424222:web:126273db274b515f8cdacf" };
let db = null, isFirebaseConnected = false, isCloudInitialSyncDone = false;
try { if (typeof firebase !== 'undefined' && firebase.initializeApp) { firebase.initializeApp(firebaseConfig); db = firebase.database(); isFirebaseConnected = true; } } catch (e) { console.warn("Firebase note:", e); }
let masterSecurityPasscode = localStorage.getItem('pe_master_passcode') || "RJ06CC7194";

// 2. AUDIO & TOASTS
let audioCtx = null;
function playAppSound(type = 'click') {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain(), now = audioCtx.currentTime;
        osc.connect(gain); gain.connect(audioCtx.destination);
        if (type === 'click') { osc.type = 'sine'; osc.frequency.setValueAtTime(800, now); osc.frequency.exponentialRampToValueAtTime(300, now + 0.04); gain.gain.setValueAtTime(0.08, now); gain.gain.linearRampToValueAtTime(0.001, now + 0.04); osc.start(now); osc.stop(now + 0.04); }
        else if (type === 'chime') { osc.type = 'triangle'; osc.frequency.setValueAtTime(523.25, now); osc.frequency.setValueAtTime(659.25, now + 0.08); osc.frequency.setValueAtTime(783.99, now + 0.16); gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35); osc.start(now); osc.stop(now + 0.35); }
    } catch (e) {}
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
    accessories: [{ name: "Turbo Ventilators", qty: "", unit: "Nos", rate: "", selected: true }, { name: "Gutters", qty: "", unit: "R.Ft", rate: "", selected: true }, { name: "Down Pipes", qty: "", unit: "Set", rate: "", selected: true }, { name: "Anchor Bolts", qty: "", unit: "Lot", rate: "", selected: true }, { name: "Nuts & Bolts", qty: "", unit: "Lot", rate: "", selected: true }],
    erectCustomLine: "Crane, Hydra, Welding Machine, Labour",
    erectSpecs: [{ text: "Crane", selected: true }, { text: "Hydra", selected: true }, { text: "Welding Machine", selected: true }, { text: "Labour", selected: true }],
    erectUnit: "Kg", moduleOrder: ['prim', 'sec', 'clad', 'acc', 'erect'], customModules: [], civilScopeDesc: "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS",
    civilData: {
        foundation: { title: "1. FOUNDATION & RCC COLUMN DETAILS", enabled: true, items: [{ id: "f1", name: "Column Foundation / Footing Work", qty: "", unit: "Nos", rate: "", enabled: true }, { id: "f2", name: "RCC Column Shuttering & Casting", qty: "", unit: "Sq.Ft", rate: "", enabled: true }, { id: "f3", name: "Reinforcement Steel Bars", qty: "", unit: "Nos", rate: "", enabled: true }, { id: "f4", name: "Stirrups / Ring Binding Work", qty: "", unit: "Lot", rate: "", enabled: true }, { id: "f5", name: "Column Grid Alignment & Spacing", qty: "", unit: "Ft", rate: "", enabled: true }] },
        brickWall: { title: "2. BRICK WALL, DPC & PLASTER DETAILS", enabled: true, items: [{ id: "b1", name: "Stone Masonry Foundation Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true }, { id: "b2", name: "Plinth / Brick Foundation Work", qty: "", unit: "R.Ft", rate: "", enabled: true }, { id: "b3", name: "DPC (Damp Proof Course) Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true }, { id: "b4", name: "Brick Wall Superstructure Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true }, { id: "b5", name: "Cement Plaster Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true }] },
        flooring: { title: "3. FLOORING & PCC WORK DETAILS", enabled: true, items: [{ id: "fl1", name: "Soil Filling & Stone Soling Work", qty: "", unit: "Cu.Ft", rate: "", enabled: true }, { id: "fl2", name: "PCC Concrete Flooring (M25) Work", qty: "", unit: "Sq.Ft", rate: "", enabled: true }] }
    },
    civilCustomCategories: []
};
const defaultSqftMasterBlueprint = {
    sqftScopeDesc: "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - SQ.FT BASIS", sqftTableDesc: "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:",
    sqftPrimCustomLine: "Heavy Duty Structural Steel Portal Framing System", sqftCladCustomLine: "0.50mm TATA BlueScope / JSW Colour Coated Profile Sheet",
    sqftAccCustomLine: "Standard Industrial Shed Accessories Package", sqftErectCustomLine: "Crane, Hydra, Welding Machine, Expert Labour", cladThickness: "0.50 mm",
    moduleOrder: ['prim', 'clad', 'acc', 'erect'],
    primSpecs: [{ text: "Columns (Main Stanchions)", length: "", width: "", thk: "", dimUnit: "mm", selected: true }, { text: "Truss / Rafter Framing", length: "", width: "", thk: "", dimUnit: "mm", selected: true }, { text: "Tie Beams & Bracings", length: "", width: "", thk: "", dimUnit: "mm", selected: true }, { text: "Canopy & Tie Members", length: "", width: "", thk: "", dimUnit: "mm", selected: true }],
    accessories: [{ name: "Turbo Ventilators", qty: "", unit: "Nos", selected: true }, { name: "Rainwater Gutters", qty: "", unit: "R.Ft", selected: true }, { name: "Down Pipes (PVC)", qty: "", unit: "Set", selected: true }, { name: "Anchor Fastener Bolts", qty: "", unit: "Lot", selected: true }],
    erectSpecs: [{ text: "Crane", selected: true }, { text: "Hydra", selected: true }, { text: "Welding Machine", selected: true }, { text: "Labour", selected: true }], customModules: []
};
const defaultBannerSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 700 240' width='700' height='240'><g fill='%230f172a'><path d='M30,120 Q30,30 160,30 L260,30 Q330,30 330,80 Q330,125 250,130 L110,130 L110,210 L30,210 Z'/><rect x='30' y='218' width='640' height='8' fill='%230c1e30'/><text x='350' y='240' font-family='Arial,sans-serif' font-weight='900' font-size='22' letter-spacing='14' text-anchor='middle'>PATEL ENGINEERING</text></g></svg>`;
const defaultAppSettings = {
    ownerName: "PATEL ENGINEERING", companyAddr: "Bhawani Nagar, Bhilwara - 311001 (Rajasthan, India)", companyGst: "08AHFPL0222M2ZF",
    phones: ["+91 9799635249", "+91 7737734122", "+91 9829111111"], companyEmail: "info@patelengineering.com", footerWeb: "www.patelengineering.com", startingQuoteSeq: 1,
    pdfRibbonTitle: "QUOTATION", pdfScopeTitle: "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - KG BASIS", headerLine1: "1. ESTIMATED STEEL WEIGHT:", milestoneHeading: "TOTAL STRUCTURE WEIGHT (PRIMARY + SECONDARY):",
    headerLine2: "2. PRICE BREAKUP AS PER KG RATE:", accSectionHeading: "3. BUILDING ACCESSORIES ITEM-WISE BREAKDOWN:", btnNamePrim: "1. Primary", btnNameSec: "2. Secondary", btnNameClad: "3. Cladding", btnNameAcc: "4. Accessories", btnNameErect: "5. Erection",
    paymentTerms: "• 40% Advance along with Purchase Order & Foundation drawing approval.\n• 50% Progressive payment against proforma invoice before dispatch.\n• 10% Final payment after successful completion of erection on site.",
    termsCond: "• Delivery within 4-6 weeks from approval of anchor drawings.\n• Uninterrupted water & 3-phase electricity at site under client scope.\n• All structural steel weights are estimated as per standard engineering tolerance.",
    sqftPdfRibbonTitle: "QUOTATION", sqftPdfScopeTitle: "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - SQ.FT BASIS", sqftHeaderLine1: "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:", sqftContractBarTitle: "COMPLETE PEB SHED CONTRACT (ON SQ.FT COVERED AREA BASIS)",
    sqftPrimLabel: "Primary Structural Framing", sqftCladLabel: "Roof & Wall Cladding System", sqftAccLabel: "Building Accessories Package", sqftErectLabel: "Turnkey Erection & Installation",
    sqftBtnNamePrim: "1. Primary Framing", sqftBtnNameClad: "2. Cladding System", sqftBtnNameAcc: "3. Accessories", sqftBtnNameErect: "4. Turnkey Erection",
    sqftPaymentTerms: "• 35% Advance with Order Confirmation & Foundation Drawing Approval.\n• 50% Progressive payment stage-wise against site delivery of structure & sheets.\n• 15% Final payment after complete handover of shed structure.",
    sqftTermsCond: "• Total covered shed area billing as per actual agreed layout dimensions.\n• Civil foundations, uninterrupted water & 3-phase power under client scope.\n• All framing & roofing work executed under turnkey single-contract rate.",
    civilPdfRibbonTitle: "QUOTATION", civilScopeDesc: "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS", civilJobTitle: "JOB DETAILS & TECHNICAL SPECIFICATIONS", civilFoundTitle: "1. FOUNDATION & RCC COLUMN DETAILS:", civilBrickTitle: "2. BRICK WALL, DPC & PLASTER DETAILS:", civilFloorTitle: "3. FLOORING & PCC WORK DETAILS:",
    btnNameFoundation: "1. Foundation Details", btnNameBrick: "2. Brick Wall Details", btnNameFlooring: "3. Flooring Details",
    civilPaymentTerms: "• 30% Advance along with formal Civil Work order confirmation.\n• 50% Running progressive payment based on site progress (Plinth/DPC/Wall).\n• 20% Final payment upon successful completion of Flooring & PCC work.",
    civilTermsCond: "• Water & 3-phase electricity connection to be provided free of charge by client at site.\n• Unforeseen hard-rock excavation or dewatering if required will be extra as per mutual consent.\n• Adequate secured storage space for cement & steel reinforcement to be provided at site.",
    projectSizeHeading: "📐 PROJECT SIZE / SHED DIMENSIONS:", termsTitle: "Terms & Conditions:", civilTermsTitle: "Civil Work Terms & Conditions:", thankYouText: "THANK YOU FOR YOUR BUSINESS WITH US.", civilThankYouText: "THANK YOU FOR YOUR CIVIL CONTRACT.",
    custAcceptanceTitle: "CUSTOMER ACCEPTANCE", custAcceptanceSub: "Authorized Signature & Stamp", signCompHeader: "FOR PATEL ENGINEERING", pdfSignatoryText: "Authorized Signatory", companyDesc: "PEB Structure | Industrial Sheds | Roofing Solutions",
    signatureData: "", logoData: "", savedPdfFontScale: 1.0, bankName: "", bankAccName: "", bankAccNo: "", bankIfsc: "", bankBranch: "", bankUpi: ""
};

let masterBlueprint = JSON.parse(localStorage.getItem('patel_master_blueprint') || JSON.stringify(defaultMasterBlueprint));
let sqftMasterBlueprint = JSON.parse(localStorage.getItem('patel_sqft_master_blueprint') || JSON.stringify(defaultSqftMasterBlueprint));
let appSettings = JSON.parse(localStorage.getItem('patel_app_settings') || JSON.stringify(defaultAppSettings));
if (!appSettings.phones || !Array.isArray(appSettings.phones)) { appSettings.phones = [appSettings.phone1, appSettings.phone2, appSettings.phone3].filter(Boolean); if (!appSettings.phones.length) appSettings.phones = ["+91 9799635249", "+91 7737734122"]; }
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
            if (s.sqftPrimSpecs) sqftMasterBlueprint.primSpecs = s.sqftPrimSpecs.map(p => ({ text: p.text || "", length: "", width: "", thk: "", dimUnit: p.dimUnit || "mm", selected: p.selected !== false }));
            if (s.sqftAccessories) sqftMasterBlueprint.accessories = s.sqftAccessories.map(a => ({ name: a.name || "", qty: "", unit: a.unit || "Nos", selected: a.selected !== false }));
            if (s.sqftScopeDesc !== undefined) sqftMasterBlueprint.sqftScopeDesc = s.sqftScopeDesc;
            if (s.sqftTableDesc !== undefined) sqftMasterBlueprint.sqftTableDesc = s.sqftTableDesc;
            if (s.sqftPrimCustomLine !== undefined) sqftMasterBlueprint.sqftPrimCustomLine = s.sqftPrimCustomLine;
            if (s.sqftCladCustomLine !== undefined) sqftMasterBlueprint.sqftCladCustomLine = s.sqftCladCustomLine;
            if (s.cladThickness !== undefined) sqftMasterBlueprint.cladThickness = s.cladThickness;
            if (s.sqftAccCustomLine !== undefined) sqftMasterBlueprint.sqftAccCustomLine = s.sqftAccCustomLine;
            if (s.sqftErectCustomLine !== undefined) sqftMasterBlueprint.sqftErectCustomLine = s.sqftErectCustomLine;
            if (s.moduleOrder) sqftMasterBlueprint.moduleOrder = [...s.moduleOrder];
            if (s.customModules) sqftMasterBlueprint.customModules = JSON.parse(JSON.stringify(s.customModules));
            localStorage.setItem('patel_sqft_master_blueprint', JSON.stringify(sqftMasterBlueprint));
            if (db && isFirebaseConnected) db.ref('patel_sqft_master_blueprint').set(sqftMasterBlueprint).catch(() => {});
        } else {
            if (s.primSpecs) masterBlueprint.primSpecs = s.primSpecs.map(p => ({ text: p.text || p, selected: p.selected !== false }));
            if (s.secSpecs) masterBlueprint.secSpecs = s.secSpecs.map(sec => ({ text: sec.text || sec, selected: sec.selected !== false }));
            if (s.accessories) masterBlueprint.accessories = s.accessories.map(a => ({ name: a.name, qty: "", unit: a.unit || "Nos", rate: "", selected: a.selected !== false }));
            if (s.erectSpecs) masterBlueprint.erectSpecs = s.erectSpecs.map(e => ({ text: e.text || e, selected: e.selected !== false }));
            if (s.primCustomLine !== undefined) masterBlueprint.primCustomLine = s.primCustomLine;
            if (s.primUnit) masterBlueprint.primUnit = s.primUnit;
            if (s.secCustomLine !== undefined) masterBlueprint.secCustomLine = s.secCustomLine;
            if (s.secUnit) masterBlueprint.secUnit = s.secUnit;
            if (s.cladCustomLine !== undefined) masterBlueprint.cladCustomLine = s.cladCustomLine;
            if (s.cladThickness !== undefined) masterBlueprint.cladThickness = s.cladThickness;
            if (s.cladUnit) masterBlueprint.cladUnit = s.cladUnit;
            if (s.accCustomLine !== undefined) masterBlueprint.accCustomLine = s.accCustomLine;
            if (s.erectCustomLine !== undefined) masterBlueprint.erectCustomLine = s.erectCustomLine;
            if (s.erectUnit) masterBlueprint.erectUnit = s.erectUnit;
            if (s.moduleOrder) masterBlueprint.moduleOrder = [...s.moduleOrder];
            if (s.customModules) masterBlueprint.customModules = JSON.parse(JSON.stringify(s.customModules));
            localStorage.setItem('patel_master_blueprint', JSON.stringify(masterBlueprint));
            if (db && isFirebaseConnected) db.ref('patel_master_blueprint').set(masterBlueprint).catch(() => {});
        }
        if (s.civilData) {
            if (s.civilScopeDesc !== undefined) masterBlueprint.civilScopeDesc = s.civilScopeDesc;
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
    } catch (err) { console.warn("Blueprint sync notice:", err); }
}

// 4. CLOUD SYNC & MASTER PROTECTION
function syncDataToCloud(k, d) { try { localStorage.setItem(k, JSON.stringify(d)); } catch (e) {} if (db && isFirebaseConnected && isCloudInitialSyncDone) db.ref(k).set(d).catch(() => {}); }
function initCloudFirstMasterSync() {
    if (!db || !isFirebaseConnected) { isCloudInitialSyncDone = true; return; }
    const syncBadge = document.getElementById('cloudSyncIndicator');
    if (syncBadge) syncBadge.innerHTML = `<span class="pulse-dot">●</span> Connecting to Cloud Master...`;
    db.ref('pe_master_passcode').on('value', (s) => { const val = s.val(); if (val) { masterSecurityPasscode = val; localStorage.setItem('pe_master_passcode', val); const t = localStorage.getItem('pe_app_auth_token'); if (t && t !== val) { localStorage.removeItem('pe_app_auth_token'); checkFirstTimeAuthentication(true); } } });
    db.ref('patel_app_settings').on('value', (s) => { const val = s.val(); if (val && typeof val === 'object') { appSettings = Object.assign({}, defaultAppSettings, val); if (!appSettings.phones || !Array.isArray(appSettings.phones)) appSettings.phones = [appSettings.phone1, appSettings.phone2, appSettings.phone3].filter(Boolean); if (!appSettings.savedPdfFontScale) appSettings.savedPdfFontScale = 1.0; try { localStorage.setItem('patel_app_settings', JSON.stringify(appSettings)); } catch (e) {} loadPhoneSettingsUI(); applyCustomButtonNamesUI(); updateHeaderBannersUI(); applyScaleToSheet(); refreshLivePdfPreviewSheet(true); } });
    db.ref('patel_master_blueprint').on('value', (s) => { const val = s.val(); if (val && typeof val === 'object') { masterBlueprint = val; try { localStorage.setItem('patel_master_blueprint', JSON.stringify(masterBlueprint)); } catch (e) {} } });
    db.ref('patel_sqft_master_blueprint').on('value', (s) => { const val = s.val(); if (val && typeof val === 'object') { sqftMasterBlueprint = val; try { localStorage.setItem('patel_sqft_master_blueprint', JSON.stringify(sqftMasterBlueprint)); } catch (e) {} } });
    db.ref('patel_app_sites').on('value', (s) => { const val = s.val(); if (val) { let loaded = Array.isArray(val) ? val.filter(Boolean) : (typeof val === 'object' ? Object.values(val).filter(Boolean) : []); if (loaded.length > 0) { sites = loaded; try { localStorage.setItem('patel_app_sites', JSON.stringify(sites)); } catch (e) {} renderHomeScreen(); loadPhoneSettingsUI(); if (currentSiteId && sites.find(x => x.id === currentSiteId)) refreshLivePdfPreviewSheet(true); } } isCloudInitialSyncDone = true; if (syncBadge) syncBadge.innerHTML = `<span class="pulse-dot">●</span> 100% Cloud Synced (All Devices Connected)`; });
}
function updateHeaderBannersUI() {
    const bannerSrc = appSettings.logoData || defaultBannerSvg;
    ['pdfHeaderBannerImg', 'civilPdfHeaderBannerImg'].forEach(id => { const img = document.getElementById(id); if (img) img.src = bannerSrc; });
    const mirrorP1 = document.querySelector('#printableA4Sheet_civilDisplayMirror #pdfHeaderBannerImg'), mirrorP2 = document.querySelector('#printableA4Sheet_civilDisplayMirror #civilPdfHeaderBannerImg');
    if (mirrorP1) mirrorP1.src = bannerSrc; if (mirrorP2) mirrorP2.src = bannerSrc;
    if (appSettings.logoData) { safeSetHtml('settingsLogoPreview', `<img src="${appSettings.logoData}" style="width:100%;height:100%;object-fit:cover;">`); safeSetHtml('appLogoBadge', `<img src="${appSettings.logoData}" style="width:100%;height:100%;object-fit:cover;">`); }
}

// 5. MASTER PASSCODE GATEWAY
function checkFirstTimeAuthentication(isRemoteKick = false) {
    const savedToken = localStorage.getItem('pe_app_auth_token'), lockScreen = document.getElementById('appFirstTimeLockScreen'); if (!lockScreen) return;
    if (savedToken === masterSecurityPasscode) lockScreen.style.display = 'none';
    else { lockScreen.style.display = 'flex'; lockScreen.style.opacity = '1'; const err = document.getElementById('authErrorMsg'); if (isRemoteKick && err) { err.innerText = "⚠️ Passcode updated by Admin. Re-enter new passcode."; err.style.display = 'block'; } document.getElementById('inpMasterPasscode')?.focus(); }
}
function verifyMasterPasscode() {
    const entered = (document.getElementById('inpMasterPasscode')?.value || "").trim().toUpperCase(), err = document.getElementById('authErrorMsg');
    if (entered === masterSecurityPasscode) { triggerHaptic(50); playAppSound('chime'); fireConfettiCelebration(); localStorage.setItem('pe_app_auth_token', masterSecurityPasscode); const lock = document.getElementById('appFirstTimeLockScreen'); if (lock) { lock.style.opacity = '0'; setTimeout(() => { lock.style.display = 'none'; }, 400); } }
    else { triggerHaptic(100); if (err) { err.innerText = "⚠️ Invalid Passcode. Access Denied!"; err.style.display = 'block'; setTimeout(() => { err.style.display = 'none'; }, 3000); } }
}
function togglePassVisibility(id) { const el = document.getElementById(id); if (el) el.type = el.type === 'password' ? 'text' : 'password'; }
function openChangePasscodeModal() { safeSetVal('inpCurrentPass', ""); safeSetVal('inpNewPass', ""); openModalWithHistory('changePasscodeModal'); }
function closeChangePasscodeModal() { closeModalSafe('changePasscodeModal'); }
function saveNewMasterPasscode() {
    const cur = (document.getElementById('inpCurrentPass')?.value || "").trim().toUpperCase(), nw = (document.getElementById('inpNewPass')?.value || "").trim().toUpperCase();
    if (cur !== masterSecurityPasscode) return showAppAlert("⚠️ Security Error", "Current passcode galat hai!");
    if (!nw || nw.length < 4) return showAppAlert("⚠️ Invalid", "Passcode kam se kam 4 characters ka ho.");
    masterSecurityPasscode = nw; localStorage.setItem('pe_master_passcode', nw); localStorage.setItem('pe_app_auth_token', nw);
    if (db && isFirebaseConnected) db.ref('pe_master_passcode').set(nw);
    closeChangePasscodeModal(); showCorporateToast(`Master Passcode updated: ${nw}`);
}

// 6. NAVIGATION & DEVICE VIEW MODES
window.addEventListener('popstate', () => handleDeviceBackButton());
function handleDeviceBackButton() {
    const openModals = document.querySelectorAll('.modal.active, .confirm-dialog-modal.active');
    if (openModals.length > 0) { openModals.forEach(m => m.classList.remove('active')); return; }
    const screenCivil = document.getElementById('screenCivilDashboard');
    if (screenCivil && screenCivil.classList.contains('active')) { handleCivilBackNav(); return; }
    const screenSite = document.getElementById('screenSiteDashboard'), screenCreate = document.getElementById('screenCreateSite'), screenSettings = document.getElementById('screenSettings');
    if ((screenSite && screenSite.classList.contains('active')) || (screenCreate && screenCreate.classList.contains('active')) || (screenSettings && screenSettings.classList.contains('active'))) openScreen('screenHome', false);
}
function handleCivilBackNav() { const site = getCurrentSite(); if (site && site.quoteType === 'civil') openScreen('screenHome', false); else openScreen('screenSiteDashboard', false); }
function openModalWithHistory(mId) { const m = document.getElementById(mId); if (m) { m.classList.add('active'); if (window.history && window.history.pushState) history.pushState({ modal: mId }, ""); } }
function closeModalSafe(mId) { const m = document.getElementById(mId); if (m) m.classList.remove('active'); }
function openScreen(sId, push = true) {
    try { if (push && window.history && window.history.pushState) history.pushState({ screen: sId }, ""); } catch (e) {}
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
function autoDetectDeviceMode() { if (manualDeviceModeOverride) return; const w = window.innerWidth; if (w >= 1025) setDeviceViewMode('desktop', false); else if (w >= 768) setDeviceViewMode('tab', false); else setDeviceViewMode('phone', false); }

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
function triggerTotalBarShimmer() { document.querySelectorAll('.solid-navy-total-bar').forEach(bar => { bar.classList.remove('shimmer-active'); void bar.offsetWidth; bar.classList.add('shimmer-active'); }); }
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
    targetBtn.appendChild(circle); setTimeout(() => { if (circle && circle.parentNode) circle.remove(); }, 500);
});

// 8. DRAG & DROP REORDERING
let activeTouchDragScope = null, activeTouchDragIndex = null, activeTouchDragParent = null, activeTouchDragElement = null;
function setupUniversalReorder(rowEl, handleEl, scope, index, parentCat = null) {
    if (!rowEl || !handleEl) return;
    rowEl.setAttribute('draggable', 'true'); rowEl.classList.add('sortable-item');
    rowEl.dataset.sortIndex = index; rowEl.dataset.sortScope = scope;
    if (parentCat) rowEl.dataset.sortParent = parentCat;
    rowEl.addEventListener('dragstart', (e) => { activeTouchDragScope = scope; activeTouchDragIndex = parseInt(index, 10); activeTouchDragParent = parentCat; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(index)); rowEl.classList.add('dragging'); });
    rowEl.addEventListener('dragend', () => { rowEl.classList.remove('dragging'); document.querySelectorAll('.sortable-item').forEach(i => i.classList.remove('drag-over')); });
    rowEl.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (activeTouchDragScope === scope && (parentCat === activeTouchDragParent)) rowEl.classList.add('drag-over'); });
    rowEl.addEventListener('dragleave', () => rowEl.classList.remove('drag-over'));
    rowEl.addEventListener('drop', (e) => {
        e.preventDefault(); e.stopPropagation(); rowEl.classList.remove('drag-over');
        const targetIdx = parseInt(rowEl.dataset.sortIndex, 10);
        if (activeTouchDragScope === scope && activeTouchDragIndex !== null && activeTouchDragIndex !== targetIdx && (parentCat === activeTouchDragParent)) handleItemsReorder(scope, activeTouchDragIndex, targetIdx, parentCat);
    });
    handleEl.addEventListener('touchstart', (e) => { e.stopPropagation(); activeTouchDragScope = scope; activeTouchDragIndex = parseInt(index, 10); activeTouchDragParent = parentCat; activeTouchDragElement = rowEl; rowEl.classList.add('dragging'); triggerHaptic(30); }, { passive: false });
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
            if (activeTouchDragScope === scope && activeTouchDragIndex !== null && activeTouchDragIndex !== targetIdx && (parentCat === activeTouchDragParent)) handleItemsReorder(scope, activeTouchDragIndex, targetIdx, parentCat);
        }
        activeTouchDragScope = activeTouchDragIndex = activeTouchDragParent = activeTouchDragElement = null;
    }, { passive: false });
}
function handleItemsReorder(scope, fromIndex, toIndex, parentCat = null) {
    const site = getCurrentSite(); if (!site) return;
    const from = parseInt(fromIndex, 10), to = parseInt(toIndex, 10);
    if (scope === 'shed_modules') {
        if (!site.moduleOrder) site.moduleOrder = isSqftMode(site) ? ['prim', 'clad', 'acc', 'erect'] : ['prim', 'sec', 'clad', 'acc', 'erect'];
        const item = site.moduleOrder.splice(from, 1)[0]; site.moduleOrder.splice(to, 0, item);
    } else if (scope === 'accessories') { const item = site.accessories.splice(from, 1)[0]; site.accessories.splice(to, 0, item); }
    else if (scope === 'civil_items') { if (site.civilData[parentCat] && site.civilData[parentCat].items) { const item = site.civilData[parentCat].items.splice(from, 1)[0]; site.civilData[parentCat].items.splice(to, 0, item); } }
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); triggerHaptic(25);
    const isCivilModalOpen = document.getElementById('civilParamModal')?.classList.contains('active');
    if (isCivilModalOpen && parentCat) openCivilParamModal(parentCat); else { calcModuleTotals(); refreshLivePdfPreviewSheet(); }
}

// 9. BOOT ANIMATION & UNITS
let bootTimer = null;
function initSamsungBootAnimation() {
    const splash = document.getElementById('appBootSplashScreen'); if (!splash) return;
    triggerHaptic(30); splash.classList.remove('boot-fade-out'); splash.style.display = 'flex';
    if (bootTimer) clearTimeout(bootTimer);
    bootTimer = setTimeout(() => skipBootAnimation(), 2400);
}
function skipBootAnimation() { const splash = document.getElementById('appBootSplashScreen'); if (!splash) return; if (bootTimer) clearTimeout(bootTimer); triggerHaptic(15); splash.classList.add('boot-fade-out'); setTimeout(() => { splash.style.display = 'none'; }, 600); }
function replaySamsungBootAnimation() { const splash = document.getElementById('appBootSplashScreen'); if (!splash) return; splash.style.display = 'flex'; splash.classList.remove('boot-fade-out'); initSamsungBootAnimation(); }
const MASTER_UNITS = ["Ft", "Inch", "R.Ft", "mm", "Mtr", "Sq.Ft", "Sq.Mtr", "Cu.Ft", "Cu.Mtr", "Nos", "Pcs", "Kg", "MT", "Lot", "Set", "Pair", "Box", "Bundle", "Pkt", "Qtl", "Bags", "Rolls", "Sheets", "Hrs", "Days"];
let activeUnitCallback = null;
function openThemeUnitPicker(currentUnit, callback) {
    activeUnitCallback = callback; const container = document.getElementById('unitPickerGrid'); if (!container) return;
    container.innerHTML = "";
    MASTER_UNITS.forEach(u => { const isSelected = u.toLowerCase() === (currentUnit || '').toLowerCase(); container.innerHTML += `<div class="unit-tile ${isSelected ? 'active' : ''} btn-ripple" onclick="selectUnitFromThemeModal('${u}')"><span>${u}</span><span>${isSelected ? '✓' : ''}</span></div>`; });
    openModalWithHistory('unitPickerModal');
}
function selectUnitFromThemeModal(u) { if (activeUnitCallback) activeUnitCallback(u); closeUnitPickerModal(); }
function closeUnitPickerModal() { closeModalSafe('unitPickerModal'); }
function getNextQuoteSequenceNumber() {
    let maxSeq = parseInt(appSettings.startingQuoteSeq || 1, 10) - 1;
    sites.forEach(s => { if (s.quoteNo) { const parts = s.quoteNo.split('/'), lastPart = parseInt(parts[parts.length - 1], 10); if (!isNaN(lastPart) && lastPart > maxSeq) maxSeq = lastPart; } });
    return maxSeq + 1;
}
function saveStartingQuoteSeq(val) { const num = parseInt(val, 10); appSettings.startingQuoteSeq = (!isNaN(num) && num > 0) ? num : 1; syncDataToCloud('patel_app_settings', appSettings); }

// 10. PREVIEW SCALING & AUTOFIT
function changePdfScale(delta) { let cur = Math.round(((parseFloat(appSettings.savedPdfFontScale) || 1.0) + delta) * 100) / 100; appSettings.savedPdfFontScale = Math.min(Math.max(cur, 0.50), 1.60); syncDataToCloud('patel_app_settings', appSettings); applyScaleToSheet(); }
function resetPdfScale() { appSettings.savedPdfFontScale = 1.0; syncDataToCloud('patel_app_settings', appSettings); applyScaleToSheet(); }
function applyScaleToSheet() { const s = parseFloat(appSettings.savedPdfFontScale) || 1.0; document.documentElement.style.setProperty('--pdf-font-scale', s); const pct = Math.round(s * 100) + '%'; safeSetText('scaleIndicatorText', pct); safeSetText('civilScaleIndicatorText', pct); setTimeout(autoFitPreview, 30); }
function autoFitPreview() {
    const isDesktop = document.body.classList.contains('mode-desktop'), viewport = document.getElementById('viewportWrap'), wrapper = document.getElementById('scalingWrapper'), sheet = document.getElementById('printableA4Sheet');
    if (viewport && wrapper && sheet) {
        const availableWidth = viewport.clientWidth || viewport.offsetWidth;
        if (availableWidth > 0) {
            let baseFit = availableWidth / 746;
            if (baseFit > 1.15 && isDesktop) { baseFit = 1.0; wrapper.style.marginLeft = `${Math.round((availableWidth - 746) / 2)}px`; } else wrapper.style.marginLeft = '0px';
            wrapper.style.transformOrigin = 'top left'; wrapper.style.transform = `scale(${baseFit})`;
            const unscaledHeight = sheet.offsetHeight || wrapper.offsetHeight;
            wrapper.style.marginBottom = (baseFit !== 1.0 && unscaledHeight > 0) ? `-${Math.round(unscaledHeight * (1 - baseFit))}px` : '0px';
            viewport.style.setProperty('height', isDesktop ? '100%' : 'auto', 'important');
            viewport.style.setProperty('overflow-y', isDesktop ? 'auto' : 'visible', 'important');
        }
    }
    const civilVp = document.getElementById('civilViewportWrap'), civilWrap = document.getElementById('civilScalingWrapper'), civilSheet = document.getElementById('civilLiveSheetDisplayBox');
    if (civilVp && civilWrap) {
        const cWidth = civilVp.clientWidth || civilVp.offsetWidth;
        if (cWidth > 0) {
            let cBaseFit = cWidth / 746;
            if (cBaseFit > 1.15 && isDesktop) { cBaseFit = 1.0; civilWrap.style.marginLeft = `${Math.round((cWidth - 746) / 2)}px`; } else civilWrap.style.marginLeft = '0px';
            civilWrap.style.transformOrigin = 'top left'; civilWrap.style.transform = `scale(${cBaseFit})`;
            const cUnscaledHeight = (civilSheet && civilSheet.offsetHeight) ? civilSheet.offsetHeight : civilWrap.offsetHeight;
            civilWrap.style.marginBottom = (cBaseFit !== 1.0 && cUnscaledHeight > 0) ? `-${Math.round(cUnscaledHeight * (1 - cBaseFit))}px` : '0px';
            civilVp.style.setProperty('height', isDesktop ? '100%' : 'auto', 'important');
            civilVp.style.setProperty('overflow-y', isDesktop ? 'auto' : 'visible', 'important');
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

// 11. CLIENT DIRECTORY & GROUPING
function getClientGroupKey(s) { const name = (s.clientName || '').trim().toLowerCase(), gst = (s.custGST || '').trim().toLowerCase(); return (name && gst) ? `${name}__${gst}` : (name || 'untitled'); }
function getUniqueSavedClients() {
    const map = new Map();
    sites.forEach(s => {
        const key = getClientGroupKey(s);
        if (!map.has(key) && s.clientName) { map.set(key, { clientName: s.clientName, custContactPerson: s.custContactPerson || "", custRole: s.custRole || "", custNumber1: s.custNumber1 || "", custNumber2: s.custNumber2 || "", custAddress: s.custAddress || "", custGST: s.custGST || "", custEmail: s.custEmail || "" }); }
    });
    return Array.from(map.values());
}
let activeClientGroupKey = null;
function openClientQuotationsModal(groupKey) {
    activeClientGroupKey = groupKey; const clientQuotes = sites.filter(s => getClientGroupKey(s) === groupKey); if (!clientQuotes.length) return;
    const clientName = clientQuotes[0].clientName || "Client Project", clientGST = clientQuotes[0].custGST || "-";
    safeSetText('clientGroupModalTitle', `📂 Quotations for: ${clientName}`);
    safeSetText('clientGroupModalSubtitle', `GSTIN: ${clientGST} | Total Proposals: ${clientQuotes.length}`);
    const container = document.getElementById('clientGroupQuotesList'); if (!container) return;
    container.innerHTML = "";
    clientQuotes.forEach(site => {
        let modeBadge = '📑 COMBINED (KG)';
        if (site.quoteType === 'civil') modeBadge = '🧱 CIVIL ONLY'; else if (site.quoteType === 'shed') modeBadge = '⚖️ SHED (KG)'; else if (site.quoteType === 'shed_sqft') modeBadge = '🏢 SHED (SQ.FT)'; else if (site.quoteType === 'both_sqft') modeBadge = '📐 COMB. (SQ.FT)';
        container.innerHTML += `<div class="client-group-card btn-ripple" onclick="loadSiteToDashboard('${site.id}'); closeModalSafe('clientQuotesModal');" style="cursor:pointer;"><div style="flex:1;"><div style="display:flex;gap:6px;align-items:center;"><span style="font-size:10px;font-weight:800;background:#fef3c7;color:#92400e;padding:2px 6px;border-radius:4px;">${site.quoteNo || 'DRAFT'}</span><span style="font-size:9.5px;font-weight:800;background:#dbeafe;color:#1e40af;padding:2px 6px;border-radius:4px;">${modeBadge}</span></div><strong style="font-size:13px;color:#0f172a;display:block;margin-top:3px;">📍 ${site.custAddress || 'Site Location'}</strong><span style="font-size:11px;color:#000;font-weight:700;">Contact: ${site.custContactPerson || '-'} (${site.custNumber1 || '-'})</span></div><div style="display:flex;gap:6px;align-items:center;"><button class="btn-site-delete btn-ripple" onclick="event.stopPropagation();triggerCustomDelete('${site.id}','${site.clientName}');">🗑️</button></div></div>`;
    });
    openModalWithHistory('clientQuotesModal');
}
function createNewQuoteForCurrentGroup() {
    if (!activeClientGroupKey) return;
    const clientQuotes = sites.filter(s => getClientGroupKey(s) === activeClientGroupKey);
    closeModalSafe('clientQuotesModal'); openCreateSiteScreen();
    if (clientQuotes.length > 0) {
        const c = clientQuotes[0];
        safeSetVal('custName', c.clientName || ''); safeSetVal('custContactPerson', c.custContactPerson || ''); safeSetVal('custRole', c.custRole || ''); safeSetVal('custNumber1', c.custNumber1 || ''); safeSetVal('custNumber2', c.custNumber2 || ''); safeSetVal('custAddress', c.custAddress || ''); safeSetVal('custGST', c.custGST || ''); safeSetVal('custEmail', c.custEmail || '');
        showCorporateToast(`Creating repeat quote for "${c.clientName}"`, "➕");
    }
}

// 12. HOMEPAGE
let tempNewQuoteType = 'both';
function setNewSiteQuoteType(type) { tempNewQuoteType = type; document.querySelectorAll('#createQuoteTypeGrid .quote-type-card').forEach(c => c.classList.remove('active')); document.getElementById('cardQuoteType_' + type)?.classList.add('active'); }
function renderHomeScreen() {
    safeSetText('appLogoName', appSettings.ownerName || "PATEL ENGINEERING");
    safeSetText('statTotalSites', sites.length); safeSetText('statActiveQuotes', sites.length);
    if (appSettings.logoData) safeSetHtml('appLogoBadge', `<img src="${appSettings.logoData}" alt="Logo">`);
    const container = document.getElementById('sitesListContainer'); if (!container) return;
    container.innerHTML = "";
    if (sites.length === 0) { container.innerHTML = `<div style="text-align:center;padding:40px 20px;color:#000;"><p style="font-size:38px;margin-bottom:8px;">🏢</p><p style="font-weight:900;color:#000;">No proposals found.</p><p style="font-size:12.5px;margin-top:4px;font-weight:700;">Click the top button to create a new quotation.</p></div>`; return; }
    const clientGroups = {};
    sites.forEach(s => { const key = getClientGroupKey(s); if (!clientGroups[key]) clientGroups[key] = []; clientGroups[key].push(s); });
    Object.keys(clientGroups).forEach(groupKey => {
        const group = clientGroups[groupKey];
        if (group.length === 1) {
            const site = group[0], sqft = ((parseFloat(site.dimW) || 0) * (parseFloat(site.dimL) || 0));
            let modeBadge = '📑 COMBINED (KG)';
            if (site.quoteType === 'civil') modeBadge = '🧱 CIVIL ONLY'; else if (site.quoteType === 'shed') modeBadge = '⚖️ SHED (KG)'; else if (site.quoteType === 'shed_sqft') modeBadge = '🏢 SHED (SQ.FT)'; else if (site.quoteType === 'both_sqft') modeBadge = '📐 COMB. (SQ.FT)';
            container.innerHTML += `<div class="card card-3d btn-ripple" onclick="loadSiteToDashboard('${site.id}')" style="cursor:pointer;user-select:none;"><div style="display:flex;justify-content:space-between;align-items:center;"><div style="flex:1;padding-right:10px;"><div style="display:flex;gap:6px;align-items:center;"><span style="font-size:10px;font-weight:900;color:#92400e;background:#fef3c7;padding:2px 7px;border-radius:4px;">${site.quoteNo || 'DRAFT'}</span><span style="font-size:9.5px;font-weight:900;color:#1e40af;background:#dbeafe;padding:2px 6px;border-radius:4px;">${modeBadge}</span></div><h3 style="font-size:15px;font-weight:900;color:#000;margin-top:5px;">${site.clientName || 'Untitled Client'}</h3><p style="font-size:12px;color:#000;font-weight:700;margin-top:2px;">📍 ${site.custAddress || 'Project Site'}</p>${site.quoteType !== 'civil' ? `<p style="font-size:11.5px;font-weight:900;color:#0c1e30;margin-top:3px;">Area: ${sqft > 0 ? sqft.toLocaleString('en-IN') + ' Sq.Ft' : '-'}</p>` : ''}</div><div style="display:flex;gap:6px;align-items:center;"><button class="btn-site-delete btn-ripple" onclick="event.stopPropagation();triggerCustomDelete('${site.id}','${site.clientName}')">🗑️</button></div></div></div>`;
        } else {
            const leadSite = group[0];
            container.innerHTML += `<div class="card card-3d btn-ripple" onclick="openClientQuotationsModal('${groupKey}')" style="cursor:border-left:5px solid #2563eb !important;background:linear-gradient(135deg,#ffffff 0%,#f0f7ff 100%);user-select:none;"><div style="display:flex;justify-content:space-between;align-items:center;"><div style="flex:1;padding-right:10px;"><div style="display:flex;gap:6px;align-items:center;"><span style="font-size:10px;font-weight:900;color:#ffffff;background:#2563eb;padding:2px 8px;border-radius:4px;">📂 ${group.length} PROPOSALS</span>${leadSite.custGST ? `<span style="font-size:9.5px;font-weight:800;color:#0f172a;background:#e2e8f0;padding:2px 6px;border-radius:4px;">GST: ${leadSite.custGST}</span>` : ''}</div><h3 style="font-size:15px;font-weight:900;color:#0c1e30;margin-top:5px;">${leadSite.clientName}</h3><p style="font-size:12px;color:#000;font-weight:700;margin-top:2px;">📍 ${leadSite.custAddress || 'Project Client'}</p><p style="font-size:11.5px;font-weight:900;color:#2563eb;margin-top:3px;">Tap to view all ${group.length} quotations</p></div></div></div>`;
        }
    });
}
let pendingDeleteId = null;
function triggerCustomDelete(siteId, clientName) { pendingDeleteId = siteId; safeSetText('confirmTitle', "Delete Quotation?"); safeSetText('confirmDesc', `Permanently delete "${clientName || 'this proposal'}"?`); openModalWithHistory('customConfirmModal'); }
function resolveCustomConfirm(isConfirmed) {
    if (isConfirmed && pendingDeleteId) { sites = sites.filter(s => s.id !== pendingDeleteId); syncDataToCloud('patel_app_sites', sites); renderHomeScreen(); loadPhoneSettingsUI(); showCorporateToast("Quotation deleted successfully", "🗑️"); if (activeClientGroupKey) openClientQuotationsModal(activeClientGroupKey); }
    pendingDeleteId = null; closeModalSafe('customConfirmModal');
}
function openCreateSiteScreen() {
    safeSetVal('custName', ""); safeSetVal('custContactPerson', ""); safeSetVal('custRole', ""); safeSetVal('custNumber1', ""); safeSetVal('custNumber2', ""); safeSetVal('custAddress', ""); safeSetVal('custGST', ""); safeSetVal('custEmail', "");
    setNewSiteQuoteType('both'); openScreen('screenCreateSite');
}

function saveNewBlankSiteAndOpen() {
    const clientNameInput = (document.getElementById('custName')?.value || "").trim();
    if (!clientNameInput) return showAppAlert("⚠️ Client Name Required", "Please enter Client Name.");
    const currentYear = new Date().getFullYear(), nextSeq = getNextQuoteSequenceNumber(), autoQuoteNumber = "PE/" + currentYear + "/" + nextSeq;
    const isNewSqft = (tempNewQuoteType === 'shed_sqft' || tempNewQuoteType === 'both_sqft');
    const bp = JSON.parse(JSON.stringify(masterBlueprint)), sqBp = JSON.parse(JSON.stringify(sqftMasterBlueprint));
    const newSite = {
        id: 'site_' + Date.now(), clientName: clientNameInput, custContactPerson: (document.getElementById('custContactPerson')?.value || "").trim(), custRole: (document.getElementById('custRole')?.value || "").trim(), quoteNo: autoQuoteNumber, quoteType: tempNewQuoteType,
        custNumber1: (document.getElementById('custNumber1')?.value || "").trim(), custNumber2: (document.getElementById('custNumber2')?.value || "").trim(), custAddress: (document.getElementById('custAddress')?.value || "").trim() || "", custGST: (document.getElementById('custGST')?.value || "").trim(), custEmail: (document.getElementById('custEmail')?.value || "").trim(), selectedTaxId: "gst18_split", civilSelectedTaxId: "gst18_split", rateOnlyMode: false, civilRateOnlyMode: false,
        civilEnabled: hasCivilMode({ quoteType: tempNewQuoteType }), shedEnabled: hasShedMode({ quoteType: tempNewQuoteType }), dimW: "", dimL: "", dimH: "", shedSqftRate: "",
        sqftScopeDesc: appSettings.sqftPdfScopeTitle !== undefined ? appSettings.sqftPdfScopeTitle : (sqBp.sqftScopeDesc || "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - SQ.FT BASIS"),
        sqftTableDesc: appSettings.sqftHeaderLine1 !== undefined ? appSettings.sqftHeaderLine1 : (sqBp.sqftTableDesc || "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:"),
        sqftPrimSpecs: (sqBp.primSpecs || []).map(p => ({ text: p.text || "", length: "", width: "", thk: "", dimUnit: p.dimUnit || "mm", selected: true })),
        sqftAccessories: (sqBp.accessories || []).map(a => ({ name: a.name || "", qty: "", unit: a.unit || "Nos", selected: true })),
        sqftPrimCustomLine: sqBp.sqftPrimCustomLine !== undefined ? sqBp.sqftPrimCustomLine : "Heavy Duty Structural Steel Portal Framing System",
        sqftCladCustomLine: sqBp.sqftCladCustomLine !== undefined ? sqBp.sqftCladCustomLine : "0.50mm TATA BlueScope / JSW Colour Coated Profile Sheet",
        sqftAccCustomLine: sqBp.sqftAccCustomLine !== undefined ? sqBp.sqftAccCustomLine : "Standard Industrial Shed Accessories Package",
        sqftErectCustomLine: sqBp.sqftErectCustomLine !== undefined ? sqBp.sqftErectCustomLine : "Crane, Hydra, Welding Machine, Expert Labour",
        moduleOrder: isNewSqft ? (sqBp.moduleOrder || ['prim', 'clad', 'acc', 'erect']) : (bp.moduleOrder || ['prim', 'sec', 'clad', 'acc', 'erect']),
        customModules: isNewSqft ? (sqBp.customModules || []).map(m => ({ ...m, qty: "", rate: "", total: 0 })) : (bp.customModules || []).map(m => ({ ...m, qty: "", rate: "", total: 0 })),
        primEnabled: true, secEnabled: true, cladEnabled: true, accEnabled: true, erectEnabled: true,
        primSpecs: (bp.primSpecs || []).map(p => ({ text: p.text || p, selected: true })), secSpecs: (bp.secSpecs || []).map(s => ({ text: s.text || s, selected: true })),
        accessories: (bp.accessories || []).map(a => ({ name: a.name, qty: "", unit: a.unit || "Nos", rate: "", selected: a.selected !== false })),
        erectSpecs: (bp.erectSpecs || []).map(e => ({ text: e.text || e, selected: true })), primWeight: "", primRate: "", primUnit: bp.primUnit || "Kg", secWeight: "", secRate: "", secUnit: bp.secUnit || "Kg",
        cladThickness: isNewSqft ? (sqBp.cladThickness || "0.50 mm") : (bp.cladThickness || "0.50 mm"), cladSqFt: "", cladRate: "", cladUnit: bp.cladUnit || "Sq.Ft", erectRate: "", erectUnit: bp.erectUnit || "Kg",
        primCustomLine: bp.primCustomLine !== undefined ? bp.primCustomLine : "Fabrication with FE 345 Steel, Cutting, Welding, 1 Coat Primer",
        secCustomLine: bp.secCustomLine !== undefined ? bp.secCustomLine : "Z Purlin 200 & 150 - 2.0mm Galvanized 120 GSM, Girts & Bracings",
        cladCustomLine: bp.cladCustomLine !== undefined ? bp.cladCustomLine : "0.50mm TATA BlueScope / JSW Colour Coated Sheet",
        accCustomLine: bp.accCustomLine !== undefined ? bp.accCustomLine : "Turbo Ventilators, Gutters, Down Pipes, Anchor Bolts, Nuts & Bolts",
        erectCustomLine: bp.erectCustomLine !== undefined ? bp.erectCustomLine : "Crane, Hydra, Welding Machine, Labour",
        foundEnabled: true, brickEnabled: true, floorEnabled: true, civilScopeDesc: appSettings.civilScopeDesc !== undefined ? appSettings.civilScopeDesc : (bp.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS"),
        civilData: bp.civilData ? JSON.parse(JSON.stringify(bp.civilData)) : {},
        civilCustomCategories: (bp.civilCustomCategories || []).map(c => ({ ...c, enabled: true, items: (c.items || []).map(it => ({ ...it, qty: "", rate: "", total: 0, enabled: it.enabled !== false })) }))
    };
    ['foundation', 'brickWall', 'flooring'].forEach(sec => { if (newSite.civilData[sec] && newSite.civilData[sec].items) newSite.civilData[sec].items.forEach(it => { it.qty = ""; it.rate = ""; it.enabled = true; }); });
    sites.unshift(newSite); syncDataToCloud('patel_app_sites', sites); renderHomeScreen(); loadPhoneSettingsUI(); loadSiteToDashboard(newSite.id); showCorporateToast(`New Proposal ${autoQuoteNumber} created!`);
}
function getCurrentSite() { return sites.find(s => s.id === currentSiteId); }
function loadSiteToDashboard(siteId) {
    currentSiteId = siteId; const site = getCurrentSite(); if (!site) return;
    if (!site.quoteType) site.quoteType = 'both';
    if (!site.moduleOrder) site.moduleOrder = isSqftMode(site) ? ['prim', 'clad', 'acc', 'erect'] : ['prim', 'sec', 'clad', 'acc', 'erect'];
    if (!site.customModules) site.customModules = [];
    if (site.civilRateOnlyMode === undefined) site.civilRateOnlyMode = false;
    site.civilEnabled = hasCivilMode(site); site.shedEnabled = hasShedMode(site);
    ['prim', 'sec', 'clad', 'acc', 'erect'].forEach(k => { if (site[k + 'Enabled'] === undefined) site[k + 'Enabled'] = true; });
    if (site.foundEnabled === undefined) site.foundEnabled = true; if (site.brickEnabled === undefined) site.brickEnabled = true; if (site.floorEnabled === undefined) site.floorEnabled = true;
    if (site.sqftScopeDesc === undefined) site.sqftScopeDesc = appSettings.sqftPdfScopeTitle || sqftMasterBlueprint.sqftScopeDesc || "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - SQ.FT BASIS";
    if (site.sqftTableDesc === undefined) site.sqftTableDesc = appSettings.sqftHeaderLine1 || sqftMasterBlueprint.sqftTableDesc || "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:";
    if (!site.sqftPrimSpecs) site.sqftPrimSpecs = JSON.parse(JSON.stringify(sqftMasterBlueprint.primSpecs || []));
    if (!site.sqftAccessories) site.sqftAccessories = JSON.parse(JSON.stringify(sqftMasterBlueprint.accessories || []));
    if (site.civilScopeDesc === undefined) site.civilScopeDesc = appSettings.civilScopeDesc || masterBlueprint.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS";
    if (!site.selectedTaxId) site.selectedTaxId = "gst18_split"; if (!site.civilSelectedTaxId) site.civilSelectedTaxId = "gst18_split";
    ensureCivilDataOnSite(site); if (!site.civilCustomCategories) site.civilCustomCategories = [];
    safeSetText('dashSiteName', site.clientName || "Untitled Client"); safeSetText('dashQuoteNo', site.quoteNo + (site.custAddress ? (" | " + site.custAddress) : ""));
    safeSetVal('dimW', site.dimW || ""); safeSetVal('dimL', site.dimL || ""); safeSetVal('dimH', site.dimH || ""); safeSetVal('shedSqftRateInput', site.shedSqftRate || "");
    const isSqft = isSqftMode(site), sqftRateRow = document.getElementById('shedSqftRateInputRow'), secCard = document.getElementById('cardModSec'), addPrimBtn = document.getElementById('btnPreviewAddSqftPrimItem');
    if (sqftRateRow) sqftRateRow.style.display = isSqft ? 'block' : 'none';
    if (secCard) secCard.style.display = isSqft ? 'none' : 'flex';
    if (addPrimBtn) addPrimBtn.style.display = isSqft ? 'inline-block' : 'none';
    updatePillTogglesUI(); updateModulePillBadgesUI(); updateCivilModulePillBadgesUI(); updateTaxDisplay(); updateHeaderBannersUI(); renderCustomModulesDashboardList(); renderCivilCustomCategoriesUI(); renderDynamicPdfActionsBar(); calcModuleTotals(); applyCustomButtonNamesUI(); refreshLivePdfPreviewSheet();
    if (site.quoteType === 'civil') openCivilDashboardScreen(); else openScreen('screenSiteDashboard');
    setTimeout(attachDynamicPreviewObserver, 150);
}

// 13. EDIT CUSTOMER & 2-WAY PERMANENT SYNC
let tempEditQuoteType = 'both';
function openEditCustomerModal() {
    const site = getCurrentSite(); if (!site) return;
    safeSetVal('editCustName', site.clientName || ""); safeSetVal('editCustContactPerson', site.custContactPerson || ""); safeSetVal('editCustRole', site.custRole || ""); safeSetVal('editCustNumber1', site.custNumber1 || ""); safeSetVal('editCustNumber2', site.custNumber2 || ""); safeSetVal('editCustAddress', site.custAddress || ""); safeSetVal('editCustGST', site.custGST || ""); safeSetVal('editCustEmail', site.custEmail || "");
    setEditSiteQuoteType(site.quoteType || 'both'); openModalWithHistory('editCustomerModal');
}
function closeEditCustomerModal() { closeModalSafe('editCustomerModal'); }
function setEditSiteQuoteType(type) { tempEditQuoteType = type; document.querySelectorAll('#editQuoteTypeGrid .quote-type-card').forEach(c => c.classList.remove('active')); document.getElementById('editCardQuoteType_' + type)?.classList.add('active'); }
function saveEditCustomerDetails() {
    const site = getCurrentSite(); if (!site) return;
    const name = (document.getElementById('editCustName')?.value || "").trim();
    if (!name) return showAppAlert("⚠️ Client Name Required", "Please enter Client Name.");
    site.clientName = name; site.custContactPerson = (document.getElementById('editCustContactPerson')?.value || "").trim(); site.custRole = (document.getElementById('editCustRole')?.value || "").trim(); site.custNumber1 = (document.getElementById('editCustNumber1')?.value || "").trim(); site.custNumber2 = (document.getElementById('editCustNumber2')?.value || "").trim(); site.custAddress = (document.getElementById('editCustAddress')?.value || "").trim(); site.custGST = (document.getElementById('editCustGST')?.value || "").trim(); site.custEmail = (document.getElementById('editCustEmail')?.value || "").trim();
    site.quoteType = tempEditQuoteType; site.civilEnabled = hasCivilMode(site); site.shedEnabled = hasShedMode(site);
    syncDataToCloud('patel_app_sites', sites);
    safeSetText('dashSiteName', site.clientName); safeSetText('dashQuoteNo', site.quoteNo + (site.custAddress ? (" | " + site.custAddress) : "")); safeSetText('civilDashSiteName', site.clientName); safeSetText('civilDashQuoteNo', site.quoteNo);
    const isSqft = isSqftMode(site), sqftRateRow = document.getElementById('shedSqftRateInputRow'), secCard = document.getElementById('cardModSec'), addPrimBtn = document.getElementById('btnPreviewAddSqftPrimItem');
    if (sqftRateRow) sqftRateRow.style.display = isSqft ? 'block' : 'none';
    if (secCard) secCard.style.display = isSqft ? 'none' : 'flex';
    if (addPrimBtn) addPrimBtn.style.display = isSqft ? 'inline-block' : 'none';
    updatePillTogglesUI(); renderDynamicPdfActionsBar(); calcModuleTotals(); refreshLivePdfPreviewSheet(); closeEditCustomerModal();
    if (site.quoteType === 'civil') openCivilDashboardScreen(); else openScreen('screenSiteDashboard');
    showCorporateToast("Quotation & Customer Details Updated!", "👤");
}

function syncPreviewCustEdit(field, el) { const site = getCurrentSite(); if (!site) return; site[field] = el.innerText.trim(); syncDataToCloud('patel_app_sites', sites); safeSetText('dashSiteName', site.clientName); safeSetText('civilDashSiteName', site.clientName); }
function syncPermanentTextLive(fieldKey, el) {
    const val = el.innerText.trim(); appSettings[fieldKey] = val; const site = getCurrentSite();
    if (site) {
        if (isSqftMode(site)) { if (fieldKey === 'sqftPdfScopeTitle') { site.sqftScopeDesc = val; sqftMasterBlueprint.sqftScopeDesc = val; } if (fieldKey === 'sqftHeaderLine1') { site.sqftTableDesc = val; sqftMasterBlueprint.sqftTableDesc = val; } }
        else { if (fieldKey === 'pdfScopeTitle') { site.primCustomLine = val; masterBlueprint.primCustomLine = val; } if (fieldKey === 'headerLine2') { masterBlueprint.headerLine2 = val; } }
        if (fieldKey === 'civilScopeDesc') { site.civilScopeDesc = val; masterBlueprint.civilScopeDesc = val; }
        syncSiteStructureToMasterBlueprint(site);
    }
    syncDataToCloud('patel_app_settings', appSettings); syncDataToCloud('patel_sqft_master_blueprint', sqftMasterBlueprint); syncDataToCloud('patel_master_blueprint', masterBlueprint);
    const modalInp = document.getElementById('pt_' + fieldKey); if (modalInp) modalInp.value = val;
    showCorporateToast("Saved as Permanent Default!", "✓");
}
function autoSavePermanentText(fieldKey, val) {
    appSettings[fieldKey] = val; const site = getCurrentSite();
    if (site) {
        if (fieldKey === 'sqftPdfScopeTitle') { site.sqftScopeDesc = val; sqftMasterBlueprint.sqftScopeDesc = val; }
        if (fieldKey === 'sqftHeaderLine1') { site.sqftTableDesc = val; sqftMasterBlueprint.sqftTableDesc = val; }
        if (fieldKey === 'pdfScopeTitle') { site.primCustomLine = val; masterBlueprint.primCustomLine = val; }
        if (fieldKey === 'civilScopeDesc') { site.civilScopeDesc = val; masterBlueprint.civilScopeDesc = val; }
        syncSiteStructureToMasterBlueprint(site);
    }
    if (fieldKey === 'sqftPdfScopeTitle') sqftMasterBlueprint.sqftScopeDesc = val;
    if (fieldKey === 'sqftHeaderLine1') sqftMasterBlueprint.sqftTableDesc = val;
    if (fieldKey === 'civilScopeDesc') masterBlueprint.civilScopeDesc = val;
    syncDataToCloud('patel_app_settings', appSettings); syncDataToCloud('patel_sqft_master_blueprint', sqftMasterBlueprint); syncDataToCloud('patel_master_blueprint', masterBlueprint);
    applyCustomButtonNamesUI(); refreshLivePdfPreviewSheet(true);
}
function syncSqftModuleTitle(fieldKey, el) { const val = el.innerText.trim(); appSettings[fieldKey] = val; syncDataToCloud('patel_app_settings', appSettings); const modalInp = document.getElementById('pt_' + fieldKey); if (modalInp) modalInp.value = val; }
function syncSqftPrimNameLive(idx, el) { const site = getCurrentSite(); if (!site?.sqftPrimSpecs || !site.sqftPrimSpecs[idx]) return; site.sqftPrimSpecs[idx].text = el.innerText.trim(); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); }
function syncSqftPrimDimLive(idx, field, el) { const site = getCurrentSite(); if (!site?.sqftPrimSpecs || !site.sqftPrimSpecs[idx]) return; site.sqftPrimSpecs[idx][field] = el.innerText.trim(); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); }
function syncSqftAccLive(idx, el) { const site = getCurrentSite(); if (!site?.sqftAccessories || !site.sqftAccessories[idx]) return; site.sqftAccessories[idx].name = el.innerText.trim(); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); }
function syncSqftAccQtyLive(idx, el) { const site = getCurrentSite(); if (!site?.sqftAccessories || !site.sqftAccessories[idx]) return; site.sqftAccessories[idx].qty = el.innerText.trim(); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); }

function syncPreviewTitleEdit(el, fPrefix, mKey = null) {
    const site = getCurrentSite(); if (!site) return; const txt = el.innerText.trim();
    if (fPrefix === 'custom' && mKey) { const c = (site.customModules || []).find(m => m.id === mKey); if (c) c.title = txt; }
    else if (isSqftMode(site)) { if (fPrefix === 'prim') site.sqftPrimCustomLine = txt; else if (fPrefix === 'clad') site.sqftCladCustomLine = txt; else if (fPrefix === 'acc') site.sqftAccCustomLine = txt; else if (fPrefix === 'erect') site.sqftErectCustomLine = txt; }
    else { if (fPrefix === 'prim') site.primCustomLine = txt; else if (fPrefix === 'sec') site.secCustomLine = txt; else if (fPrefix === 'clad') site.cladCustomLine = txt; else if (fPrefix === 'acc') site.accCustomLine = txt; else if (fPrefix === 'erect') site.erectCustomLine = txt; }
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site);
}
function syncPreviewEdit(el, field) { const site = getCurrentSite(); if (!site) return; site[field] = el.innerText.trim(); syncDataToCloud('patel_app_sites', sites); calcModuleTotals(); refreshLivePdfPreviewSheet(true); }
function syncAccTitleEdit(idx, el) { const site = getCurrentSite(); if (!site?.accessories || !site.accessories[idx]) return; site.accessories[idx].name = el.innerText.trim(); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); }
function syncPreviewAccEdit(idx, field, el) { const site = getCurrentSite(); if (!site?.accessories || !site.accessories[idx]) return; site.accessories[idx][field] = el.innerText.trim(); syncDataToCloud('patel_app_sites', sites); calcModuleTotals(); refreshLivePdfPreviewSheet(true); }
function syncCivilTitleEdit(el, secKey, idx) { const site = getCurrentSite(); if (!site?.civilData?.[secKey]?.items?.[idx]) return; site.civilData[secKey].items[idx].name = el.innerText.trim(); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); }
function syncPreviewTermsEdit(field, el) { const val = el.innerText.trim(); appSettings[field] = val; syncDataToCloud('patel_app_settings', appSettings); const modalInp = document.getElementById(field); if (modalInp) modalInp.value = val; }

// 14. CIVIL DATA & TOGGLES
function ensureCivilDataOnSite(site) {
    if (!site.civilData) site.civilData = JSON.parse(JSON.stringify(masterBlueprint.civilData));
    ['foundation', 'brickWall', 'flooring'].forEach(sec => {
        if (!site.civilData[sec]) site.civilData[sec] = JSON.parse(JSON.stringify(masterBlueprint.civilData[sec]));
        if (!site.civilData[sec].items) site.civilData[sec].items = JSON.parse(JSON.stringify(masterBlueprint.civilData[sec].items));
        site.civilData[sec].items.forEach(it => { if (it.enabled === undefined) it.enabled = true; if (it.qty === undefined) it.qty = ""; if (it.rate === undefined) it.rate = ""; });
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
    const site = getCurrentSite(), isSqft = isSqftMode(site);
    if (isSqft) {
        safeSetText('dashBtnTitlePrim', appSettings.sqftBtnNamePrim || appSettings.sqftPrimLabel || "1. Primary Framing");
        safeSetText('dashBtnTitleClad', appSettings.sqftBtnNameClad || appSettings.sqftCladLabel || "2. Cladding System");
        safeSetText('dashBtnTitleAcc', appSettings.sqftBtnNameAcc || appSettings.sqftAccLabel || "3. Accessories Package");
        safeSetText('dashBtnTitleErect', appSettings.sqftBtnNameErect || appSettings.sqftErectLabel || "4. Turnkey Erection");
    } else {
        safeSetText('dashBtnTitlePrim', appSettings.btnNamePrim || "1. Primary");
        safeSetText('dashBtnTitleSec', appSettings.btnNameSec || "2. Secondary");
        safeSetText('dashBtnTitleClad', appSettings.btnNameClad || "3. Cladding");
        safeSetText('dashBtnTitleAcc', appSettings.btnNameAcc || "4. Accessories");
        safeSetText('dashBtnTitleErect', appSettings.btnNameErect || "5. Erection");
    }
    safeSetText('dashBtnTitleFoundation', appSettings.btnNameFoundation || "1. Foundation Details");
    safeSetText('dashBtnTitleBrick', appSettings.btnNameBrick || "2. Brick Wall Details");
    safeSetText('dashBtnTitleFlooring', appSettings.btnNameFlooring || "3. Flooring Details");
}
function toggleModuleActiveState(modKey) { const site = getCurrentSite(); if (!site) return; site[modKey + 'Enabled'] = !site[modKey + 'Enabled']; syncDataToCloud('patel_app_sites', sites); updateModulePillBadgesUI(); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
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
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); updateCivilModulePillBadgesUI(); calcModuleTotals(); refreshLivePdfPreviewSheet();
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
function toggleRateOnlyMode() { const site = getCurrentSite(); if (!site) return; site.rateOnlyMode = !site.rateOnlyMode; syncDataToCloud('patel_app_sites', sites); updatePillTogglesUI(); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function toggleCivilRateOnlyMode() { const site = getCurrentSite(); if (!site) return; site.civilRateOnlyMode = !site.civilRateOnlyMode; syncDataToCloud('patel_app_sites', sites); updatePillTogglesUI(); refreshLivePdfPreviewSheet(); }
function updatePillTogglesUI() {
    const site = getCurrentSite(); if (!site) return; const isBoth = (site.quoteType === 'both' || site.quoteType === 'both_sqft');
    const btnRate = document.getElementById('pillBtnRateMode'), txtRate = document.getElementById('pillTxtRateMode');
    const btnCivRate = document.getElementById('pillBtnCivilRateMode'), txtCivRate = document.getElementById('pillTxtCivilRateMode'), boxCiv = document.getElementById('civilSectionsContainer');
    if (btnRate && txtRate) { btnRate.classList.toggle('active', !!site.rateOnlyMode); txtRate.innerText = site.rateOnlyMode ? "Shed Rates (ON)" : "Shed BOQ"; }
    if (btnCivRate && txtCivRate) { btnCivRate.classList.toggle('active', !!site.civilRateOnlyMode); txtCivRate.innerText = site.civilRateOnlyMode ? "Civil Rates (ON)" : "Civil BOQ"; btnCivRate.style.display = isBoth ? 'flex' : 'none'; }
    if (boxCiv) boxCiv.style.display = isBoth ? 'block' : 'none';
    const civPillCivRate = document.getElementById('pillBtnCivilScreenCivRateMode'), civTxtCivRate = document.getElementById('pillTxtCivilScreenCivRateMode');
    if (civPillCivRate && civTxtCivRate) { civPillCivRate.classList.toggle('active', !!site.civilRateOnlyMode); civTxtCivRate.innerText = site.civilRateOnlyMode ? "Civil Rates (ON)" : "Civil BOQ"; }
}

// 15. CIVIL DASHBOARD
function openCivilDashboardScreen() {
    const site = getCurrentSite(); if (!site) return;
    safeSetText('civilDashSiteName', site.clientName || "Untitled Client"); safeSetText('civilDashQuoteNo', site.quoteNo || "#PE/2026/01");
    safeSetText('civilScopeDescPreviewTxt', site.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS");
    renderCivilCustomCategoriesUI(); updatePillTogglesUI(); updateCivilModulePillBadgesUI(); updateTaxDisplay(); updateHeaderBannersUI(); calcModuleTotals(); openScreen('screenCivilDashboard');
    setTimeout(() => { refreshLivePdfPreviewSheet(); syncCivilLivePreviewBox(); autoFitPreview(); }, 80);
}
function syncCivilLivePreviewBox() {
    const pSheet = document.getElementById('printableA4Sheet'), civilLiveBox = document.getElementById('civilLiveSheetDisplayBox');
    if (pSheet && civilLiveBox) {
        civilLiveBox.innerHTML = ""; const clone = pSheet.cloneNode(true);
        clone.id = 'printableA4Sheet_civilDisplayMirror'; clone.style.display = 'flow-root';
        const cloneShed = clone.querySelector('#page1MsStructure'), cloneCivil = clone.querySelector('#civilDedicatedPageSheet'), cloneGap = clone.querySelector('#civilPageGapDivider');
        const site = getCurrentSite();
        if (cloneCivil) cloneCivil.style.setProperty('display', 'flow-root', 'important');
        if (site && site.quoteType === 'civil') { if (cloneShed) cloneShed.remove(); if (cloneGap) cloneGap.remove(); }
        else if (site && (site.quoteType === 'shed' || site.quoteType === 'shed_sqft')) { if (cloneCivil) cloneCivil.remove(); if (cloneGap) cloneGap.remove(); }
        else { if (!hasShedMode(site) && cloneShed) cloneShed.remove(); if (!hasCivilMode(site) && cloneCivil) cloneCivil.remove(); if ((!hasShedMode(site) || !hasCivilMode(site)) && cloneGap) cloneGap.remove(); }
        civilLiveBox.appendChild(clone);
    }
}
function openCivilScopeModal() { const site = getCurrentSite(); safeSetVal('inp_civilScopeDescModal', site?.civilScopeDesc || masterBlueprint.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS"); openModalWithHistory('civilScopeModal'); }
function closeCivilScopeModal() { closeModalSafe('civilScopeModal'); }
function saveCivilScopeModal() {
    const site = getCurrentSite(); if (!site) return; const nw = (document.getElementById('inp_civilScopeDescModal')?.value || "").trim();
    site.civilScopeDesc = nw; masterBlueprint.civilScopeDesc = nw; appSettings.civilScopeDesc = nw;
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); syncDataToCloud('patel_app_settings', appSettings);
    safeSetText('civilScopeDescPreviewTxt', nw); closeCivilScopeModal(); refreshLivePdfPreviewSheet(); setTimeout(() => openCivilDashboardScreen(), 50);
}

// 16. CIVIL PARAMETERS MODAL
let activeCivilModalType = null;
function openCivilParamModal(type) {
    activeCivilModalType = type; const site = getCurrentSite(); if (!site) return;
    ensureCivilDataOnSite(site); const container = document.getElementById('civilModalRowsContainer'), title = document.getElementById('civilModalTitle'); if (!container || !title) return;
    const secData = site.civilData[type]; title.innerHTML = `🧱 <input type="text" class="modal-title-edit" value="${secData.title}" oninput="updateCivilSecTitle('${type}',this.value)">`;
    let html = "";
    (secData.items || []).forEach((item, idx) => {
        const isSelected = item.enabled !== false, lineTotal = isSelected ? ((parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0)) : 0;
        html += `<div class="civil-calc-card card-3d sortable-item ${isSelected ? '' : 'disabled-mod'}" id="civCard_${type}_${idx}" data-sort-index="${idx}"><div class="acc-top-row"><div style="display:flex;align-items:center;gap:8px;flex:1;min-width:0;" onclick="toggleCivilItemTick('${type}',${idx})"><span class="drag-handle" id="handle_civ_${type}_${idx}" onclick="event.stopPropagation()" title="Drag to reorder">⋮⋮</span><div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation();toggleCivilItemTick('${type}',${idx})">${isSelected ? '✓' : ''}</div><strong style="font-size:12px;color:#0f172a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${idx + 1}. ${item.name}</strong></div><div style="display:flex;align-items:center;gap:6px;flex-shrink:0;"><span class="acc-total-pill">${lineTotal > 0 ? '₹ ' + Math.round(lineTotal).toLocaleString('en-IN') : (isSelected ? '-' : 'OFF')}</span><button type="button" class="btn-del-pro btn-ripple" onclick="deleteCivilItem('${type}',${idx})">🗑️</button></div></div><div class="form-group" style="margin-bottom:8px;"><label>Item Description</label><input type="text" value="${item.name}" oninput="updateCivilItemField('${type}',${idx},'name',this.value)"></div><div class="row-3"><div class="form-group" style="margin:0;"><label>Qty / Area</label><input type="number" inputmode="decimal" step="any" placeholder="-" value="${item.qty || ''}" oninput="updateCivilItemField('${type}',${idx},'qty',this.value)"></div><div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPicker('${item.unit}',(u)=>{updateCivilItemField('${type}',${idx},'unit',u);openCivilParamModal('${type}');})">${item.unit || 'Lot'} ▾</button></div><div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" placeholder="-" value="${item.rate || ''}" oninput="updateCivilItemField('${type}',${idx},'rate',this.value)"></div></div></div>`;
    });
    container.innerHTML = html;
    (secData.items || []).forEach((_, idx) => { const row = document.getElementById(`civCard_${type}_${idx}`), handle = document.getElementById(`handle_civ_${type}_${idx}`); if (row && handle) setupUniversalReorder(row, handle, 'civil_items', idx, type); });
    openModalWithHistory('civilParamModal');
}
function toggleCivilItemTick(type, idx) { const site = getCurrentSite(); if (!site?.civilData[type]?.items[idx]) return; site.civilData[type].items[idx].enabled = !(site.civilData[type].items[idx].enabled !== false); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); openCivilParamModal(type); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function deleteCivilItem(type, idx) { const site = getCurrentSite(); if (!site?.civilData[type]?.items) return; site.civilData[type].items.splice(idx, 1); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); openCivilParamModal(type); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function updateCivilSecTitle(section, val) { const site = getCurrentSite(); if (!site) return; site.civilData[section].title = val; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet(); }
function updateCivilItemField(section, idx, field, val) { const site = getCurrentSite(); if (!site?.civilData[section]?.items[idx]) return; site.civilData[section].items[idx][field] = val; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function addCivilRowDirectly(secKey) { const site = getCurrentSite(); if (!site) return; ensureCivilDataOnSite(site); const targetList = site.civilData[secKey].items; targetList.push({ id: 'citem_' + Date.now(), name: "New Civil Work Item #" + (targetList.length + 1), qty: "", unit: "Lot", rate: "", enabled: true }); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function addCustomRowToActiveCivilSection() { if (!activeCivilModalType) return; addCivilRowDirectly(activeCivilModalType); openCivilParamModal(activeCivilModalType); }
function closeCivilParamModal() { closeModalSafe('civilParamModal'); calcModuleTotals(); refreshLivePdfPreviewSheet(); setTimeout(() => openCivilDashboardScreen(), 50); }

// 17. UNIVERSAL MODULE ADDER
let universalModMode = 'shed', universalModUnit = 'Lot';
function openAddUniversalModuleModal(mode) {
    universalModMode = mode; universalModUnit = 'Lot'; safeSetText('universalModHeading', mode === 'civil' ? "➕ Add Civil Module" : "➕ Add Custom Module");
    safeSetVal('umod_title', ""); safeSetVal('umod_desc', ""); safeSetVal('umod_qty', ""); safeSetVal('umod_rate', ""); safeSetText('btn_umod_unit', "Lot ▾"); recalcUmodPreviewAmount(); openModalWithHistory('universalModuleModal');
}
function recalcUmodPreviewAmount() { const q = parseFloat(document.getElementById('umod_qty')?.value) || 0, r = parseFloat(document.getElementById('umod_rate')?.value) || 0; safeSetText('umodCalculatedAmtText', (q * r) > 0 ? '₹ ' + Math.round(q * r).toLocaleString('en-IN') : '-'); }
function openThemeUnitPickerForUniversalMod() { openThemeUnitPicker(universalModUnit, (u) => { universalModUnit = u; safeSetText('btn_umod_unit', u + " ▾"); }); }
function closeUniversalModuleModal() { closeModalSafe('universalModuleModal'); }
function saveUniversalModule() {
    const site = getCurrentSite(); if (!site) return; const title = (document.getElementById('umod_title')?.value || "").trim(); if (!title) return showAppAlert("⚠️ Required", "Please enter Module Title!");
    const descVal = (document.getElementById('umod_desc')?.value || "").trim(), qtyRaw = document.getElementById('umod_qty')?.value || "", rateRaw = document.getElementById('umod_rate')?.value || "";
    const qtyVal = parseFloat(qtyRaw) || 0, rateVal = parseFloat(rateRaw) || 0, totalVal = qtyVal * rateVal;
    if (universalModMode === 'civil') {
        if (!site.civilCustomCategories) site.civilCustomCategories = [];
        site.civilCustomCategories.push({ id: 'civcat_' + Date.now(), categoryName: title, enabled: true, items: [{ name: descVal || title, qty: qtyRaw, unit: universalModUnit, rate: rateRaw, total: totalVal, enabled: true }] });
        renderCivilCustomCategoriesUI();
    } else {
        if (!site.customModules) site.customModules = []; const newModId = 'cmod_' + Date.now();
        site.customModules.push({ id: newModId, title, desc: descVal, unit: universalModUnit, qty: qtyRaw, rate: rateRaw, total: totalVal, enabled: true });
        if (!site.moduleOrder) site.moduleOrder = isSqftMode(site) ? ['prim', 'clad', 'acc', 'erect'] : ['prim', 'sec', 'clad', 'acc', 'erect'];
        site.moduleOrder.push(newModId); renderCustomModulesDashboardList();
    }
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); closeUniversalModuleModal(); refreshLivePdfPreviewSheet(); showCorporateToast(`Module "${title}" Added!`);
}
function renderCivilCustomCategoriesUI() {
    const site = getCurrentSite(), box = document.getElementById('civilCustomCategoriesGrid'); if (!box || !site) return; box.innerHTML = "";
    (site.civilCustomCategories || []).forEach((cat, cIdx) => {
        const isEnabled = cat.enabled !== false;
        box.innerHTML += `<div class="module-grid-card card-3d-press btn-ripple ${!isEnabled ? 'disabled-mod' : ''}" style="border-left:4px solid #16a34a;"><span class="mod-switch-pill ${isEnabled ? 'on' : ''}" onclick="event.stopPropagation();toggleCustomCivilCategoryActive(${cIdx})">${isEnabled ? 'ON' : 'OFF'}</span><div><div class="mod-card-top"><span class="mod-card-icon">🏗️</span><span class="mod-card-title">${4 + cIdx}. ${cat.categoryName}</span></div><span class="mod-card-tag">${(cat.items || []).length} Items</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><span class="mod-card-badge" style="background:#166534;">Configured</span><button class="btn-del-pro btn-ripple" onclick="deleteCustomCivilCategory(${cIdx})">🗑️</button></div></div>`;
    });
}
function toggleCustomCivilCategoryActive(cIdx) { const site = getCurrentSite(); if (!site?.civilCustomCategories[cIdx]) return; site.civilCustomCategories[cIdx].enabled = !(site.civilCustomCategories[cIdx].enabled !== false); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); renderCivilCustomCategoriesUI(); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function deleteCustomCivilCategory(cIdx) { const site = getCurrentSite(); if (!site?.civilCustomCategories) return; site.civilCustomCategories.splice(cIdx, 1); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); renderCivilCustomCategoriesUI(); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function renderCustomModulesDashboardList() {
    const site = getCurrentSite(), container = document.getElementById('customModulesListContainer'); if (!container || !site) return; container.innerHTML = "";
    (site.customModules || []).forEach((mod, idx) => {
        const amt = (parseFloat(mod.qty) || 0) * (parseFloat(mod.rate) || 0), isEnabled = mod.enabled !== false;
        container.innerHTML += `<div class="module-grid-card card-3d-press ${!isEnabled ? 'disabled-mod' : ''} btn-ripple" style="border-left:4px solid var(--header-bg);"><span class="mod-switch-pill ${isEnabled ? 'on' : ''}" onclick="event.stopPropagation();toggleCustomModuleActive('${mod.id}')">${isEnabled ? 'ON' : 'OFF'}</span><div><div class="mod-card-top"><span class="mod-card-icon">✨</span><span class="mod-card-title">${(isSqftMode(site) ? 5 : 6) + idx}. ${mod.title}</span></div><span class="mod-card-tag">${mod.desc || (mod.qty + ' ' + mod.unit + ' @ ₹' + mod.rate)}</span></div><div style="display:flex;justify-content:space-between;align-items:center;"><span class="mod-card-badge">${site.rateOnlyMode ? ('₹ ' + (mod.rate || '-') + '/' + mod.unit) : (amt > 0 ? 'Rs. ' + Math.round(amt).toLocaleString('en-IN') : 'Scope')}</span><button class="btn-del-pro btn-ripple" onclick="event.stopPropagation();deleteCustomModule('${mod.id}')">🗑️</button></div></div>`;
    });
}
function toggleCustomModuleActive(modId) { const site = getCurrentSite(), mod = (site?.customModules || []).find(m => m.id === modId); if (mod) { mod.enabled = !(mod.enabled !== false); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); renderCustomModulesDashboardList(); calcModuleTotals(); refreshLivePdfPreviewSheet(); } }
function deleteCustomModule(modId) { const site = getCurrentSite(); if (!site) return; site.customModules = (site.customModules || []).filter(m => m.id !== modId); if (site.moduleOrder) site.moduleOrder = site.moduleOrder.filter(id => id !== modId); syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); renderCustomModulesDashboardList(); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function autoSaveAndUpdate() {
    const site = getCurrentSite(); if (!site) return; site.dimW = document.getElementById('dimW')?.value || ""; site.dimL = document.getElementById('dimL')?.value || ""; site.dimH = document.getElementById('dimH')?.value || ""; site.shedSqftRate = document.getElementById('shedSqftRateInput')?.value || "";
    const sqft = (parseFloat(site.dimW) || 0) * (parseFloat(site.dimL) || 0); safeSetText('dashSqFtText', sqft > 0 ? sqft.toLocaleString('en-IN') + " Sq.Ft" : "0 Sq.Ft");
    if (isSqftMode(site)) { const sqRate = parseFloat(site.shedSqftRate) || 0, autoCost = sqft * sqRate; safeSetText('shedSqftAutoCostBadge', autoCost > 0 ? "₹ " + Math.round(autoCost).toLocaleString('en-IN') : "-"); const tax = getActiveTaxSlab('shed'), withTaxRate = (tax.rate > 0 && sqRate > 0) ? (sqRate + (sqRate * tax.rate)) : 0; safeSetText('shedSqftWithTaxRateBadge', withTaxRate > 0 ? `₹ ${withTaxRate.toFixed(2)} / Sq.Ft` : (sqRate > 0 ? `₹ ${sqRate.toFixed(2)} / Sq.Ft (No Tax)` : "-")); }
    syncDataToCloud('patel_app_sites', sites); calcModuleTotals(); refreshLivePdfPreviewSheet();
}

// 18. STRUCTURE MODULE MODALS
let activeModType = null;
function openModuleModal(type) {
    activeModType = type; const site = getCurrentSite(); if (!site) return;
    const modalTitle = document.getElementById('modModalTitle'), customLineInput = document.getElementById('modalInputCustomLine');
    const inputsBox = document.getElementById('modInputsBox'), checklistTitle = document.getElementById('lblChecklistTitle'), addRowBox = document.getElementById('addItemRowBox'), subNotice = document.getElementById('modModalSubNotice');
    safeSetVal('customItemInput', ""); const isSqft = isSqftMode(site);
    if (isSqft) {
        if (type === 'prim') customLineInput.value = site.sqftPrimCustomLine !== undefined ? site.sqftPrimCustomLine : "";
        else if (type === 'clad') customLineInput.value = site.sqftCladCustomLine !== undefined ? site.sqftCladCustomLine : "";
        else if (type === 'acc') customLineInput.value = site.sqftAccCustomLine !== undefined ? site.sqftAccCustomLine : "";
        else if (type === 'erect') customLineInput.value = site.sqftErectCustomLine !== undefined ? site.sqftErectCustomLine : "";
    } else {
        if (type === 'prim') customLineInput.value = site.primCustomLine !== undefined ? site.primCustomLine : "";
        else if (type === 'sec') customLineInput.value = site.secCustomLine !== undefined ? site.secCustomLine : "";
        else if (type === 'clad') customLineInput.value = site.cladCustomLine !== undefined ? site.cladCustomLine : "";
        else if (type === 'acc') customLineInput.value = site.accCustomLine !== undefined ? site.accCustomLine : "";
        else if (type === 'erect') customLineInput.value = site.erectCustomLine !== undefined ? site.erectCustomLine : "";
    }
    if (type === 'prim') {
        modalTitle.innerHTML = `🏗️ 1. Primary Framing Structure`; checklistTitle.innerText = isSqft ? "Member Dimensions (Length, Width, Thickness, Unit):" : "Checklist Specifications:"; checklistTitle.style.display = addRowBox.style.display = 'block';
        if (isSqft) { if (subNotice) subNotice.innerText = "Sq.Ft Mode: Overall shed rate applies. Enter Length, Width, Thickness & Unit for each member."; inputsBox.innerHTML = `<div style="font-size:11px;font-weight:800;color:#0369a1;background:#e0f2fe;padding:6px 9px;border-radius:6px;border:1px solid #7dd3fc;">ℹ️ Sq.Ft Mode: Har member ki Length, Width, Thickness aur Unit fill karein.</div>`; renderSqftPrimaryChecklist(site.sqftPrimSpecs || []); }
        else { if (subNotice) subNotice.innerText = "Title, header line & specifications control"; inputsBox.innerHTML = `<div class="row-3"><div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPickerForMod('prim')">${site.primUnit || 'Kg'} ▾</button></div><div class="form-group" style="margin:0;"><label>Weight / Qty</label><input type="number" inputmode="decimal" step="any" id="modalInputWt" value="${site.primWeight}" oninput="autoSaveModuleChanges()"></div><div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.primRate}" oninput="autoSaveModuleChanges()"></div></div>`; renderStandardChecklist(site.primSpecs); }
    } else if (type === 'sec') {
        modalTitle.innerHTML = `⚙️ 2. Secondary Framing`; checklistTitle.innerText = "Specifications:"; checklistTitle.style.display = addRowBox.style.display = 'block';
        inputsBox.innerHTML = `<div class="row-3"><div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPickerForMod('sec')">${site.secUnit || 'Kg'} ▾</button></div><div class="form-group" style="margin:0;"><label>Weight / Qty</label><input type="number" inputmode="decimal" step="any" id="modalInputWt" value="${site.secWeight}" oninput="autoSaveModuleChanges()"></div><div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.secRate}" oninput="autoSaveModuleChanges()"></div></div>`; renderStandardChecklist(site.secSpecs);
    } else if (type === 'clad') {
        modalTitle.innerHTML = `🛡️ 3. Roofing & Cladding System`; checklistTitle.style.display = addRowBox.style.display = 'none';
        if (isSqft) { inputsBox.innerHTML = `<div class="form-group"><label>Sheet Thickness (e.g. 0.50 mm)</label><input type="text" id="modalInputThick" value="${site.cladThickness || ''}" placeholder="0.50 mm" oninput="autoSaveModuleChanges()"></div><div style="font-size:11px;font-weight:700;color:#475569;padding:4px 0;">💡 Sheeting parameters overall Sq.Ft contract ke sath sync rahenge.</div>`; }
        else { inputsBox.innerHTML = `<div class="form-group"><label>Sheet Thickness (e.g. 0.50 mm)</label><input type="text" id="modalInputThick" value="${site.cladThickness || ''}" placeholder="0.50 mm" oninput="autoSaveModuleChanges()"></div><div class="row-3"><div class="form-group" style="margin:0;"><label>Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPickerForMod('clad')">${site.cladUnit || 'Sq.Ft'} ▾</button></div><div class="form-group" style="margin:0;"><label>Total Coverage</label><input type="number" inputmode="decimal" step="any" id="modalInputSqFt" value="${site.cladSqFt}" oninput="autoSaveModuleChanges()"></div><div class="form-group" style="margin:0;"><label>Rate (₹)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.cladRate}" oninput="autoSaveModuleChanges()"></div></div>`; }
        document.getElementById('modItemsCheckContainer').innerHTML = `<div style="font-size:12px;color:#64748b;padding:10px 0;">💡 Sheeting parameters sync automatically.</div>`;
    } else if (type === 'acc') {
        modalTitle.innerHTML = `📦 4. Building Accessories`; checklistTitle.innerText = isSqft ? "Accessories List (Name, Quantity & Unit):" : "Accessories Breakdown (Quantity, Unit & Rate):"; checklistTitle.style.display = addRowBox.style.display = 'block';
        if (isSqft) { inputsBox.innerHTML = `<p style="font-size:11.5px;color:#0369a1;font-weight:800;margin:0;">💡 Sq.Ft Mode: Quantity & Unit technical specifications column me print honge. Khali chhodne par blank rahega.</p>`; renderSqftAccessoriesChecklist(); }
        else { inputsBox.innerHTML = `<p style="font-size:12px;color:#475569;margin:0;">Kg Mode: Har item ki Quantity, Unit aur Rate fill karein:</p>`; renderAccessoriesChecklist(); }
    } else if (type === 'erect') {
        modalTitle.innerHTML = `🚜 5. Turnkey Erection`; checklistTitle.innerText = "Scope Specifications:"; checklistTitle.style.display = addRowBox.style.display = 'block';
        if (isSqft) { inputsBox.innerHTML = `<p style="font-size:11.5px;color:#475569;margin:0;">Turnkey Erection included in overall shed rate.</p>`; }
        else { inputsBox.innerHTML = `<div class="form-group" style="margin:0;"><label>Erection Rate (₹ / Kg)</label><input type="number" inputmode="decimal" step="any" id="modalInputRt" value="${site.erectRate}" oninput="autoSaveModuleChanges()"></div>`; }
        renderStandardChecklist(site.erectSpecs);
    }
    openModalWithHistory('moduleSelectionModal');
}
function autoSaveModuleChanges() {
    const site = getCurrentSite(); if (!site) return; const customLineVal = (document.getElementById('modalInputCustomLine')?.value || "").trim(); const isSqft = isSqftMode(site);
    if (isSqft) {
        if (activeModType === 'prim') site.sqftPrimCustomLine = customLineVal;
        else if (activeModType === 'clad') { site.sqftCladCustomLine = customLineVal; const thk = document.getElementById('modalInputThick')?.value; if (thk !== undefined) site.cladThickness = thk; }
        else if (activeModType === 'acc') site.sqftAccCustomLine = customLineVal;
        else if (activeModType === 'erect') site.sqftErectCustomLine = customLineVal;
    } else {
        if (activeModType === 'prim') site.primCustomLine = customLineVal;
        else if (activeModType === 'sec') site.secCustomLine = customLineVal;
        else if (activeModType === 'clad') { site.cladCustomLine = customLineVal; const thk = document.getElementById('modalInputThick')?.value; if (thk !== undefined) site.cladThickness = thk; site.cladSqFt = document.getElementById('modalInputSqFt')?.value || ""; site.cladRate = document.getElementById('modalInputRt')?.value || ""; }
        else if (activeModType === 'acc') site.accCustomLine = customLineVal;
        else if (activeModType === 'erect') { site.erectCustomLine = customLineVal; site.erectRate = document.getElementById('modalInputRt')?.value || ""; }
        if (activeModType === 'prim') { site.primWeight = document.getElementById('modalInputWt')?.value || ""; site.primRate = document.getElementById('modalInputRt')?.value || ""; }
        else if (activeModType === 'sec') { site.secWeight = document.getElementById('modalInputWt')?.value || ""; site.secRate = document.getElementById('modalInputRt')?.value || ""; }
    }
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function renderSqftPrimaryChecklist(list) {
    const container = document.getElementById('modItemsCheckContainer'); if (!container) return; container.innerHTML = "";
    if (!list || list.length === 0) { container.innerHTML = `<div style="font-size:12.5px;color:#a1a1aa;padding:12px 0;">No items found. Add below.</div>`; return; }
    list.forEach((item, idx) => {
        const isSelected = item.selected !== false, itemName = item.text !== undefined ? item.text : item, curUnit = item.dimUnit || "mm";
        container.innerHTML += `<div class="sqft-prim-spec-card ${!isSelected ? 'disabled-mod' : ''}" id="sqftPrimCard_${idx}"><div class="sqft-prim-spec-top"><div style="display:flex;align-items:center;gap:8px;flex:1;" onclick="toggleItemTick(${idx})"><div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation();toggleItemTick(${idx})">${isSelected ? '✓' : ''}</div><input type="text" value="${itemName}" onclick="event.stopPropagation()" oninput="updateStandardChecklistItemName(${idx},this.value)" style="border:none;background:transparent;font-size:13px;font-weight:900;color:#0f172a;flex:1;outline:none;"></div><button class="btn-del-pro btn-ripple" onclick="event.stopPropagation();deleteItemFromModule(${idx})">🗑️</button></div><div class="sqft-prim-dim-grid" style="grid-template-columns:repeat(4, 1fr);"><div><label>Length</label><input type="text" placeholder="-" value="${item.length || ''}" oninput="updatePrimaryDimField(${idx},'length',this.value)"></div><div><label>Width / Size</label><input type="text" placeholder="-" value="${item.width || ''}" oninput="updatePrimaryDimField(${idx},'width',this.value)"></div><div><label>Thickness</label><input type="text" placeholder="-" value="${item.thk || ''}" oninput="updatePrimaryDimField(${idx},'thk',this.value)"></div><div><label>Unit</label><select onchange="updatePrimaryDimField(${idx},'dimUnit',this.value)"><option value="mm" ${curUnit === 'mm' ? 'selected' : ''}>mm</option><option value="Ft" ${curUnit === 'Ft' ? 'selected' : ''}>Ft</option><option value="Inch" ${curUnit === 'Inch' ? 'selected' : ''}>Inch</option><option value="Mtr" ${curUnit === 'Mtr' ? 'selected' : ''}>Mtr</option></select></div></div></div>`;
    });
}
function updatePrimaryDimField(idx, field, val) { const site = getCurrentSite(); if (!site?.sqftPrimSpecs || !site.sqftPrimSpecs[idx]) return; site.sqftPrimSpecs[idx][field] = val; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet(); }
function renderSqftAccessoriesChecklist() {
    const container = document.getElementById('modItemsCheckContainer'); if (!container) return; container.innerHTML = ""; const site = getCurrentSite();
    if (!site?.sqftAccessories || site.sqftAccessories.length === 0) { container.innerHTML = `<div style="font-size:12.5px;color:#a1a1aa;padding:12px 0;">No accessories added.</div>`; return; }
    site.sqftAccessories.forEach((acc, idx) => {
        const isSelected = acc.selected !== false;
        container.innerHTML += `<div class="tick-item-card ${isSelected ? 'selected' : ''}" onclick="toggleAccessoryTick(${idx})" style="display:flex;align-items:center;gap:6px;"><div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation();toggleAccessoryTick(${idx})">${isSelected ? '✓' : ''}</div><input type="text" value="${acc.name}" onclick="event.stopPropagation()" oninput="updateAccessoryFieldFast(${idx},'name',this.value)" style="border:none;background:transparent;font-size:12.5px;font-weight:800;color:#0f172a;flex:1;outline:none;" placeholder="Accessory Item Name"><input type="number" inputmode="decimal" value="${acc.qty || ''}" onclick="event.stopPropagation()" oninput="updateAccessoryFieldFast(${idx},'qty',this.value)" placeholder="Qty" style="width:65px;padding:4px 6px;border:1.5px solid #cbd5e1;border-radius:6px;font-size:11.5px;font-weight:800;outline:none;background:#fff;text-align:center;"><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" style="width:65px;height:30px;font-size:11px;padding:2px 4px;" onclick="event.stopPropagation();openThemeUnitPicker('${acc.unit || 'Nos'}',(u)=>{updateAccessoryFieldFast(${idx},'unit',u);renderSqftAccessoriesChecklist();})">${acc.unit || 'Nos'} ▾</button><button class="btn-del-pro btn-ripple" onclick="event.stopPropagation();deleteAccessoryItem(${idx})">🗑️</button></div>`;
    });
}
function renderAccessoriesChecklist() {
    const container = document.getElementById('modItemsCheckContainer'); if (!container) return; container.innerHTML = ""; const site = getCurrentSite();
    if (!site?.accessories || site.accessories.length === 0) { container.innerHTML = `<div style="font-size:12.5px;color:#a1a1aa;padding:12px 0;">No accessories added.</div>`; return; }
    site.accessories.forEach((a, idx) => {
        const isSelected = a.selected !== false, q = parseFloat(a.qty) || 0, r = parseFloat(a.rate) || 0, lineTot = q * r;
        container.innerHTML += `<div class="acc-item-card card-3d ${isSelected ? 'selected' : 'disabled-mod'}" id="kgAccCard_${idx}"><div class="acc-top-row"><div style="display:flex;align-items:center;gap:8px;flex:1;" onclick="toggleAccessoryTick(${idx})"><div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation();toggleAccessoryTick(${idx})">${isSelected ? '✓' : ''}</div><input type="text" value="${a.name}" onclick="event.stopPropagation()" oninput="updateAccessoryFieldFast(${idx},'name',this.value)" style="border:none;background:transparent;font-size:12.5px;font-weight:900;color:#0f172a;flex:1;outline:none;" placeholder="Item Name"></div><div style="display:flex;align-items:center;gap:6px;"><span class="acc-total-pill">${lineTot > 0 ? '₹ ' + Math.round(lineTot).toLocaleString('en-IN') : (isSelected ? '-' : 'OFF')}</span><button class="btn-del-pro btn-ripple" onclick="event.stopPropagation();deleteAccessoryItem(${idx})">🗑️</button></div></div><div class="row-3" style="margin-top:6px;"><div class="form-group" style="margin:0;"><label style="font-size:9px;">Quantity</label><input type="number" inputmode="decimal" step="any" placeholder="-" value="${a.qty || ''}" oninput="updateAccessoryFieldFast(${idx},'qty',this.value)"></div><div class="form-group" style="margin:0;"><label style="font-size:9px;">Unit</label><button type="button" class="theme-unit-btn btn-3d-secondary btn-ripple" onclick="openThemeUnitPickerForAcc(${idx})">${a.unit || 'Nos'} ▾</button></div><div class="form-group" style="margin:0;"><label style="font-size:9px;">Rate (₹)</label><input type="number" inputmode="decimal" step="any" placeholder="-" value="${a.rate || ''}" oninput="updateAccessoryFieldFast(${idx},'rate',this.value)"></div></div></div>`;
    });
}
function updateAccessoryFieldFast(idx, field, val) {
    const site = getCurrentSite();
    if (isSqftMode(site)) { if (site?.sqftAccessories?.[idx]) { site.sqftAccessories[idx][field] = val; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet(); } }
    else { if (site?.accessories?.[idx]) { site.accessories[idx][field] = val; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet(); } }
}
function toggleAccessoryTick(idx) {
    const site = getCurrentSite();
    if (isSqftMode(site)) { if (site?.sqftAccessories?.[idx]) { site.sqftAccessories[idx].selected = !(site.sqftAccessories[idx].selected !== false); renderSqftAccessoriesChecklist(); } }
    else { if (site?.accessories?.[idx]) { site.accessories[idx].selected = !(site.accessories[idx].selected !== false); renderAccessoriesChecklist(); } }
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function deleteAccessoryItem(idx) {
    const site = getCurrentSite();
    if (isSqftMode(site)) { if (site?.sqftAccessories) { site.sqftAccessories.splice(idx, 1); renderSqftAccessoriesChecklist(); } }
    else { if (site?.accessories) { site.accessories.splice(idx, 1); renderAccessoriesChecklist(); } }
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function openThemeUnitPickerForMod(modType) {
    const site = getCurrentSite(); if (!site) return;
    const curUnit = modType === 'prim' ? site.primUnit : modType === 'sec' ? site.secUnit : modType === 'clad' ? site.cladUnit : site.erectUnit;
    openThemeUnitPicker(curUnit || 'Kg', (u) => {
        if (modType === 'prim') site.primUnit = u; else if (modType === 'sec') site.secUnit = u; else if (modType === 'clad') site.cladUnit = u; else if (modType === 'erect') site.erectUnit = u;
        syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); openModuleModal(modType); calcModuleTotals(); refreshLivePdfPreviewSheet();
    });
}
function closeModuleModal() { closeModalSafe('moduleSelectionModal'); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function renderStandardChecklist(list) {
    const container = document.getElementById('modItemsCheckContainer'); if (!container) return; container.innerHTML = "";
    if (!list || list.length === 0) { container.innerHTML = `<div style="font-size:12.5px;color:#a1a1aa;padding:12px 0;">No items found. Add below.</div>`; return; }
    list.forEach((item, idx) => {
        const isSelected = item.selected === true, itemName = item.text !== undefined ? item.text : item;
        container.innerHTML += `<div class="tick-item-card ${isSelected ? 'selected' : ''}" onclick="toggleItemTick(${idx})"><div class="tick-box-ui ${isSelected ? 'checked' : ''}" onclick="event.stopPropagation();toggleItemTick(${idx})">${isSelected ? '✓' : ''}</div><input type="text" value="${itemName}" onclick="event.stopPropagation()" oninput="updateStandardChecklistItemName(${idx},this.value)" style="flex:1;border:none;background:transparent;font-size:13px;font-weight:800;color:#0f172a;outline:none;"><button class="btn-del-pro btn-ripple" onclick="event.stopPropagation();deleteItemFromModule(${idx})">🗑️</button></div>`;
    });
}
function updateStandardChecklistItemName(idx, newText) {
    const site = getCurrentSite();
    if (isSqftMode(site) && activeModType === 'prim') { if (site.sqftPrimSpecs[idx]) { site.sqftPrimSpecs[idx].text = newText; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet(); } }
    else { let targetList = activeModType === 'prim' ? site.primSpecs : activeModType === 'sec' ? site.secSpecs : site.erectSpecs; if (targetList[idx]) { targetList[idx].text = newText; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet(); } }
}
function toggleItemTick(idx) {
    const site = getCurrentSite();
    if (isSqftMode(site) && activeModType === 'prim') { site.sqftPrimSpecs[idx].selected = !(site.sqftPrimSpecs[idx].selected !== false); renderSqftPrimaryChecklist(site.sqftPrimSpecs); }
    else { let targetList = activeModType === 'prim' ? site.primSpecs : activeModType === 'sec' ? site.secSpecs : site.erectSpecs; targetList[idx].selected = !(targetList[idx].selected !== false); renderStandardChecklist(targetList); }
    autoSaveModuleChanges();
}
function deleteItemFromModule(idx) {
    const site = getCurrentSite();
    if (isSqftMode(site) && activeModType === 'prim') { site.sqftPrimSpecs.splice(idx, 1); renderSqftPrimaryChecklist(site.sqftPrimSpecs); }
    else { let targetList = activeModType === 'prim' ? site.primSpecs : activeModType === 'sec' ? site.secSpecs : site.erectSpecs; targetList.splice(idx, 1); renderStandardChecklist(targetList); }
    autoSaveModuleChanges();
}
function addNewItemToModule() {
    const val = (document.getElementById('customItemInput')?.value || "").trim(); if (!val) return;
    const site = getCurrentSite();
    if (isSqftMode(site) && activeModType === 'prim') { site.sqftPrimSpecs = site.sqftPrimSpecs || []; site.sqftPrimSpecs.push({ text: val, length: "", width: "", thk: "", dimUnit: "mm", selected: true }); renderSqftPrimaryChecklist(site.sqftPrimSpecs); }
    else if (activeModType === 'prim') { site.primSpecs = site.primSpecs || []; site.primSpecs.push({ text: val, selected: true }); renderStandardChecklist(site.primSpecs); }
    else if (activeModType === 'sec') { site.secSpecs = site.secSpecs || []; site.secSpecs.push({ text: val, selected: true }); renderStandardChecklist(site.secSpecs); }
    else if (activeModType === 'acc') {
        if (isSqftMode(site)) { site.sqftAccessories = site.sqftAccessories || []; site.sqftAccessories.push({ name: val, qty: "", unit: "Nos", selected: true }); renderSqftAccessoriesChecklist(); }
        else { site.accessories = site.accessories || []; site.accessories.push({ name: val, qty: "1", unit: "Nos", rate: "0", selected: true }); renderAccessoriesChecklist(); }
    } else if (activeModType === 'erect') { site.erectSpecs = site.erectSpecs || []; site.erectSpecs.push({ text: val, selected: true }); renderStandardChecklist(site.erectSpecs); }
    safeSetVal('customItemInput', ""); autoSaveModuleChanges();
}
function addNewSqftPrimaryItemDirectly() {
    const site = getCurrentSite(); if (!site) return;
    site.sqftPrimSpecs = site.sqftPrimSpecs || []; site.sqftPrimSpecs.push({ text: "New Framing Member #" + (site.sqftPrimSpecs.length + 1), length: "", width: "", thk: "", dimUnit: "mm", selected: true });
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet();
}
function addNewAccessoryDirectly() {
    const site = getCurrentSite(); if (!site) return;
    if (isSqftMode(site)) { site.sqftAccessories = site.sqftAccessories || []; site.sqftAccessories.push({ name: "New Accessory Item #" + (site.sqftAccessories.length + 1), qty: "", unit: "Nos", selected: true }); }
    else { site.accessories = site.accessories || []; site.accessories.push({ name: "New Accessory Item #" + (site.accessories.length + 1), qty: "", unit: "Nos", rate: "", selected: true }); }
    syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet();
}
function openShedUnitPicker(fPrefix) {
    const site = getCurrentSite(); if (!site) return;
    const curUnit = fPrefix === 'prim' ? site.primUnit : fPrefix === 'sec' ? site.secUnit : fPrefix === 'clad' ? site.cladUnit : site.erectUnit;
    openThemeUnitPicker(curUnit || 'Kg', (u) => {
        if (fPrefix === 'prim') site.primUnit = u; else if (fPrefix === 'sec') site.secUnit = u; else if (fPrefix === 'clad') site.cladUnit = u; else if (fPrefix === 'erect') site.erectUnit = u;
        syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet();
    });
}
function openThemeUnitPickerForAcc(idx) {
    const site = getCurrentSite(); if (!site?.accessories?.[idx]) return;
    openThemeUnitPicker(site.accessories[idx].unit || 'Nos', (u) => { site.accessories[idx].unit = u; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); renderAccessoriesChecklist(); refreshLivePdfPreviewSheet(); });
}
function openThemeUnitPickerForSqftAcc(idx) {
    const site = getCurrentSite(); if (!site?.sqftAccessories?.[idx]) return;
    openThemeUnitPicker(site.sqftAccessories[idx].unit || 'Nos', (u) => { site.sqftAccessories[idx].unit = u; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); refreshLivePdfPreviewSheet(); });
}
function openCivilUnitPicker(secKey, idx) {
    const site = getCurrentSite(); if (!site?.civilData?.[secKey]?.items?.[idx]) return;
    openThemeUnitPicker(site.civilData[secKey].items[idx].unit || 'Lot', (u) => { site.civilData[secKey].items[idx].unit = u; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet(); });
}
function openCivilCustomCatUnitPicker(cIdx, idx) {
    const site = getCurrentSite(); if (!site?.civilCustomCategories?.[cIdx]?.items?.[idx]) return;
    openThemeUnitPicker(site.civilCustomCategories[cIdx].items[idx].unit || 'Lot', (u) => { site.civilCustomCategories[cIdx].items[idx].unit = u; syncDataToCloud('patel_app_sites', sites); syncSiteStructureToMasterBlueprint(site); calcModuleTotals(); refreshLivePdfPreviewSheet(); });
}

// 19. TAX SELECTION & CALCULATIONS
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
    activeTaxPickerTarget = target; const site = getCurrentSite();
    const currentTaxId = target === 'civil' ? (site.civilSelectedTaxId || "gst18_split") : (site.selectedTaxId || "gst18_split");
    safeSetText('taxModalHeadingTitle', target === 'civil' ? "Civil Tax Slab" : "Shed Tax Slab");
    const container = document.getElementById('taxSlabListContainer'); if (!container) return; container.innerHTML = "";
    TAX_SLABS.forEach(tax => {
        const isSelected = tax.id === currentTaxId;
        container.innerHTML += `<div class="tick-item-card card-3d ${isSelected ? 'selected' : ''} btn-ripple" onclick="selectTaxSlab('${tax.id}')"><div class="tick-box-ui ${isSelected ? 'checked' : ''}">${isSelected ? '✓' : ''}</div><div style="flex:1;"><strong style="font-size:13px;color:#000;display:block;">${tax.name}</strong><span style="font-size:11px;color:#64748b;">${tax.desc}</span></div></div>`;
    });
    openModalWithHistory('taxModal');
}
function closeTaxPickerModal() { closeModalSafe('taxModal'); }
function selectTaxSlab(taxId) { const site = getCurrentSite(); if (site) { if (activeTaxPickerTarget === 'civil') site.civilSelectedTaxId = taxId; else site.selectedTaxId = taxId; syncDataToCloud('patel_app_sites', sites); updateTaxDisplay(); calcModuleTotals(); refreshLivePdfPreviewSheet(); } closeTaxPickerModal(); }
function getActiveTaxSlab(target = 'shed') { const site = getCurrentSite(); const taxId = site ? (target === 'civil' ? (site.civilSelectedTaxId || "gst18_split") : (site.selectedTaxId || "gst18_split")) : "gst18_split"; return TAX_SLABS.find(t => t.id === taxId) || TAX_SLABS[0]; }
function updateTaxDisplay() { const shedTax = getActiveTaxSlab('shed'), civilTax = getActiveTaxSlab('civil'); safeSetText('selectedTaxNameText', shedTax.name); safeSetText('selectedTaxDescText', shedTax.desc); safeSetText('civilSelectedTaxNameText', civilTax.name); safeSetText('civilSelectedTaxDescText', civilTax.desc); }
function calcModuleTotals() {
    const site = getCurrentSite(); if (!site) return; const isRateOnly = site.rateOnlyMode, isSqft = isSqftMode(site);
    if (isSqft) {
        const sqft = (parseFloat(site.dimW) || 0) * (parseFloat(site.dimL) || 0), sqRate = parseFloat(site.shedSqftRate) || 0, autoCost = sqft * sqRate;
        safeSetText('badgePrimTotal', 'Configured'); safeSetText('badgeSecTotal', 'Excluded'); safeSetText('badgeCladTotal', 'Included'); safeSetText('badgeAccTotal', 'Configured'); safeSetText('badgeErectTotal', 'Turnkey');
        safeSetText('shedSqftAutoCostBadge', autoCost > 0 ? "₹ " + Math.round(autoCost).toLocaleString('en-IN') : "-");
        const tax = getActiveTaxSlab('shed'), withTaxRate = (tax.rate > 0 && sqRate > 0) ? (sqRate + (sqRate * tax.rate)) : 0;
        safeSetText('shedSqftWithTaxRateBadge', withTaxRate > 0 ? `₹ ${withTaxRate.toFixed(2)} / Sq.Ft` : (sqRate > 0 ? `₹ ${sqRate.toFixed(2)} / Sq.Ft (No Tax)` : "-"));
    } else {
        const pTot = (site.primEnabled !== false) ? (parseFloat(site.primWeight) || 0) * (parseFloat(site.primRate) || 0) : 0;
        if (site.primEnabled === false) safeSetText('badgePrimTotal', 'Disabled'); else if (isRateOnly) safeSetText('badgePrimTotal', '₹ ' + (site.primRate || '-') + '/Kg'); else animateNumberRoll('badgePrimTotal', pTot, "Rs. ");
        const sTot = (site.secEnabled !== false) ? (parseFloat(site.secWeight) || 0) * (parseFloat(site.secRate) || 0) : 0;
        if (site.secEnabled === false) safeSetText('badgeSecTotal', 'Disabled'); else if (isRateOnly) safeSetText('badgeSecTotal', '₹ ' + (site.secRate || '-') + '/Kg'); else animateNumberRoll('badgeSecTotal', sTot, "Rs. ");
        const cTot = (site.cladEnabled !== false) ? (parseFloat(site.cladSqFt) || 0) * (parseFloat(site.cladRate) || 0) : 0;
        if (site.cladEnabled === false) safeSetText('badgeCladTotal', 'Disabled'); else if (isRateOnly) safeSetText('badgeCladTotal', '₹ ' + (site.cladRate || '-') + '/Sq.Ft'); else animateNumberRoll('badgeCladTotal', cTot, "Rs. ");
        let aTot = 0; if (site.accEnabled !== false) { (site.accessories || []).forEach(a => { if (a.selected === true) aTot += (parseFloat(a.qty) || 0) * (parseFloat(a.rate) || 0); }); }
        if (site.accEnabled === false) safeSetText('badgeAccTotal', 'Disabled'); else if (isRateOnly) safeSetText('badgeAccTotal', 'Package'); else animateNumberRoll('badgeAccTotal', aTot, "Rs. ");
        const autoWt = ((site.primEnabled !== false) ? (parseFloat(site.primWeight) || 0) : 0) + ((site.secEnabled !== false) ? (parseFloat(site.secWeight) || 0) : 0);
        const eTot = (site.erectEnabled !== false) ? autoWt * (parseFloat(site.erectRate) || 0) : 0;
        if (site.erectEnabled === false) safeSetText('badgeErectTotal', 'Disabled'); else if (isRateOnly) safeSetText('badgeErectTotal', '₹ ' + (site.erectRate || '-') + '/Kg'); else animateNumberRoll('badgeErectTotal', eTot, "Rs. ");
    }
    if (site.civilData) {
        const getSecTotal = (secKey) => { let tot = 0; (site.civilData[secKey]?.items || []).forEach(it => { if (it.enabled !== false) tot += (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0); }); return tot; };
        const fTot = getSecTotal('foundation'), bTot = getSecTotal('brickWall'), flTot = getSecTotal('flooring');
        safeSetText('badgeCivFoundTotal', site.foundEnabled === false ? 'Disabled' : (site.civilRateOnlyMode ? 'Unit Rates' : (fTot > 0 ? 'Rs. ' + Math.round(fTot).toLocaleString('en-IN') : 'Edit ➔')));
        safeSetText('badgeCivBrickTotal', site.brickEnabled === false ? 'Disabled' : (site.civilRateOnlyMode ? 'Unit Rates' : (bTot > 0 ? 'Rs. ' + Math.round(bTot).toLocaleString('en-IN') : 'Edit ➔')));
        safeSetText('badgeCivFloorTotal', site.floorEnabled === false ? 'Disabled' : (site.civilRateOnlyMode ? 'Unit Rates' : (flTot > 0 ? 'Rs. ' + Math.round(flTot).toLocaleString('en-IN') : 'Edit ➔')));
    }
}
function renderVerticalTaxRowsHtml(basicCost, taxSlab) {
    if (!taxSlab || taxSlab.rate === 0 || basicCost === 0) return `<div class="tax-split-row"><span class="tax-lbl">GST:</span><span class="tax-amt">-</span></div>`;
    if (taxSlab.split) {
        const cgstAmt = Math.round(basicCost * taxSlab.cgstRate), sgstAmt = Math.round(basicCost * taxSlab.sgstRate);
        const cgstPct = (taxSlab.cgstRate * 100).toFixed(1).replace('.0', ''), sgstPct = (taxSlab.sgstRate * 100).toFixed(1).replace('.0', '');
        return `<div class="tax-split-row"><span class="tax-lbl">CGST @ ${cgstPct}%:</span><span class="tax-amt">${cgstAmt > 0 ? '₹ ' + cgstAmt.toLocaleString('en-IN') : '-'}</span></div><div class="tax-split-row"><span class="tax-lbl">SGST @ ${sgstPct}%:</span><span class="tax-amt">${sgstAmt > 0 ? '₹ ' + sgstAmt.toLocaleString('en-IN') : '-'}</span></div>`;
    }
    const taxAmt = Math.round(basicCost * taxSlab.rate);
    return `<div class="tax-split-row"><span class="tax-lbl">${taxSlab.name}:</span><span class="tax-amt">${taxAmt > 0 ? '₹ ' + taxAmt.toLocaleString('en-IN') : '-'}</span></div>`;
}

// 21. LIVE PREVIEW ENGINE (SCREEN DISPLAY)
function refreshLivePdfPreviewSheet(isSoftRefresh = false) {
    const site = getCurrentSite(); if (!site) return;
    const isRateOnly = site.rateOnlyMode === true, isCivilRateOnly = site.civilRateOnlyMode === true, isSqft = isSqftMode(site);
    const compAddr = appSettings.companyAddr || "Bhawani Nagar, Bhilwara - 311001 (Rajasthan, India)", compGst = appSettings.companyGst || "08AHFPL0222M2ZF";
    const compPhones = (appSettings.phones || []).filter(Boolean).join(", ") || "+91 9799635249", compEmail = (appSettings.companyEmail || "").trim(), compWeb = (appSettings.footerWeb || "").trim();

    safeSetText('pdfSubstripAddr', compAddr); safeSetText('civilPdfSubstripAddr', compAddr);
    safeSetText('pdfSubstripGst', compGst); safeSetText('civilPdfSubstripGst', compGst);
    safeSetText('pdfFooterPhones', compPhones); safeSetText('civilPdfFooterPhones', compPhones);
    safeSetText('pdfCompanyGst', compGst); safeSetText('civilPdfCompanyGst', compGst);
    safeSetText('pdfFooterAddrMini', compAddr); safeSetText('civilPdfFooterAddrMini', compAddr);

    const pEmailWrap = document.getElementById('pdfFooterEmailWrap'), cEmailWrap = document.getElementById('civilPdfFooterEmailWrap');
    if (compEmail) { safeSetText('pdfFooterEmail', compEmail); safeSetText('civilPdfFooterEmail', compEmail); if (pEmailWrap) pEmailWrap.style.display = 'inline-flex'; if (cEmailWrap) cEmailWrap.style.display = 'inline-flex'; }
    else { if (pEmailWrap) pEmailWrap.style.display = 'none'; if (cEmailWrap) cEmailWrap.style.display = 'none'; }
    const pWebWrap = document.getElementById('pdfFooterWebWrap'), cWebWrap = document.getElementById('civilPdfFooterWebWrap');
    if (compWeb) { safeSetText('pdfFooterWebDisplay', compWeb); safeSetText('civilPdfFooterWebDisplay', compWeb); if (pWebWrap) pWebWrap.style.display = 'inline-flex'; if (cWebWrap) cWebWrap.style.display = 'inline-flex'; }
    else { if (pWebWrap) pWebWrap.style.display = 'none'; if (cWebWrap) cWebWrap.style.display = 'none'; }

    updateHeaderBannersUI();
    safeSetText('pdfRibbonTitle', isSqft ? (appSettings.sqftPdfRibbonTitle !== undefined ? appSettings.sqftPdfRibbonTitle : "QUOTATION") : (appSettings.pdfRibbonTitle !== undefined ? appSettings.pdfRibbonTitle : "QUOTATION"));
    safeSetText('civilPdfRibbonTitle', appSettings.civilPdfRibbonTitle !== undefined ? appSettings.civilPdfRibbonTitle : "QUOTATION");
    safeSetText('pdfScopeTitle', isSqft ? (site.sqftScopeDesc !== undefined ? site.sqftScopeDesc : (appSettings.sqftPdfScopeTitle || "")) : (site.primCustomLine !== undefined ? site.primCustomLine : (appSettings.pdfScopeTitle || "")));
    safeSetText('pdfProjectSizeHeading', appSettings.projectSizeHeading !== undefined ? appSettings.projectSizeHeading : "📐 PROJECT SIZE / SHED DIMENSIONS:");
    safeSetText('displayHeaderLine1', appSettings.headerLine1 !== undefined ? appSettings.headerLine1 : "1. ESTIMATED STEEL WEIGHT:");
    safeSetText('pdfMilestoneHeading', appSettings.milestoneHeading !== undefined ? appSettings.milestoneHeading : "TOTAL STRUCTURE WEIGHT (PRIMARY + SECONDARY):");
    safeSetText('displayHeaderLine2', isSqft ? (site.sqftTableDesc !== undefined ? site.sqftTableDesc : (appSettings.sqftHeaderLine1 || "")) : (appSettings.headerLine2 !== undefined ? appSettings.headerLine2 : "2. PRICE BREAKUP AS PER KG RATE:"));
    safeSetText('pdfAccSectionHeading', appSettings.accSectionHeading !== undefined ? appSettings.accSectionHeading : "3. BUILDING ACCESSORIES ITEM-WISE BREAKDOWN:");
    safeSetText('civilPdfScopeTitle', site.civilScopeDesc !== undefined ? site.civilScopeDesc : (appSettings.civilScopeDesc || ""));
    safeSetText('civilJobTitleDisplay', appSettings.civilJobTitle !== undefined ? appSettings.civilJobTitle : "JOB DETAILS & TECHNICAL SPECIFICATIONS");
    safeSetText('civilFoundTitle', appSettings.civilFoundTitle !== undefined ? appSettings.civilFoundTitle : "1. FOUNDATION & RCC COLUMN DETAILS:");
    safeSetText('civilBrickTitle', appSettings.civilBrickTitle !== undefined ? appSettings.civilBrickTitle : "2. BRICK WALL, DPC & PLASTER DETAILS:");
    safeSetText('civilFloorTitle', appSettings.civilFloorTitle !== undefined ? appSettings.civilFloorTitle : "3. FLOORING & PCC WORK DETAILS:");
    safeSetText('pdfTermsHeaderDisplay', appSettings.termsTitle !== undefined ? appSettings.termsTitle : "Terms & Conditions:");
    safeSetText('civilPdfTermsHeaderDisplay', appSettings.civilTermsTitle !== undefined ? appSettings.civilTermsTitle : "Civil Work Terms & Conditions:");
    safeSetText('pdfThankYouDisplay', appSettings.thankYouText !== undefined ? appSettings.thankYouText : "THANK YOU FOR YOUR BUSINESS WITH US.");
    safeSetText('civilPdfThankYouDisplay', appSettings.civilThankYouText !== undefined ? appSettings.civilThankYouText : "THANK YOU FOR YOUR CIVIL CONTRACT.");
    safeSetText('pdfCustSignHeader', appSettings.custAcceptanceTitle !== undefined ? appSettings.custAcceptanceTitle : "CUSTOMER ACCEPTANCE");
    safeSetText('civilCustSignHeader', appSettings.custAcceptanceTitle !== undefined ? appSettings.custAcceptanceTitle : "CUSTOMER ACCEPTANCE");
    safeSetText('pdfCustSignSub', appSettings.custAcceptanceSub !== undefined ? appSettings.custAcceptanceSub : "Authorized Signature & Stamp");
    safeSetText('civilCustSignSub', appSettings.custAcceptanceSub !== undefined ? appSettings.custAcceptanceSub : "Authorized Signature & Stamp");
    safeSetText('pdfSignCompanyHeader', appSettings.signCompHeader !== undefined ? appSettings.signCompHeader : ("FOR " + (appSettings.ownerName || "PATEL ENGINEERING")));
    safeSetText('civilSignCompanyHeader', appSettings.signCompHeader !== undefined ? appSettings.signCompHeader : ("FOR " + (appSettings.ownerName || "PATEL ENGINEERING")));
    safeSetText('pdfSignatoryTitleDisplay', appSettings.pdfSignatoryText !== undefined ? appSettings.pdfSignatoryText : "Authorized Signatory");
    safeSetText('civilSignatoryTitleDisplay', appSettings.pdfSignatoryText !== undefined ? appSettings.pdfSignatoryText : "Authorized Signatory");
    safeSetText('pdfQuoteNo', site.quoteNo || "PE/2026/01"); safeSetText('civilPdfQuoteNo', site.quoteNo || "PE/2026/01");
    const issueDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    safeSetText('pdfCurrentDate', issueDateStr); safeSetText('civilPdfCurrentDate', issueDateStr);

    const sqft = (parseFloat(site.dimW) || 0) * (parseFloat(site.dimL) || 0);
    safeSetText('dimWVal', site.dimW ? site.dimW + " Ft" : "-"); safeSetText('dimLVal', site.dimL ? site.dimL + " Ft" : "-");
    safeSetText('dimHVal', site.dimH ? site.dimH + " Ft" : "-"); safeSetText('dimAreaVal', sqft > 0 ? sqft.toLocaleString('en-IN') + " Sq.Ft" : "-");

    const contactPersonLine = [site.custContactPerson, site.custRole ? ('(' + site.custRole + ')') : ''].filter(Boolean).join(' ') || "-";
    const clientPhones = [site.custNumber1, site.custNumber2].filter(Boolean).join(" / ") || "-";
    safeSetText('pdfClientName', site.clientName || "-"); safeSetText('pdfContactPersonDisplay', contactPersonLine);
    safeSetText('pdfClientPhone', clientPhones); safeSetText('pdfClientGst', site.custGST || "-"); safeSetText('pdfClientAddr', site.custAddress || "-");
    safeSetText('civilPdfClientName', site.clientName || "-"); safeSetText('civilPdfContactPersonDisplay', contactPersonLine);
    safeSetText('civilPdfClientPhone', clientPhones); safeSetText('civilPdfClientGst', site.custGST || "-"); safeSetText('civilPdfClientAddr', site.custAddress || "-");

    const isShedActive = hasShedMode(site), isCivilActive = hasCivilMode(site), page1ShedSheet = document.getElementById('page1MsStructure');
    let shedGrandTotal = 0, autoTotalSteelWeightKg = 0;

    if (!isShedActive) { if (page1ShedSheet) page1ShedSheet.style.setProperty('display', 'none', 'important'); }
    else {
        if (page1ShedSheet) page1ShedSheet.style.setProperty('display', 'flow-root', 'important');
        const sec1Wrap = document.getElementById('pdfSection1WeightWrapper'), accContainer = document.getElementById('pdfAccBreakdownContainer');
        if (isSqft) {
            if (sec1Wrap) sec1Wrap.style.display = 'none'; if (accContainer) accContainer.style.display = 'none';
            const thead = document.getElementById('pdfTableHead');
            if (thead) { thead.innerHTML = `<tr><th style="width:7%;text-align:center;">S.NO</th><th style="width:40%;text-align:left;">ITEM / WORK COMPONENT</th><th style="width:40%;text-align:left;">TECHNICAL SPECIFICATIONS & DIMENSIONS</th><th style="width:13%;text-align:center;">UNIT / SCOPE</th></tr>`; }
            const tbody = document.getElementById('pdfTableBody');
            if (tbody) {
                tbody.innerHTML = ""; let sNo = 1;
                if (!site.moduleOrder || site.moduleOrder.includes('sec')) site.moduleOrder = ['prim', 'clad', 'acc', 'erect'];
                site.moduleOrder.forEach((mKey, orderIdx) => {
                    if (mKey === 'prim' && site.primEnabled !== false) {
                        const primItems = (site.sqftPrimSpecs || []).filter(p => p.selected !== false); let leftItemsHtml = "", rightItemsHtml = "";
                        if (primItems.length > 0) {
                            primItems.forEach((p, pIdx) => {
                                const name = p.text || p, hasSize = (p.length || p.width || p.thk); let dimHtml = "&nbsp;";
                                if (hasSize) { const thkPart = p.thk ? ` × Thk: <span class="editable-preview-title" contenteditable="true" onblur="syncSqftPrimDimLive(${pIdx},'thk',this)">${p.thk}</span>` : ''; dimHtml = `L: <span class="editable-preview-title" contenteditable="true" onblur="syncSqftPrimDimLive(${pIdx},'length',this)">${p.length || '-'}</span> × W: <span class="editable-preview-title" contenteditable="true" onblur="syncSqftPrimDimLive(${pIdx},'width',this)">${p.width || '-'}</span>${thkPart} ${p.dimUnit || 'mm'}`; }
                                leftItemsHtml += `<div class="sqft-pair-row">• <b class="editable-preview-title" contenteditable="true" onblur="syncSqftPrimNameLive(${pIdx},this)">${name}</b></div>`; rightItemsHtml += `<div class="sqft-pair-row">${dimHtml}</div>`;
                            });
                        }
                        const primCustomLineDisplay = site.sqftPrimCustomLine !== undefined ? site.sqftPrimCustomLine : (sqftMasterBlueprint.sqftPrimCustomLine || "");
                        const tr = document.createElement('tr'); tr.className = "sortable-item"; tr.dataset.sortIndex = orderIdx;
                        tr.innerHTML = `<td style="width:7%;text-align:center;font-weight:900;vertical-align:middle;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${sNo++}</td><td style="width:40%;vertical-align:top;"><b class="editable-preview-title" contenteditable="true" onblur="syncSqftModuleTitle('sqftPrimLabel',this)" style="font-size:calc(10.5px * var(--pdf-font-scale));display:block;margin-bottom:2px;">${appSettings.sqftPrimLabel || "Primary Structural Framing"}</b><div class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this,'prim')" style="font-size:calc(9px * var(--pdf-font-scale));color:#000;font-weight:700;margin-bottom:4px;">${primCustomLineDisplay}</div>${leftItemsHtml}</td><td style="width:40%;vertical-align:top;"><div style="font-size:calc(10.5px * var(--pdf-font-scale));visibility:hidden;margin-bottom:2px;">Spacer</div><div style="font-size:calc(9px * var(--pdf-font-scale));visibility:hidden;margin-bottom:4px;">Spacer</div>${rightItemsHtml}</td><td style="width:13%;text-align:center;font-weight:900;color:#0c1e30;vertical-align:middle;">Main Frame</td>`;
                        tbody.appendChild(tr); setupUniversalReorder(tr, tr.querySelector('.drag-handle'), 'shed_modules', orderIdx);
                    } else if (mKey === 'clad' && site.cladEnabled !== false) {
                        const cladCustomLineDisplay = site.sqftCladCustomLine !== undefined ? site.sqftCladCustomLine : (sqftMasterBlueprint.sqftCladCustomLine || "");
                        const tr = document.createElement('tr'); tr.className = "sortable-item"; tr.dataset.sortIndex = orderIdx;
                        tr.innerHTML = `<td style="width:7%;text-align:center;font-weight:900;vertical-align:middle;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${sNo++}</td><td style="width:40%;vertical-align:middle;"><b class="editable-preview-title" contenteditable="true" onblur="syncSqftModuleTitle('sqftCladLabel',this)" style="font-size:calc(10.5px * var(--pdf-font-scale));display:block;margin-bottom:2px;">${appSettings.sqftCladLabel || "Roof & Wall Cladding System"}</b><div class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this,'clad')" style="font-size:calc(9px * var(--pdf-font-scale));color:#000;font-weight:700;">${cladCustomLineDisplay}</div></td><td style="width:40%;vertical-align:middle;"><div style="font-weight:900;font-size:calc(10px * var(--pdf-font-scale));color:#000000;">Thickness: <span class="editable-preview-title" contenteditable="true" onblur="syncPreviewEdit(this,'cladThickness')">${site.cladThickness || '0.50 mm'}</span></div></td><td style="width:13%;text-align:center;font-weight:900;color:#0c1e30;vertical-align:middle;">Covering</td>`;
                        tbody.appendChild(tr); setupUniversalReorder(tr, tr.querySelector('.drag-handle'), 'shed_modules', orderIdx);
                    } else if (mKey === 'acc' && site.accEnabled !== false) {
                        const activeAcc = (site.sqftAccessories || []).filter(a => a.selected !== false); let leftAccHtml = "", rightAccHtml = "";
                        if (activeAcc.length > 0) {
                            activeAcc.forEach((a, aIdx) => {
                                const qVal = (a.qty || "").trim(); let qtyCellContent = "&nbsp;";
                                if (qVal) qtyCellContent = `<span class="editable-preview-title" contenteditable="true" onblur="syncSqftAccQtyLive(${aIdx},this)" style="color:#000000;font-weight:900;">${qVal}</span> <span class="preview-unit-pill btn-ripple" onclick="openThemeUnitPickerForSqftAcc(${aIdx})" style="color:#000000;border-color:#94a3b8;background:#f1f5f9;">${a.unit || 'Nos'} ▾</span>`;
                                leftAccHtml += `<div class="sqft-pair-row">• <b class="editable-preview-title" contenteditable="true" onblur="syncSqftAccLive(${aIdx},this)" style="color:#000000;">${a.name}</b></div>`; rightAccHtml += `<div class="sqft-pair-row" style="font-weight:900;color:#000000;">${qtyCellContent}</div>`;
                            });
                        }
                        const accCustomLineDisplay = site.sqftAccCustomLine !== undefined ? site.sqftAccCustomLine : (sqftMasterBlueprint.sqftAccCustomLine || "");
                        const tr = document.createElement('tr'); tr.className = "sortable-item"; tr.dataset.sortIndex = orderIdx;
                        tr.innerHTML = `<td style="width:7%;text-align:center;font-weight:900;vertical-align:middle;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${sNo++}</td><td style="width:40%;vertical-align:top;"><b class="editable-preview-title" contenteditable="true" onblur="syncSqftModuleTitle('sqftAccLabel',this)" style="font-size:calc(10.5px * var(--pdf-font-scale));display:block;margin-bottom:2px;">${appSettings.sqftAccLabel || "Building Accessories Package"}</b><div class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this,'acc')" style="font-size:calc(9px * var(--pdf-font-scale));color:#000;font-weight:700;margin-bottom:4px;">${accCustomLineDisplay}</div>${leftAccHtml}</td><td style="width:40%;vertical-align:top;"><div style="font-size:calc(10.5px * var(--pdf-font-scale));visibility:hidden;margin-bottom:2px;">Spacer</div><div style="font-size:calc(9px * var(--pdf-font-scale));visibility:hidden;margin-bottom:4px;">Spacer</div>${rightAccHtml}</td><td style="width:13%;text-align:center;font-weight:900;color:#0c1e30;vertical-align:middle;">Package</td>`;
                        tbody.appendChild(tr); setupUniversalReorder(tr, tr.querySelector('.drag-handle'), 'shed_modules', orderIdx);
                    } else if (mKey === 'erect' && site.erectEnabled !== false) {
                        const erectBullets = (site.erectSpecs || []).filter(e => e.selected === true).map(e => `<span>• ${e.text || e}</span>`).join(' ');
                        const erectCustomLineDisplay = site.sqftErectCustomLine !== undefined ? site.sqftErectCustomLine : (sqftMasterBlueprint.sqftErectCustomLine || "");
                        const tr = document.createElement('tr'); tr.className = "sortable-item"; tr.dataset.sortIndex = orderIdx;
                        tr.innerHTML = `<td style="width:7%;text-align:center;font-weight:900;vertical-align:middle;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${sNo++}</td><td style="width:40%;vertical-align:middle;"><b class="editable-preview-title" contenteditable="true" onblur="syncSqftModuleTitle('sqftErectLabel',this)" style="font-size:calc(10.5px * var(--pdf-font-scale));display:block;margin-bottom:2px;">${appSettings.sqftErectLabel || "Turnkey Erection & Installation"}</b><div class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this,'erect')" style="font-size:calc(9px * var(--pdf-font-scale));color:#000;font-weight:700;">${erectCustomLineDisplay}</div></td><td style="width:40%;vertical-align:middle;"><div style="font-weight:800;color:#000000;font-size:calc(9.5px * var(--pdf-font-scale));">${erectBullets || 'Crane, Hydra, Welding Machine & Labour'}</div></td><td style="width:13%;text-align:center;font-weight:900;color:#0c1e30;vertical-align:middle;">Turnkey</td>`;
                        tbody.appendChild(tr); setupUniversalReorder(tr, tr.querySelector('.drag-handle'), 'shed_modules', orderIdx);
                    } else {
                        const c = (site.customModules || []).find(m => m.id === mKey);
                        if (c && c.enabled !== false) {
                            const tr = document.createElement('tr'); tr.className = "sortable-item"; tr.dataset.sortIndex = orderIdx;
                            tr.innerHTML = `<td style="width:7%;text-align:center;font-weight:900;vertical-align:middle;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${sNo++}</td><td style="width:40%;vertical-align:middle;"><b class="editable-preview-title" contenteditable="true" onblur="syncPreviewTitleEdit(this,'custom','${c.id}')" style="font-size:calc(10.5px * var(--pdf-font-scale));display:block;margin-bottom:2px;">${c.title}</b><div class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" style="font-size:calc(9px * var(--pdf-font-scale));color:#000;font-weight:700;">${c.desc || '-'}</div></td><td style="width:40%;vertical-align:middle;"><div style="font-weight:800;color:#000000;font-size:calc(9.5px * var(--pdf-font-scale));">${c.qty ? (c.qty + ' ' + (c.unit || 'Lot')) : 'Standard Scope'}</div></td><td style="width:13%;text-align:center;font-weight:900;color:#0c1e30;vertical-align:middle;">${c.unit || 'Lot'}</td>`;
                            tbody.appendChild(tr); setupUniversalReorder(tr, tr.querySelector('.drag-handle'), 'shed_modules', orderIdx);
                        }
                    }
                });
                const sqRate = parseFloat(site.shedSqftRate) || 0, shedBasicCost = sqft * sqRate, tax = getActiveTaxSlab('shed'), taxAmt = shedBasicCost * tax.rate, grand = shedBasicCost + taxAmt, withTaxRate = (tax.rate > 0 && sqRate > 0) ? (sqRate + (sqRate * tax.rate)) : 0;
                shedGrandTotal = grand; animateNumberRoll('pdfFinBasic', shedBasicCost, "Rs. "); safeSetHtml('pdfTaxBreakdownRows', renderVerticalTaxRowsHtml(shedBasicCost, tax)); animateNumberRoll('pdfFinGrand', grand, "Rs. "); triggerTotalBarShimmer();
                const shedAvgBox = document.getElementById('pdfShedAvgRateBox');
                if (shedAvgBox) { if (sqRate > 0) { safeSetText('pdfShedAvgRateLabel', tax.rate > 0 ? 'SHED RATE / SQ.FT (WITH GST):' : 'SHED RATE / SQ.FT:'); safeSetText('pdfShedAvgRateVal', `₹ ${withTaxRate > 0 ? withTaxRate.toFixed(2) : sqRate.toFixed(2)} / Sq.Ft`); shedAvgBox.style.display = 'flex'; } else shedAvgBox.style.display = 'none'; }
            }
        } else {
            if (sec1Wrap) sec1Wrap.style.display = 'block';
            const s1Tbody = document.getElementById('pdfSection1TableBody');
            if (s1Tbody) {
                s1Tbody.innerHTML = "";
                if (site.primEnabled !== false) { const pWt = parseFloat(site.primWeight) || 0, pUnit = site.primUnit || "Kg", inKg = pUnit.toLowerCase() === 'mt' ? (pWt * 1000) : pWt; autoTotalSteelWeightKg += inKg; s1Tbody.innerHTML += `<tr><td style="font-size:calc(10.5px * var(--pdf-font-scale)) !important;color:#000;font-weight:800;"><b>Primary Structure:</b> <span class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this,'prim')">${(site.primCustomLine !== undefined ? site.primCustomLine : "")}</span></td><td style="text-align:right;font-weight:900;font-size:calc(10.5px * var(--pdf-font-scale)) !important;color:#000;">${pWt > 0 ? `${pWt.toLocaleString('en-IN')} <span class="unit-locked-text">${pUnit}</span> (${(inKg/1000).toFixed(1)} MT)` : "-"}</td></tr>`; }
                if (site.secEnabled !== false) { const sWt = parseFloat(site.secWeight) || 0, sUnit = site.secUnit || "Kg", inKg = sUnit.toLowerCase() === 'mt' ? (sWt * 1000) : sWt; autoTotalSteelWeightKg += inKg; s1Tbody.innerHTML += `<tr><td style="font-size:calc(10.5px * var(--pdf-font-scale)) !important;color:#000;font-weight:800;"><b>Secondary Structure:</b> <span class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this,'sec')">${(site.secCustomLine !== undefined ? site.secCustomLine : "")}</span></td><td style="text-align:right;font-weight:900;font-size:calc(10.5px * var(--pdf-font-scale)) !important;color:#000;">${sWt > 0 ? `${sWt.toLocaleString('en-IN')} <span class="unit-locked-text">${sUnit}</span> (${(inKg/1000).toFixed(1)} MT)` : "-"}</td></tr>`; }
                s1Tbody.innerHTML += `<tr class="executive-weight-total-row"><td style="font-size:calc(10.5px * var(--pdf-font-scale)) !important;color:#000;font-weight:900;"><div class="exec-wt-title" id="pdfMilestoneHeading">${appSettings.milestoneHeading || "TOTAL STRUCTURE WEIGHT (PRIMARY + SECONDARY):"}</div></td><td style="text-align:right;font-size:calc(10.5px * var(--pdf-font-scale)) !important;font-weight:900;color:#000;"><span class="exec-wt-val">${autoTotalSteelWeightKg > 0 ? `${autoTotalSteelWeightKg.toLocaleString('en-IN')} Kg (${(autoTotalSteelWeightKg/1000).toFixed(1)} MT)` : "-"}</span></td></tr>`;
                if (site.cladEnabled !== false) { const cSq = parseFloat(site.cladSqFt) || 0, cUnit = site.cladUnit || "Sq.Ft", thickBadge = site.cladThickness ? `<span class="spec-highlight-pill" style="margin-left:6px;">📐 Thickness: ${site.cladThickness}</span>` : ''; s1Tbody.innerHTML += `<tr><td style="font-size:calc(10.5px * var(--pdf-font-scale)) !important;color:#000;font-weight:800;"><b>Roof & Wall Cladding:</b> <span class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this,'clad')">${(site.cladCustomLine !== undefined ? site.cladCustomLine : "")}</span>${thickBadge}</td><td style="text-align:right;font-weight:900;font-size:calc(10.5px * var(--pdf-font-scale)) !important;color:#000;"><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this,'cladSqFt')">${cSq > 0 ? cSq : '-'}</span> <span class="unit-locked-text">${cUnit}</span></td></tr>`; }
            }
            const thead = document.getElementById('pdfTableHead');
            if (thead) { thead.innerHTML = isRateOnly ? `<tr><th style="width:7%;text-align:center;">S.NO</th><th style="width:55%;text-align:left;">DESCRIPTION</th><th style="width:14%;text-align:center;">UNIT</th><th style="width:24%;text-align:right;">CONTRACT RATE (₹)</th></tr>` : `<tr><th style="width:7%;text-align:center;">S.NO</th><th style="width:45%;text-align:left;">DESCRIPTION</th><th style="width:13%;text-align:center;">QUANTITY</th><th style="width:10%;text-align:center;">UNIT</th><th style="width:12%;text-align:right;">RATE (₹)</th><th style="width:13%;text-align:right;">AMOUNT (INR)</th></tr>`; }
            const pWt = (site.primEnabled !== false) ? (parseFloat(site.primWeight) || 0) : 0, pRt = parseFloat(site.primRate) || 0, pTot = pWt * pRt, pUnit = site.primUnit || "Kg";
            const sWt = (site.secEnabled !== false) ? (parseFloat(site.secWeight) || 0) : 0, sRt = parseFloat(site.secRate) || 0, sTot = sWt * sRt, sUnit = site.secUnit || "Kg";
            const cSq = (site.cladEnabled !== false) ? (parseFloat(site.cladSqFt) || 0) : 0, cRt = parseFloat(site.cladRate) || 0, cTot = cSq * cRt, cUnit = site.cladUnit || "Sq.Ft";
            let aTot = 0, selectedAccCount = 0;
            const breakdownTbody = document.getElementById('pdfAccBreakdownBody'), breakdownThead = document.getElementById('pdfAccTableHead');
            if (breakdownTbody) breakdownTbody.innerHTML = "";
            if (breakdownThead) { breakdownThead.innerHTML = isRateOnly ? `<tr><th style="width:60%;text-align:left;">ACCESSORY ITEM</th><th style="width:20%;text-align:center;">UNIT</th><th style="width:20%;text-align:right;">CONTRACT RATE (₹)</th></tr>` : `<tr><th style="width:47%;text-align:left;">ACCESSORY ITEM</th><th style="width:13%;text-align:center;">QTY</th><th style="width:12%;text-align:center;">UNIT</th><th style="width:13%;text-align:right;">RATE (₹)</th><th style="width:15%;text-align:right;">AMOUNT (₹)</th></tr>`; }
            if (site.accEnabled !== false) {
                (site.accessories || []).forEach((a, aIdx) => {
                    if (a.selected === true) {
                        selectedAccCount++; const q = parseFloat(a.qty) || 0, r = parseFloat(a.rate) || 0, lineTot = q * r; aTot += lineTot;
                        if (breakdownTbody) {
                            const tr = document.createElement('tr'); tr.className = "sortable-item"; tr.dataset.sortIndex = aIdx;
                            tr.innerHTML = isRateOnly ? `<td><span class="drag-handle" id="handle_acc_${aIdx}" title="Drag to reorder">⋮⋮</span> <b class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncAccTitleEdit(${aIdx},this)">${a.name}</b></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openThemeUnitPickerForAcc(${aIdx})">${a.unit || 'Nos'} ▾</span></td><td style="text-align:right;font-weight:900;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewAccEdit(${aIdx},'rate',this)">${formatRawOrDash(a.rate)}</span></td>` : `<td><span class="drag-handle" id="handle_acc_${aIdx}" title="Drag to reorder">⋮⋮</span> <b class="editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncAccTitleEdit(${aIdx},this)">${a.name}</b></td><td style="text-align:center;font-weight:900;"><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewAccEdit(${aIdx},'qty',this)">${formatRawOrDash(a.qty)}</span></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openThemeUnitPickerForAcc(${aIdx})">${a.unit || 'Nos'} ▾</span></td><td style="text-align:right;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(${aIdx},'rate',this)">${formatRawOrDash(a.rate)}</span></td><td style="text-align:right;font-weight:900;">${lineTot > 0 ? '₹ ' + Math.round(lineTot).toLocaleString('en-IN') : '-'}</td>`;
                            breakdownTbody.appendChild(tr); setupUniversalReorder(tr, tr.querySelector('.drag-handle'), 'accessories', aIdx);
                        }
                    }
                });
            }
            if (accContainer) accContainer.style.display = (site.accEnabled !== false && selectedAccCount > 0) ? 'block' : 'none';
            const eWt = (site.erectEnabled !== false) ? autoTotalSteelWeightKg : 0, eRt = parseFloat(site.erectRate) || 0, eTot = eWt * eRt, eUnit = site.erectUnit || "Kg";
            const tbody = document.getElementById('pdfTableBody'); let customTot = 0, sNoCounter = 1;
            if (tbody) {
                tbody.innerHTML = "";
                const helperSpecs = (specs) => (!specs || !Array.isArray(specs)) ? "" : `<div class="item-specs-bullets">${specs.filter(s => s.selected === true).map(s => `<span>• ${s.text || s}</span>`).join('')}</div>`;
                const addRow = (catTitle, line, uRate, qty, amt, fPrefix, uLabel, isCust = false, bullets = "", mKey = "") => {
                    const descHtml = `<div class="row-item-title" style="font-size:calc(10.5px * var(--pdf-font-scale)) !important;font-weight:900;color:#000;">${catTitle}:</div><div class="row-item-subtitle editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewTitleEdit(this,'${fPrefix}','${mKey}')" style="font-size:calc(9.5px * var(--pdf-font-scale));">${(line !== undefined ? line : "").trim()}</div>${bullets}`;
                    const tr = document.createElement('tr'); tr.className = "sortable-item"; tr.dataset.sortIndex = sNoCounter - 1;
                    tr.innerHTML = isRateOnly ? `<td style="text-align:center;font-weight:900;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${sNoCounter++}</td><td>${descHtml}</td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="${isCust ? '' : `openShedUnitPicker('${fPrefix}')`}">${uLabel || '-'} ▾</span></td><td style="text-align:right;font-weight:900;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this,'${fPrefix}Rate')">${formatRawOrDash(uRate)}</span></td>` : `<td style="text-align:center;font-weight:900;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${sNoCounter++}</td><td>${descHtml}</td><td style="text-align:center;font-weight:900;"><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this,'${fPrefix === 'clad' ? 'cladSqFt' : `${fPrefix}Weight`}')">${formatRawOrDash(qty)}</span></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="${isCust ? '' : `openShedUnitPicker('${fPrefix}')`}">${uLabel || '-'} ▾</span></td><td style="text-align:right;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this,'${fPrefix}Rate')">${formatRawOrDash(uRate)}</span></td><td style="text-align:right;font-weight:900;">${amt > 0 ? 'Rs. ' + Math.round(amt).toLocaleString('en-IN') : '-'}</td>`;
                    tbody.appendChild(tr); const curIdx = site.moduleOrder.indexOf(mKey); if (curIdx !== -1) setupUniversalReorder(tr, tr.querySelector('.drag-handle'), 'shed_modules', curIdx);
                };
                (site.moduleOrder || ['prim', 'sec', 'clad', 'acc', 'erect']).forEach(mKey => {
                    if (mKey === 'prim' && site.primEnabled !== false) addRow("Primary Structure", site.primCustomLine, pRt, pWt, pTot, 'prim', pUnit, false, helperSpecs(site.primSpecs), 'prim');
                    else if (mKey === 'sec' && site.secEnabled !== false) addRow("Secondary Structure", site.secCustomLine, sRt, sWt, sTot, 'sec', sUnit, false, helperSpecs(site.secSpecs), 'sec');
                    else if (mKey === 'clad' && site.cladEnabled !== false) { const thickBullet = site.cladThickness ? `<div class="item-specs-bullets"><span class="spec-highlight-pill">📐 Thickness: ${site.cladThickness}</span></div>` : ''; addRow("Roof & Wall Cladding", site.cladCustomLine, cRt, cSq, cTot, 'clad', cUnit, false, thickBullet, 'clad'); }
                    else if (mKey === 'acc' && site.accEnabled !== false) addRow("Accessories Package", site.accCustomLine, `Itemized Below`, `Package`, aTot, 'acc', '', false, "", 'acc');
                    else if (mKey === 'erect' && site.erectEnabled !== false) addRow("Erection & Installation", site.erectCustomLine, eRt, eWt, eTot, 'erect', eUnit, false, helperSpecs(site.erectSpecs), 'erect');
                    else { const c = (site.customModules || []).find(m => m.id === mKey); if (c && c.enabled !== false) { const tot = (parseFloat(c.qty) || 0) * (parseFloat(c.rate) || 0); customTot += tot; addRow(c.title, c.desc || '-', c.rate, c.qty, tot, 'custom', c.unit || 'Lot', true, "", c.id); } }
                });
                const basic = pTot + sTot + cTot + aTot + eTot + customTot, tax = getActiveTaxSlab('shed'), taxAmt = basic * tax.rate, grand = basic + taxAmt;
                shedGrandTotal = grand; animateNumberRoll('pdfFinBasic', basic, "Rs. "); safeSetHtml('pdfTaxBreakdownRows', renderVerticalTaxRowsHtml(basic, tax)); animateNumberRoll('pdfFinGrand', grand, "Rs. "); triggerTotalBarShimmer();
                const shedAvgBox = document.getElementById('pdfShedAvgRateBox');
                if (shedAvgBox) { if (sqft > 0 && !isRateOnly && grand > 0) { safeSetText('pdfShedAvgRateLabel', 'SHED RATE / SQ.FT:'); safeSetText('pdfShedAvgRateVal', `₹ ${Math.round(grand / sqft).toLocaleString('en-IN')} / Sq.Ft`); shedAvgBox.style.display = 'flex'; } else shedAvgBox.style.display = 'none'; }
            }
        }
        const finBox = document.getElementById('financialStandardBox'), rateNotice = document.getElementById('rateOnlyNoticeBox');
        if (finBox && rateNotice) { finBox.style.display = isRateOnly ? 'none' : 'block'; rateNotice.style.display = isRateOnly ? 'block' : 'none'; }
        const pTerms = isSqft ? (appSettings.sqftPaymentTerms || '') : (appSettings.paymentTerms || '');
        const gTerms = isSqft ? (appSettings.sqftTermsCond || '') : (appSettings.termsCond || '');
        const pKey = isSqft ? 'sqftPaymentTerms' : 'paymentTerms', gKey = isSqft ? 'sqftTermsCond' : 'termsCond';
        safeSetHtml('pdfTermsContainer', `<div class="terms-seamless-block"><b style="font-size:calc(9.5px * var(--pdf-font-scale));">1. Payment Terms & Schedule:</b><div class="editable-preview-title" contenteditable="true" onblur="syncPreviewTermsEdit('${pKey}',this)" style="display:block;white-space:pre-wrap;margin-top:2px;font-size:calc(9px * var(--pdf-font-scale));line-height:1.35;font-weight:800;color:#000;">${pTerms}</div></div><div class="terms-seamless-block" style="margin-top:5px;"><b style="font-size:calc(9.5px * var(--pdf-font-scale));">2. Commercial Terms & Conditions:</b><div class="editable-preview-title" contenteditable="true" onblur="syncPreviewTermsEdit('${gKey}',this)" style="display:block;white-space:pre-wrap;margin-top:2px;font-size:calc(9px * var(--pdf-font-scale));line-height:1.35;font-weight:800;color:#000;">${gTerms}</div></div>`);
        safeSetHtml('pdfSignImgBox', appSettings.signatureData ? `<img src="${appSettings.signatureData}" style="max-height:44px;width:auto;display:block;margin:0 auto;">` : '');
    }

    // PAGE 2: CIVIL SPECIFICATIONS
    const civilPageBlock = document.getElementById('civilDedicatedPageSheet'), pageGapDivider = document.getElementById('civilPageGapDivider');
    let civilGrandTotal = 0, civilTotalBasic = 0;
    if (!isCivilActive) {
        if (civilPageBlock) civilPageBlock.style.setProperty('display', 'none', 'important');
        if (pageGapDivider) pageGapDivider.style.setProperty('display', 'none', 'important');
    } else {
        if (civilPageBlock) civilPageBlock.style.setProperty('display', 'flow-root', 'important');
        if (pageGapDivider) pageGapDivider.style.setProperty('display', isShedActive ? 'block' : 'none', 'important');
        ensureCivilDataOnSite(site); const civ = site.civilData;
        const cleanCivHead = isCivilRateOnly ? `<tr><th style="width:8%;text-align:center;">S.N</th><th style="width:56%;text-align:left;">ITEM / WORK DESCRIPTION</th><th style="width:14%;text-align:center;">UNIT</th><th style="width:22%;text-align:right;">CONTRACT RATE (₹)</th></tr>` : `<tr><th style="width:7%;text-align:center;">S.N</th><th style="width:45%;text-align:left;">ITEM / WORK DESCRIPTION</th><th style="width:14%;text-align:center;">QTY / AREA</th><th style="width:10%;text-align:center;">UNIT</th><th style="width:11%;text-align:right;">RATE (₹)</th><th style="width:13%;text-align:right;">AMOUNT (₹)</th></tr>`;
        safeSetHtml('civilFoundationTableHead', cleanCivHead); safeSetHtml('civilBrickWallTableHead', cleanCivHead); safeSetHtml('civilFlooringTableHead', cleanCivHead);
        const renderCivSection = (secKey, secPrefix, tbodyId, titleKey, defaultTitle, isEnabled) => {
            const sec = civ[secKey], finalTitle = appSettings[titleKey] || sec.title || defaultTitle; safeSetText(titleKey, finalTitle);
            const titleEl = document.getElementById(titleKey)?.parentElement, tbody = document.getElementById(tbodyId), tblWrap = tbody?.closest('.table-wrapper');
            if (!isEnabled) { if (titleEl) titleEl.style.display = 'none'; if (tblWrap) tblWrap.style.display = 'none'; return; }
            if (titleEl) titleEl.style.display = 'flex'; if (tblWrap) tblWrap.style.display = 'block';
            if (!tbody) return; tbody.innerHTML = ""; let sIdx = 1;
            (sec.items || []).forEach((item, idx) => {
                if (item.enabled !== false) {
                    const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0); civilTotalBasic += amt;
                    const tr = document.createElement('tr'); tr.className = "sortable-item"; tr.dataset.sortIndex = idx;
                    tr.innerHTML = isCivilRateOnly ? `<td style="text-align:center;font-weight:900;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${secPrefix}.${sIdx++}</td><td><div class="civil-item-title editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncCivilTitleEdit(this,'${secKey}',${idx})" style="font-size:calc(9.5px * var(--pdf-font-scale));">${item.name}</div></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openCivilUnitPicker('${secKey}',${idx})">${item.unit || 'Lot'} ▾</span></td><td style="text-align:right;font-weight:900;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this,'civ_${secKey}_${idx}_rate')">${formatRawOrDash(item.rate)}</span></td>` : `<td style="text-align:center;font-weight:900;"><span class="drag-handle" title="Drag to reorder">⋮⋮</span> ${secPrefix}.${sIdx++}</td><td><div class="civil-item-title editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)" onblur="syncCivilTitleEdit(this,'${secKey}',${idx})" style="font-size:calc(9.5px * var(--pdf-font-scale));">${item.name}</div></td><td style="text-align:center;font-weight:900;"><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this,'civ_${secKey}_${idx}_qty')">${formatRawOrDash(item.qty)}</span></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openCivilUnitPicker('${secKey}',${idx})">${item.unit || 'Lot'} ▾</span></td><td style="text-align:right;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this,'civ_${secKey}_${idx}_rate')">${formatRawOrDash(item.rate)}</span></td><td class="civil-amt-cell" style="font-weight:900;">${amt > 0 ? '₹ ' + Math.round(amt).toLocaleString('en-IN') : '-'}</td>`;
                    tbody.appendChild(tr); setupUniversalReorder(tr, tr.querySelector('.drag-handle'), 'civil_items', idx, secKey);
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
                            const tot = (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0); civilTotalBasic += tot;
                            rowsHtml += isCivilRateOnly ? `<tr><td style="text-align:center;font-weight:900;">${idx + 1}</td><td><div class="civil-item-title editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)">${it.name}</div></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openCivilCustomCatUnitPicker(${cIdx},${idx})">${it.unit || 'Lot'} ▾</span></td><td style="text-align:right;font-weight:900;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onblur="syncPreviewEdit(this,'civcat_${cIdx}_${idx}_rate')">${formatRawOrDash(it.rate)}</span></td></tr>` : `<tr><td style="text-align:center;font-weight:900;">${idx + 1}</td><td><div class="civil-item-title editable-preview-title" contenteditable="true" onfocus="handlePreviewInputFocus(this)">${it.name}</div></td><td style="text-align:center;"><span class="preview-unit-pill btn-ripple" onclick="openCivilCustomCatUnitPicker(${cIdx},${idx})">${it.unit || 'Lot'} ▾</span></td><td style="text-align:right;"><span class="rate-prefix">₹ </span><span contenteditable="true" inputmode="decimal" onfocus="handlePreviewInputFocus(this)" onblur="syncPreviewEdit(this,'civcat_${cIdx}_${idx}_rate')">${formatRawOrDash(it.rate)}</span></td><td class="civil-amt-cell" style="font-weight:900;">${tot > 0 ? '₹ ' + Math.round(tot).toLocaleString('en-IN') : '-'}</td></tr>`;
                        }
                    });
                    customCivWrapper.innerHTML += `<div class="civil-category-title-bar"><span style="font-size:calc(9.5px * var(--pdf-font-scale));">${cat.categoryName}:</span></div><div class="table-wrapper"><table class="civil-schedule-table"><thead>${cleanCivHead}</thead><tbody>${rowsHtml}</tbody></table></div>`;
                }
            });
        }
        safeSetHtml('civilPdfTermsContainer', `<div class="terms-seamless-block"><b style="font-size:calc(9.5px * var(--pdf-font-scale));">1. Civil Work Schedule & Terms:</b><div class="editable-preview-title" contenteditable="true" onblur="syncPreviewTermsEdit('civilPaymentTerms',this)" style="display:block;white-space:pre-wrap;margin-top:2px;font-size:calc(9px * var(--pdf-font-scale));line-height:1.35;font-weight:800;color:#000;">${(appSettings.civilPaymentTerms || '')}</div></div><div class="terms-seamless-block" style="margin-top:5px;"><b style="font-size:calc(9.5px * var(--pdf-font-scale));">2. General Civil Conditions:</b><div class="editable-preview-title" contenteditable="true" onblur="syncPreviewTermsEdit('civilTermsCond',this)" style="display:block;white-space:pre-wrap;margin-top:2px;font-size:calc(9px * var(--pdf-font-scale));line-height:1.35;font-weight:800;color:#000;">${(appSettings.civilTermsCond || '')}</div></div>`);
        const civilTax = getActiveTaxSlab('civil'), civGrand = civilTotalBasic + (civilTotalBasic * civilTax.rate);
        civilGrandTotal = civGrand; animateNumberRoll('civilFinBasic', civilTotalBasic, "Rs. "); safeSetHtml('civilPdfTaxBreakdownRows', renderVerticalTaxRowsHtml(civilTotalBasic, civilTax)); animateNumberRoll('civilFinGrand', civGrand, "Rs. "); triggerTotalBarShimmer();
        const civFinBox = document.getElementById('civilFinancialBox'), civRateNotice = document.getElementById('civilRateOnlyNoticeBox');
        if (civFinBox && civRateNotice) { civFinBox.style.display = isCivilRateOnly ? 'none' : 'block'; civRateNotice.style.display = isCivilRateOnly ? 'block' : 'none'; }
        safeSetHtml('civilPdfSignImgBox', appSettings.signatureData ? `<img src="${appSettings.signatureData}" style="max-height:44px;width:auto;display:block;margin:0 auto;">` : '');
    }

    // COMBINED PACKAGE STRIP
    const p1CombBox = document.getElementById('pdfCombinedPackageBox'), p2CombBox = document.getElementById('civilPdfCombinedPackageBox');
    const isCivilActuallyValued = (civilGrandTotal > 0 || civilTotalBasic > 0);
    if (isShedActive && isCivilActive && isCivilActuallyValued) {
        const totalComb = shedGrandTotal + civilGrandTotal, combRate = sqft > 0 ? Math.round(totalComb / sqft) : 0;
        const combHtml = `<div class="comb-row"><span>Shed Project Area:</span><b>${sqft > 0 ? sqft.toLocaleString('en-IN') + ' Sq.Ft' : '-'}</b></div><div class="comb-row"><span>Combined Contract Total (Shed + Civil):</span><b>${totalComb > 0 ? '₹ ' + Math.round(totalComb).toLocaleString('en-IN') : '-'}</b></div><div class="comb-rate-pill"><span>COMBINED RATE / SQ.FT:</span><b>${combRate > 0 ? '₹ ' + combRate.toLocaleString('en-IN') : '-'} / Sq.Ft</b></div>`;
        if (p1CombBox) { p1CombBox.innerHTML = combHtml; p1CombBox.style.display = isRateOnly ? 'none' : 'flex'; }
        if (p2CombBox) { p2CombBox.innerHTML = combHtml; p2CombBox.style.display = isCivilRateOnly ? 'none' : 'flex'; }
    } else { if (p1CombBox) p1CombBox.style.display = 'none'; if (p2CombBox) p2CombBox.style.display = 'none'; }

    // COMPANY BANK ACCOUNT DETAILS
    const p1BankBox = document.getElementById('pdfCompanyBankDetailsBox'), p2BankBox = document.getElementById('civilPdfCompanyBankDetailsBox');
    if (appSettings.bankName || appSettings.bankAccNo || appSettings.bankIfsc) {
        safeSetText('pdfBankNameDisplay', appSettings.bankName || '-'); safeSetText('pdfBankAccNameDisplay', appSettings.bankAccName || '-'); safeSetText('pdfBankAccNoDisplay', appSettings.bankAccNo || '-'); safeSetText('pdfBankIfscDisplay', appSettings.bankIfsc || '-'); safeSetText('pdfBankBranchDisplay', appSettings.bankBranch || '-');
        safeSetText('civilPdfBankNameDisplay', appSettings.bankName || '-'); safeSetText('civilPdfBankAccNameDisplay', appSettings.bankAccName || '-'); safeSetText('civilPdfBankAccNoDisplay', appSettings.bankAccNo || '-'); safeSetText('civilPdfBankIfscDisplay', appSettings.bankIfsc || '-'); safeSetText('civilPdfBankBranchDisplay', appSettings.bankBranch || '-');
        const p1UpiWrap = document.getElementById('pdfBankUpiWrap'), p2UpiWrap = document.getElementById('civilPdfBankUpiWrap');
        if (appSettings.bankUpi) { safeSetText('pdfBankUpiDisplay', appSettings.bankUpi); safeSetText('civilPdfBankUpiDisplay', appSettings.bankUpi); if (p1UpiWrap) p1UpiWrap.style.display = 'flex'; if (p2UpiWrap) p2UpiWrap.style.display = 'flex'; }
        else { if (p1UpiWrap) p1UpiWrap.style.display = 'none'; if (p2UpiWrap) p2UpiWrap.style.display = 'none'; }
        if (p1BankBox) p1BankBox.style.display = 'flex'; if (p2BankBox) p2BankBox.style.display = 'flex';
    } else { if (p1BankBox) p1BankBox.style.display = 'none'; if (p2BankBox) p2BankBox.style.display = 'none'; }

    syncCivilLivePreviewBox();
    if (!isSoftRefresh) setTimeout(autoFitPreview, 35);
}

// ============================================================================
// 23. PURE TRUE-VECTOR PDF ENGINE (100% REAL TEXT & SHARP VECTOR LININGS)
// ============================================================================
async function downloadPDFDirectly(mode = 'both') {
    const site = getCurrentSite(); if (!site) return;
    const clientClean = (site.clientName || 'Client').trim().replace(/[^a-zA-Z0-9]/g, '_');
    const quoteClean = (site.quoteNo || 'Quote').trim().replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Patel_Engineering_${clientClean}_${quoteClean}_${mode.toUpperCase()}.pdf`;
    
    triggerHaptic(50); playAppSound('chime'); fireConfettiCelebration();

    const jsPDFClass = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    if (!jsPDFClass || !jsPDFClass.API || !jsPDFClass.API.autoTable) {
        showCorporateToast("Fallback: Opening Vector Print...", "🖨️");
        window.print();
        return;
    }

    const doc = new jsPDFClass({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const isSqft = isSqftMode(site), isRateOnly = site.rateOnlyMode === true;
    const compAddr = appSettings.companyAddr || "Bhawani Nagar, Bhilwara - 311001 (Rajasthan, India)";
    const compGst = appSettings.companyGst || "08AHFPL0222M2ZF";
    const compPhones = (appSettings.phones || []).filter(Boolean).join(", ") || "+91 9799635249";
    const compEmail = (appSettings.companyEmail || "").trim();
    const compWeb = (appSettings.footerWeb || "").trim();
    const issueDateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const sqft = (parseFloat(site.dimW) || 0) * (parseFloat(site.dimL) || 0);

    // DRAW COMMON VECTOR HEADER
    function drawHeaderAndSubstrip(pDoc, ribbonText, quoteNum) {
        pDoc.setFillColor(12, 30, 48);
        pDoc.rect(10, 8, 190, 2, 'F');

        // Logo Image
        if (appSettings.logoData) {
            try { pDoc.addImage(appSettings.logoData, 'PNG', 10, 11, 75, 23, undefined, 'FAST'); }
            catch(e) { pDoc.setFont('helvetica', 'bold'); pDoc.setFontSize(16); pDoc.setTextColor(12, 30, 48); pDoc.text(appSettings.ownerName || "PATEL ENGINEERING", 12, 23); }
        } else {
            pDoc.setFont('helvetica', 'bold'); pDoc.setFontSize(16); pDoc.setTextColor(12, 30, 48);
            pDoc.text(appSettings.ownerName || "PATEL ENGINEERING", 12, 23);
        }

        // Navy Blue Angled Polygon Ribbon
        pDoc.setFillColor(12, 30, 48);
        pDoc.triangle(120, 10, 132, 35, 132, 10, 'F');
        pDoc.rect(132, 10, 68, 25, 'F');

        pDoc.setTextColor(255, 255, 255);
        pDoc.setFont('helvetica', 'bold');
        pDoc.setFontSize(15);
        pDoc.text(ribbonText, 195, 19, { align: 'right' });
        pDoc.setFontSize(8);
        pDoc.setFont('helvetica', 'normal');
        pDoc.text("Quote Ref: " + quoteNum, 195, 25, { align: 'right' });
        pDoc.text("Issue Date: " + issueDateStr, 195, 30, { align: 'right' });

        // Substrip bar
        pDoc.setFillColor(12, 30, 48);
        pDoc.rect(10, 36, 190, 5.5, 'F');
        pDoc.setTextColor(255, 255, 255);
        pDoc.setFontSize(7.5);
        pDoc.text("Works & Office: " + compAddr, 12, 40);
        pDoc.setFont('helvetica', 'bold');
        pDoc.text("GSTIN: " + compGst, 198, 40, { align: 'right' });
    }

    // DRAW CUSTOMER DETAILS & DIMENSIONS
    function drawCustomerDetailsBlock(pDoc, scopeTitle, startY) {
        pDoc.setDrawColor(0, 0, 0); pDoc.setLineWidth(0.35);
        pDoc.rect(10, startY, 190, 23);
        pDoc.line(108, startY, 108, startY + 23);

        // Left: Scope & Dimension Box
        pDoc.setTextColor(0, 0, 0); pDoc.setFont('helvetica', 'bold'); pDoc.setFontSize(8);
        pDoc.text(scopeTitle, 12, startY + 4, { maxWidth: 94 });
        pDoc.setFontSize(6.5); pDoc.text("PROJECT SIZE / SHED DIMENSIONS:", 12, startY + 9.5);

        const dimY = startY + 11.5;
        pDoc.setDrawColor(0, 0, 0); pDoc.setLineWidth(0.25);
        pDoc.rect(12, dimY, 93, 8.5);
        pDoc.setFillColor(224, 242, 254);
        pDoc.rect(68, dimY, 37, 8.5, 'FD');

        pDoc.setFontSize(6.5); pDoc.setFont('helvetica', 'normal');
        pDoc.text("Width", 15, dimY + 3); pDoc.text("Length", 32, dimY + 3); pDoc.text("Height", 51, dimY + 3); pDoc.text("Total Area", 72, dimY + 3);
        pDoc.setFontSize(8); pDoc.setFont('helvetica', 'bold');
        pDoc.text(site.dimW ? site.dimW + " Ft" : "-", 15, dimY + 7); pDoc.text("x", 28, dimY + 6);
        pDoc.text(site.dimL ? site.dimL + " Ft" : "-", 32, dimY + 7); pDoc.text("x", 47, dimY + 6);
        pDoc.text(site.dimH ? site.dimH + " Ft" : "-", 51, dimY + 7); pDoc.text("=", 65, dimY + 6);
        pDoc.setTextColor(12, 30, 48); pDoc.text(sqft > 0 ? sqft.toLocaleString('en-IN') + " Sq.Ft" : "-", 72, dimY + 7);

        // Right: Customer info
        pDoc.setTextColor(0, 0, 0);
        const contactLine = [site.custContactPerson, site.custRole ? ('(' + site.custRole + ')') : ''].filter(Boolean).join(' ') || "-";
        const phonesLine = [site.custNumber1, site.custNumber2].filter(Boolean).join(" / ") || "-";
        const infoRows = [["Client:", site.clientName || "-"], ["Contact Person:", contactLine], ["Contact Number:", phonesLine], ["Customer GST:", site.custGST || "-"], ["Site Address:", site.custAddress || "-"]];
        let cY = startY + 4;
        infoRows.forEach(([lbl, val]) => {
            pDoc.setFont('helvetica', 'bold'); pDoc.setFontSize(7); pDoc.text(lbl, 110, cY);
            pDoc.setFont('helvetica', 'normal'); pDoc.text(String(val), 198, cY, { align: 'right', maxWidth: 62 });
            cY += 4.2;
        });
    }

    // DRAW COMMON FOOTER
    function drawFooterBar(pDoc) {
        pDoc.setFillColor(12, 30, 48);
        pDoc.rect(10, 287, 190, 6, 'F');
        pDoc.setTextColor(255, 255, 255); pDoc.setFontSize(6.5); pDoc.setFont('helvetica', 'normal');
        pDoc.text("Phones: " + compPhones + "  |  GSTIN: " + compGst, 12, 290.5);
        pDoc.text(compAddr + (compEmail ? " | " + compEmail : ""), 12, 292);
        if (compWeb) pDoc.text(compWeb, 198, 291, { align: 'right' });
    }

    // PAGE 1: SHED QUOTATION
    if (hasShedMode(site) && (mode === 'shed' || mode === 'both')) {
        drawHeaderAndSubstrip(doc, (appSettings.pdfRibbonTitle || "QUOTATION"), (site.quoteNo || "PE/2026/01"));
        drawCustomerDetailsBlock(doc, (isSqft ? (site.sqftScopeDesc || "QUOTATION FOR PEB - SQ.FT BASIS") : (appSettings.pdfScopeTitle || "QUOTATION FOR PRE-ENGINEERED BUILDING")), 43);

        let tableStartY = 68;

        // TABLE SECTION HEADER BAR
        doc.setFillColor(226, 232, 240);
        doc.rect(10, tableStartY, 190, 5, 'F');
        doc.setFillColor(12, 30, 48);
        doc.rect(10, tableStartY, 2.5, 5, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(0, 0, 0);
        doc.text(isSqft ? (site.sqftTableDesc || "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:") : (appSettings.headerLine2 || "1. PRICE BREAKUP AS PER KG RATE:"), 14, tableStartY + 3.5);

        // BUILD TABLE ROWS
        let tableHeaders = [], tableData = [], colStyles = {};
        if (isSqft) {
            tableHeaders = [['S.NO', 'ITEM / WORK COMPONENT', 'TECHNICAL SPECIFICATIONS & DIMENSIONS', 'UNIT / SCOPE']];
            colStyles = { 0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' }, 1: { cellWidth: 70 }, 2: { cellWidth: 80 }, 3: { cellWidth: 28, halign: 'center', fontStyle: 'bold' } };
            
            let sNo = 1;
            // 1. Primary
            if (site.primEnabled !== false) {
                let primLeft = (appSettings.sqftPrimLabel || "Primary Structural Framing") + "\n" + (site.sqftPrimCustomLine || "");
                let primRight = "";
                (site.sqftPrimSpecs || []).filter(p => p.selected !== false).forEach(p => {
                    primLeft += `\n• ${p.text || ""}`;
                    let dimText = (p.length || p.width || p.thk) ? `L: ${p.length || '-'} x W: ${p.width || '-'}` + (p.thk ? ` x Thk: ${p.thk}` : '') + ` ${p.dimUnit || 'mm'}` : "-";
                    primRight += (primRight ? "\n" : "") + dimText;
                });
                tableData.push([String(sNo++), primLeft, primRight, 'Main Frame']);
            }
            // 2. Cladding
            if (site.cladEnabled !== false) {
                tableData.push([String(sNo++), (appSettings.sqftCladLabel || "Roof & Wall Cladding System") + "\n" + (site.sqftCladCustomLine || ""), "Thickness: " + (site.cladThickness || "0.50 mm"), 'Covering']);
            }
            // 3. Accessories
            if (site.accEnabled !== false) {
                let accLeft = (appSettings.sqftAccLabel || "Building Accessories Package") + "\n" + (site.sqftAccCustomLine || "");
                let accRight = "";
                (site.sqftAccessories || []).filter(a => a.selected !== false).forEach(a => {
                    accLeft += `\n• ${a.name || ""}`;
                    accRight += (accRight ? "\n" : "") + (a.qty ? `${a.qty} ${a.unit || 'Nos'}` : "-");
                });
                tableData.push([String(sNo++), accLeft, accRight, 'Package']);
            }
            // 4. Erection
            if (site.erectEnabled !== false) {
                let erectSpecs = (site.erectSpecs || []).filter(e => e.selected === true).map(e => "• " + (e.text || e)).join("\n");
                tableData.push([String(sNo++), (appSettings.sqftErectLabel || "Turnkey Erection & Installation") + "\n" + (site.sqftErectCustomLine || ""), erectSpecs || "Crane, Hydra, Welding Machine & Labour", 'Turnkey']);
            }
        } else {
            // KG MODE
            tableHeaders = isRateOnly ? [['S.NO', 'DESCRIPTION', 'UNIT', 'CONTRACT RATE (₹)']] : [['S.NO', 'DESCRIPTION', 'QTY', 'UNIT', 'RATE (₹)', 'AMOUNT (INR)']];
            colStyles = isRateOnly ? { 0: { cellWidth: 12, halign: 'center' }, 1: { cellWidth: 120 }, 2: { cellWidth: 25, halign: 'center' }, 3: { cellWidth: 33, halign: 'right' } } :
                                     { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: 82 }, 2: { cellWidth: 22, halign: 'center' }, 3: { cellWidth: 18, halign: 'center' }, 4: { cellWidth: 24, halign: 'right' }, 5: { cellWidth: 34, halign: 'right' } };
            let sNo = 1;
            const pWt = (parseFloat(site.primWeight) || 0), pRt = (parseFloat(site.primRate) || 0);
            if (site.primEnabled !== false) tableData.push(isRateOnly ? [String(sNo++), "Primary Structure: " + (site.primCustomLine || ""), site.primUnit || "Kg", "Rs. " + pRt] : [String(sNo++), "Primary Structure: " + (site.primCustomLine || ""), String(pWt), site.primUnit || "Kg", String(pRt), "Rs. " + Math.round(pWt * pRt).toLocaleString('en-IN')]);
            const sWt = (parseFloat(site.secWeight) || 0), sRt = (parseFloat(site.secRate) || 0);
            if (site.secEnabled !== false) tableData.push(isRateOnly ? [String(sNo++), "Secondary Structure: " + (site.secCustomLine || ""), site.secUnit || "Kg", "Rs. " + sRt] : [String(sNo++), "Secondary Structure: " + (site.secCustomLine || ""), String(sWt), site.secUnit || "Kg", String(sRt), "Rs. " + Math.round(sWt * sRt).toLocaleString('en-IN')]);
            const cSq = (parseFloat(site.cladSqFt) || 0), cRt = (parseFloat(site.cladRate) || 0);
            if (site.cladEnabled !== false) tableData.push(isRateOnly ? [String(sNo++), "Roof & Wall Cladding: " + (site.cladCustomLine || ""), site.cladUnit || "Sq.Ft", "Rs. " + cRt] : [String(sNo++), "Roof & Wall Cladding: " + (site.cladCustomLine || ""), String(cSq), site.cladUnit || "Sq.Ft", String(cRt), "Rs. " + Math.round(cSq * cRt).toLocaleString('en-IN')]);
            if (site.erectEnabled !== false) {
                const autoWt = (site.primEnabled !== false ? pWt : 0) + (site.secEnabled !== false ? sWt : 0), eRt = (parseFloat(site.erectRate) || 0);
                tableData.push(isRateOnly ? [String(sNo++), "Erection & Installation: " + (site.erectCustomLine || ""), site.erectUnit || "Kg", "Rs. " + eRt] : [String(sNo++), "Erection & Installation: " + (site.erectCustomLine || ""), String(autoWt), site.erectUnit || "Kg", String(eRt), "Rs. " + Math.round(autoWt * eRt).toLocaleString('en-IN')]);
            }
        }

        // GENERATE TRUE VECTOR AUTOTABLE
        doc.autoTable({
            startY: tableStartY + 5.5,
            head: tableHeaders,
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [12, 30, 48], textColor: 255, fontStyle: 'bold', fontSize: 7.5, halign: 'center', cellPadding: 2 },
            styles: { fontSize: 7, cellPadding: 1.8, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.25, font: 'helvetica' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            columnStyles: colStyles,
            margin: { left: 10, right: 10 }
        });

        let finalY = doc.lastAutoTable.finalY + 3;

        // SUMMARY, TERMS & FINANCIALS (FITS PERFECTLY ON SINGLE PAGE)
        const summaryHeight = 44;
        doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.35);
        doc.rect(10, finalY, 190, summaryHeight);
        doc.line(110, finalY, 110, finalY + summaryHeight);

        // Left Terms
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(0, 0, 0);
        doc.text("Terms & Conditions:", 12, finalY + 4);
        doc.setFontSize(6.5); doc.setFont('helvetica', 'normal');
        const termsText = (isSqft ? appSettings.sqftPaymentTerms : appSettings.paymentTerms) || "";
        doc.text(termsText, 12, finalY + 8, { maxWidth: 94 });

        // Right Financials
        const sqRate = parseFloat(site.shedSqftRate) || 0, shedBasicCost = sqft * sqRate;
        const tax = getActiveTaxSlab('shed'), taxAmt = shedBasicCost * tax.rate, grand = shedBasicCost + taxAmt;
        const withTaxRate = (tax.rate > 0 && sqRate > 0) ? (sqRate + (sqRate * tax.rate)) : sqRate;

        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        doc.text("Total Basic Cost:", 112, finalY + 5);
        doc.setFont('helvetica', 'bold');
        doc.text("Rs. " + Math.round(shedBasicCost).toLocaleString('en-IN'), 198, finalY + 5, { align: 'right' });

        if (tax.split) {
            doc.setFont('helvetica', 'normal');
            doc.text("CGST @ 9%:", 112, finalY + 9.5);
            doc.text("Rs. " + Math.round(shedBasicCost * 0.09).toLocaleString('en-IN'), 198, finalY + 9.5, { align: 'right' });
            doc.text("SGST @ 9%:", 112, finalY + 14);
            doc.text("Rs. " + Math.round(shedBasicCost * 0.09).toLocaleString('en-IN'), 198, finalY + 14, { align: 'right' });
        }

        // Solid Navy Total Bar
        doc.setFillColor(12, 30, 48);
        doc.rect(112, finalY + 17, 86, 7.5, 'F');
        doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
        doc.text("GRAND TOTAL WITH GST:", 114, finalY + 22);
        doc.text("Rs. " + Math.round(grand).toLocaleString('en-IN'), 196, finalY + 22, { align: 'right' });

        // Shed rate pill
        doc.setFillColor(241, 245, 249);
        doc.rect(112, finalY + 26, 86, 6, 'F');
        doc.setTextColor(0, 0, 0); doc.setFontSize(7);
        doc.text("SHED RATE / SQ.FT (WITH GST):", 114, finalY + 30);
        doc.text("Rs. " + withTaxRate.toFixed(2) + " / Sq.Ft", 196, finalY + 30, { align: 'right' });

        // BANK DETAILS CARD
        let bankY = finalY + summaryHeight + 2.5;
        if (appSettings.bankName || appSettings.bankAccNo) {
            doc.setFillColor(12, 30, 48); doc.rect(10, bankY, 190, 4.5, 'F');
            doc.setTextColor(255, 255, 255); doc.setFontSize(6.5); doc.setFont('helvetica', 'bold');
            doc.text("COMPANY BANK ACCOUNT DETAILS (FOR NEFT / RTGS / IMPS / UPI):", 12, bankY + 3.2);

            doc.setFillColor(248, 250, 252); doc.setDrawColor(0, 0, 0);
            doc.rect(10, bankY + 4.5, 190, 8, 'FD');
            doc.setTextColor(0, 0, 0); doc.setFontSize(6.5);
            doc.text("Bank Name: " + (appSettings.bankName || "-"), 12, bankY + 8);
            doc.text("Account Name: " + (appSettings.bankAccName || "-"), 75, bankY + 8);
            doc.text("Account No: " + (appSettings.bankAccNo || "-"), 140, bankY + 8);
            doc.text("IFSC Code: " + (appSettings.bankIfsc || "-"), 12, bankY + 11.5);
            doc.text("Branch: " + (appSettings.bankBranch || "-"), 75, bankY + 11.5);
            doc.text("UPI ID: " + (appSettings.bankUpi || "-"), 140, bankY + 11.5);
            bankY += 14;
        }

        // SIGNATURES
        let sigY = bankY + 4;
        doc.setDrawColor(0, 0, 0); doc.setLineWidth(0.35);
        doc.line(15, sigY + 12, 75, sigY + 12);
        doc.line(135, sigY + 12, 195, sigY + 12);

        // Digital Signature Image
        if (appSettings.signatureData) {
            try { doc.addImage(appSettings.signatureData, 'PNG', 145, sigY - 2, 40, 13); } catch(e) {}
        }

        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor(0, 0, 0);
        doc.text("CUSTOMER ACCEPTANCE", 45, sigY + 15.5, { align: 'center' });
        doc.text("FOR " + (appSettings.ownerName || "PATEL ENGINEERING"), 165, sigY + 15.5, { align: 'center' });
        doc.setFontSize(6); doc.setFont('helvetica', 'normal');
        doc.text("Authorized Signature & Stamp", 45, sigY + 18.5, { align: 'center' });
        doc.text("Authorized Signatory", 165, sigY + 18.5, { align: 'center' });

        // Footer
        drawFooterBar(doc);
    }

    // PAGE 2: CIVIL WORKS (IF APPLICABLE)
    if (hasCivilMode(site) && (mode === 'civil' || mode === 'both')) {
        if (hasShedMode(site) && mode === 'both') doc.addPage();

        drawHeaderAndSubstrip(doc, "QUOTATION", (site.quoteNo || "PE/2026/01"));
        drawCustomerDetailsBlock(doc, site.civilScopeDesc || "TECHNICAL SPECIFICATION SCHEDULE FOR CIVIL & RCC WORKS", 43);

        let civTableData = [];
        ensureCivilDataOnSite(site);
        const civ = site.civilData;

        ['foundation', 'brickWall', 'flooring'].forEach((secKey, sIdx) => {
            if (site[secKey === 'foundation' ? 'foundEnabled' : (secKey === 'brickWall' ? 'brickEnabled' : 'floorEnabled')] !== false) {
                (civ[secKey]?.items || []).filter(it => it.enabled !== false).forEach((it, iIdx) => {
                    const amt = (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0);
                    civTableData.push([`${sIdx + 1}.${iIdx + 1}`, it.name, it.qty || "-", it.unit || "Lot", it.rate ? "Rs. " + it.rate : "-", amt > 0 ? "Rs. " + Math.round(amt).toLocaleString('en-IN') : "-"]);
                });
            }
        });

        doc.autoTable({
            startY: 70,
            head: [['S.N', 'ITEM / WORK DESCRIPTION', 'QTY / AREA', 'UNIT', 'RATE (₹)', 'AMOUNT (₹)']],
            body: civTableData,
            theme: 'grid',
            headStyles: { fillColor: [12, 30, 48], textColor: 255, fontStyle: 'bold', fontSize: 7.5, halign: 'center' },
            styles: { fontSize: 7, cellPadding: 1.8, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.25 },
            margin: { left: 10, right: 10 }
        });

        drawFooterBar(doc);
    }

    // SAVE FILE DIRECTLY (100% REAL VECTOR PDF)
    doc.save(fileName);
    showCorporateToast("✓ True Vector PDF Downloaded (100% Real Text)!", "💎");
}

// 24. PERMANENT TEXTS MODAL, 3 TABS & BANK DETAILS CONTROLS
function switchPermanentTextTab(tabKey) {
    ['btnTabPtKg', 'btnTabPtSqft', 'btnTabPtCivil'].forEach(id => document.getElementById(id)?.classList.remove('active'));
    document.getElementById('ptPanelKg').style.display = 'none'; document.getElementById('ptPanelSqft').style.display = 'none'; document.getElementById('ptPanelCivil').style.display = 'none';
    if (tabKey === 'kg') { document.getElementById('btnTabPtKg')?.classList.add('active'); document.getElementById('ptPanelKg').style.display = 'block'; }
    else if (tabKey === 'sqft') { document.getElementById('btnTabPtSqft')?.classList.add('active'); document.getElementById('ptPanelSqft').style.display = 'block'; }
    else if (tabKey === 'civil') { document.getElementById('btnTabPtCivil')?.classList.add('active'); document.getElementById('ptPanelCivil').style.display = 'block'; }
}
function openBankDetailsModal() {
    safeSetVal('inpBankName', appSettings.bankName || ""); safeSetVal('inpBankAccName', appSettings.bankAccName || ""); safeSetVal('inpBankAccNo', appSettings.bankAccNo || ""); safeSetVal('inpBankIfsc', appSettings.bankIfsc || ""); safeSetVal('inpBankBranch', appSettings.bankBranch || ""); safeSetVal('inpBankUpi', appSettings.bankUpi || "");
    openModalWithHistory('companyBankDetailsModal');
}
function closeBankDetailsModal() { closeModalSafe('companyBankDetailsModal'); }
function saveCompanyBankDetails() {
    appSettings.bankName = (document.getElementById('inpBankName')?.value || "").trim(); appSettings.bankAccName = (document.getElementById('inpBankAccName')?.value || "").trim(); appSettings.bankAccNo = (document.getElementById('inpBankAccNo')?.value || "").trim(); appSettings.bankIfsc = (document.getElementById('inpBankIfsc')?.value || "").trim().toUpperCase(); appSettings.bankBranch = (document.getElementById('inpBankBranch')?.value || "").trim(); appSettings.bankUpi = (document.getElementById('inpBankUpi')?.value || "").trim();
    syncDataToCloud('patel_app_settings', appSettings); closeBankDetailsModal(); refreshLivePdfPreviewSheet(); showCorporateToast("Bank Account Details Saved!", "🏦");
}
function clearCompanyBankDetails() {
    safeSetVal('inpBankName', ""); safeSetVal('inpBankAccName', ""); safeSetVal('inpBankAccNo', ""); safeSetVal('inpBankIfsc', ""); safeSetVal('inpBankBranch', ""); safeSetVal('inpBankUpi', "");
    appSettings.bankName = ""; appSettings.bankAccName = ""; appSettings.bankAccNo = ""; appSettings.bankIfsc = ""; appSettings.bankBranch = ""; appSettings.bankUpi = "";
    syncDataToCloud('patel_app_settings', appSettings); closeBankDetailsModal(); refreshLivePdfPreviewSheet(); showCorporateToast("Bank Details cleared", "🗑️");
}
function openPermanentTextsModal() {
    safeSetVal('pt_companyDesc', appSettings.companyDesc !== undefined ? appSettings.companyDesc : ""); safeSetVal('pt_companyAddr', appSettings.companyAddr !== undefined ? appSettings.companyAddr : ""); safeSetVal('pt_companyGst', appSettings.companyGst !== undefined ? appSettings.companyGst : ""); safeSetVal('pt_footerWeb', appSettings.footerWeb !== undefined ? appSettings.footerWeb : "");
    safeSetVal('pt_pdfRibbonTitle', appSettings.pdfRibbonTitle !== undefined ? appSettings.pdfRibbonTitle : "QUOTATION"); safeSetVal('pt_pdfScopeTitle', appSettings.pdfScopeTitle !== undefined ? appSettings.pdfScopeTitle : "");
    safeSetVal('pt_headerLine1', appSettings.headerLine1 !== undefined ? appSettings.headerLine1 : "1. ESTIMATED STEEL WEIGHT:"); safeSetVal('pt_milestoneHeading', appSettings.milestoneHeading !== undefined ? appSettings.milestoneHeading : "TOTAL STRUCTURE WEIGHT (PRIMARY + SECONDARY):");
    safeSetVal('pt_headerLine2', appSettings.headerLine2 !== undefined ? appSettings.headerLine2 : "2. PRICE BREAKUP AS PER KG RATE:"); safeSetVal('pt_accSectionHeading', appSettings.accSectionHeading !== undefined ? appSettings.accSectionHeading : "3. BUILDING ACCESSORIES ITEM-WISE BREAKDOWN:");
    safeSetVal('pt_btnNamePrim', appSettings.btnNamePrim !== undefined ? appSettings.btnNamePrim : "1. Primary"); safeSetVal('pt_btnNameSec', appSettings.btnNameSec !== undefined ? appSettings.btnNameSec : "2. Secondary"); safeSetVal('pt_btnNameClad', appSettings.btnNameClad !== undefined ? appSettings.btnNameClad : "3. Cladding"); safeSetVal('pt_btnNameAcc', appSettings.btnNameAcc !== undefined ? appSettings.btnNameAcc : "4. Accessories"); safeSetVal('pt_btnNameErect', appSettings.btnNameErect !== undefined ? appSettings.btnNameErect : "5. Erection");
    safeSetVal('pt_sqftPdfRibbonTitle', appSettings.sqftPdfRibbonTitle !== undefined ? appSettings.sqftPdfRibbonTitle : "QUOTATION"); safeSetVal('pt_sqftPdfScopeTitle', appSettings.sqftPdfScopeTitle !== undefined ? appSettings.sqftPdfScopeTitle : "QUOTATION FOR PRE-ENGINEERED BUILDING (PEB) - SQ.FT BASIS");
    safeSetVal('pt_sqftHeaderLine1', appSettings.sqftHeaderLine1 !== undefined ? appSettings.sqftHeaderLine1 : "1. SHED SPECIFICATIONS & TECHNICAL WORK DESCRIPTION:"); safeSetVal('pt_sqftContractBarTitle', appSettings.sqftContractBarTitle !== undefined ? appSettings.sqftContractBarTitle : "COMPLETE PEB SHED CONTRACT (ON SQ.FT COVERED AREA BASIS)");
    safeSetVal('pt_sqftPrimLabel', appSettings.sqftPrimLabel !== undefined ? appSettings.sqftPrimLabel : "Primary Structural Framing"); safeSetVal('pt_sqftCladLabel', appSettings.sqftCladLabel !== undefined ? appSettings.sqftCladLabel : "Roof & Wall Cladding System"); safeSetVal('pt_sqftAccLabel', appSettings.sqftAccLabel !== undefined ? appSettings.sqftAccLabel : "Building Accessories Package"); safeSetVal('pt_sqftErectLabel', appSettings.sqftErectLabel !== undefined ? appSettings.sqftErectLabel : "Turnkey Erection & Installation");
    safeSetVal('pt_civilPdfRibbonTitle', appSettings.civilPdfRibbonTitle !== undefined ? appSettings.civilPdfRibbonTitle : "QUOTATION"); safeSetVal('pt_civilJobTitle', appSettings.civilJobTitle !== undefined ? appSettings.civilJobTitle : "JOB DETAILS & TECHNICAL SPECIFICATIONS");
    safeSetVal('pt_civilFoundTitle', appSettings.civilFoundTitle !== undefined ? appSettings.civilFoundTitle : "1. FOUNDATION & RCC COLUMN DETAILS:"); safeSetVal('pt_civilBrickTitle', appSettings.civilBrickTitle !== undefined ? appSettings.civilBrickTitle : "2. BRICK WALL, DPC & PLASTER DETAILS:"); safeSetVal('pt_civilFloorTitle', appSettings.civilFloorTitle !== undefined ? appSettings.civilFloorTitle : "3. FLOORING & PCC WORK DETAILS:");
    safeSetVal('pt_btnNameFoundation', appSettings.btnNameFoundation !== undefined ? appSettings.btnNameFoundation : "1. Foundation Details"); safeSetVal('pt_btnNameBrick', appSettings.btnNameBrick !== undefined ? appSettings.btnNameBrick : "2. Brick Wall Details"); safeSetVal('pt_btnNameFlooring', appSettings.btnNameFlooring !== undefined ? appSettings.btnNameFlooring : "3. Flooring Details");
    safeSetVal('pt_custAcceptanceTitle', appSettings.custAcceptanceTitle !== undefined ? appSettings.custAcceptanceTitle : "CUSTOMER ACCEPTANCE"); safeSetVal('pt_custAcceptanceSub', appSettings.custAcceptanceSub !== undefined ? appSettings.custAcceptanceSub : "Authorized Signature & Stamp");
    safeSetVal('pt_signCompHeader', appSettings.signCompHeader !== undefined ? appSettings.signCompHeader : ""); safeSetVal('pt_pdfSignatoryText', appSettings.pdfSignatoryText !== undefined ? appSettings.pdfSignatoryText : "Authorized Signatory");
    switchPermanentTextTab('kg'); openModalWithHistory('permanentTextsModal');
}
function closePermanentTextsModal() { closeModalSafe('permanentTextsModal'); }

function renderSettingsPhonesUI() {
    const box = document.getElementById('settingsPhonesListContainer'); if (!box) return; box.innerHTML = "";
    (appSettings.phones || []).forEach((phone, idx) => {
        box.innerHTML += `<div class="phone-row-dynamic"><span class="phone-badge-prefix">📞 #${idx + 1}</span><input type="tel" value="${phone}" placeholder="Enter phone number..." oninput="updatePhoneSetting(${idx},this.value)"><button type="button" class="btn-del-pro btn-ripple" onclick="deletePhoneSetting(${idx})">🗑️</button></div>`;
    });
}
function addPhoneRowInSettings() { if (!appSettings.phones) appSettings.phones = []; appSettings.phones.push("+91 "); syncDataToCloud('patel_app_settings', appSettings); renderSettingsPhonesUI(); refreshLivePdfPreviewSheet(); }
function updatePhoneSetting(idx, val) { if (!appSettings.phones) appSettings.phones = []; appSettings.phones[idx] = val; syncDataToCloud('patel_app_settings', appSettings); refreshLivePdfPreviewSheet(); }
function deletePhoneSetting(idx) { if (!appSettings.phones) return; appSettings.phones.splice(idx, 1); syncDataToCloud('patel_app_settings', appSettings); renderSettingsPhonesUI(); refreshLivePdfPreviewSheet(); }
function saveCompanyEmailSetting(val) { appSettings.companyEmail = val.trim(); syncDataToCloud('patel_app_settings', appSettings); refreshLivePdfPreviewSheet(); }
function saveFooterWebSetting(val) { appSettings.footerWeb = val.trim(); syncDataToCloud('patel_app_settings', appSettings); refreshLivePdfPreviewSheet(); }
function loadPhoneSettingsUI() { renderSettingsPhonesUI(); safeSetVal('setCompanyEmail', appSettings.companyEmail || ""); safeSetVal('setFooterWeb', appSettings.footerWeb || ""); safeSetVal('setStartingQuoteNo', getNextQuoteSequenceNumber()); }
let currentSettingKey = '';
function openLargeInput(key, title) { currentSettingKey = key; safeSetText('largeInputTitle', title); safeSetVal('largeInputTextarea', appSettings[key] !== undefined ? appSettings[key] : ""); openModalWithHistory('largeInputModal'); }
function closeLargeInput() { closeModalSafe('largeInputModal'); calcModuleTotals(); refreshLivePdfPreviewSheet(); }
function autoSaveLargeInputLive() { appSettings[currentSettingKey] = document.getElementById('largeInputTextarea')?.value || ""; syncDataToCloud('patel_app_settings', appSettings); loadPhoneSettingsUI(); renderHomeScreen(); refreshLivePdfPreviewSheet(); }

function compressAndOptimizeBanner(file, maxWidth = 2000, quality = 0.95, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas'); let width = img.width, height = img.height;
            if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
            canvas.width = width; canvas.height = height; const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(img, 0, 0, width, height);
            callback(canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
function handleLogoUpload(input) {
    if (input.files && input.files[0]) {
        compressAndOptimizeBanner(input.files[0], 2000, 0.95, function(optimizedBase64) {
            appSettings.logoData = optimizedBase64; syncDataToCloud('patel_app_settings', appSettings); updateHeaderBannersUI(); refreshLivePdfPreviewSheet();
            const fav = document.getElementById('dynamicAppFavicon'), appleFav = document.getElementById('dynamicAppleIcon');
            if (fav) fav.href = optimizedBase64; if (appleFav) appleFav.href = optimizedBase64;
            showCorporateToast("Header Banner Updated!", "🖼️"); input.value = '';
        });
    }
}

// 25. DIGITAL SIGNATURE & WINDOW ONLOAD
let canvas, ctx, isDrawing = false, sigEventsAttached = false;
function openSignatureModal() {
    openModalWithHistory('sigModal');
    canvas = document.getElementById('sigPad'); ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.strokeStyle = '#000';
    if (!sigEventsAttached) {
        canvas.addEventListener('touchstart', (e) => { isDrawing = true; ctx.beginPath(); const t = e.touches[0], r = canvas.getBoundingClientRect(); ctx.moveTo(t.clientX - r.left, t.clientY - r.top); e.preventDefault(); }, {passive:false});
        canvas.addEventListener('touchmove', (e) => { if (!isDrawing) return; const t = e.touches[0], r = canvas.getBoundingClientRect(); ctx.lineTo(t.clientX - r.left, t.clientY - r.top); ctx.stroke(); e.preventDefault(); }, {passive:false});
        canvas.addEventListener('touchend', () => isDrawing = false);
        canvas.addEventListener('mousedown', (e) => { isDrawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); });
        canvas.addEventListener('mousemove', (e) => { if (isDrawing) { ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); } });
        canvas.addEventListener('mouseup', () => isDrawing = false);
        sigEventsAttached = true;
    }
}
function clearSignature() { if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height); }
function closeSigModal() { closeModalSafe('sigModal'); }
function saveSignature() { appSettings.signatureData = canvas.toDataURL(); syncDataToCloud('patel_app_settings', appSettings); closeSigModal(); refreshLivePdfPreviewSheet(); showCorporateToast("Digital Signature Saved Successfully!", "✍️"); }

window.onload = function() {
    checkFirstTimeAuthentication(); initCloudFirstMasterSync(); renderHomeScreen(); loadPhoneSettingsUI();
    applyScaleToSheet(); autoDetectDeviceMode(); updateHeaderBannersUI();
    if (appSettings.logoData) { const fav = document.getElementById('dynamicAppFavicon'), appleFav = document.getElementById('dynamicAppleIcon'); if (fav) fav.href = appSettings.logoData; if (appleFav) appleFav.href = appSettings.logoData; }
    initSamsungBootAnimation(); setTimeout(attachDynamicPreviewObserver, 200);
};
