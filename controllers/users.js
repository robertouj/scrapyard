const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');

const { ObjectId } = mongoose.Types;

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.json({ success: true, msg: 'show all users', data: users })
  } catch(err) {
    next(err)
  }
}

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.json({ success: true, msg: 'show selected user', data: user })
  } catch(err) {
    next(err)
  }
};

const createUser = async (req, res, next) => {
  try {

    // insert user
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });

    // create token
    const token = user.getSignedJwtToken();

    res.json({ success: true, token })
  } catch(err) {
    next(err)
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send('Please provide an email and password')
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).send('Invalid credentials')
    }

    const doesPassMatch = await user.matchPassword(password);
    if (!doesPassMatch) {
      res.status(401).send('Invalid credentials')
    }

    const token = user.getSignedJwtToken();

    res.json({ success: true, token })

  } catch(err) {
    next(err)
  }
}

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);
    res.json({ success: true, msg: `user with id ${id} deleted`, data: user })
  } catch(err) {
    next(err) 
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    
    const user = await User.findByIdAndUpdate(id, { username, email }, { new: true });
    res.json({ success: true, msg: `user with id ${id} updated`, data: user })
  } catch(err) {
    next(err)
  }
};

const getUserOrders = async (req, res, next) => {
  // ?price[lte]=2000
  try {
    const { id } = req.params;
    const queryStr = JSON.stringify(req.query).replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)

    const orders = await Order.find({ userId: ObjectId(id), ...JSON.parse(queryStr) })
    res.json({ success: true, msg: `orders of user with user id ${id} retrieved`, data: orders })
  } catch(err) {
    next(err)
  }
};

const getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.json({
    success: true,
    data: user
  });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserOrders,
  login,
  getMe
}