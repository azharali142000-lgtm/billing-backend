const state = {
  token: localStorage.getItem("billr_token") || "",
  user: JSON.parse(localStorage.getItem("billr_user") || "null"),
  theme: localStorage.getItem("billr_theme") || "dark",
  companyProfile: null,
  gstSettings: null,
  workers: [],
  customers: [],
  products: [],
  invoices: [],
  salesInvoices: [],
  payments: [],
  printer: {
    available: false,
    platform: "web",
    connected: false,
    savedPrinter: null,
    pairedDevices: []
  },
  activeScreen: "sales",
  invoiceStatusFilter: "ALL",
  salesDateFilter: "TODAY",
  salesDateLabel: "Today",
  salesCustomStart: "",
  salesCustomEnd: "",
  ledgerTab: "customers",
  customerLedger: {
    customerId: null,
    customer: null,
    invoices: [],
    filter: "TODAY",
    filterLabel: "Today",
    customStart: "",
    customEnd: ""
  },
  productSearch: "",
  productSort: "stock",
  onlyNegativeStock: false,
  selectedInvoiceId: null
};

const authView = document.getElementById("authView");
const appView = document.getElementById("appView");
const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");
const identifierInput = document.getElementById("identifier");
const passwordInput = document.getElementById("password");
const currentUserEl = document.getElementById("currentUser");
const workerQuickActions = document.getElementById("workerQuickActions");
const workerThemeDarkBtn = document.getElementById("workerThemeDarkBtn");
const workerThemeLightBtn = document.getElementById("workerThemeLightBtn");
const workerChangePasswordBtn = document.getElementById("workerChangePasswordBtn");
const workerLogoutBtn = document.getElementById("workerLogoutBtn");
const globalMessage = document.getElementById("globalMessage");
const screenTitle = document.getElementById("screenTitle");
const salesDateFilter = document.getElementById("salesDateFilter");
const salesCustomDateRange = document.getElementById("salesCustomDateRange");
const salesStartDate = document.getElementById("salesStartDate");
const salesEndDate = document.getElementById("salesEndDate");
const settingsMenuBtn = document.getElementById("settingsMenuBtn");
const settingsMenu = document.getElementById("settingsMenu");
const settingsSyncBtn = document.getElementById("settingsSyncBtn");
const settingsRefreshBtn = document.getElementById("settingsRefreshBtn");
const settingsOpenPanelBtn = document.getElementById("settingsOpenPanelBtn");
const settingsChangePasswordBtn = document.getElementById("settingsChangePasswordBtn");
const settingsUserManagementBtn = document.getElementById("settingsUserManagementBtn");
const settingsAddWorkerBtn = document.getElementById("settingsAddWorkerBtn");
const settingsResetWorkerBtn = document.getElementById("settingsResetWorkerBtn");
const themeDarkBtn = document.getElementById("themeDarkBtn");
const themeLightBtn = document.getElementById("themeLightBtn");
const themePanelDarkBtn = document.getElementById("themePanelDarkBtn");
const themePanelLightBtn = document.getElementById("themePanelLightBtn");
const companyProfileSection = document.getElementById("companyProfileSection");
const companyNameInput = document.getElementById("companyNameInput");
const companyLogoInput = document.getElementById("companyLogoInput");
const companyLogoPreview = document.getElementById("companyLogoPreview");
const companyAddressInput = document.getElementById("companyAddressInput");
const companyPhoneInput = document.getElementById("companyPhoneInput");
const companyEmailInput = document.getElementById("companyEmailInput");
const companyGstNumberInput = document.getElementById("companyGstNumberInput");
const companyBankDetailsInput = document.getElementById("companyBankDetailsInput");
const companyTermsInput = document.getElementById("companyTermsInput");
const saveCompanyProfileBtn = document.getElementById("saveCompanyProfileBtn");
const printerSettingsSection = document.getElementById("printerSettingsSection");
const printerStatusText = document.getElementById("printerStatusText");
const printerSavedText = document.getElementById("printerSavedText");
const printerScanBtn = document.getElementById("printerScanBtn");
const printerReconnectBtn = document.getElementById("printerReconnectBtn");
const printerClearBtn = document.getElementById("printerClearBtn");
const printerDeviceList = document.getElementById("printerDeviceList");
const gstSettingsSection = document.getElementById("gstSettingsSection");
const gstEnabledToggle = document.getElementById("gstEnabledToggle");
const gstModeSelect = document.getElementById("gstModeSelect");
const defaultGstRateInput = document.getElementById("defaultGstRateInput");
const gstNumberInput = document.getElementById("gstNumberInput");
const gstTypeSelect = document.getElementById("gstTypeSelect");
const gstCustomerChecklist = document.getElementById("gstCustomerChecklist");
const saveGstSettingsBtn = document.getElementById("saveGstSettingsBtn");
const primaryFab = document.getElementById("primaryFab");
const secondaryFab = document.getElementById("secondaryFab");
const entryModal = document.getElementById("entryModal");
const modalLabel = document.getElementById("modalLabel");
const modalTitle = document.getElementById("modalTitle");
const modalFields = document.getElementById("modalFields");
const modalSubmitBtn = document.getElementById("modalSubmitBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const productSearchInput = document.getElementById("productSearch");
const productSortBtn = document.getElementById("productSortBtn");
const productFilterBtn = document.getElementById("productFilterBtn");
const customersShortcutBtn = document.getElementById("customersShortcutBtn");
const productsShortcutBtn = document.getElementById("productsShortcutBtn");
const editInvoiceBtn = document.getElementById("editInvoiceBtn");
const invoiceDrawer = document.getElementById("invoiceDrawer");
const closeInvoiceDrawerBtn = document.getElementById("closeInvoiceDrawerBtn");
const invoiceDraftNumberEl = document.getElementById("invoiceDraftNumber");
const invoiceDraftDateEl = document.getElementById("invoiceDraftDate");
const selectCustomerBtn = document.getElementById("selectCustomerBtn");
const editSelectedCustomerBtn = document.getElementById("editSelectedCustomerBtn");
const invoiceDraftItemsEl = document.getElementById("invoiceDraftItems");
const openProductSheetBtn = document.getElementById("openProductSheetBtn");
const invoiceSubtotalEl = document.getElementById("invoiceSubtotal");
const invoiceTotalEl = document.getElementById("invoiceTotal");
const invoiceSubmitMessage = document.getElementById("invoiceSubmitMessage");
const invoiceGstSummary = document.getElementById("invoiceGstSummary");
const invoiceGstRateWrap = document.getElementById("invoiceGstRateWrap");
const invoiceGstRateInput = document.getElementById("invoiceGstRateInput");
const roundOffToggle = document.getElementById("roundOffToggle");
const createInvoiceBtn = document.getElementById("createInvoiceBtn");
const customerSheet = document.getElementById("customerSheet");
const closeCustomerSheetBtn = document.getElementById("closeCustomerSheetBtn");
const customerSearchInput = document.getElementById("customerSearchInput");
const addCustomerFromSheetBtn = document.getElementById("addCustomerFromSheetBtn");
const customerSheetList = document.getElementById("customerSheetList");
const customerLedgerSheet = document.getElementById("customerLedgerSheet");
const closeCustomerLedgerSheetBtn = document.getElementById("closeCustomerLedgerSheetBtn");
const customerLedgerName = document.getElementById("customerLedgerName");
const customerLedgerFilter = document.getElementById("customerLedgerFilter");
const customerLedgerCustomDateRange = document.getElementById("customerLedgerCustomDateRange");
const customerLedgerStartDate = document.getElementById("customerLedgerStartDate");
const customerLedgerEndDate = document.getElementById("customerLedgerEndDate");
const customerLedgerCollect = document.getElementById("customerLedgerCollect");
const customerLedgerPay = document.getElementById("customerLedgerPay");
const customerLedgerInvoiceList = document.getElementById("customerLedgerInvoiceList");
const productSheet = document.getElementById("productSheet");
const closeProductSheetBtn = document.getElementById("closeProductSheetBtn");
const productSheetSearchInput = document.getElementById("productSheetSearchInput");
const addProductFromSheetBtn = document.getElementById("addProductFromSheetBtn");
const productSheetList = document.getElementById("productSheetList");
const productInsights = document.getElementById("productInsights");
const productSheetDoneBtn = document.getElementById("productSheetDoneBtn");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const settingsLogoutBtn = document.getElementById("settingsLogoutBtn");
const userManagementSection = document.getElementById("userManagementSection");
const addWorkerBtn = document.getElementById("addWorkerBtn");
const workerList = document.getElementById("workerList");
const invoiceActionButtons = () => [...document.querySelectorAll("[data-invoice-action]")];
const PRINTER_STORAGE_KEY = "billr_printer_device";

let modalSubmitHandler = null;
let syncInterval = null;
let pendingResetWorkerId = null;
let invoiceSubmitting = false;
let invoiceDraftBaseline = null;
let suppressHistoryPush = false;
let allowBrowserExit = false;
let pendingCompanyLogoDataUrl = "";
let invoiceDraft = {
  invoiceId: null,
  customerId: null,
  items: [],
  roundOff: false
};

function resetLoginFields() {
  if (identifierInput) {
    identifierInput.value = "";
  }
  if (passwordInput) {
    passwordInput.value = "";
  }
}

function showMessage(message, isError = false) {
  globalMessage.textContent = message;
  globalMessage.classList.remove("hidden", "error");
  if (isError) {
    globalMessage.classList.add("error");
  }
}

function showInvoiceSubmitMessage(message, isError = false) {
  if (!invoiceSubmitMessage) {
    return;
  }
  invoiceSubmitMessage.textContent = message;
  invoiceSubmitMessage.classList.remove("hidden", "error");
  if (isError) {
    invoiceSubmitMessage.classList.add("error");
  } else {
    invoiceSubmitMessage.classList.remove("error");
  }
}

function clearInvoiceSubmitMessage() {
  if (!invoiceSubmitMessage) {
    return;
  }
  invoiceSubmitMessage.textContent = "";
  invoiceSubmitMessage.classList.add("hidden");
  invoiceSubmitMessage.classList.remove("error");
}

function clearMessage() {
  globalMessage.classList.add("hidden");
  globalMessage.textContent = "";
  globalMessage.classList.remove("error");
}

function setCompanyLogoPreview(src = "") {
  if (!companyLogoPreview) {
    return;
  }
  const hasLogo = Boolean(src);
  companyLogoPreview.src = hasLogo ? src : "";
  companyLogoPreview.classList.toggle("hidden", !hasLogo);
}

function resizeImageToJpegDataUrl(file, maxSide = 360, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = () => reject(new Error("Unable to read logo image"));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Unable to load logo file"));
    reader.readAsDataURL(file);
  });
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${state.token}`
  };
}

function buildInvoiceQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `/api/invoices?${query}` : "/api/invoices";
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

function getCapacitorPlatform() {
  return window.Capacitor?.getPlatform?.() || "web";
}

function getNativePrinterPlugin() {
  return window.Capacitor?.Plugins?.NativeBluetoothPrinter || null;
}

function isNativeAndroidPrinterAvailable() {
  return getCapacitorPlatform() === "android" && Boolean(getNativePrinterPlugin());
}

function getSavedPrinterPreference() {
  try {
    return JSON.parse(localStorage.getItem(PRINTER_STORAGE_KEY) || "null");
  } catch (_error) {
    return null;
  }
}

function setSavedPrinterPreference(printer) {
  if (!printer) {
    localStorage.removeItem(PRINTER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(PRINTER_STORAGE_KEY, JSON.stringify(printer));
}

async function ensureNativePrinterReady() {
  const plugin = getNativePrinterPlugin();
  if (!plugin) {
    throw new Error("Bluetooth printing is only available inside the Android APK");
  }
  const status = await plugin.getStatus();
  if (!status.available) {
    throw new Error("Bluetooth is not available on this Android device.");
  }
  if (status.enabled === false) {
    throw new Error("Turn on Bluetooth on your phone, then try printing again.");
  }
  return plugin;
}

async function connectSavedPrinter(savedPrinter) {
  const plugin = await ensureNativePrinterReady();
  if (!savedPrinter?.address) {
    return false;
  }

  try {
    const result = await plugin.connect({ address: savedPrinter.address });
    state.printer.connected = Boolean(result.connected);
    state.printer.savedPrinter = result.savedPrinter || savedPrinter;
    setSavedPrinterPreference(state.printer.savedPrinter);
    return state.printer.connected;
  } catch (error) {
    state.printer.connected = false;
    console.log("[Billr] printer connect failed", { message: error.message, address: savedPrinter.address });
    return false;
  }
}

async function listPairedPrinters() {
  const plugin = await ensureNativePrinterReady();
  const response = await plugin.listPairedDevices();
  return (response.devices || []).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

async function refreshNativePrinterState({ scan = false, reconnect = false } = {}) {
  if (!isNativeAndroidPrinterAvailable()) {
    state.printer = {
      available: false,
      platform: getCapacitorPlatform(),
      connected: false,
      savedPrinter: null,
      pairedDevices: []
    };
    renderSettingsScreen();
    return state.printer;
  }

  const savedPrinter = getSavedPrinterPreference();
  const plugin = await ensureNativePrinterReady();
  const status = await plugin.getStatus();
  const pairedDevices = scan ? await listPairedPrinters() : state.printer.pairedDevices || [];
  let connected = false;

  if (reconnect && savedPrinter?.address) {
    connected = await connectSavedPrinter(savedPrinter);
  } else {
    connected = Boolean(status.connected && savedPrinter?.address && status.savedPrinter?.address === savedPrinter.address);
  }

  state.printer = {
    available: Boolean(status.available),
    platform: getCapacitorPlatform(),
    connected,
    savedPrinter: connected ? status.savedPrinter || savedPrinter : savedPrinter,
    pairedDevices
  };

  renderSettingsScreen();
  return state.printer;
}

async function saveNativePrinter(device) {
  const savedPrinter = {
    address: device.address,
    name: device.name || "Bluetooth Printer"
  };
  setSavedPrinterPreference(savedPrinter);
  state.printer.savedPrinter = savedPrinter;
  await refreshNativePrinterState({ reconnect: true, scan: true });
}

async function clearNativePrinterSelection() {
  const plugin = getNativePrinterPlugin();
  if (plugin && state.printer.savedPrinter?.address) {
    try {
      await plugin.disconnect();
    } catch (_error) {
      // Ignore disconnect issues during clear.
    }
  }
  setSavedPrinterPreference(null);
  state.printer.savedPrinter = null;
  state.printer.connected = false;
  await refreshNativePrinterState({ scan: true });
}

function bytesToBase64(bytes) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function currency(value) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function initials(name) {
  return String(name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getDateFilterConfig(filterKey, customStart = "", customEnd = "") {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const presets = {
    TODAY: {
      label: "Today",
      startDate: toDateInputValue(today),
      endDate: toDateInputValue(today)
    },
    YESTERDAY: {
      label: "Yesterday",
      startDate: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1)),
      endDate: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1))
    },
    THIS_WEEK: {
      label: "This Week",
      startDate: toDateInputValue(startOfWeek(today)),
      endDate: toDateInputValue(today)
    },
    THIS_MONTH: {
      label: "This Month",
      startDate: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: toDateInputValue(today)
    },
    THIS_YEAR: {
      label: "This Year",
      startDate: toDateInputValue(new Date(today.getFullYear(), 0, 1)),
      endDate: toDateInputValue(today)
    },
    LAST_YEAR: {
      label: "Last Year",
      startDate: toDateInputValue(new Date(today.getFullYear() - 1, 0, 1)),
      endDate: toDateInputValue(new Date(today.getFullYear() - 1, 11, 31))
    }
  };

  if (filterKey === "CUSTOM") {
    return {
      label: "Custom Date",
      startDate: customStart || toDateInputValue(today),
      endDate: customEnd || customStart || toDateInputValue(today)
    };
  }

  return presets[filterKey] || presets.TODAY;
}

function invoiceCode(invoice) {
  const date = new Date(invoice.createdAt);
  const year = date.getFullYear();
  const current = String(year % 100).padStart(2, "0");
  const next = String((year + 1) % 100).padStart(2, "0");
  const previous = String((year - 1) % 100).padStart(2, "0");
  const fy = date.getMonth() >= 3 ? `${current}-${next}` : `${previous}-${current}`;
  return `FY/${fy}/${String(invoice.id).padStart(4, "0")}`;
}

function isAdmin() {
  return normalizeRole(state.user?.role) === "admin";
}

function isWorker() {
  return normalizeRole(state.user?.role) === "staff";
}

function userLoginId(user = state.user) {
  return user?.phone || user?.email || "-";
}

function activeGstCustomerIds() {
  return state.customers.filter((customer) => customer.gstSelected).map((customer) => customer.id);
}

function normalizeRole(role) {
  if (!role) {
    return "-";
  }
  const normalized = String(role).toLowerCase();
  if (normalized === "salesman" || normalized === "worker") {
    return "staff";
  }
  return normalized;
}

function setSyncState(text) {
  if (settingsSyncBtn) {
    settingsSyncBtn.textContent = text === "Syncing" ? "Syncing..." : "Sync";
  }
}

function cloneDraftState(draft = invoiceDraft) {
  return {
    invoiceId: draft.invoiceId,
    customerId: draft.customerId,
    items: [...(draft.items || [])]
      .map((item) => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity)
      }))
      .sort((a, b) => a.productId - b.productId),
    roundOff: Boolean(draft.roundOff)
  };
}

function currentModalName() {
  if (productSheet?.open) {
    return "product-sheet";
  }
  if (customerSheet?.open) {
    return "customer-sheet";
  }
  if (customerLedgerSheet?.open) {
    return "customer-ledger-sheet";
  }
  if (invoiceDrawer?.open) {
    return "invoice-drawer";
  }
  if (entryModal?.open) {
    return "entry-modal";
  }
  return null;
}

function getNavState() {
  return {
    screen: state.activeScreen,
    modal: currentModalName(),
    invoiceId: invoiceDraft.invoiceId || null
  };
}

function pushNavState() {
  if (suppressHistoryPush) {
    return;
  }
  history.pushState(getNavState(), "", window.location.href);
}

function replaceNavState() {
  history.replaceState(getNavState(), "", window.location.href);
}

function closeOpenModalOnly() {
  if (productSheet?.open) {
    productSheet.close();
    return true;
  }
  if (customerSheet?.open) {
    customerSheet.close();
    return true;
  }
  if (customerLedgerSheet?.open) {
    customerLedgerSheet.close();
    return true;
  }
  if (invoiceDrawer?.open) {
    invoiceDrawer.close();
    return true;
  }
  if (entryModal?.open) {
    entryModal.close();
    return true;
  }
  return false;
}

function isInvoiceDraftDirty() {
  if (!invoiceDrawer?.open) {
    return false;
  }
  const baseline = invoiceDraftBaseline || {
    invoiceId: null,
    customerId: state.customers[0]?.id || null,
    items: [],
    roundOff: false
  };
  const current = cloneDraftState();
  return JSON.stringify(current) !== JSON.stringify(cloneDraftState(baseline));
}

function syncInvoiceBaseline() {
  invoiceDraftBaseline = cloneDraftState();
}

function applyTheme(theme) {
  const nextTheme = theme === "light" ? "light" : "dark";
  state.theme = nextTheme;
  document.documentElement.setAttribute("data-theme", nextTheme);
  localStorage.setItem("billr_theme", nextTheme);

  [themeDarkBtn, themePanelDarkBtn].forEach((button) => {
    button?.classList.toggle("active", nextTheme === "dark");
  });
  [themeLightBtn, themePanelLightBtn].forEach((button) => {
    button?.classList.toggle("active", nextTheme === "light");
  });
  [workerThemeDarkBtn].forEach((button) => {
    button?.classList.toggle("active", nextTheme === "dark");
  });
  [workerThemeLightBtn].forEach((button) => {
    button?.classList.toggle("active", nextTheme === "light");
  });
}

function closeSettingsMenu() {
  if (!settingsMenu || !settingsMenuBtn) {
    return;
  }
  settingsMenu.classList.add("hidden");
  settingsMenuBtn.setAttribute("aria-expanded", "false");
}

function toggleSettingsMenu() {
  if (!settingsMenu || !settingsMenuBtn) {
    return;
  }
  const opening = settingsMenu.classList.contains("hidden");
  settingsMenu.classList.toggle("hidden", !opening);
  settingsMenuBtn.setAttribute("aria-expanded", opening ? "true" : "false");
}

function renderVisibility() {
  const loggedIn = Boolean(state.token);
  authView.classList.toggle("hidden", loggedIn);
  appView.classList.toggle("hidden", !loggedIn);

  if (loggedIn && state.user) {
    currentUserEl.textContent = `${state.user.name} (${normalizeRole(state.user.role)})`;
  }

  if (workerQuickActions) {
    workerQuickActions.classList.toggle("hidden", !loggedIn || !isWorker());
  }

  if (userManagementSection) {
    userManagementSection.classList.toggle("hidden", !loggedIn || !isAdmin());
  }

  if (companyProfileSection) {
    companyProfileSection.classList.toggle("hidden", !loggedIn || !isAdmin());
  }

  if (printerSettingsSection) {
    printerSettingsSection.classList.toggle("hidden", !loggedIn || !isAdmin());
  }

  if (gstSettingsSection) {
    gstSettingsSection.classList.toggle("hidden", !loggedIn || !isAdmin());
  }

  if (settingsMenuBtn) {
    settingsMenuBtn.classList.toggle("hidden", !loggedIn);
  }

  document.querySelectorAll(".admin-only").forEach((node) => {
    node.classList.toggle("hidden", !loggedIn || !isAdmin());
  });
}

function selectScreen(screen, options = {}) {
  state.activeScreen = screen;
  document.querySelectorAll(".main-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.screen === screen);
  });
  customersShortcutBtn?.classList.toggle("active", screen === "ledger");
  productsShortcutBtn?.classList.toggle("active", screen === "inventory");
  document.querySelectorAll(".screen-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `${screen}Screen`);
  });
  screenTitle.textContent =
    {
      sales: "Sales / Bills",
      inventory: "Products & Inventory",
      ledger: "Customers Ledger",
      detail: "Invoice Detail",
      settings: "Settings"
    }[screen] || "Billr";
  updateFabs();
  if (!options.skipHistory) {
    pushNavState();
  } else {
    replaceNavState();
  }
}

function updateFabs() {
  primaryFab.classList.remove("hidden");
  secondaryFab.classList.add("hidden");

  if (state.activeScreen === "sales") {
    primaryFab.textContent = "+ Invoice";
    secondaryFab.textContent = "+ Payment";
    secondaryFab.classList.remove("hidden");
  } else if (state.activeScreen === "inventory") {
    primaryFab.textContent = "+ New Product";
  } else if (state.activeScreen === "ledger") {
    primaryFab.textContent = state.ledgerTab === "customers" ? "+ New Customer" : "+ New Vendor";
  } else {
    primaryFab.textContent = "+ Invoice";
  }
}

function getFilteredInvoices() {
  return state.salesInvoices.filter((invoice) => {
    if (state.invoiceStatusFilter === "ALL") {
      return true;
    }
    return invoice.status === state.invoiceStatusFilter;
  });
}

function getSortedProducts() {
  const term = state.productSearch.trim().toLowerCase();
  let products = [...state.products];

  if (term) {
    products = products.filter((product) =>
      `${product.name || ""}`.toLowerCase().includes(term)
    );
  }

  if (state.onlyNegativeStock) {
    products = products.filter((product) => Number(product.stock) < 0);
  }

  if (state.productSort === "price") {
    products.sort((a, b) => Number(b.price) - Number(a.price));
  } else {
    products.sort((a, b) => Number(a.stock) - Number(b.stock));
  }

  return products;
}

function getSuggestedQuantity(productId) {
  if (!invoiceDraft.customerId) {
    return 1;
  }

  const customerInvoices = state.invoices.filter((invoice) => invoice.customerId === invoiceDraft.customerId);
  const lastMatch = customerInvoices
    .flatMap((invoice) => invoice.items || [])
    .reverse()
    .find((item) => item.productId === productId);

  return lastMatch ? Number(lastMatch.quantity) || 1 : 1;
}

function getFrequentlySoldProducts() {
  const counts = new Map();
  state.invoices.forEach((invoice) => {
    (invoice.items || []).forEach((item) => {
      counts.set(item.productId, (counts.get(item.productId) || 0) + Number(item.quantity || 0));
    });
  });

  return [...state.products]
    .sort((a, b) => (counts.get(b.id) || 0) - (counts.get(a.id) || 0))
    .slice(0, 5);
}

function getLastOrderItemsForCustomer() {
  if (!invoiceDraft.customerId) {
    return [];
  }
  const latest = state.invoices.find((invoice) => invoice.customerId === invoiceDraft.customerId);
  return latest?.items || [];
}

function draftQuantity(productId) {
  return invoiceDraft.items.find((item) => item.productId === productId)?.quantity || 0;
}

function setDraftQuantity(productId, quantity) {
  const normalized = Math.max(0, Number(quantity) || 0);
  const existing = invoiceDraft.items.find((item) => item.productId === productId);
  if (normalized === 0) {
    invoiceDraft.items = invoiceDraft.items.filter((item) => item.productId !== productId);
  } else if (existing) {
    existing.quantity = normalized;
  } else {
    invoiceDraft.items.push({ productId, quantity: normalized });
  }
}

async function fetchSalesInvoices() {
  const range = getDateFilterConfig(
    state.salesDateFilter,
    state.salesCustomStart,
    state.salesCustomEnd
  );
  state.salesDateLabel = range.label;
  const response = await apiRequest(
    buildInvoiceQuery({
      startDate: range.startDate,
      endDate: range.endDate,
      limit: 50
    }),
    { headers: authHeaders() }
  );
  state.salesInvoices = response.data;
}

async function fetchCustomerLedgerInvoices() {
  if (!state.customerLedger.customerId) {
    state.customerLedger.invoices = [];
    return;
  }

  const range = getDateFilterConfig(
    state.customerLedger.filter,
    state.customerLedger.customStart,
    state.customerLedger.customEnd
  );
  state.customerLedger.filterLabel = range.label;
  const response = await apiRequest(
    buildInvoiceQuery({
      customerId: state.customerLedger.customerId,
      startDate: range.startDate,
      endDate: range.endDate,
      limit: 50
    }),
    { headers: authHeaders() }
  );
  state.customerLedger.invoices = response.data;
}

function renderSalesScreen() {
  const filtered = getFilteredInvoices();
  const totalAmount = filtered.reduce((sum, invoice) => sum + Number(invoice.total), 0);
  const pendingAmount = filtered
    .filter((invoice) => invoice.status === "PENDING")
    .reduce((sum, invoice) => sum + Number(invoice.total), 0);

  document.getElementById("salesTotalAmount").textContent = currency(totalAmount);
  document.getElementById("salesPendingAmount").textContent = currency(pendingAmount);
  if (salesDateFilter) {
    salesDateFilter.value = state.salesDateFilter;
    salesDateFilter.options[salesDateFilter.selectedIndex].text = state.salesDateLabel;
  }
  if (salesCustomDateRange) {
    salesCustomDateRange.classList.toggle("hidden", state.salesDateFilter !== "CUSTOM");
  }
  if (salesStartDate) {
    salesStartDate.value = state.salesCustomStart;
  }
  if (salesEndDate) {
    salesEndDate.value = state.salesCustomEnd;
  }

  const list = document.getElementById("invoiceList");
  list.innerHTML = filtered.length
    ? filtered
        .map((invoice) => {
          const active = invoice.id === state.selectedInvoiceId ? " active" : "";
          return `
            <article class="invoice-row${active}" data-invoice-id="${invoice.id}">
              <div class="row-top">
                <div>
                  <div class="row-title">${invoice.customer?.name || "-"}</div>
                  <div class="row-subtitle">${invoiceCode(invoice)}</div>
                </div>
                <span class="status-pill ${invoice.status.toLowerCase()}">${invoice.status.toLowerCase()}</span>
              </div>
              <div class="row-bottom">
                <span class="row-subtitle">${formatDate(invoice.createdAt)}</span>
                <span class="row-subtitle">Created by ${invoice.user?.name || "-"}</span>
                <span class="amount-main">${currency(invoice.total)}</span>
              </div>
            </article>
          `;
        })
        .join("")
    : `<div class="invoice-row"><div class="row-title">No invoices found.</div></div>`;

  document.querySelectorAll(".status-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.statusFilter === state.invoiceStatusFilter);
  });

  document.querySelectorAll("[data-invoice-id]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedInvoiceId = Number(node.dataset.invoiceId);
      renderSalesScreen();
      renderDetailScreen();
      selectScreen("detail");
    });
  });
}

function renderInventoryScreen() {
  const products = getSortedProducts();
  const lowStockCount = state.products.filter((product) => Number(product.stock) <= 5).length;
  document.getElementById("inventoryProductCount").textContent = String(products.length);
  document.getElementById("inventoryLowStockCount").textContent = String(lowStockCount);

  const list = document.getElementById("productList");
  list.innerHTML = products.length
    ? products
        .map((product) => {
          const stock = Number(product.stock);
          const negative = stock < 0;
          return `
            <article class="inventory-row${negative ? " negative" : ""}">
              <div class="inventory-top">
                <strong>${product.name || `Untitled Product #${product.id}`}</strong>
                <div class="worker-actions">
                  <span class="amount-main">${currency(product.price)}</span>
                  <button class="chip chip-ghost" data-edit-product-id="${product.id}" type="button">Edit</button>
                </div>
              </div>
              <div class="inventory-bottom">
                <span class="inventory-meta">Selling price</span>
                <span class="inventory-qty ${negative ? "negative-stock" : ""}">Qty: ${stock}</span>
              </div>
            </article>
          `;
        })
        .join("")
    : `<article class="inventory-row"><strong>No products found.</strong></article>`;

  document.querySelectorAll("[data-edit-product-id]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      const product = state.products.find((entry) => entry.id === Number(node.dataset.editProductId));
      if (product) {
        openModal("product", { product });
      }
    });
  });
}

function renderLedgerScreen() {
  const collect = state.customers.reduce((sum, customer) => sum + Math.max(Number(customer.balance), 0), 0);
  document.getElementById("ledgerCollect").textContent = currency(collect);
  document.getElementById("ledgerPay").textContent = currency(0);
  document.getElementById("ledgerTitle").textContent =
    state.ledgerTab === "customers" ? "Customer Ledger" : "Vendor Ledger";

  const list = document.getElementById("ledgerList");
  if (state.ledgerTab === "vendors") {
    list.innerHTML = `
      <article class="ledger-row">
        <div class="ledger-main">
          <div class="ledger-left">
            <span class="avatar">V</span>
            <div>
              <div class="ledger-name">No vendors yet</div>
              <div class="ledger-meta">Vendor module can be added on the same backend pattern.</div>
            </div>
          </div>
          <strong class="ledger-balance positive">Rs 0.00</strong>
        </div>
      </article>
    `;
    return;
  }

  list.innerHTML = state.customers.length
    ? state.customers
        .map((customer) => {
          const balance = Number(customer.balance);
          return `
            <article class="ledger-row" data-customer-ledger-id="${customer.id}">
              <div class="ledger-main">
                <div class="ledger-left">
                  <span class="avatar">${initials(customer.name)}</span>
                  <div>
                    <div class="ledger-name">${customer.name}</div>
                    <div class="ledger-meta">${customer.phone || customer.address || "No extra contact details"}</div>
                  </div>
                </div>
                <div class="worker-actions">
                  <strong class="ledger-balance ${balance > 0 ? "negative" : "positive"}">
                    ${balance > 0 ? "Due " : ""}${currency(balance)}
                  </strong>
                  <button class="chip chip-ghost" data-edit-customer-id="${customer.id}" type="button">Edit</button>
                </div>
              </div>
            </article>
          `;
        })
        .join("")
    : `<article class="ledger-row"><div class="ledger-name">No customers found.</div></article>`;

  document.querySelectorAll("[data-customer-ledger-id]").forEach((node) => {
    node.addEventListener("click", async () => {
      if (node.dataset.editClick === "true") {
        node.dataset.editClick = "false";
        return;
      }
      const customerId = Number(node.dataset.customerLedgerId);
      await openCustomerLedger(customerId);
    });
  });

  document.querySelectorAll("[data-edit-customer-id]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      const container = node.closest("[data-customer-ledger-id]");
      if (container) {
        container.dataset.editClick = "true";
      }
      const customer = state.customers.find((entry) => entry.id === Number(node.dataset.editCustomerId));
      if (customer) {
        openModal("customer", { customer });
      }
    });
  });
}

function renderCustomerLedgerSheet() {
  if (!customerLedgerName || !customerLedgerInvoiceList) {
    return;
  }

  const customer = state.customerLedger.customer;
  customerLedgerName.textContent = customer?.name || "Customer Ledger";
  if (customerLedgerFilter) {
    customerLedgerFilter.value = state.customerLedger.filter;
    customerLedgerFilter.options[customerLedgerFilter.selectedIndex].text = state.customerLedger.filterLabel;
  }
  if (customerLedgerCustomDateRange) {
    customerLedgerCustomDateRange.classList.toggle("hidden", state.customerLedger.filter !== "CUSTOM");
  }
  if (customerLedgerStartDate) {
    customerLedgerStartDate.value = state.customerLedger.customStart;
  }
  if (customerLedgerEndDate) {
    customerLedgerEndDate.value = state.customerLedger.customEnd;
  }

  const collect = state.customerLedger.invoices.reduce((sum, invoice) => {
    return invoice.status === "CANCELLED" ? sum : sum + Number(invoice.total || 0);
  }, 0);

  customerLedgerCollect.textContent = currency(collect);
  customerLedgerPay.textContent = currency(0);

  customerLedgerInvoiceList.innerHTML = state.customerLedger.invoices.length
    ? state.customerLedger.invoices
        .map((invoice) => {
          return `
            <article class="invoice-row" data-ledger-invoice-id="${invoice.id}">
              <div class="row-top">
                <div>
                  <div class="row-title">${invoiceCode(invoice)}</div>
                  <div class="row-subtitle">${formatDate(invoice.createdAt)}</div>
                </div>
                <span class="status-pill ${invoice.status.toLowerCase()}">${invoice.status.toLowerCase()}</span>
              </div>
              <div class="row-bottom">
                <span class="row-subtitle">${invoice.customer?.name || customer?.name || "-"}</span>
                <span class="amount-main">${currency(invoice.total)}</span>
              </div>
            </article>
          `;
        })
        .join("")
    : `<article class="invoice-row"><div class="row-title">No invoices found for this range.</div></article>`;

  document.querySelectorAll("[data-ledger-invoice-id]").forEach((node) => {
    node.addEventListener("click", () => {
      state.selectedInvoiceId = Number(node.dataset.ledgerInvoiceId);
      customerLedgerSheet.close();
      selectScreen("detail");
      renderDetailScreen();
    });
  });
}

async function openCustomerLedger(customerId) {
  const customer = state.customers.find((entry) => entry.id === customerId);
  if (!customer) {
    showMessage("Customer not found.", true);
    return;
  }

  state.customerLedger.customerId = customerId;
  state.customerLedger.customer = customer;
  await fetchCustomerLedgerInvoices();
  renderCustomerLedgerSheet();
  customerLedgerSheet.showModal();
  pushNavState();
}

function getSelectedInvoice() {
  if (state.selectedInvoiceId) {
    return (
      state.invoices.find((invoice) => invoice.id === state.selectedInvoiceId) ||
      state.salesInvoices.find((invoice) => invoice.id === state.selectedInvoiceId) ||
      state.customerLedger.invoices.find((invoice) => invoice.id === state.selectedInvoiceId) ||
      null
    );
  }
  return state.salesInvoices[0] || state.invoices[0] || null;
}

function logClick(label, payload = {}) {
  console.log(`[Billr] ${label} clicked`, payload);
}

function getInvoiceActivity(invoice) {
  return [
    `Invoice ${invoiceCode(invoice)} created on ${formatDate(invoice.createdAt)}`,
    `Status: ${invoice.status}`,
    `Created by: ${invoice.user?.name || "-"}`,
    `Customer: ${invoice.customer?.name || "-"}`
  ];
}

async function openInvoicePdf(invoice) {
  console.log("[Billr] View PDF clicked", { invoiceId: invoice.id });

  const response = await fetch(`/api/invoices/${invoice.id}/pdf`, {
    headers: {
      Authorization: `Bearer ${state.token}`
    }
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Unable to generate invoice PDF");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const preview = window.open(url, "_blank", "noopener,noreferrer");

  if (!preview) {
    URL.revokeObjectURL(url);
    throw new Error("Popup blocked. Please allow popups to preview the PDF.");
  }

  showMessage("Invoice PDF opened in a new tab.");
}

function buildThermalReceipt(invoice) {
  const divider = "-".repeat(32);
  const rows = [
    "BILLR CLOUD",
    divider,
    invoiceCode(invoice),
    `Date ${formatDate(invoice.createdAt)}`,
    `Customer ${invoice.customer?.name || "-"}`,
    divider
  ];

  (invoice.items || []).forEach((item) => {
    const productName = item.product?.name || `Product #${item.productId}`;
    rows.push(productName.slice(0, 32));
    rows.push(`Qty ${item.quantity} x ${currency(item.price)}`);
    rows.push(`Line ${currency(Number(item.price) * Number(item.quantity))}`);
    rows.push("");
  });

  rows.push(divider);
  if (invoice.gstApplied) {
    rows.push(`Subtotal ${currency(invoice.subtotal || 0)}`);
    rows.push(
      `${invoice.gstType === "IGST" ? "IGST" : "CGST/SGST"} ${Number(invoice.gstRate || 0)}%`
    );
    rows.push(`GST Amt ${currency(invoice.gstAmount || 0)}`);
    rows.push(`GST No ${invoice.gstNumber || "-"}`);
    rows.push(divider);
  }
  rows.push(`TOTAL ${currency(invoice.total)}`);
  rows.push("");
  rows.push("Thank you");
  rows.push("");
  rows.push("");

  return rows.join("\n");
}

