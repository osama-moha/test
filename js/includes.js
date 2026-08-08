async function loadNavbar(){
  const navbarTarget = document.getElementById("site-navbar");
  if(!navbarTarget) return;

  try{
    const response = await fetch("/includes/navbar.html");

    if(!response.ok){
      throw new Error("Navbar file could not be loaded.");
    }

    const html = await response.text();
    navbarTarget.innerHTML = html;

    initNavbar();
    setActiveNav();
  }catch(error){
    console.error(error);
  }
}

async function loadFooter(){
  const footerTarget = document.getElementById("site-footer");
  if(!footerTarget) return;

  try{
    const response = await fetch("/includes/footer.html");

    if(!response.ok){
      throw new Error("Footer file could not be loaded.");
    }

    const html = await response.text();
    footerTarget.innerHTML = html;
    initLeadDrawer();
  }catch(error){
    console.error(error);
  }
}

// Cookie consent notice. Google tags load with consent defaulted to
// "denied" on every page (see the gtag snippet in each page head).
// This banner records the visitor's choice and updates Consent Mode.
function initCookieNotice(){
  let stored = null;
  try{ stored = localStorage.getItem("uec_cookie_consent"); }catch(e){}
  if(stored === "granted" || stored === "denied") return;

  const notice = document.createElement("div");
  notice.className = "cookie-notice";
  notice.setAttribute("role", "region");
  notice.setAttribute("aria-label", "Cookie consent");
  notice.innerHTML =
    '<p class="cookie-notice-text">We use cookies for analytics and advertising measurement. ' +
    'See our <a href="/privacy-policy/">Privacy Policy</a> for details.</p>' +
    '<div class="cookie-notice-actions">' +
      '<button type="button" class="btn btn-primary cookie-notice-accept">Accept</button>' +
      '<button type="button" class="btn cookie-notice-decline">Decline</button>' +
    '</div>';

  function resolveConsent(choice){
    try{ localStorage.setItem("uec_cookie_consent", choice); }catch(e){}
    if(typeof gtag === "function"){
      const state = choice === "granted" ? "granted" : "denied";
      gtag("consent", "update", {
        ad_storage: state,
        ad_user_data: state,
        ad_personalization: state,
        analytics_storage: state
      });
    }
    notice.remove();
  }

  notice.querySelector(".cookie-notice-accept").addEventListener("click", ()=> resolveConsent("granted"));
  notice.querySelector(".cookie-notice-decline").addEventListener("click", ()=> resolveConsent("denied"));

  document.body.appendChild(notice);
}

let drawerLastFocus = null;
let currentDrawerCategory = 'FREE_REVIEW';

function getDrawerVariantCategory(serviceInterest, pageSource) {
  const service = (serviceInterest || "").toLowerCase();
  const source = (pageSource || "").toLowerCase();

  if (service.includes("corporate risk audit") || source.includes("corporate-risk-audit") || source === "construction-site-security" || source === "warehouse-security" || source === "retail-storefronts" || source === "office-security") {
    return "CORPORATE_AUDIT";
  }
  
  if (service.includes("cctv") || service.includes("smart alarm") || service.includes("access control") || service.includes("electric fencing") || service.includes("fire") || service.includes("equipment purchase")) {
    return "EQUIPMENT";
  }

  if (service.includes("manned guarding") || service.includes("professional monitoring") || service.includes("residential") || service.includes("airbnb") || service.includes("storefront guardian") || service.includes("office shield") || service.includes("site lease")) {
    return "OPERATIONS";
  }

  return "FREE_REVIEW";
}

