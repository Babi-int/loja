const productService = require("../services/productService");
const inventoryService = require("../services/inventoryService");

async function index(req, res, next) {
  try {
    const products = await productService.listProducts(req.query);
    return res.json(products);
  } catch (error) {
    return next(error);
  }
}

async function store(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return res.json(product);
  } catch (error) {
    return next(error);
  }
}

async function destroy(req, res, next) {
  try {
    await productService.deleteProduct(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function stockAdjustment(req, res, next) {
  try {
    const result = await inventoryService.adjustStock(req.params.id, req.body);
    return res.json(result);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  destroy,
  index,
  stockAdjustment,
  store,
  update
};
