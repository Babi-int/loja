const userService = require("../services/userService");

async function index(req, res, next) {
  try {
    const users = await userService.listUsers();
    return res.json(users);
  } catch (error) {
    return next(error);
  }
}

async function store(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
}

async function destroy(req, res, next) {
  try {
    await userService.deleteUser(req.user.id, req.params.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  destroy,
  index,
  store
};
