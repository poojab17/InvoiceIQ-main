const jwt = require("jsonwebtoken");


// ==================================================
// AUTHENTICATION MIDDLEWARE
// ==================================================

const protect = (req, res, next) => {

    try {

        const authorizationHeader =
            req.headers.authorization;


        if (

            !authorizationHeader ||

            !authorizationHeader.startsWith("Bearer ")

        ) {

            return res.status(401).json({

                message:
                    "Authentication required"

            });

        }


        const token =
            authorizationHeader.split(" ")[1];


        if (!token) {

            return res.status(401).json({

                message:
                    "Authentication required"

            });

        }


        const decodedToken =
            jwt.verify(

                token,

                process.env.JWT_SECRET

            );


        req.user = {

            userId:
                decodedToken.userId,

            email:
                decodedToken.email

        };


        next();

    }


    catch (error) {

        return res.status(401).json({

            message:
                "Invalid or expired token"

        });

    }

};


// ==================================================
// EXPORT
// ==================================================

module.exports = protect;