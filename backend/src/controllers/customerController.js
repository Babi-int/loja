const customerService = require("../services/customerService");

async function index(req, res, next) {
  try {
    const customers = await customerService.listCustomers(req.query);
    return res.json(customers);
  } catch (error) {
    return next(error);
  }
}

async function store(req, res, next) {
  try {
    const customer = await customerService.createCustomer(req.body);
    return res.status(201).json(customer);
  } catch (error) {
    return next(error);
  }
}

async function update(req, res, next) {
  try {
    const customer = await customerService.updateCustomer(req.params.id, req.body);
    return res.json(customer);
  } catch (error) {
    return next(error);
  }
}

async function destroy(req, res, next) {
  try {
    await customerService.deleteCustomer(req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  destroy,
  index,
  store,
  update
};