function buildEscPosBytes(invoice) {
  const encoder = new TextEncoder();
  const body = encoder.encode(buildThermalReceipt(invoice));
  const init = Uint8Array.from([0x1b, 0x40]);
  const lineFeed = Uint8Array.from([0x0a]);
  const cut = Uint8Array.from([0x1d, 0x56, 0x41, 0x10]);
  const payload = new Uint8Array(init.length + body.length + lineFeed.length + cut.length);
  let offset = 0;
  payload.set(init, offset);
  offset += init.length;
  payload.set(body, offset);
  offset += body.length;
  payload.set(lineFeed, offset);
  offset += lineFeed.length;
  payload.set(cut, offset);
  return payload;
}

async function printInvoiceViaNativeBluetooth(invoice) {
  console.log("[Billr] Thermal Print clicked", {
    invoiceId: invoice.id,
    platform: getCapacitorPlatform()
  });

  const plugin = await ensureNativePrinterReady();
  const savedPrinter = state.printer.savedPrinter || getSavedPrinterPreference();
  if (!savedPrinter?.address) {
    throw new Error("No printer selected. Choose a paired printer first.");
  }

  const payload = bytesToBase64(buildEscPosBytes(invoice));
  const result = await plugin.printEscPos({
    address: savedPrinter.address,
    payloadBase64: payload
  });

  state.printer.connected = Boolean(result.connected);
  state.printer.savedPrinter = result.savedPrinter || savedPrinter;
  renderSettingsScreen();
  console.log("[Billr] thermal print success", {
    bytes: payload.length,
    printer: state.printer.savedPrinter?.address || savedPrinter.address
  });
}

