const settingsService = require("../services/settingsService");

async function show(req, res, next) {
  try {
    const settings = await settingsService.getSettings();
    return res.json(settings);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const settings = await settingsService.updateSettings(req.body || {});
    return res.json(settings);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  show,
  update
};