function openServiceDrawer(pageSource, serviceInterest, title, intro){
  const backdrop = document.getElementById("drawerBackdrop");
  const drawer = document.getElementById("drawer");
  const pageSourceField = document.getElementById("drawerPageSource");
  const serviceInterestField = document.getElementById("drawerServiceInterest");
  const titleElement = document.getElementById("drawerTitle");
  const introElement = document.getElementById("drawerIntro");

  if(!backdrop || !drawer || !pageSourceField || !serviceInterestField || !titleElement || !introElement){
    return true;
  }

  if(window.event && typeof window.event.preventDefault === "function"){
    window.event.preventDefault();
  }

  drawerLastFocus = document.activeElement;

  pageSourceField.value = pageSource || "";
  serviceInterestField.value = serviceInterest || "";
  titleElement.textContent = title || "Request a Security Recommendation";
  introElement.textContent = intro || "Answer three quick questions to isolate your real layout vulnerabilities.";

  currentDrawerCategory = getDrawerVariantCategory(serviceInterest, pageSource);

  // Configure drawer fields by variant category
  const eqExtras = document.getElementById("drawer-equipment-extras");
  const opExtras = document.getElementById("drawer-operations-extras");
  const corpExtras = document.getElementById("drawer-corporate-extras");
  const companyGroup = document.getElementById("drawer-company-group");

  if (eqExtras) eqExtras.style.display = (currentDrawerCategory === "EQUIPMENT") ? "block" : "none";
  if (opExtras) opExtras.style.display = (currentDrawerCategory === "OPERATIONS") ? "block" : "none";
  if (corpExtras) corpExtras.style.display = (currentDrawerCategory === "CORPORATE_AUDIT") ? "block" : "none";
  if (companyGroup) companyGroup.style.display = (currentDrawerCategory === "CORPORATE_AUDIT") ? "block" : "none";

  // Filter property tiles for Corporate Audit
  document.querySelectorAll('#conversational-drawer-form label[data-tile-category]').forEach(label => {
    if (currentDrawerCategory === "CORPORATE_AUDIT") {
      label.style.display = (label.dataset.tileCategory === "commercial") ? "flex" : "none";
    } else {
      label.style.display = "flex";
    }
  });

  // Filter concern tiles for Corporate Audit
  document.querySelectorAll('#conversational-drawer-form label[data-concern-scope]').forEach(label => {
    if (currentDrawerCategory === "CORPORATE_AUDIT") {
      label.style.display = (label.dataset.concernScope === "residential") ? "none" : "flex";
    } else {
      label.style.display = "flex";
    }
  });

  // Reset form inputs
  document.querySelectorAll('#conversational-drawer-form input[type="radio"]').forEach(radio => radio.checked = false);
  if(document.getElementById('drawer-input-property_type')) document.getElementById('drawer-input-property_type').value = '';
  if(document.getElementById('drawer-location')) document.getElementById('drawer-location').value = '';
  if(document.getElementById('drawer-input-security_concern')) document.getElementById('drawer-input-security_concern').value = '';
  if(document.getElementById('drawer-installation-status')) document.getElementById('drawer-installation-status').value = '';
  if(document.getElementById('drawer-operations-timeframe')) document.getElementById('drawer-operations-timeframe').value = '';
  if(document.getElementById('drawer-site-scale')) document.getElementById('drawer-site-scale').value = '';
  if(document.getElementById('drawer-corporate-timeframe')) document.getElementById('drawer-corporate-timeframe').value = '';
  if(document.getElementById('drawer-company')) document.getElementById('drawer-company').value = '';

  document.querySelectorAll('#conversational-drawer-form .form-step').forEach((step, idx) => {
    if (idx === 0) step.classList.add('active');
    else step.classList.remove('active');
  });

  updateStepIndicator('drawer', 1);

  const step1Next = document.getElementById('drawerStep1Next');
  const step2Next = document.getElementById('drawerStep2Next');
  const submitBtn = document.getElementById('drawerSubmitBtn');

  if (step1Next) step1Next.disabled = true;
  if (step2Next) step2Next.disabled = true;
  if (submitBtn) submitBtn.disabled = true;

  backdrop.classList.add("open");
  drawer.classList.add("open");
  document.body.classList.add("drawer-open");

  return false;
}

function closeFormDrawer(){
  const backdrop = document.getElementById("drawerBackdrop");
  const drawer = document.getElementById("drawer");

  if(backdrop) backdrop.classList.remove("open");
  if(drawer) drawer.classList.remove("open");
  document.body.classList.remove("drawer-open");

  if(drawerLastFocus && typeof drawerLastFocus.focus === "function"){
    drawerLastFocus.focus();
  }

  return false;
}

function applyLeadTrackFilter(formSelector, track) {
  document.querySelectorAll(formSelector + ' .option-button[data-track]').forEach((btn) => {
    const btnTrack = btn.dataset.track;
    btn.style.display = (btnTrack === track || btnTrack === 'both') ? '' : 'none';
  });
}

