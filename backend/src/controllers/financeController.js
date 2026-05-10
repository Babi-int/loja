const financeService = require("../services/financeService");

async function summary(req, res, next) {
  try {
    const data = await financeService.getFinanceSummary();
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function dashboard(req, res, next) {
  try {
    const data = await financeService.getDashboardSummary(req.query);
    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  dashboard,
  summary
};
