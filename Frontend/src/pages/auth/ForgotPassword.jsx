import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Backend later
    console.log("Password reset email:", email);

    setSubmitted(true);
  };

  return (
    <AuthLayout>
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          border
          border-white/10
          bg-white/5
          backdrop-blur-xl
          p-8
        "
      >
        {!submitted ? (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white">
                Forgot Password?
              </h1>

              <p className="mt-2 text-sm text-gray-400">
                Enter your email and we'll send you reset instructions.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label className="text-sm text-gray-300">
                  Email Address
                </label>

                <div className="relative mt-2">
                  <Mail
                    size={18}
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-500
                    "
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-white/5
                      py-3
                      pl-10
                      pr-4
                      text-white
                      outline-none
                      transition
                      placeholder:text-gray-600
                      focus:border-indigo-500
                    "
                  />
                </div>
              </div>

              <button
                type="submit"
                className="
                  w-full
                  rounded-xl
                  bg-indigo-600
                  py-3
                  font-medium
                  text-white
                  transition
                  hover:bg-indigo-700
                "
              >
                Send Reset Link
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div
              className="
                mx-auto
                mb-5
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-green-500/10
                text-green-400
              "
            >
              <Mail size={26} />
            </div>

            <h1 className="text-2xl font-bold text-white">
              Check Your Email
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              We've prepared a password reset request for{" "}
              <span className="text-gray-200">
                {email}
              </span>
              .
            </p>
          </div>
        )}

        <Link
          to="/login"
          className="
            mt-7
            flex
            items-center
            justify-center
            gap-2
            text-sm
            text-indigo-400
            transition
            hover:text-indigo-300
          "
        >
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}