// Shared conversational-form logic used by both the site-wide drawer
// and the standalone /contact/ page. Each surface keeps its own
// presentation (slide-out panel vs full page), but the step
// navigation, track filtering, and submission behavior are now
// defined once here instead of duplicated in each place.
const DRAWER_FORM_CONFIG = {
  formSelector: '#conversational-drawer-form',
  inputPrefix: 'drawer-input-',
  nameFieldId: 'drawer-name',
  phoneFieldId: 'drawer-phone',
  surfacePrefix: 'drawer',
  totalSteps: 3
};

const CONTACT_FORM_CONFIG = {
  formSelector: '#contact-step-form',
  inputPrefix: 'contact-input-',
  nameFieldId: 'contact-page-name',
  phoneFieldId: 'contact-page-phone',
  surfacePrefix: 'contact',
  totalSteps: 3
};

const STEP_TITLES = {
  1: '01 Site Details',
  2: '02 Requirements',
  3: '03 Contact'
};

function updateStepIndicator(surfacePrefix, stepNum) {
  const countEl = document.getElementById(surfacePrefix + 'StepCount');
  const titleEl = document.getElementById(surfacePrefix + 'StepTitle');

  if (countEl) countEl.textContent = `STEP ${stepNum} / 3`;
  if (titleEl) titleEl.textContent = STEP_TITLES[stepNum] || '';

  const seg1 = document.getElementById(surfacePrefix + 'Seg1');
  const seg2 = document.getElementById(surfacePrefix + 'Seg2');
  const seg3 = document.getElementById(surfacePrefix + 'Seg3');

  if (seg1 && seg2 && seg3) {
    seg1.className = 'step-segment' + (stepNum >= 1 ? ' active' : '');
    seg2.className = 'step-segment' + (stepNum >= 2 ? ' active' : '');
    seg3.className = 'step-segment' + (stepNum >= 3 ? ' active' : '');
  }
}

function goToFormStep(stepNum, config) {
  if (stepNum < 1 || stepNum > config.totalSteps) return;

  document.querySelectorAll(config.formSelector + ' .form-step').forEach((step) => {
    const stepAttr = parseInt(step.dataset.step, 10);
    step.classList.toggle('active', stepAttr === stepNum);
  });

  updateStepIndicator(config.surfacePrefix, stepNum);
}

function handleTileRadioChange(radioEl, surface, stepNum) {
  const inputId = surface + '-input-' + (stepNum === 1 ? 'property_type' : 'security_concern');
  const targetedInput = document.getElementById(inputId);
  if (targetedInput) targetedInput.value = radioEl.value;

  if (stepNum === 1) {
    if (surface === 'drawer') validateDrawerStep1();
    else validateContactStep1();
  } else if (stepNum === 2) {
    if (surface === 'drawer') validateDrawerStep2();
    else validateContactStep2();
  }
}

function validateDrawerStep1() {
  const propType = document.getElementById('drawer-input-property_type').value;
  const location = document.getElementById('drawer-location').value.trim();
  const step1Next = document.getElementById('drawerStep1Next');
  if (step1Next) {
    step1Next.disabled = !(propType.length > 0 && location.length >= 2);
  }
}

function validateContactStep1() {
  const propType = document.getElementById('contact-input-property_type').value;
  const location = document.getElementById('contact-location') ? document.getElementById('contact-location').value.trim() : 'N/A';
  const step1Next = document.getElementById('contactStep1Next');
  if (step1Next) {
    step1Next.disabled = !(propType.length > 0);
  }
}

function validateDrawerStep2() {
  const concern = document.getElementById('drawer-input-security_concern').value;
  const step2Next = document.getElementById('drawerStep2Next');
  if (!step2Next) return;

  let isValid = concern.length > 0;

  if (currentDrawerCategory === 'EQUIPMENT') {
    const status = document.getElementById('drawer-installation-status').value;
    isValid = isValid && (status !== '');
  } else if (currentDrawerCategory === 'OPERATIONS') {
    const timeframe = document.getElementById('drawer-operations-timeframe').value;
    isValid = isValid && (timeframe !== '');
  } else if (currentDrawerCategory === 'CORPORATE_AUDIT') {
    const scale = document.getElementById('drawer-site-scale').value;
    const timeframe = document.getElementById('drawer-corporate-timeframe').value;
    isValid = isValid && (scale !== '') && (timeframe !== '');
  }

  step2Next.disabled = !isValid;
}