async function openPrinterSelectionModal(invoice) {
  await refreshNativePrinterState({ scan: true });
  if (!state.printer.pairedDevices.length) {
    showMessage("No paired Bluetooth printers found. Pair the printer in Android settings first.", true);
    return;
  }

  modalLabel.textContent = "Printer";
  modalTitle.textContent = "Select Paired Printer";
  modalFields.innerHTML = `
    <div class="worker-list">
      ${state.printer.pairedDevices
        .map(
          (device) => `
            <article class="worker-row${state.printer.savedPrinter?.address === device.address ? " active-printer" : ""}">
              <div class="worker-main">
                <div class="ledger-left">
                  <span class="avatar">${initials(device.name || "BT")}</span>
                  <div>
                    <div class="ledger-name">${escapeHtml(device.name || "Bluetooth Printer")}</div>
                    <div class="ledger-meta">${escapeHtml(device.address)}</div>
                  </div>
                </div>
                <div class="worker-actions">
                  <button class="primary-btn" data-printer-pick="${escapeHtml(device.address)}" data-printer-name="${escapeHtml(device.name || "Bluetooth Printer")}" type="button">
                    ${state.printer.savedPrinter?.address === device.address ? "Print Now" : "Use & Print"}
                  </button>
                </div>
              </div>
            </article>
          `
        )
        .join("")}
    </div>
    <p class="support-text">Billing stays synced to the cloud. Printing happens directly over Android Bluetooth Classic.</p>
  `;
  modalSubmitBtn.classList.add("hidden");
  modalSubmitHandler = null;
  entryModal.showModal();

  modalFields.querySelectorAll("[data-printer-pick]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        button.disabled = true;
        const device = {
          address: button.dataset.printerPick,
          name: button.dataset.printerName
        };
        await saveNativePrinter(device);
        await printInvoiceViaNativeBluetooth(invoice);
        entryModal.close();
        showMessage("Receipt sent to the Bluetooth printer.");
      } catch (error) {
        showMessage(error.message, true);
      } finally {
        button.disabled = false;
      }
    });
  });
}

