const express = require("express");

const {

    registerUser,

    loginUser,

    getCurrentUser

} = require("../controllers/authController");


const protect =
    require("../middleware/authMiddleware");


const router = express.Router();


// ==================================================
// REGISTER USER
// POST /api/auth/register
// ==================================================

router.post(

    "/register",

    registerUser

);


// ==================================================
// LOGIN USER
// POST /api/auth/login
// ==================================================

router.post(

    "/login",

    loginUser

);


// ==================================================
// GET CURRENT USER
// GET /api/auth/me
// ==================================================

router.get(

    "/me",

    protect,

    getCurrentUser

);


// ==================================================
// EXPORT ROUTER
// ==================================================

module.exports = router;