function validateContactStep2() {
  const concern = document.getElementById('contact-input-security_concern').value;
  const step2Next = document.getElementById('contactStep2Next');
  if (step2Next) {
    step2Next.disabled = !(concern.length > 0);
  }
}

function validateDrawerStep3() {
  const nameVal = document.getElementById('drawer-name').value.trim();
  const phoneVal = document.getElementById('drawer-phone').value.trim();
  const submitBtn = document.getElementById('drawerSubmitBtn');
  const nameErr = document.getElementById('drawer-name-error');
  const phoneErr = document.getElementById('drawer-phone-error');
  const companyErr = document.getElementById('drawer-company-error');

  const isValidName = nameVal.length >= 2;
  const isValidPhone = phoneVal.length >= 8;
  let isValidCompany = true;

  if (currentDrawerCategory === 'CORPORATE_AUDIT') {
    const companyVal = document.getElementById('drawer-company').value.trim();
    isValidCompany = companyVal.length >= 2;
    if (companyErr) companyErr.style.display = (companyVal.length > 0 && !isValidCompany) ? 'block' : 'none';
  }

  if (nameErr) nameErr.style.display = (nameVal.length > 0 && !isValidName) ? 'block' : 'none';
  if (phoneErr) phoneErr.style.display = (phoneVal.length > 0 && !isValidPhone) ? 'block' : 'none';

  if (submitBtn) {
    submitBtn.disabled = !(isValidName && isValidPhone && isValidCompany);
  }
}

function validateContactStep3() {
  const nameVal = document.getElementById('contact-page-name').value.trim();
  const phoneVal = document.getElementById('contact-page-phone').value.trim();
  const submitBtn = document.getElementById('contactSubmitBtn');
  const nameErr = document.getElementById('contact-name-error');
  const phoneErr = document.getElementById('contact-phone-error');

  const isValidName = nameVal.length >= 2;
  const isValidPhone = phoneVal.length >= 8;

  if (nameErr) nameErr.style.display = (nameVal.length > 0 && !isValidName) ? 'block' : 'none';
  if (phoneErr) phoneErr.style.display = (phoneVal.length > 0 && !isValidPhone) ? 'block' : 'none';

  if (submitBtn) {
    submitBtn.disabled = !(isValidName && isValidPhone);
  }
}

function nextDrawerStep(fromStep) {
  if (fromStep === 1) {
    const propVal = document.getElementById('drawer-input-property_type').value;
    const locVal = document.getElementById('drawer-location').value.trim();
    if (!propVal || locVal.length < 2) return;
  } else if (fromStep === 2) {
    const concernVal = document.getElementById('drawer-input-security_concern').value;
    if (!concernVal) return;
  }
  goToFormStep(fromStep + 1, DRAWER_FORM_CONFIG);
}

function prevDrawerStep(fromStep) {
  goToFormStep(fromStep - 1, DRAWER_FORM_CONFIG);
}

function nextContactStep(fromStep) {
  if (fromStep === 1) {
    const val = document.getElementById('contact-input-property_type').value;
    if (!val) return;
  } else if (fromStep === 2) {
    const val = document.getElementById('contact-input-security_concern').value;
    if (!val) return;
  }
  goToFormStep(fromStep + 1, CONTACT_FORM_CONFIG);
}

function handleContactPrevStep(fromStep) {
  goToFormStep(fromStep - 1, CONTACT_FORM_CONFIG);
}

