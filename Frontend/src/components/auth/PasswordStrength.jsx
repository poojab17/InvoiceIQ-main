import { motion } from "framer-motion";


export default function PasswordStrength({ password }) {


  const getStrength = () => {

    let score = 0;


    if(password.length >= 8)
      score++;


    if(/[A-Z]/.test(password))
      score++;


    if(/[0-9]/.test(password))
      score++;


    if(/[^A-Za-z0-9]/.test(password))
      score++;


    return score;

  };



  const strength = getStrength();



  const strengthData = {

    0:{
      label:"",
      color:"bg-white/10"
    },

    1:{
      label:"Weak",
      color:"bg-red-500"
    },

    2:{
      label:"Fair",
      color:"bg-yellow-500"
    },

    3:{
      label:"Good",
      color:"bg-blue-500"
    },

    4:{
      label:"Strong",
      color:"bg-green-500"
    }

  };



  return (

    <div className="mt-3">


      {/* Strength Bars */}

      <div className="flex gap-1">


        {[1,2,3,4].map((item)=>(


          <motion.div

            key={item}

            initial={{
              scaleX:0
            }}

            animate={{
              scaleX:
                strength >= item
                ?
                1
                :
                0.3
            }}

            transition={{
              duration:0.3
            }}

            className={`
              h-1
              flex-1
              rounded-full
              origin-left
              ${
                strength >= item
                ?
                strengthData[strength].color
                :
                "bg-white/10"
              }
            `}

          />


        ))}


      </div>





      {
        password && (

          <p
            className="
              mt-2
              text-xs
              text-gray-400
            "
          >

            Password strength:

            <span
              className="
                ml-1
                text-white
                font-medium
              "
            >

              {strengthData[strength].label}

            </span>


          </p>

        )
      }





      {
        password && strength < 4 && (

          <p
            className="
              mt-1
              text-xs
              text-gray-500
            "
          >

            Use 8+ characters with uppercase,
            numbers and symbols

          </p>

        )
      }


    </div>

  );

}