function openInvoiceDocument(invoice, options = {}) {
  const doc = window.open("", "_blank", "noopener,noreferrer,width=900,height=700");
  if (!doc) {
    showMessage("Popup blocked. Please allow popups to view the invoice document.", true);
    return;
  }

  const lineItems = (invoice.items || [])
    .map(
      (item) => `
        <tr>
          <td>${item.product?.name || `Product #${item.productId}`}</td>
          <td>${item.quantity}</td>
          <td>${currency(item.price)}</td>
          <td>${currency(Number(item.price) * Number(item.quantity))}</td>
        </tr>
      `
    )
    .join("");

  const printLabel = options.thermal ? "Thermal Print Preview" : "Invoice Preview";
  const gstSummary = invoice.gstApplied
    ? `
        <div><strong>Subtotal:</strong> ${currency(invoice.subtotal || 0)}</div>
        <div><strong>${invoice.gstType === "IGST" ? "IGST" : "CGST / SGST"}:</strong> ${Number(invoice.gstRate || 0)}%</div>
        <div><strong>GST Amount:</strong> ${currency(invoice.gstAmount || 0)}</div>
        <div><strong>GST Number:</strong> ${invoice.gstNumber || "-"}</div>
      `
    : "";

  doc.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>${printLabel}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; color: #111; }
          h1, h2, h3, p { margin: 0 0 10px; }
          .meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin: 18px 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          th, td { padding: 10px 8px; border-bottom: 1px solid #ddd; text-align: left; }
          .total { margin-top: 18px; font-weight: 700; font-size: 20px; text-align: right; }
          .footer { margin-top: 32px; font-size: 12px; color: #444; }
        </style>
      </head>
      <body>
        <h2>Billr Cloud</h2>
        <h1>${invoiceCode(invoice)}</h1>
        <p>Status: ${invoice.status}</p>
        <div class="meta">
          <div><strong>Customer:</strong> ${invoice.customer?.name || "-"}</div>
          <div><strong>Date:</strong> ${formatDate(invoice.createdAt)}</div>
          <div><strong>Amount:</strong> ${currency(invoice.total)}</div>
          ${gstSummary}
        </div>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${lineItems}</tbody>
        </table>
        <div class="total">Total: ${currency(invoice.total)}</div>
        <div class="footer">Billr Cloud</div>
      </body>
    </html>
  `);
  doc.document.close();

  if (options.print) {
    setTimeout(() => {
      doc.focus();
      doc.print();
    }, 250);
  }
}