async function handleUnifiedSubmit(event, config) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending your request...";
  }

  const name = document.getElementById(config.nameFieldId) ? document.getElementById(config.nameFieldId).value : "";
  const phone = document.getElementById(config.phoneFieldId) ? document.getElementById(config.phoneFieldId).value : "";
  const propType = document.getElementById(config.inputPrefix + 'property_type') ? document.getElementById(config.inputPrefix + 'property_type').value : "";
  const location = document.getElementById(config.surfacePrefix + '-location') ? document.getElementById(config.surfacePrefix + '-location').value : "";
  const concern = document.getElementById(config.inputPrefix + 'security_concern') ? document.getElementById(config.inputPrefix + 'security_concern').value : "";
  const serviceInterest = document.getElementById(config.surfacePrefix + 'ServiceInterest') ? document.getElementById(config.surfacePrefix + 'ServiceInterest').value : "";

  let companyName = "";
  const companyEl = document.getElementById(config.surfacePrefix + '-company');
  if (companyEl && companyEl.value) companyName = companyEl.value;

  let whatsappMessage = `Hello Urban Eye, I would like to request a security review.\n\n` +
                        `*Service:* ${serviceInterest || "Security Assessment"}\n` +
                        `*Name:* ${name}\n`;
  if (companyName) whatsappMessage += `*Company:* ${companyName}\n`;
  whatsappMessage += `*WhatsApp:* ${phone}\n` +
                     `*Property Type:* ${propType}\n` +
                     `*Location:* ${location}\n` +
                     `*Primary Concern:* ${concern}`;

  const eqStatusEl = document.getElementById(config.surfacePrefix + '-installation-status');
  if (eqStatusEl && eqStatusEl.value) whatsappMessage += `\n*System Status:* ${eqStatusEl.value}`;

  const scaleEl = document.getElementById(config.surfacePrefix + '-site-scale');
  if (scaleEl && scaleEl.value) whatsappMessage += `\n*Site Scale:* ${scaleEl.value}`;

  const opTimeframeEl = document.getElementById(config.surfacePrefix + '-operations-timeframe');
  if (opTimeframeEl && opTimeframeEl.value) whatsappMessage += `\n*Timeframe:* ${opTimeframeEl.value}`;

  const corpTimeframeEl = document.getElementById(config.surfacePrefix + '-corporate-timeframe');
  if (corpTimeframeEl && corpTimeframeEl.value) whatsappMessage += `\n*Timeframe:* ${corpTimeframeEl.value}`;

  const encodedMessage = encodeURIComponent(whatsappMessage);
  const whatsappUrl = `https://wa.me/254768055555?text=${encodedMessage}`;

  try {
    await fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });
  } catch(err) {
    console.error("Formspree connection backup logged:", err);
  }

  window.location.href = whatsappUrl;
  return false;
}

function handleStepSelection(element, fieldId, value, currentStep) {
  handleUnifiedStepSelection(element, fieldId, value, currentStep, DRAWER_FORM_CONFIG);
}

function handleDrawerSubmit(event) {
  return handleUnifiedSubmit(event, DRAWER_FORM_CONFIG);
}

function handleContactStepSelection(element, fieldId, value, currentStep) {
  handleUnifiedStepSelection(element, fieldId, value, currentStep, CONTACT_FORM_CONFIG);
}

function handleContactPageSubmit(event) {
  return handleUnifiedSubmit(event, CONTACT_FORM_CONFIG);
}

function initLeadDrawer(){
  const drawer = document.getElementById("drawer");
  if(!drawer) return;

  document.addEventListener("keydown",(event)=>{
    if(event.key === "Escape") closeFormDrawer();
  });
}

window.openServiceDrawer = openServiceDrawer;
window.closeFormDrawer = closeFormDrawer;
window.handleStepSelection = handleStepSelection;
window.prevDrawerStep = prevDrawerStep;
window.nextDrawerStep = nextDrawerStep;
window.nextContactStep = nextContactStep;
window.handleDrawerSubmit = handleDrawerSubmit;
window.handleContactStepSelection = handleContactStepSelection;
window.handleContactPrevStep = handleContactPrevStep;
window.handleContactPageSubmit = handleContactPageSubmit;
window.goToFormStep = goToFormStep;
window.applyLeadTrackFilter = applyLeadTrackFilter;
window.handleTileRadioChange = handleTileRadioChange;
window.validateDrawerStep3 = validateDrawerStep3;
window.validateContactStep3 = validateContactStep3;

function initNavbar(){
  const navMenu = document.getElementById("nav-menu");
  const navToggle = document.getElementById("nav-toggle");
  const navClose = document.getElementById("nav-close");

  function openMenu(){
    if(!navMenu) return;
    navMenu.classList.add("show-menu");
    document.body.classList.add("menu-open");
  }

  function closeMenu(){
    if(!navMenu) return;
    navMenu.classList.remove("show-menu");
    document.body.classList.remove("menu-open");
  }

  if(navToggle) navToggle.addEventListener("click", openMenu);
  if(navClose) navClose.addEventListener("click", closeMenu);

  document.querySelectorAll(
    ".nav-link, .nav-dropdown-menu a, .mobile-nav-link, .mobile-subnav a, .mobile-menu-actions a, .mobile-contact-icons a"
  ).forEach((link)=>{
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown",(event)=>{
    if(event.key === "Escape") closeMenu();
  });
}

