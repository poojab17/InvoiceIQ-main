const mongoose = require("mongoose");


// ==================================================
// USER SCHEMA
// ==================================================

const userSchema = new mongoose.Schema(

    {

        // ------------------------------------------
        // USER NAME
        // ------------------------------------------

        name: {

            type: String,

            required: true,

            trim: true

        },


        // ------------------------------------------
        // USER EMAIL
        // ------------------------------------------

        email: {

            type: String,

            required: true,

            unique: true,

            lowercase: true,

            trim: true

        },


        // ------------------------------------------
        // HASHED PASSWORD
        // ------------------------------------------

        passwordHash: {

            type: String,

            required: true

        }

    },

    {

        timestamps: true

    }

);


// ==================================================
// EXPORT MODEL
// ==================================================

module.exports = mongoose.model(

    "User",

    userSchema

);