async function handleInvoiceAction(action) {
  const invoice = getSelectedInvoice();
  logClick(action, { invoiceId: invoice?.id || null });

  if (!invoice) {
    showMessage("Select an invoice first.", true);
    return;
  }

  if (action === "view-pdf") {
    await openInvoicePdf(invoice);
    return;
  }

  if (action === "share") {
    const shareText = invoice.gstApplied
      ? `${invoiceCode(invoice)} · ${invoice.customer?.name || "-"} · ${currency(invoice.total)} · GST ${Number(invoice.gstRate || 0)}% ${currency(invoice.gstAmount || 0)}`
      : `${invoiceCode(invoice)} · ${invoice.customer?.name || "-"} · ${currency(invoice.total)}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Billr Invoice", text: shareText });
      } catch (_error) {
        showMessage("Share cancelled.");
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      showMessage("Invoice summary copied for sharing.");
    } else {
      showMessage("Share is not supported in this browser.", true);
    }
    return;
  }

  if (action === "record-payment") {
    openModal("payment");
    return;
  }

  if (action === "duplicate") {
    invoiceDraft.customerId = invoice.customerId;
    invoiceDraft.invoiceId = null;
    invoiceDraft.items = (invoice.items || []).map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity)
    }));
    invoiceDraft.roundOff = false;
    openInvoiceDrawer();
    showMessage("Invoice copied into the draft composer.");
    return;
  }

  if (action === "thermal-print") {
    if (isNativeAndroidPrinterAvailable()) {
      try {
        await openPrinterSelectionModal(invoice);
      } catch (error) {
        console.log("[Billr] thermal print failure", { message: error.message });
        showMessage(error.message, true);
      }
    } else {
      showMessage("Thermal printing is available only inside the Android APK.", true);
    }
    return;
  }

  if (action === "activity") {
    showMessage(getInvoiceActivity(invoice).join(" | "));
    return;
  }

  if (action === "document-settings") {
    showMessage("Document settings opened. Placeholder flow ready for further settings.");
    return;
  }

  if (action === "send-email") {
    const subject = encodeURIComponent(`Invoice ${invoiceCode(invoice)}`);
    const body = encodeURIComponent(
      invoice.gstApplied
        ? `Invoice ${invoiceCode(invoice)} for ${invoice.customer?.name || "-"} amount ${currency(invoice.total)}. GST ${Number(invoice.gstRate || 0)}% amount ${currency(invoice.gstAmount || 0)}. GST No ${invoice.gstNumber || "-"}`
        : `Invoice ${invoiceCode(invoice)} for ${invoice.customer?.name || "-"} amount ${currency(invoice.total)}.`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    return;
  }

  if (action === "send-sms") {
    showMessage(`SMS flow placeholder for ${invoice.customer?.name || "-"}.`);
    return;
  }

  if (action === "e-way-bill") {
    showMessage("E-way Bill request triggered. Connect cloud API next.");
    return;
  }

  if (action === "e-invoice") {
    showMessage("E-Invoice request triggered. Connect IRP API next.");
    return;
  }

  if (action === "generate-qr") {
    const qrWindow = window.open("", "_blank", "noopener,noreferrer,width=420,height=520");
    if (!qrWindow) {
      showMessage("Popup blocked. Please allow popups to view QR.", true);
      return;
    }
    const data = `${invoiceCode(invoice)}|${invoice.customer?.name || "-"}|${invoice.total}`;
    qrWindow.document.write(`
      <!doctype html>
      <html>
        <head><title>Invoice QR</title><style>body{font-family:Arial;padding:24px;background:#111;color:#fff;text-align:center}.box{margin:24px auto;padding:24px;border:1px solid #333;border-radius:18px;max-width:320px}.qr{font-size:14px;line-height:1.2;word-break:break-word;background:#fff;color:#000;padding:24px;border-radius:16px}</style></head>
        <body>
          <div class="box">
            <h2>${invoiceCode(invoice)}</h2>
            <div class="qr">QR DATA<br><br>${data}</div>
          </div>
        </body>
      </html>
    `);
    qrWindow.document.close();
    return;
  }

  if (action === "cancel-invoice") {
    const confirmed = window.confirm(`Cancel invoice ${invoiceCode(invoice)}?`);
    if (!confirmed) {
      return;
    }
    await apiRequest(`/api/invoices/${invoice.id}/cancel`, {
      method: "PATCH",
      headers: authHeaders()
    });
    await loadDashboard();
    showMessage(`Invoice ${invoiceCode(invoice)} cancelled.`);
    return;
  }

  showMessage(`${action} clicked. Placeholder flow ready.`);
}

function renderDetailScreen() {
  const invoice = getSelectedInvoice();
  const code = document.getElementById("detailInvoiceNumber");
  const status = document.getElementById("detailStatus");
  const amountNode = document.getElementById("detailAmount");
  document.querySelectorAll('[data-invoice-action="thermal-print"]').forEach((button) => {
    button.classList.toggle("hidden", !isNativeAndroidPrinterAvailable());
  });

  if (!invoice) {
    code.textContent = "FY/24-25/0000";
    status.textContent = "Pending";
    status.className = "status-pill pending";
    document.getElementById("detailCustomer").textContent = "No invoice selected";
    document.getElementById("detailDate").textContent = "-";
    document.getElementById("detailCreator").textContent = "-";
    amountNode.textContent = currency(0);
    amountNode.title = "";
    document.getElementById("detailItems").innerHTML = `<div class="detail-item-row">No invoice lines yet.</div>`;
    if (editInvoiceBtn) {
      editInvoiceBtn.disabled = true;
      editInvoiceBtn.classList.toggle("hidden", !isAdmin());
    }
    return;
  }

  if (editInvoiceBtn) {
    editInvoiceBtn.disabled = !isAdmin() || invoice.status === "CANCELLED";
    editInvoiceBtn.classList.toggle("hidden", !isAdmin());
  }

  code.textContent = invoiceCode(invoice);
  status.textContent = invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase();
  status.className = `status-pill ${invoice.status.toLowerCase()}`;
  document.getElementById("detailCustomer").textContent = invoice.customer?.name || "-";
  document.getElementById("detailDate").textContent = formatDate(invoice.createdAt);
  document.getElementById("detailCreator").textContent = invoice.user?.name || "-";
  amountNode.textContent = currency(invoice.total);
  amountNode.title = invoice.gstApplied
    ? `Subtotal ${currency(invoice.subtotal || 0)} | ${invoice.gstType === "IGST" ? "IGST" : "CGST/SGST"} ${Number(invoice.gstRate || 0)}% | GST ${currency(invoice.gstAmount || 0)}`
    : "";
  document.getElementById("detailItems").innerHTML = invoice.items?.length
    ? invoice.items
        .map(
          (item) => `
            <div class="detail-item-row">
              <div class="row-top">
                <strong>${item.product?.name || `Untitled Product #${item.productId}`}</strong>
                <span>${currency(item.price)}</span>
              </div>
              <div class="row-bottom">
                <span class="row-subtitle">Quantity: ${item.quantity}</span>
                <span class="row-subtitle">Line Total: ${currency(Number(item.price) * Number(item.quantity))}</span>
              </div>
            </div>
          `
        )
        .join("")
    : `<div class="detail-item-row">No items on this invoice.</div>`;
}

function renderSettingsScreen() {
  if (isAdmin() && state.companyProfile) {
    companyNameInput.value = state.companyProfile.companyName || "";
    companyAddressInput.value = state.companyProfile.address || "";
    companyPhoneInput.value = state.companyProfile.phone || "";
    companyEmailInput.value = state.companyProfile.email || "";
    companyGstNumberInput.value = state.companyProfile.gstNumber || "";
    companyBankDetailsInput.value = state.companyProfile.bankDetails || "";
    companyTermsInput.value = state.companyProfile.termsAndConditions || "";
    pendingCompanyLogoDataUrl = state.companyProfile.logoDataUrl || "";
    if (companyLogoInput) {
      companyLogoInput.value = "";
    }
    setCompanyLogoPreview(pendingCompanyLogoDataUrl);
  }

  if (isAdmin() && state.gstSettings) {
    gstEnabledToggle.checked = Boolean(state.gstSettings.gstEnabled);
    gstModeSelect.value = state.gstSettings.gstMode;
    defaultGstRateInput.value = Number(state.gstSettings.defaultGstRate || 0);
    gstNumberInput.value = state.gstSettings.gstNumber || "";
    gstTypeSelect.value = state.gstSettings.gstType;
    gstCustomerChecklist.innerHTML = state.customers
      .map(
        (customer) => `
          <label class="ledger-row">
            <span>${customer.name}</span>
            <input class="gst-customer-check" type="checkbox" value="${customer.id}" ${customer.gstSelected ? "checked" : ""} />
          </label>
        `
      )
      .join("");
  }

  if (printerStatusText) {
    if (!isNativeAndroidPrinterAvailable()) {
      printerStatusText.textContent =
        getCapacitorPlatform() === "android"
          ? "Native printer plugin is unavailable in this build."
          : "Thermal printing is available only inside the Android APK.";
    } else if (state.printer.connected) {
      printerStatusText.textContent = "Printer connected and ready for thermal printing.";
    } else if (state.printer.savedPrinter) {
      printerStatusText.textContent = "Saved printer found. Tap Reconnect or print an invoice to connect.";
    } else {
      printerStatusText.textContent = "No printer selected yet. Load paired printers and choose one.";
    }
  }

  if (printerSavedText) {
    printerSavedText.textContent = state.printer.savedPrinter
      ? `Saved printer: ${state.printer.savedPrinter.name || "Thermal Printer"} (${state.printer.savedPrinter.address})`
      : "No printer selected.";
  }

  if (printerScanBtn) {
    printerScanBtn.disabled = !isNativeAndroidPrinterAvailable();
  }
  if (printerReconnectBtn) {
    printerReconnectBtn.disabled = !isNativeAndroidPrinterAvailable() || !state.printer.savedPrinter;
  }
  if (printerClearBtn) {
    printerClearBtn.disabled = !isNativeAndroidPrinterAvailable() || !state.printer.savedPrinter;
  }

  if (printerDeviceList) {
    if (!isNativeAndroidPrinterAvailable()) {
      printerDeviceList.innerHTML = `<article class="worker-row"><div class="ledger-name">Open the Android APK to manage Bluetooth printers.</div></article>`;
    } else if (!state.printer.pairedDevices.length) {
      printerDeviceList.innerHTML = `<article class="worker-row"><div class="ledger-name">No paired printers loaded yet. Tap "Load Paired Printers".</div></article>`;
    } else {
      printerDeviceList.innerHTML = state.printer.pairedDevices
        .map(
          (device) => `
            <article class="worker-row${state.printer.savedPrinter?.address === device.address ? " active-printer" : ""}">
              <div class="worker-main">
                <div class="ledger-left">
                  <span class="avatar">${initials(device.name || "BT")}</span>
                  <div>
                    <div class="ledger-name">${device.name || "Bluetooth Printer"}</div>
                    <div class="ledger-meta">${device.address}</div>
                  </div>
                </div>
                <div class="worker-actions">
                  <button class="chip chip-ghost" data-printer-action="select" data-printer-address="${device.address}" data-printer-name="${escapeHtml(device.name || "Bluetooth Printer")}" type="button">
                    ${state.printer.savedPrinter?.address === device.address ? "Selected" : "Use Printer"}
                  </button>
                </div>
              </div>
            </article>
          `
        )
        .join("");

      printerDeviceList.querySelectorAll("[data-printer-action='select']").forEach((button) => {
        button.addEventListener("click", async () => {
          try {
            await saveNativePrinter({
              address: button.dataset.printerAddress,
              name: button.dataset.printerName
            });
            showMessage("Printer saved and connected.");
          } catch (error) {
            showMessage(error.message, true);
          }
        });
      });
    }
  }

  if (!workerList) {
    return;
  }

  if (!isAdmin()) {
    workerList.innerHTML = "";
    return;
  }

  workerList.innerHTML = state.workers.length
    ? state.workers
        .map(
          (worker) => `
            <article class="worker-row${worker.isActive ? "" : " disabled"}">
              <div class="worker-main">
                <div class="ledger-left">
                  <span class="avatar">${initials(worker.name)}</span>
                  <div>
                    <div class="ledger-name">${worker.name}</div>
                    <div class="ledger-meta">${userLoginId(worker)} | ${worker.isActive ? "Active" : "Disabled"}</div>
                  </div>
                </div>
                <div class="worker-actions">
                  <button class="chip chip-ghost" data-worker-action="reset" data-worker-id="${worker.id}" type="button">Reset Password</button>
                  <button class="chip chip-ghost danger-text" data-worker-action="disable" data-worker-id="${worker.id}" type="button" ${worker.isActive ? "" : "disabled"}>Disable User</button>
                </div>
              </div>
            </article>
          `
        )
        .join("")
    : `<article class="worker-row"><div class="ledger-name">No staff added yet.</div></article>`;

  workerList.querySelectorAll("[data-worker-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const workerId = Number(button.dataset.workerId);
      const action = button.dataset.workerAction;
      logClick(`worker-${action}`, { workerId });
      if (action === "reset") {
        pendingResetWorkerId = workerId;
        openModal("reset-worker-password", { workerId });
        return;
      }

      if (!window.confirm("Disable this staff account?")) {
        return;
      }

      try {
        await apiRequest(`/api/auth/workers/${workerId}/disable`, {
          method: "PATCH",
          headers: authHeaders()
        });
        showMessage("Staff disabled successfully.");
        await loadDashboard();
      } catch (error) {
        showMessage(error.message, true);
      }
    });
  });
}

function getDraftInvoiceTotal() {
  const subtotal = invoiceDraft.items.reduce((sum, item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    return sum + (product ? Number(product.price) * Number(item.quantity) : 0);
  }, 0);
  const total = invoiceDraft.roundOff ? Math.round(subtotal) : subtotal;
  return { subtotal, total };
}

function getInvoicePayload() {
  const validItems = invoiceDraft.items
    .map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity)
    }))
    .filter((item) => Number.isInteger(item.productId) && Number.isInteger(item.quantity) && item.quantity > 0);

  return {
    invoiceId: invoiceDraft.invoiceId,
    customerId: Number(invoiceDraft.customerId),
    items: validItems,
    gstRate: isAdmin() && invoiceGstRateInput?.value !== "" ? Number(invoiceGstRateInput.value) : null,
    totalAmount: getDraftInvoiceTotal().total
  };
}

function getInvoiceGstPreview() {
  const selectedCustomer = state.customers.find((customer) => customer.id === invoiceDraft.customerId);
  const settings = state.gstSettings;
  const subtotal = getDraftInvoiceTotal().subtotal;
  const productRates = invoiceDraft.items
    .map((item) => state.products.find((product) => product.id === item.productId)?.gstRate)
    .filter((rate) => rate !== undefined);

  if (!settings?.gstEnabled) {
    return { applied: false, rate: 0, amount: 0, total: subtotal, type: null, number: null };
  }

  const customerSelected = settings.gstMode === "ALL" || Boolean(selectedCustomer?.gstSelected);
  if (!customerSelected) {
    return { applied: false, rate: 0, amount: 0, total: subtotal, type: null, number: null };
  }

  const overrideRate =
    isAdmin() && invoiceGstRateInput?.value !== "" ? Number(invoiceGstRateInput.value || 0) : null;
  const effectiveRate =
    overrideRate !== null
      ? overrideRate
      : productRates.find((rate) => rate !== null && rate !== undefined) ?? Number(settings.defaultGstRate || 0);
  const gstAmount = subtotal * (Number(effectiveRate || 0) / 100);
  return {
    applied: true,
    rate: Number(effectiveRate || 0),
    amount: gstAmount,
    total: subtotal + gstAmount,
    type: settings.gstType,
    number: settings.gstNumber
  };
}

function renderInvoiceDrawer() {
  const draftInvoice = invoiceDraft.invoiceId
    ? (
        state.invoices.find((invoice) => invoice.id === invoiceDraft.invoiceId) ||
        state.salesInvoices.find((invoice) => invoice.id === invoiceDraft.invoiceId) ||
        state.customerLedger.invoices.find((invoice) => invoice.id === invoiceDraft.invoiceId) ||
        null
      )
    : null;
  const nextId = (state.invoices[0]?.id || 0) + 1;
  invoiceDraftNumberEl.textContent = draftInvoice
    ? invoiceCode(draftInvoice)
    : invoiceCode({ id: nextId, createdAt: new Date().toISOString() });
  invoiceDraftDateEl.textContent = draftInvoice
    ? formatDate(draftInvoice.createdAt)
    : formatDate(new Date().toISOString());
  const selectedCustomer = state.customers.find((customer) => customer.id === invoiceDraft.customerId);
  selectCustomerBtn.textContent = selectedCustomer
    ? `${selectedCustomer.name} | ${currency(selectedCustomer.balance)}`
    : "Select Customer";
  if (editSelectedCustomerBtn) {
    editSelectedCustomerBtn.disabled = !selectedCustomer;
  }

  const { subtotal, total } = getDraftInvoiceTotal();
  const gstPreview = getInvoiceGstPreview();
  invoiceSubtotalEl.textContent = currency(subtotal);
  invoiceTotalEl.textContent = currency(gstPreview.total || total);
  roundOffToggle.checked = invoiceDraft.roundOff;
  createInvoiceBtn.disabled = invoiceSubmitting;
  createInvoiceBtn.textContent = invoiceSubmitting
    ? invoiceDraft.invoiceId
      ? "Updating..."
      : "Creating..."
    : invoiceDraft.invoiceId
      ? "Update Invoice"
      : "Create Invoice";
  if (!invoiceSubmitting && !invoiceSubmitMessage?.textContent) {
    clearInvoiceSubmitMessage();
  }

  if (invoiceGstRateWrap) {
    invoiceGstRateWrap.classList.toggle("hidden", !isAdmin());
  }
  if (invoiceGstRateInput) {
    if (draftInvoice) {
      if (document.activeElement !== invoiceGstRateInput) {
        invoiceGstRateInput.value = Number(draftInvoice?.gstRate || 0) || "";
      }
    } else if (!invoiceGstRateInput.dataset.touched) {
      invoiceGstRateInput.value = "";
    }
  }
  if (invoiceGstSummary) {
    invoiceGstSummary.classList.toggle("hidden", !gstPreview.applied);
    invoiceGstSummary.innerHTML = gstPreview.applied
      ? `
          <div><p class="mini-label">GST</p><span class="shortcut-note">${gstPreview.type === "IGST" ? "IGST" : "CGST/SGST"} @ ${gstPreview.rate}%</span></div>
          <div><p class="mini-label">GST Amount</p><span class="shortcut-note">${currency(gstPreview.amount)}</span></div>
          <div><p class="mini-label">GST Number</p><span class="shortcut-note">${gstPreview.number || "-"}</span></div>
        `
      : "";
  }

  invoiceDraftItemsEl.innerHTML = invoiceDraft.items.length
    ? invoiceDraft.items
        .map((item) => {
          const product = state.products.find((entry) => entry.id === item.productId);
          return `
            <div class="detail-item-row">
              <div class="draft-item-row">
                <div>
                  <strong>${product?.name || `Untitled Product #${item.productId}`}</strong>
                  <div class="row-subtitle">${currency(product?.price || 0)}</div>
                </div>
                <div class="qty-control" data-draft-product-id="${item.productId}">
                  <button class="qty-btn" data-qty-action="decrease" type="button">-</button>
                  <span class="qty-value">${item.quantity}</span>
                  <button class="qty-btn" data-qty-action="increase" type="button">+</button>
                  <button class="ghost-btn" data-qty-action="remove" type="button">Edit</button>
                </div>
              </div>
            </div>
          `;
        })
        .join("")
    : `<div class="detail-item-row"><span class="shortcut-note">No products added yet. Tap "Add / Edit Products".</span></div>`;

  invoiceDraftItemsEl.querySelectorAll("[data-qty-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.parentElement.dataset.draftProductId);
      const current = draftQuantity(productId);
      const action = button.dataset.qtyAction;
      if (action === "increase") {
        setDraftQuantity(productId, current + 1);
      } else if (action === "decrease") {
        setDraftQuantity(productId, current - 1);
      } else {
        openProductSelectionSheet();
        return;
      }
      renderInvoiceDrawer();
      renderProductSheet();
    });
  });
}

function renderCustomerSheet() {
  const term = customerSearchInput.value.trim().toLowerCase();
  const customers = state.customers.filter((customer) =>
    customer.name.toLowerCase().includes(term) ||
    `${customer.phone || ""}`.toLowerCase().includes(term)
  );

  customerSheetList.innerHTML = customers.length
    ? customers
        .map(
          (customer) => `
            <article class="ledger-row" data-customer-id="${customer.id}">
              <div class="ledger-main">
                <div class="ledger-left">
                  <span class="avatar">${initials(customer.name)}</span>
                  <div>
                    <div class="ledger-name">${customer.name}</div>
                    <div class="ledger-meta">${customer.phone || customer.address || "No extra contact details"}</div>
                  </div>
                </div>
                <div class="worker-actions customer-sheet-actions">
                  <strong class="ledger-balance ${Number(customer.balance) > 0 ? "negative" : "positive"}">
                    ${currency(customer.balance)}
                  </strong>
                  <button class="chip chip-ghost" data-edit-sheet-customer-id="${customer.id}" type="button">Edit</button>
                </div>
              </div>
            </article>
          `
        )
        .join("")
    : `<article class="ledger-row"><div class="ledger-name">No matching customers.</div></article>`;

  customerSheetList.querySelectorAll("[data-customer-id]").forEach((node) => {
    node.addEventListener("click", () => {
      invoiceDraft.customerId = Number(node.dataset.customerId);
      renderInvoiceDrawer();
      customerSheet.close();
      renderProductSheet();
    });
  });

  customerSheetList.querySelectorAll("[data-edit-sheet-customer-id]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      const customer = state.customers.find((entry) => entry.id === Number(node.dataset.editSheetCustomerId));
      if (customer) {
        openInvoiceCustomerModal(customer);
      }
    });
  });
}

function openInvoiceCustomerModal(customer = null) {
  openModal("customer", {
    customer,
    invoiceContext: true
  });
}

function renderProductInsights() {
  const frequent = getFrequentlySoldProducts();
  const lastOrderItems = getLastOrderItemsForCustomer();

  const frequentHtml = frequent.length
    ? `<div><p class="mini-label">Frequently Sold</p>${frequent
        .map((product) => `<span class="insight-chip">${product.name || `Product #${product.id}`}</span>`)
        .join("")}</div>`
    : "";

  const lastOrderHtml = lastOrderItems.length
    ? `<div><p class="mini-label">Last Order Items</p>${lastOrderItems
        .map((item) => `<span class="insight-chip">${item.product?.name || `Product #${item.productId}`} x${item.quantity}</span>`)
        .join("")}</div>`
    : `<div><p class="mini-label">Last Order Items</p><span class="shortcut-note">Select a customer to see history.</span></div>`;

  productInsights.innerHTML = frequentHtml + lastOrderHtml;
}

function renderProductSheet() {
  const term = productSheetSearchInput.value.trim().toLowerCase();
  const products = getSortedProducts().filter((product) =>
    `${product.name || ""}`.toLowerCase().includes(term)
  );

  renderProductInsights();

  productSheetList.innerHTML = products.length
    ? products
        .map((product) => {
          const stock = Number(product.stock);
          const negative = stock < 0;
          const selectedQty = draftQuantity(product.id);
          const suggestedQty = getSuggestedQuantity(product.id);
          const projectedStock = stock - selectedQty;
          const warning = projectedStock < 0 ? "Warning: stock will go negative" : "";
          return `
            <article class="inventory-row${negative ? " negative" : ""}">
              <div class="inventory-top">
                <strong>${product.name || `Untitled Product #${product.id}`}</strong>
                <span class="amount-main">${currency(product.price)}</span>
              </div>
              <div class="inventory-bottom">
                <span class="inventory-meta ${negative ? "negative-stock" : ""}">Stock: ${stock}</span>
                <div class="qty-control" data-sheet-product-id="${product.id}">
                  <button class="qty-btn" data-sheet-action="decrease" type="button">-</button>
                  <span class="qty-value">${selectedQty}</span>
                  <button class="qty-btn" data-sheet-action="increase" type="button">+</button>
                </div>
              </div>
              <div class="shortcut-note">${warning || `Suggested qty: ${suggestedQty}`}</div>
            </article>
          `;
        })
        .join("")
    : `<article class="inventory-row"><strong>No products found.</strong></article>`;

  productSheetList.querySelectorAll("[data-sheet-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = Number(button.parentElement.dataset.sheetProductId);
      const current = draftQuantity(productId);
      const suggestedQty = getSuggestedQuantity(productId);
      if (button.dataset.sheetAction === "increase") {
        setDraftQuantity(productId, current > 0 ? current + 1 : suggestedQty);
      } else {
        setDraftQuantity(productId, current - 1);
      }
      renderProductSheet();
      renderInvoiceDrawer();
    });
  });
}

function openInvoiceDrawer() {
  if (!invoiceDraft.customerId && state.customers[0]) {
    invoiceDraft.customerId = state.customers[0].id;
  }
  clearInvoiceSubmitMessage();
  syncInvoiceBaseline();
  renderInvoiceDrawer();
  invoiceDrawer.showModal();
  pushNavState();
}

function startInvoiceEdit(invoice) {
  invoiceDraft = {
    invoiceId: invoice.id,
    customerId: invoice.customerId,
    items: (invoice.items || []).map((item) => ({
      productId: item.productId,
      quantity: Number(item.quantity)
    })),
    roundOff: false
  };
  clearInvoiceSubmitMessage();
  syncInvoiceBaseline();
  renderInvoiceDrawer();
  invoiceDrawer.showModal();
  pushNavState();
}

function openCustomerSelectionSheet() {
  renderCustomerSheet();
  customerSheet.showModal();
  pushNavState();
}

function openProductSelectionSheet() {
  renderProductSheet();
  productSheet.showModal();
  pushNavState();
}

function openInvoiceProductModal(product = null) {
  openModal("product", {
    product,
    invoiceContext: true,
    requireName: true
  });
}

async function submitInvoiceDraft() {
  const isEditing = Boolean(invoiceDraft.invoiceId);
  console.log(isEditing ? "Update clicked" : "Create clicked");
  logClick(isEditing ? "update-invoice" : "create-invoice", {
    invoiceId: invoiceDraft.invoiceId,
    customerId: invoiceDraft.customerId,
    itemCount: invoiceDraft.items.length,
    disabled: createInvoiceBtn.disabled
  });

  if (invoiceSubmitting) {
    return;
  }

  const payload = getInvoicePayload();
  console.log("payload", payload);
  clearInvoiceSubmitMessage();

  if (!payload.customerId) {
    showInvoiceSubmitMessage("Select a customer first.", true);
    showMessage("Select a customer first.", true);
    return;
  }

  if (!payload.items.length) {
    showInvoiceSubmitMessage("Add at least one product with quantity.", true);
    showMessage("Add at least one product.", true);
    return;
  }

  invoiceSubmitting = true;
  showInvoiceSubmitMessage(isEditing ? "Updating invoice..." : "Creating invoice...");
  renderInvoiceDrawer();

  try {
    const response = await apiRequest(isEditing ? `/api/invoices/${invoiceDraft.invoiceId}` : "/api/invoices", {
      method: isEditing ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        customerId: payload.customerId,
        items: payload.items,
        gstRate: payload.gstRate,
        total: payload.totalAmount
      })
    });

    state.selectedInvoiceId = response.data.id;
    invoiceDrawer.close();
    productSheet.close();
    customerSheet.close();
    invoiceDraft = {
      invoiceId: null,
      customerId: null,
      items: [],
      roundOff: false
    };
    invoiceDraftBaseline = null;
    clearInvoiceSubmitMessage();
    await loadDashboard();
    showMessage(
      `Invoice ${invoiceCode(response.data)} ${isEditing ? "updated" : "created"} successfully.`
    );
    selectScreen("detail", { skipHistory: true });
  } catch (error) {
    showInvoiceSubmitMessage(error.message, true);
    showMessage(error.message, true);
    console.log("[Billr] create-invoice failure", { message: error.message, payload });
  } finally {
    invoiceSubmitting = false;
    renderInvoiceDrawer();
  }
}

window.createInvoice = submitInvoiceDraft;

function renderAll() {
  renderVisibility();
  updateFabs();
  renderSalesScreen();
  renderInventoryScreen();
  renderLedgerScreen();
  renderDetailScreen();
  renderSettingsScreen();
  renderCustomerLedgerSheet();
}

async function loadDashboard(showToast = false) {
  setSyncState("Syncing");
  const [meRes, customersRes, productsRes, invoicesRes, paymentsRes] = await Promise.all([
    apiRequest("/api/auth/me", { headers: authHeaders() }),
    apiRequest("/api/customers", { headers: authHeaders() }),
    apiRequest("/api/products", { headers: authHeaders() }),
    apiRequest("/api/invoices?limit=50", { headers: authHeaders() }),
    apiRequest("/api/payments", { headers: authHeaders() })
  ]);

  state.user = meRes.data;
  localStorage.setItem("billr_user", JSON.stringify(state.user));
  state.customers = customersRes.data;
  state.products = productsRes.data;
  state.invoices = invoicesRes.data;
  state.payments = paymentsRes.data;
  state.companyProfile = isAdmin()
    ? (await apiRequest("/api/settings/company", { headers: authHeaders() })).data
    : null;
  state.gstSettings = isAdmin()
    ? (await apiRequest("/api/settings/gst", { headers: authHeaders() })).data
    : null;
  state.workers = isAdmin()
    ? (await apiRequest("/api/auth/workers", { headers: authHeaders() })).data
    : [];
  try {
    await refreshNativePrinterState({ reconnect: true });
  } catch (error) {
    console.log("[Billr] printer state refresh failed", { message: error.message });
  }
  await fetchSalesInvoices();
  if (state.customerLedger.customerId) {
    state.customerLedger.customer =
      state.customers.find((customer) => customer.id === state.customerLedger.customerId) || null;
    if (state.customerLedger.customer) {
      await fetchCustomerLedgerInvoices();
    } else {
      state.customerLedger.customerId = null;
      state.customerLedger.invoices = [];
    }
  }
  if (!state.selectedInvoiceId && state.invoices[0]) {
    state.selectedInvoiceId = state.invoices[0].id;
  }
  renderAll();
  setSyncState("Synced");
  if (showToast) {
    showMessage("Cloud data refreshed.");
  }
}

function modalFieldHtml(type) {
  const modalMeta = arguments[1] || {};
  if (type === "invoice") {
    return `
      <label>
        <span>Customer</span>
        <select id="modalInvoiceCustomer">
          ${state.customers.map((customer) => `<option value="${customer.id}">${customer.name}</option>`).join("")}
        </select>
      </label>
      <div class="invoice-items-draft">
        <div class="draft-row">
          <select class="draft-product">
            ${state.products.map((product) => `<option value="${product.id}">${product.name || `Untitled Product #${product.id}`} - ${currency(product.price)}</option>`).join("")}
          </select>
          <input class="draft-quantity" type="number" min="1" value="1" />
        </div>
        <div class="draft-row">
          <select class="draft-product">
            ${state.products.map((product) => `<option value="${product.id}">${product.name || `Untitled Product #${product.id}`} - ${currency(product.price)}</option>`).join("")}
          </select>
          <input class="draft-quantity" type="number" min="1" value="1" />
        </div>
      </div>
    `;
  }

  if (type === "customer") {
    const customer = modalMeta.customer || {};
    return `
      <label><span>Name</span><input id="modalCustomerName" type="text" value="${escapeHtml(customer.name || "")}" required /></label>
      <label><span>Phone</span><input id="modalCustomerPhone" type="text" value="${escapeHtml(customer.phone || "")}" /></label>
      <label><span>Address</span><input id="modalCustomerAddress" type="text" value="${escapeHtml(customer.address || "")}" /></label>
    `;
  }

  if (type === "product") {
    const product = modalMeta.product || {};
    const unitMatch = typeof product.name === "string" ? product.name.match(/^(.*?)(?:\s+\(([^)]+)\))?$/) : null;
    const baseName = unitMatch?.[1]?.trim() || product.name || "";
    const baseUnit = unitMatch?.[2]?.trim() || "";
    return `
      <label><span>Name</span><input id="modalProductName" type="text" value="${escapeHtml(baseName)}" ${modalMeta.requireName ? "required" : ""} /></label>
      <label><span>Price</span><input id="modalProductPrice" type="number" min="0.01" step="0.01" value="${product.price ?? ""}" required /></label>
      <label><span>Unit</span><input id="modalProductUnit" type="text" value="${escapeHtml(baseUnit)}" placeholder="Optional" /></label>
      ${isAdmin() ? `<label><span>GST Rate</span><input id="modalProductGstRate" type="number" min="0" step="0.01" value="${product.gstRate ?? ""}" /></label>` : ""}
      <label><span>Stock</span><input id="modalProductStock" type="number" step="1" value="${product.stock ?? 0}" /></label>
    `;
  }

  if (type === "change-password") {
    return `
      <label><span>Current Password</span><input id="modalCurrentPassword" type="password" required /></label>
      <label><span>New Password</span><input id="modalNewPassword" type="password" minlength="6" required /></label>
      <label><span>Confirm New Password</span><input id="modalConfirmPassword" type="password" minlength="6" required /></label>
    `;
  }

  if (type === "worker") {
    return `
      <label><span>Name</span><input id="modalWorkerName" type="text" required /></label>
      <label><span>Phone</span><input id="modalWorkerPhone" type="text" /></label>
      <label><span>Email</span><input id="modalWorkerEmail" type="email" /></label>
      <label><span>Initial Password</span><input id="modalWorkerPassword" type="password" minlength="6" required /></label>
    `;
  }

  if (type === "reset-worker-password") {
    const workerOptions = state.workers
      .filter((worker) => worker.isActive)
      .map(
        (worker) =>
          `<option value="${worker.id}" ${worker.id === pendingResetWorkerId ? "selected" : ""}>${worker.name} (${userLoginId(worker)})</option>`
      )
      .join("");

    return `
      <label>
        <span>Staff</span>
        <select id="modalResetWorkerId">
          ${workerOptions}
        </select>
      </label>
      <label><span>New Password</span><input id="modalResetWorkerPassword" type="password" minlength="6" required /></label>
      <p class="support-text">Admin can reset a staff password without the old password.</p>
    `;
  }

  return `
    <label>
      <span>Customer</span>
      <select id="modalPaymentCustomer">
        ${state.customers.map((customer) => `<option value="${customer.id}">${customer.name}</option>`).join("")}
      </select>
    </label>
    <label><span>Amount</span><input id="modalPaymentAmount" type="number" min="0.01" step="0.01" required /></label>
    <label>
      <span>Method</span>
      <select id="modalPaymentMethod">
        <option value="cash">Cash</option>
        <option value="upi">UPI</option>
        <option value="bank">Bank Transfer</option>
        <option value="card">Card</option>
      </select>
    </label>
  `;
}

function openModal(type, meta = {}) {
  const config = {
    invoice: { label: "Sales", title: "New Invoice" },
    customer: { label: "Ledger", title: meta.customer ? "Edit Customer" : "New Customer" },
    product: { label: "Inventory", title: meta.product ? "Edit Product" : "New Product" },
    payment: { label: "Collections", title: "Record Payment" },
    "change-password": { label: "Settings", title: "Change Password" },
    worker: { label: "Admin Controls", title: "Add Staff" },
    "reset-worker-password": { label: "Admin Controls", title: "Reset Staff Password" }
  }[type];

  modalLabel.textContent = config.label;
  modalTitle.textContent = config.title;
  modalFields.innerHTML = modalFieldHtml(type, meta);
  modalSubmitBtn.classList.remove("hidden");
  modalSubmitHandler = async () => {
    try {
      if (type === "invoice") {
        const items = [...modalFields.querySelectorAll(".draft-row")].map((row) => ({
          productId: Number(row.querySelector(".draft-product").value),
          quantity: Number(row.querySelector(".draft-quantity").value)
        }));
        const response = await apiRequest("/api/invoices", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            customerId: Number(document.getElementById("modalInvoiceCustomer").value),
            items
          })
        });
        state.selectedInvoiceId = response.data.id;
        showMessage(`Invoice ${invoiceCode(response.data)} created.`);
      } else if (type === "customer") {
        const response = await apiRequest(meta.customer ? `/api/customers/${meta.customer.id}` : "/api/customers", {
          method: meta.customer ? "PUT" : "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            name: document.getElementById("modalCustomerName").value.trim(),
            phone: document.getElementById("modalCustomerPhone").value.trim(),
            address: document.getElementById("modalCustomerAddress").value.trim()
          })
        });
        const savedCustomer = response.data;
        state.customers = meta.customer
          ? state.customers.map((customer) => (customer.id === savedCustomer.id ? savedCustomer : customer))
          : [savedCustomer, ...state.customers];
        if (meta.invoiceContext) {
          invoiceDraft.customerId = savedCustomer.id;
        }
        showMessage(`Customer ${savedCustomer.name} ${meta.customer ? "updated" : "created"}.`);
        if (typeof meta.onSuccess === "function") {
          await meta.onSuccess(savedCustomer);
        }
      } else if (type === "product") {
        const rawName = document.getElementById("modalProductName").value.trim();
        const unit = document.getElementById("modalProductUnit")?.value.trim();
        if ((meta.requireName || meta.invoiceContext) && !rawName) {
          throw new Error("Product name is required");
        }
        const formattedName = rawName ? (unit ? `${rawName} (${unit})` : rawName) : null;
        const response = await apiRequest(meta.product ? `/api/products/${meta.product.id}` : "/api/products", {
          method: meta.product ? "PUT" : "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            name: formattedName,
            price: Number(document.getElementById("modalProductPrice").value),
            gstRate: document.getElementById("modalProductGstRate")?.value ?? undefined,
            stock: document.getElementById("modalProductStock").value
          })
        });
        const savedProduct = response.data;
        state.products = meta.product
          ? state.products.map((product) => (product.id === savedProduct.id ? savedProduct : product))
          : [savedProduct, ...state.products];
        if (meta.invoiceContext) {
          setDraftQuantity(savedProduct.id, Math.max(1, draftQuantity(savedProduct.id)));
        }
        showMessage(`Product ${savedProduct.name || `#${savedProduct.id}`} ${meta.product ? "updated" : "created"}.`);
      } else if (type === "change-password") {
        await apiRequest("/api/auth/change-password", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            currentPassword: document.getElementById("modalCurrentPassword").value,
            newPassword: document.getElementById("modalNewPassword").value,
            confirmNewPassword: document.getElementById("modalConfirmPassword").value
          })
        });
        showMessage("Password changed successfully.");
      } else if (type === "worker") {
        const response = await apiRequest("/api/auth/workers", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            name: document.getElementById("modalWorkerName").value.trim(),
            phone: document.getElementById("modalWorkerPhone").value.trim(),
            email: document.getElementById("modalWorkerEmail").value.trim(),
            password: document.getElementById("modalWorkerPassword").value
          })
        });
        showMessage(`Staff ${response.data.name} created.`);
      } else if (type === "reset-worker-password") {
        const resetWorkerId = Number(document.getElementById("modalResetWorkerId")?.value || meta.workerId);
        await apiRequest(`/api/auth/workers/${resetWorkerId}/reset-password`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            newPassword: document.getElementById("modalResetWorkerPassword").value
          })
        });
        pendingResetWorkerId = null;
        showMessage("Staff password reset successfully.");
      } else {
        const response = await apiRequest("/api/payments", {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            customerId: Number(document.getElementById("modalPaymentCustomer").value),
            amount: Number(document.getElementById("modalPaymentAmount").value),
            method: document.getElementById("modalPaymentMethod").value
          })
        });
        showMessage(`Payment #${response.data.id} recorded.`);
      }

      entryModal.close();
      await loadDashboard();
      if (type === "customer" && meta.invoiceContext) {
        renderInvoiceDrawer();
        if (customerSheet?.open) {
          renderCustomerSheet();
        }
      } else if (type === "product" && meta.invoiceContext) {
        renderInvoiceDrawer();
        if (productSheet?.open) {
          renderProductSheet();
        }
      }
    } catch (error) {
      showMessage(error.message, true);
    }
  };

  entryModal.showModal();
}

function closeModal() {
  modalSubmitBtn.classList.remove("hidden");
  entryModal.close();
}

async function login(event) {
  event.preventDefault();
  authMessage.textContent = "Signing in...";
  try {
    const response = await apiRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: identifierInput.value.trim(),
        password: passwordInput.value
      })
    });
    state.token = response.data.token;
    state.user = response.data.user;
    localStorage.setItem("billr_token", state.token);
    localStorage.setItem("billr_user", JSON.stringify(state.user));
    authMessage.textContent = "";
    renderVisibility();
    await loadDashboard();
    selectScreen("sales");
    if (syncInterval) {
      clearInterval(syncInterval);
    }
    syncInterval = setInterval(() => {
      loadDashboard().catch(() => {});
    }, 15000);
  } catch (error) {
    authMessage.textContent = error.message;
  }
}

function logout() {
  state.token = "";
  state.user = null;
  state.companyProfile = null;
  state.workers = [];
  state.customers = [];
  state.products = [];
  state.invoices = [];
  state.payments = [];
  state.printer = {
    available: false,
    platform: "web",
    connected: false,
    savedPrinter: null,
    pairedDevices: []
  };
  localStorage.removeItem("billr_token");
  localStorage.removeItem("billr_user");
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  closeSettingsMenu();
  clearMessage();
  renderVisibility();
  authMessage.textContent = "";
  resetLoginFields();
}

function handleAppBackNavigation() {
  if (productSheet?.open) {
    productSheet.close();
    replaceNavState();
    return true;
  }

  if (customerSheet?.open) {
    customerSheet.close();
    replaceNavState();
    return true;
  }

  if (customerLedgerSheet?.open) {
    customerLedgerSheet.close();
    replaceNavState();
    return true;
  }

  if (entryModal?.open) {
    entryModal.close();
    replaceNavState();
    return true;
  }

  if (invoiceDrawer?.open) {
    if (isInvoiceDraftDirty()) {
      const discard = window.confirm("Discard changes?");
      if (!discard) {
        pushNavState();
        return true;
      }
    }
    invoiceDrawer.close();
    productSheet.close();
    customerSheet.close();
    customerLedgerSheet.close();
    clearInvoiceSubmitMessage();
    replaceNavState();
    return true;
  }

  if (state.activeScreen === "detail") {
    selectScreen("sales", { skipHistory: true });
    return true;
  }

  if (state.activeScreen !== "sales") {
    selectScreen("sales", { skipHistory: true });
    return true;
  }

  if (state.activeScreen === "sales") {
    const shouldExit = window.confirm("Exit app?");
    if (!shouldExit) {
      pushNavState();
      return true;
    }

    allowBrowserExit = true;
    try {
      window.close();
    } catch (_error) {
      // Browser may block close; continue to history navigation attempt.
    }
    setTimeout(() => {
      allowBrowserExit = false;
      pushNavState();
    }, 250);
    return false;
  }

  return false;
}

loginForm.addEventListener("submit", login);
settingsRefreshBtn?.addEventListener("click", async () => {
  logClick("refresh");
  closeSettingsMenu();
  try {
    await loadDashboard(true);
  } catch (error) {
    showMessage(error.message, true);
  }
});
settingsMenuBtn?.addEventListener("click", (event) => {
  event.stopPropagation();
  logClick("settings-menu");
  toggleSettingsMenu();
});
workerChangePasswordBtn?.addEventListener("click", () => {
  logClick("worker-change-password");
  openModal("change-password");
});
workerLogoutBtn?.addEventListener("click", () => {
  logClick("worker-logout");
  logout();
});
settingsLogoutBtn?.addEventListener("click", () => {
  logClick("settings-logout");
  closeSettingsMenu();
  logout();
});
changePasswordBtn?.addEventListener("click", () => {
  logClick("change-password");
  openModal("change-password");
});
settingsChangePasswordBtn?.addEventListener("click", () => {
  logClick("settings-change-password");
  closeSettingsMenu();
  openModal("change-password");
});
addWorkerBtn?.addEventListener("click", () => {
  logClick("add-worker");
  openModal("worker");
});
settingsAddWorkerBtn?.addEventListener("click", () => {
  logClick("settings-add-worker");
  closeSettingsMenu();
  openModal("worker");
});
settingsUserManagementBtn?.addEventListener("click", () => {
  logClick("settings-user-management");
  closeSettingsMenu();
  selectScreen("settings");
  userManagementSection?.scrollIntoView({ behavior: "smooth", block: "start" });
});
settingsOpenPanelBtn?.addEventListener("click", () => {
  logClick("settings-open");
  closeSettingsMenu();
  selectScreen("settings");
});
settingsSyncBtn?.addEventListener("click", async () => {
  logClick("settings-sync");
  closeSettingsMenu();
  try {
    await loadDashboard(true);
  } catch (error) {
    showMessage(error.message, true);
  }
});
settingsResetWorkerBtn?.addEventListener("click", () => {
  logClick("settings-reset-worker");
  closeSettingsMenu();
  if (!state.workers.some((worker) => worker.isActive)) {
    showMessage("No active staff available to reset.", true);
    return;
  }
  pendingResetWorkerId = state.workers.find((worker) => worker.isActive)?.id || null;
  openModal("reset-worker-password");
});
printerScanBtn?.addEventListener("click", async () => {
  logClick("printer-scan");
  try {
    await refreshNativePrinterState({ scan: true });
    showMessage("Paired Bluetooth printers loaded.");
  } catch (error) {
    showMessage(error.message, true);
  }
});
printerReconnectBtn?.addEventListener("click", async () => {
  logClick("printer-reconnect");
  try {
    await refreshNativePrinterState({ reconnect: true, scan: true });
    showMessage(state.printer.connected ? "Printer connected." : "Reconnect attempted.");
  } catch (error) {
    showMessage(error.message, true);
  }
});
printerClearBtn?.addEventListener("click", async () => {
  logClick("printer-clear");
  try {
    await clearNativePrinterSelection();
    showMessage("Saved printer cleared.");
  } catch (error) {
    showMessage(error.message, true);
  }
});
[themeDarkBtn, themePanelDarkBtn].forEach((button) => {
  button?.addEventListener("click", () => {
    logClick("theme-dark");
    applyTheme("dark");
  });
});
[themeLightBtn, themePanelLightBtn].forEach((button) => {
  button?.addEventListener("click", () => {
    logClick("theme-light");
    applyTheme("light");
  });
});
[workerThemeDarkBtn].forEach((button) => {
  button?.addEventListener("click", () => {
    logClick("worker-theme-dark");
    applyTheme("dark");
  });
});
[workerThemeLightBtn].forEach((button) => {
  button?.addEventListener("click", () => {
    logClick("worker-theme-light");
    applyTheme("light");
  });
});
companyLogoInput?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    return;
  }
  try {
    pendingCompanyLogoDataUrl = await resizeImageToJpegDataUrl(file);
    setCompanyLogoPreview(pendingCompanyLogoDataUrl);
    showMessage("Company logo is ready to save.");
  } catch (error) {
    showMessage(error.message, true);
  }
});
saveCompanyProfileBtn?.addEventListener("click", async () => {
  logClick("save-company-profile");
  try {
    await apiRequest("/api/settings/company", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        companyName: companyNameInput.value.trim(),
        logoDataUrl: pendingCompanyLogoDataUrl || null,
        address: companyAddressInput.value.trim(),
        phone: companyPhoneInput.value.trim(),
        email: companyEmailInput.value.trim(),
        gstNumber: companyGstNumberInput.value.trim(),
        bankDetails: companyBankDetailsInput.value.trim(),
        termsAndConditions: companyTermsInput.value.trim()
      })
    });
    await loadDashboard();
    showMessage("Company profile saved successfully.");
  } catch (error) {
    showMessage(error.message, true);
  }
});
salesDateFilter?.addEventListener("change", async (event) => {
  state.salesDateFilter = event.target.value;
  const range = getDateFilterConfig(state.salesDateFilter, state.salesCustomStart, state.salesCustomEnd);
  state.salesDateLabel = range.label;
  state.salesCustomStart = range.startDate;
  state.salesCustomEnd = range.endDate;
  await fetchSalesInvoices();
  renderSalesScreen();
});
[salesStartDate, salesEndDate].forEach((input) => {
  input?.addEventListener("change", async () => {
    state.salesCustomStart = salesStartDate?.value || "";
    state.salesCustomEnd = salesEndDate?.value || "";
    if (state.salesDateFilter === "CUSTOM") {
      await fetchSalesInvoices();
      renderSalesScreen();
    }
  });
});
invoiceGstRateInput?.addEventListener("input", () => {
  invoiceGstRateInput.dataset.touched = "true";
  renderInvoiceDrawer();
});
saveGstSettingsBtn?.addEventListener("click", async () => {
  logClick("save-gst-settings");
  try {
    const selectedCustomerIds = [...document.querySelectorAll(".gst-customer-check:checked")].map((node) =>
      Number(node.value)
    );
    await apiRequest("/api/settings/gst", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        gstEnabled: gstEnabledToggle.checked,
        gstMode: gstModeSelect.value,
        defaultGstRate: Number(defaultGstRateInput.value || 0),
        gstNumber: gstNumberInput.value.trim(),
        gstType: gstTypeSelect.value,
        selectedCustomerIds
      })
    });
    await loadDashboard();
    showMessage("GST settings saved successfully.");
  } catch (error) {
    showMessage(error.message, true);
  }
});
[invoiceDrawer, customerSheet, customerLedgerSheet, productSheet, entryModal].forEach((dialog) => {
  dialog?.addEventListener("cancel", (event) => {
    event.preventDefault();
    handleAppBackNavigation();
  });
});
document.addEventListener("click", (event) => {
  if (!settingsMenu || !settingsMenuBtn) {
    return;
  }
  if (!settingsMenu.contains(event.target) && !settingsMenuBtn.contains(event.target)) {
    closeSettingsMenu();
  }
});

