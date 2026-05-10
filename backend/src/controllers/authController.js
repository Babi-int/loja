const authService = require("../services/authService");

async function login(req, res, next) {
  try {
    const response = await authService.login(req.body);
    return res.json(response);
  } catch (error) {
    return next(error);
  }
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = {
  login,
  me
};
