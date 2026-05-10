const { db } = require("../database/firebase");

const settingsRef = db.collection("settings").doc("app");

const DEFAULT_SETTINGS = {
  storeName: "Maricota Kids",
  lowStockThreshold: 5,
  disallowSaleBelowCost: true,
  maxDiscountPercentFromList: 50
};

function mergeSettings(data) {
  const src = data || {};
  return {
    storeName: String(src.storeName ?? DEFAULT_SETTINGS.storeName).trim() || DEFAULT_SETTINGS.storeName,
    lowStockThreshold: Math.max(0, Math.floor(Number(src.lowStockThreshold ?? DEFAULT_SETTINGS.lowStockThreshold))),
    disallowSaleBelowCost: src.disallowSaleBelowCost !== false,
    maxDiscountPercentFromList: Math.min(
      100,
      Math.max(0, Number(src.maxDiscountPercentFromList ?? DEFAULT_SETTINGS.maxDiscountPercentFromList))
    )
  };
}

async function getSettings() {
  const snap = await settingsRef.get();
  if (!snap.exists) {
    return { ...DEFAULT_SETTINGS, id: "app" };
  }
  return { id: snap.id, ...mergeSettings(snap.data() || {}) };
}

async function updateSettings(body) {
  const current = await getSettings();
  const next = mergeSettings({ ...current, ...(body || {}) });
  const now = new Date().toISOString();
  await settingsRef.set(
    {
      ...next,
      updatedAt: now
    },
    { merge: true }
  );
  return getSettings();
}

module.exports = {
  DEFAULT_SETTINGS,
  getSettings,
  mergeSettings,
  updateSettings
};
