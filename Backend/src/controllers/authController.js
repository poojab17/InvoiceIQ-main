const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");


// ==================================================
// GENERATE JWT TOKEN
// ==================================================

const generateToken = (user) => {

    return jwt.sign(

        {

            userId:
                user._id.toString(),

            email:
                user.email

        },

        process.env.JWT_SECRET,

        {

            expiresIn:
                process.env.JWT_EXPIRES_IN || "7d"

        }

    );

};


// ==================================================
// REGISTER USER
// ==================================================

const registerUser = async (req, res) => {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (

            !name ||

            !email ||

            !password

        ) {

            return res.status(400).json({

                message:
                    "Name, email and password are required"

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                message:
                    "Password must be at least 6 characters long"

            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        // ------------------------------------------
        // CHECK EXISTING USER
        // ------------------------------------------

        const existingUser =
            await User.findOne({

                email:
                    normalizedEmail

            });


        if (existingUser) {

            return res.status(409).json({

                message:
                    "User already exists with this email"

            });

        }


        // ------------------------------------------
        // HASH PASSWORD
        // ------------------------------------------

        const passwordHash =
            await bcrypt.hash(

                password,

                10

            );


        // ------------------------------------------
        // CREATE USER
        // ------------------------------------------

        const user =
            await User.create({

                name:
                    name.trim(),

                email:
                    normalizedEmail,

                passwordHash

            });


        // ------------------------------------------
        // GENERATE TOKEN
        // ------------------------------------------

        const token =
            generateToken(user);


        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.status(201).json({

            message:
                "User registered successfully",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email

            }

        });

    }


    catch (error) {

        console.error(

            "REGISTER ERROR:",

            error.message

        );


        return res.status(500).json({

            message:
                "Registration failed"

        });

    }

};


// ==================================================
// LOGIN USER
// ==================================================

const loginUser = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ------------------------------------------
        // VALIDATION
        // ------------------------------------------

        if (

            !email ||

            !password

        ) {

            return res.status(400).json({

                message:
                    "Email and password are required"

            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        // ------------------------------------------
        // FIND USER
        // ------------------------------------------

        const user =
            await User.findOne({

                email:
                    normalizedEmail

            });


        if (!user) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // ------------------------------------------
        // VERIFY PASSWORD
        // ------------------------------------------

        const isPasswordValid =
            await bcrypt.compare(

                password,

                user.passwordHash

            );


        if (!isPasswordValid) {

            return res.status(401).json({

                message:
                    "Invalid email or password"

            });

        }


        // ------------------------------------------
        // GENERATE TOKEN
        // ------------------------------------------

        const token =
            generateToken(user);


        // ------------------------------------------
        // RESPONSE
        // ------------------------------------------

        return res.status(200).json({

            message:
                "Login successful",

            token,

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email

            }

        });

    }


    catch (error) {

        console.error(

            "LOGIN ERROR:",

            error.message

        );


        return res.status(500).json({

            message:
                "Login failed"

        });

    }

};


// ==================================================
// GET CURRENT AUTHENTICATED USER
// ==================================================

const getCurrentUser = async (req, res) => {

    try {

        const user =
            await User.findById(

                req.user.userId

            ).select("-passwordHash");


        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }


        return res.status(200).json({

            user: {

                id:
                    user._id,

                name:
                    user.name,

                email:
                    user.email,

                createdAt:
                    user.createdAt,

                updatedAt:
                    user.updatedAt

            }

        });

    }


    catch (error) {

        console.error(

            "GET CURRENT USER ERROR:",

            error.message

        );


        return res.status(500).json({

            message:
                "Failed to fetch current user"

        });

    }

};


// ==================================================
// EXPORTS
// ==================================================

module.exports = {

    registerUser,

    loginUser,

    getCurrentUser

};