document.querySelectorAll(".main-tab").forEach((button) => {
  button.addEventListener("click", () => selectScreen(button.dataset.screen));
});

document.querySelectorAll(".status-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    state.invoiceStatusFilter = chip.dataset.statusFilter;
    renderSalesScreen();
  });
});

document.querySelectorAll(".ledger-tab").forEach((button) => {
  button.addEventListener("click", () => {
    state.ledgerTab = button.dataset.ledgerTab;
    document.querySelectorAll(".ledger-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.ledgerTab === state.ledgerTab);
    });
    renderLedgerScreen();
    updateFabs();
  });
});

productSearchInput.addEventListener("input", (event) => {
  state.productSearch = event.target.value;
  renderInventoryScreen();
});

productSortBtn.addEventListener("click", () => {
  state.productSort = state.productSort === "stock" ? "price" : "stock";
  productSortBtn.textContent = `Sort: ${state.productSort === "stock" ? "Stock" : "Price"}`;
  renderInventoryScreen();
});

productFilterBtn.addEventListener("click", () => {
  state.onlyNegativeStock = !state.onlyNegativeStock;
  productFilterBtn.textContent = `Filter: ${state.onlyNegativeStock ? "Negative" : "All"}`;
  renderInventoryScreen();
});

primaryFab.addEventListener("click", () => {
  logClick("primary-fab", { screen: state.activeScreen });
  if (state.activeScreen === "sales" || state.activeScreen === "detail" || state.activeScreen === "settings") {
    invoiceDraft.invoiceId = null;
    openInvoiceDrawer();
  } else if (state.activeScreen === "inventory") {
    openModal("product");
  } else {
    openModal("customer");
  }
});

