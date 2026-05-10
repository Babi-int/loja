const saleService = require("../services/saleService");

async function index(req, res, next) {
  try {
    const sales = await saleService.listSales();
    return res.json(sales);
  } catch (error) {
    return next(error);
  }
}

async function store(req, res, next) {
  try {
    const sale = await saleService.createSale(req.body);
    return res.status(201).json(sale);
  } catch (error) {
    return next(error);
  }
}

async function cancel(req, res, next) {
  try {
    const sale = await saleService.cancelSale(req.params.id);
    return res.json(sale);
  } catch (error) {
    return next(error);
  }
}

async function partialReturn(req, res, next) {
  try {
    const sale = await saleService.registerPartialReturn(req.params.id, req.body);
    return res.json(sale);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  cancel,
  index,
  partialReturn,
  store
};
