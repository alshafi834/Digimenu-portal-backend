const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/users-model");
const Order = require("../models/order-model");

const upload = require("../services/file-upload");
const singleUpload = upload.single("image");

//Get the userlist
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    const err = new HttpError("Couldnt fetch user, please try again", 500);
    return next(err);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

//Sign up functionality
const signUp = async (req, res, next) => {
  console.log("entering here");
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { username, address, phone, email, password } = req.body;

  let isUserExist;
  try {
    isUserExist = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Signup failed, please try again", 500);
    return next(err);
  }
  if (isUserExist) {
    const error = new HttpError(
      "User exists already, please login instead",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    const err = new HttpError("Could not create user, please try again!", 500);
    return next(error);
  }
  const createdUser = new User({
    username,
    address,
    phone,
    email,
    password: hashedPassword,
  });

  try {
    await createdUser.save();
  } catch (error) {
    const err = new HttpError("Signing up failed, please try again", 500);
    return next(err);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      "supersecret_boiler",
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Signing up failed, please try again!", 500);
    return next(err);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

//Login functionality
const login = async (req, res, next) => {
  const { email, password } = req.body;

  let isUserExist;
  try {
    isUserExist = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Login failed, please try again", 500);
    return next(err);
  }

  if (!isUserExist) {
    const error = new HttpError("Invalid username or password, try again", 401);
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, isUserExist.password);
  } catch (error) {
    const err = new HttpError(
      "Could not log in, pleas check your credentials",
      500
    );
    return next(err);
  }

  if (!isValidPassword) {
    const error = new HttpError("Invalid username or password, try again", 401);
    return next(error);
  }

  let token;
  try {
    token = jwt.sign(
      { userId: isUserExist.id, email: isUserExist.email },
      "supersecret_boiler",
      { expiresIn: "1h" }
    );
  } catch (error) {
    const err = new HttpError("Login failed, please try again!", 500);
    return next(err);
  }

  res.json({ userId: isUserExist.id, email: isUserExist.email, token: token });
};

const getUserProfile = async (req, res, next) => {
  const { userID } = req.body;
  let userProfileInfo;

  try {
    userProfileInfo = await User.findOne({ _id: userID });
  } catch (error) {
    const err = new HttpError("Could not find the user with this email", 500);
    return next(err);
  }

  //console.log(userProfileInfo);
  res.json(userProfileInfo);
};

const editRestInfo = async (req, res, next) => {
  console.log(req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { email, category } = req.body;

  let isUserExist;
  try {
    isUserExist = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Invalid User", 500);
    return next(err);
  }

  /* let newCat = { catName: category };

  User.findOneAndUpdate({ email: email }, { $push: { categories: newCat } }); */

  var objFriends = { catName: category };
  User.findOneAndUpdate(
    { email: email },
    { $push: { categories: objFriends } },
    { new: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("here is the suc", success);
        res.status(201).json(success.categories);
      }
    }
  );

  /* isUserExist.username = username;
  isUserExist.age = age;
  isUserExist.height = height;
  isUserExist.weight = weight; */
  //isUserExist.categories = newCat;

  /* if (isUserExist) {
    try {
      await isUserExist.save();
    } catch (error) {
      const err = new HttpError(
        "Couldn't update the user info, try again later",
        500
      );
      return next(err);
    }
  } */

  //res.status(201).json({ msg: "userinfo updated" });
};

const addFoodItem = async (req, res, next) => {
  console.log("here is the food", req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { email, foodName, foodPrice, foodImage, category } = req.body;

  let isUserExist;
  try {
    isUserExist = await User.findOne({ email: email });
  } catch (error) {
    const err = new HttpError("Invalid User", 500);
    return next(err);
  }

  var objFriends = {
    foodName: foodName,
    foodPrice: foodPrice,
    foodImage: foodImage,
    foodCategory: category,
  };
  User.findOneAndUpdate(
    { email: email },
    { $push: { fooditems: objFriends } },
    { new: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("here is the suc", success);
        res.status(201).json(success);
      }
    }
  );
};

const editRestProfileInfo = async (req, res, next) => {
  console.log(req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { restproInfo } = req.body;

  let isUserExist;
  try {
    isUserExist = await User.findOne({ email: restproInfo.email });
  } catch (error) {
    const err = new HttpError("Invalid User", 500);
    return next(err);
  }

  isUserExist.username = restproInfo.username;
  isUserExist.address = restproInfo.address;
  isUserExist.phone = restproInfo.phone;
  isUserExist.email = restproInfo.email;

  if (isUserExist) {
    try {
      await isUserExist.save();
    } catch (error) {
      const err = new HttpError(
        "Couldn't update the user info, try again later",
        500
      );
      return next(err);
    }
  }

  res.status(201).json({ msg: "Restaurant Info Updated Successfully!" });
};

const deleteCategory = async (req, res, next) => {
  const { email } = req.body;
  const catID = req.params.id;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  //var objFriends = { catName: category };
  User.findOneAndUpdate(
    { email: email },
    { $pull: { categories: { _id: catID } } },
    { new: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        res.status(201).json(success.categories);
      }
    }
  );
};

const deleteFood = async (req, res, next) => {
  const { email } = req.body;
  const foodID = req.params.id;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  //var objFriends = { catName: category };
  User.findOneAndUpdate(
    { email: email },
    { $pull: { fooditems: { _id: foodID } } },
    { new: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        res.status(201).json(success.fooditems);
      }
    }
  );
};

const uploadFoodImage = async (req, res, next) => {
  singleUpload(req, res, function (err) {
    console.log("image", req.body);
    if (err) {
      return res.status(422).send({ error: err.message });
    }

    res.json({ imageUrl: req.file.location });
  });
};

const getActiveOrders = async (req, res, next) => {
  const userId = req.params.userid;
  let userOrders;

  try {
    userOrders = await Order.find({
      $and: [{ createdfor: userId }, { status: { $ne: 3 } }],
    });
    //userOrders = await Order.find({ creator: userId });
  } catch (error) {
    const err = new HttpError("Could not find the user with this email", 500);
    return next(err);
  }
  res.json(userOrders);
};

const getCompletedOrders = async (req, res, next) => {
  const userId = req.params.userid;
  let userOrders;

  try {
    userOrders = await Order.find({
      $and: [{ createdfor: userId }, { status: { $eq: 3 } }],
    });
    //userOrders = await Order.find({ creator: userId });
  } catch (error) {
    const err = new HttpError("Could not find the user with this email", 500);
    return next(err);
  }
  res.json(userOrders);
};

const updateOrderStatus = async (req, res, next) => {
  console.log(req.body);
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(
      new HttpError("Invalid input passed, please check your data", 422)
    );
  }

  const { orderId, status, userId } = req.body;
  console.log(status);

  let isOrderExist;
  try {
    isOrderExist = await Order.findOne({ _id: orderId });
  } catch (error) {
    const err = new HttpError("Invalid Order", 500);
    return next(err);
  }

  console.log("here is the order", isOrderExist);
  isOrderExist.status = status;

  if (isOrderExist) {
    try {
      await isOrderExist.save();
    } catch (error) {
      const err = new HttpError(
        "Couldn't update the user info, try again later",
        500
      );
      return next(err);
    }
  }

  //res.status(201).json({ msg: "Restaurant Info Updated Successfully!" });

  let userOrders;

  try {
    userOrders = await Order.find({
      $and: [{ createdfor: userId }, { status: { $ne: 3 } }],
    });
    //userOrders = await Order.find({ creator: userId });
  } catch (error) {
    const err = new HttpError("Could not find the user with this email", 500);
    return next(err);
  }
  res.json(userOrders);
};

exports.getUsers = getUsers;
exports.signUp = signUp;
exports.login = login;
exports.getUserProfile = getUserProfile;
exports.editRestInfo = editRestInfo;
exports.addFoodItem = addFoodItem;
exports.editRestProfileInfo = editRestProfileInfo;
exports.deleteCategory = deleteCategory;
exports.deleteFood = deleteFood;
exports.uploadFoodImage = uploadFoodImage;
exports.getActiveOrders = getActiveOrders;
exports.updateOrderStatus = updateOrderStatus;
exports.getCompletedOrders = getCompletedOrders;
