const express = require("express");
const router = express.Router();
const { check } = require("express-validator");

const userController = require("../controllers/users-controller");
const checkAuth = require("../middleware/check-auth");

router.post(
  "/signup",
  [
    check("username").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  userController.signUp
);

router.post("/login", userController.login);

router.post("/editrestinfo", userController.editRestInfo);

router.post("/editrestprofileinfo", userController.editRestProfileInfo);

router.post("/addfooditem", userController.addFoodItem);
router.post("/uploadfoodimage", userController.uploadFoodImage);

router.delete("/deletecategory/:id", userController.deleteCategory);
router.delete("/deletefood/:id", userController.deleteFood);

router.get("/orders/:userid", userController.getActiveOrders);
router.get("/completedorders/:userid", userController.getCompletedOrders);
router.post("/updateorderstatus", userController.updateOrderStatus);

router.use(checkAuth);

router.post("/", userController.getUserProfile);

module.exports = router;