secondaryFab.addEventListener("click", () => {
  logClick("secondary-fab");
  openModal("payment");
});
customersShortcutBtn.addEventListener("click", () => {
  logClick("customers-shortcut");
  selectScreen("ledger");
});
productsShortcutBtn.addEventListener("click", () => {
  logClick("products-shortcut");
  selectScreen("inventory");
});
closeModalBtn.addEventListener("click", closeModal);
modalCancelBtn.addEventListener("click", closeModal);
modalSubmitBtn.addEventListener("click", async () => {
  logClick("modal-submit", { title: modalTitle.textContent });
  if (modalSubmitHandler) {
    await modalSubmitHandler();
  }
});
closeInvoiceDrawerBtn.addEventListener("click", () => {
  handleAppBackNavigation();
});
selectCustomerBtn.addEventListener("click", () => {
  logClick("select-customer");
  openCustomerSelectionSheet();
});
editSelectedCustomerBtn?.addEventListener("click", () => {
  const customer = state.customers.find((entry) => entry.id === invoiceDraft.customerId);
  logClick("edit-selected-customer", { customerId: customer?.id || null });
  if (customer) {
    openInvoiceCustomerModal(customer);
  }
});
openProductSheetBtn.addEventListener("click", () => {
  logClick("open-product-sheet");
  openProductSelectionSheet();
});
roundOffToggle.addEventListener("change", () => {
  logClick("round-off-toggle", { checked: roundOffToggle.checked });
  invoiceDraft.roundOff = roundOffToggle.checked;
  renderInvoiceDrawer();
});
closeCustomerSheetBtn.addEventListener("click", () => {
  handleAppBackNavigation();
});
customerSearchInput.addEventListener("input", renderCustomerSheet);
addCustomerFromSheetBtn?.addEventListener("click", () => {
  logClick("add-customer-from-sheet");
  openInvoiceCustomerModal();
});
closeCustomerLedgerSheetBtn?.addEventListener("click", () => {
  handleAppBackNavigation();
});
customerLedgerFilter?.addEventListener("change", async (event) => {
  state.customerLedger.filter = event.target.value;
  const range = getDateFilterConfig(
    state.customerLedger.filter,
    state.customerLedger.customStart,
    state.customerLedger.customEnd
  );
  state.customerLedger.filterLabel = range.label;
  state.customerLedger.customStart = range.startDate;
  state.customerLedger.customEnd = range.endDate;
  await fetchCustomerLedgerInvoices();
  renderCustomerLedgerSheet();
});
[customerLedgerStartDate, customerLedgerEndDate].forEach((input) => {
  input?.addEventListener("change", async () => {
    state.customerLedger.customStart = customerLedgerStartDate?.value || "";
    state.customerLedger.customEnd = customerLedgerEndDate?.value || "";
    if (state.customerLedger.filter === "CUSTOM") {
      await fetchCustomerLedgerInvoices();
      renderCustomerLedgerSheet();
    }
  });
});
closeProductSheetBtn.addEventListener("click", () => {
  handleAppBackNavigation();
});
productSheetSearchInput.addEventListener("input", renderProductSheet);
addProductFromSheetBtn?.addEventListener("click", () => {
  logClick("add-product-from-sheet");
  openInvoiceProductModal();
});
productSheetDoneBtn?.addEventListener("click", () => {
  logClick("product-sheet-done", { itemCount: invoiceDraft.items.length });
  productSheet.close();
  replaceNavState();
  renderInvoiceDrawer();
  createInvoiceBtn.focus();
});
createInvoiceBtn.onclick = submitInvoiceDraft;
editInvoiceBtn?.addEventListener("click", () => {
  if (!isAdmin()) {
    showMessage("Only admins can edit finalized invoices.", true);
    return;
  }
  const invoice = getSelectedInvoice();
  if (!invoice || invoice.status === "CANCELLED") {
    showMessage("Select an active invoice to edit.", true);
    return;
  }
  logClick("edit-invoice", { invoiceId: invoice.id });
  startInvoiceEdit(invoice);
});
window.addEventListener("popstate", () => {
  if (allowBrowserExit) {
    return;
  }
  suppressHistoryPush = true;
  try {
    const handled = handleAppBackNavigation();
    if (!handled) {
      replaceNavState();
    }
  } finally {
    suppressHistoryPush = false;
  }
});

invoiceActionButtons().forEach((button) => {
  button.addEventListener("click", async () => {
    const action = button.dataset.invoiceAction;
    try {
      await handleInvoiceAction(action);
    } catch (error) {
      showMessage(error.message || "Action failed", true);
    }
  });
});

applyTheme(state.theme);
renderVisibility();
resetLoginFields();
replaceNavState();
selectScreen(state.activeScreen, { skipHistory: true });

if (state.token) {
  loadDashboard()
    .then(() => {
      syncInterval = setInterval(() => {
        loadDashboard().catch(() => {});
      }, 15000);
    })
    .catch((error) => {
      logout();
      authMessage.textContent = error.message;
    });
}
