const supplierService = require("../services/supplierService");
const supplierPurchaseService = require("../services/supplierPurchaseService");

async function index(req, res, next) {
  try {
    const suppliers = await supplierService.listSuppliers(req.query);
    return res.json(suppliers);
  } catch (error) {
    return next(error);
  }
}

async function store(req, res, next) {
  try {
    const supplier = await supplierService.createSupplier(req.body);
    return res.status(201).json(supplier);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const supplier = await supplierService.updateSupplier(req.params.id, req.body);
    return res.json(supplier);
  } catch (error) {
    return next(error);
  }
}

async function destroy(req, res, next) {
  try {
    await supplierService.deleteSupplier(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function purchaseIndex(req, res, next) {
  try {
    const list = await supplierPurchaseService.listPurchasesBySupplier(req.params.id);
    return res.json(list);
  } catch (error) {
    return next(error);
  }
}

async function purchaseStore(req, res, next) {
  try {
    const row = await supplierPurchaseService.recordPurchase(req.params.id, req.body);
    return res.status(201).json(row);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  destroy,
  index,
  purchaseIndex,
  purchaseStore,
  store,
  update
};
