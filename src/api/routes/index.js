const express = require("express");
const router = express.Router();
const passport = require("passport");
const controller = require("../controllers");
const { apiAuth, validation } = require("../middlewares");

// Routes list
const routes = [
  //Auth
  {
    method: "POST",
    path: "/register",
    handler: "AuthController.register"
  },
  {
    method: "POST",
    path: "/login",
    handler: "AuthController.login"
  },
  {
    method: "POST",
    path: "/forgot-password",
    handler: "AuthController.forgotPassword"
  },
  {
    method: "POST",
    path: "/reset-password",
    handler: "AuthController.resetPassword"
  },
  {
    method: "GET",
    path: "/user-profile",
    handler: "AuthController.getMyDetail",
    authenticate: true
  },
  {
    method: "PUT",
    path: "/user-profile",
    handler: "UserController.updateProfile",
    authenticate: true
  },
  {
    method: "GET",
    path: "/logout",
    handler: "AuthController.logout",
    authenticate: true
  },
  {
    method: "GET",
    path: "/user-verify-email",
    handler: "AuthController.verifyEmail"
  },
  {
    method: "POST",
    path: "/user-profile-extra-fields",
    handler: "UserController.extraFieldCreate",
    authenticate: true
  },
  {
    method: "PUT",
    path: "/user-profile-extra-fields",
    handler: "UserController.extraFieldUpdate",
    authenticate: true
  }
];

// Applying routes
routes.forEach(route => {
  const handler = route.handler.split(".");

  let middleware = [(req, res, next) => next()];
  let validationMiddlware = (req, res, next) => {
    validation.validate(req.body, handler);
    next();
  };

  if (route.authenticate) {
    middleware.push(apiAuth);
    middleware.push(passport.authenticate("jwt", { session: false }));
  }

  // Validators
  if (!["get", "delete"].includes(route.method.toLowerCase())) {
    middleware.push(validationMiddlware);
  }

  router[route.method.toLowerCase()](
    route.path,
    ...middleware,
    controller[handler[0]][handler[1]]
  );
});

exports.router = router;