function setActiveNav(){
  const path = window.location.pathname;
  let activeSection = "";

  if(path === "/" || path === "/index.html"){
    activeSection = "home";
  }else if(path === "/programs/"){
    activeSection = "programs";
  }else if(path.startsWith("/insights/")){
    activeSection = "insights";
  }else if(path === "/about/"){
    activeSection = "about";
  }else if(path === "/careers/"){
    activeSection = "careers";
  }else if(path === "/contact/"){
    activeSection = "contact";
  }

  if(!activeSection) return;

  const activeLink = document.querySelector(`[data-nav-section="${activeSection}"]`);
  if(activeLink) activeLink.classList.add("is-active");
}

function initHeaderScroll(){
  const header = document.querySelector(".topbar");
  if(!header) return;

  function onScroll(){
    if(window.scrollY > 40){
      header.classList.add("is-scrolled");
    }else{
      header.classList.remove("is-scrolled");
    }
  }

  onScroll();
  window.addEventListener("scroll", onScroll, {passive:true});
}

function initSmoothAnchors(){
  document.querySelectorAll('a[href^="#"]').forEach((anchor)=>{
    anchor.addEventListener("click", function(event){
      const target = document.querySelector(this.getAttribute("href"));
      if(!target) return;

      event.preventDefault();
      target.scrollIntoView({behavior:"smooth", block:"start"});
    });
  });
}

function initScrollReveal(){
  const revealItems = document.querySelectorAll(
    ".reveal-fade, .reveal-up, .reveal-slide, .reveal-stagger"
  );

  if(!revealItems.length) return;

  if(!("IntersectionObserver" in window)){
    revealItems.forEach((item)=>item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },{
    threshold:0.15,
    rootMargin:"0px 0px -40px 0px"
  });

  revealItems.forEach((item)=>observer.observe(item));
}

function initPageReveal(){
  const targets = document.querySelectorAll(".card, .process-step, .cta-band, .service-row, #industries .card");

  if(!targets.length) return;

  if(!("IntersectionObserver" in window)){
    targets.forEach((item)=>item.classList.add("is-visible"));
    return;
  }

  targets.forEach((item, index)=>{
    if(item.closest(".service-row")){
      item.classList.add("reveal-slide");
    }else{
      item.classList.add("reveal-fade");
    }

    if(item.closest("#industries")){
      item.style.transitionDelay = `${Math.min(index * 100, 500)}ms`;
    }
  });
}

function initHeroParallax(){
  const heroImage = document.querySelector(".hero-photo img");
  if(!heroImage || window.matchMedia("(max-width: 767px)").matches) return;

  let ticking = false;

  function update(){
    const offset = window.scrollY * 0.4;
    heroImage.style.transform = `translate3d(0, ${offset}px, 0) scale(1.04)`;
    ticking = false;
  }

  window.addEventListener("scroll", ()=>{
    if(!ticking){
      window.requestAnimationFrame(update);
      ticking = true;
    }
  }, {passive:true});
}

function initPageProgress(){
  const bar = document.querySelector(".page-progress-bar");
  if(!bar) return;

  function update(){
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
    bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }

  update();
  window.addEventListener("scroll", update, {passive:true});
  window.addEventListener("resize", update);
}

function preselectInterestFromUrl(){
  const params = new URLSearchParams(window.location.search);
  const value = params.get("service") || params.get("package");

  if(!value) return;

  const select = document.getElementById("service-interest");
  if(!select) return;

  const normalized = value.toLowerCase().trim();

  const optionExists = Array.from(select.options).some((option)=>{
    return option.value === normalized;
  });

  if(optionExists){
    select.value = normalized;
  }
}

function initControlLines(){
  const overlays = document.querySelectorAll("[data-control-line]");
  if(!overlays.length) return;

  if("IntersectionObserver" in window){
    const observer = new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>{
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: 0.2});

    overlays.forEach((overlay)=> observer.observe(overlay));
  }else{
    overlays.forEach((overlay)=> overlay.classList.add("is-visible"));
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  await loadNavbar();
  await loadFooter();
  initHeaderScroll();
  initSmoothAnchors();
  initPageReveal();
  initScrollReveal();
  initHeroParallax();
  initPageProgress();
  initControlLines();
  preselectInterestFromUrl();
  initCookieNotice();
});