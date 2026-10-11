const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connectDB = require("./config/db");

const invoiceRoutes = require("./routes/invoiceRoutes");

const authRoutes = require("./routes/authRoutes");


const app = express();


// ============================================
// MIDDLEWARES
// ============================================

app.use(

    cors()

);


app.use(

    express.json()

);


app.use(

    express.urlencoded({

        extended: true

    })

);


// ============================================
// ROUTES
// ============================================

// Invoice routes
app.use(

    "/api/invoices",

    invoiceRoutes

);


// Authentication routes
app.use(

    "/api/auth",

    authRoutes

);


// ============================================
// TEST ROUTE
// ============================================

app.get(

    "/",

    (req, res) => {

        res.json({

            message:

                "InvoiceIQ Backend is running"

        });

    }

);


// ============================================
// CONNECT TO DATABASE
// ============================================

connectDB();


// ============================================
// START SERVER
// ============================================

const PORT = 5001;


app.listen(

    PORT,

    () => {

        console.log(

            `Backend server running on http://localhost:${PORT}`

        );

    }

);