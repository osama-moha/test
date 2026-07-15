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

let drawerLastFocus = null;

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

  document.querySelectorAll('#conversational-drawer-form .form-step').forEach((step, idx) => {
    if (idx === 0) step.classList.add('active');
    else step.classList.remove('active');
  });

  const progressBar = document.getElementById('drawerProgressBar');
  if (progressBar) progressBar.style.width = '20%';

  document.querySelectorAll('#conversational-drawer-form .option-button').forEach(btn => btn.classList.remove('selected'));
  
  if(document.getElementById('drawer-input-property_type')) document.getElementById('drawer-input-property_type').value = '';
  if(document.getElementById('drawer-input-security_concern')) document.getElementById('drawer-input-security_concern').value = '';
  if(document.getElementById('drawer-input-detection_speed')) document.getElementById('drawer-input-detection_speed').value = '';
  if(document.getElementById('drawer-input-desired_outcome')) document.getElementById('drawer-input-desired_outcome').value = '';

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
  progressBarId: 'drawerProgressBar',
  totalSteps: 5
};

const CONTACT_FORM_CONFIG = {
  formSelector: '#contact-step-form',
  inputPrefix: 'contact-input-',
  nameFieldId: 'contact-page-name',
  phoneFieldId: 'contact-page-phone',
  progressBarId: 'contactProgressBar',
  totalSteps: 5
};

function goToFormStep(stepNum, config) {
  if (stepNum < 1 || stepNum > config.totalSteps) return;

  document.querySelectorAll(config.formSelector + ' .form-step').forEach((step) => {
    const stepAttr = parseInt(step.dataset.step, 10);
    step.classList.toggle('active', stepAttr === stepNum);
  });

  const progressBar = document.getElementById(config.progressBarId);
  if (progressBar) {
    progressBar.style.width = (stepNum / config.totalSteps * 100) + '%';
  }
}

function handleUnifiedStepSelection(element, fieldId, value, currentStep, config) {
  const parent = element.parentElement;
  parent.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('selected'));
  element.classList.add('selected');

  const targetedInput = document.getElementById(config.inputPrefix + fieldId);
  if (targetedInput) targetedInput.value = value;

  if (fieldId === 'property_type' && element.dataset.track) {
    applyLeadTrackFilter(config.formSelector, element.dataset.track);
  }

  setTimeout(() => {
    goToFormStep(currentStep + 1, config);
  }, 220);
}

async function handleUnifiedSubmit(event, config) {
  event.preventDefault();
  const form = event.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing Setup Brief...";
  }

  const name = document.getElementById(config.nameFieldId).value;
  const phone = document.getElementById(config.phoneFieldId).value;
  const propType = document.getElementById(config.inputPrefix + 'property_type').value;
  const concern = document.getElementById(config.inputPrefix + 'security_concern').value;
  const speed = document.getElementById(config.inputPrefix + 'detection_speed').value;
  const outcome = document.getElementById(config.inputPrefix + 'desired_outcome').value;

  const whatsappMessage = `Hello Urban Eye, I would like to request a security assessment.\n\n` +
                          `*Name:* ${name}\n` +
                          `*WhatsApp:* ${phone}\n` +
                          `*Property Type:* ${propType}\n` +
                          `*Primary Concern:* ${concern}\n` +
                          `*Current Awareness:* ${speed}\n` +
                          `*Desired Outcome:* ${outcome}`;

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

function prevDrawerStep(currentStep) {
  goToFormStep(currentStep - 1, DRAWER_FORM_CONFIG);
}

function handleDrawerSubmit(event) {
  return handleUnifiedSubmit(event, DRAWER_FORM_CONFIG);
}

function handleContactStepSelection(element, fieldId, value, currentStep) {
  handleUnifiedStepSelection(element, fieldId, value, currentStep, CONTACT_FORM_CONFIG);
}

function handleContactPrevStep(currentStep) {
  goToFormStep(currentStep - 1, CONTACT_FORM_CONFIG);
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
window.handleDrawerSubmit = handleDrawerSubmit;
window.handleContactStepSelection = handleContactStepSelection;
window.handleContactPrevStep = handleContactPrevStep;
window.handleContactPageSubmit = handleContactPageSubmit;
window.goToFormStep = goToFormStep;
window.applyLeadTrackFilter = applyLeadTrackFilter;

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

  const servicePages = [
    "/manned-guarding/",
    "/ajax-smart-alarms/",
    "/cctv-installation/",
    "/access-control/",
    "/commercial-fire-alarm-systems/",
    "/electric-fencing/",
    "/professional-monitoring/"
  ];

  const servePages = [
    "/residential-security/",
    "/retail-storefronts/",
    "/warehouse-security/",
    "/airbnb-security/",
    "/office-security/",
    "/construction-site-security/"
  ];

  let activeSection = "";

  if(path === "/" || path === "/index.html"){
    activeSection = "home";
  }else if(servicePages.includes(path)){
    activeSection = "services";
  }else if(servePages.includes(path)){
    activeSection = "serve";
  }else if(path === "/programs/"){
    activeSection = "programs";
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

document.addEventListener("DOMContentLoaded", async ()=>{
  await loadNavbar();
  await loadFooter();
  initSmoothAnchors();
  initPageReveal();
  initScrollReveal();
  initHeroParallax();
  initPageProgress();
  preselectInterestFromUrl();
});