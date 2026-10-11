import { useState } from "react";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import PasswordStrength from "./PasswordStrength";

export default function RegisterForm() {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });

    setError("");
  };


  // ==========================================
  // REAL REGISTER
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match"
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      const response =
        await register({
          name: formData.name,
          email: formData.email,
          password:
            formData.password,
        });


      /*
        If backend register response
        returns token → AuthContext stores it.

        If no token → redirect to login.
      */

      if (response?.token) {
        navigate(
          "/dashboard",
          {
            replace: true,
          }
        );
      } else {
        navigate(
          "/login",
          {
            replace: true,
            state: {
              registered: true,
            },
          }
        );
      }

    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err?.message ||
          "Unable to create account"
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      {/* Full Name */}
      <div>

        <label className="text-sm text-gray-300">
          Full Name
        </label>

        <div className="relative mt-2">

          <User
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
            type="text"
            name="name"
            value={
              formData.name
            }
            onChange={
              handleChange
            }
            placeholder="John Doe"
            required
            disabled={loading}
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
              disabled:opacity-60
            "
          />

        </div>

      </div>


      {/* Email */}
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
            name="email"
            value={
              formData.email
            }
            onChange={
              handleChange
            }
            placeholder="you@example.com"
            required
            disabled={loading}
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
              disabled:opacity-60
            "
          />

        </div>

      </div>


      {/* Password */}
      <div>

        <label className="text-sm text-gray-300">
          Password
        </label>

        <div className="relative mt-2">

          <Lock
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
            type={
              showPassword
                ? "text"
                : "password"
            }
            name="password"
            value={
              formData.password
            }
            onChange={
              handleChange
            }
            placeholder="Create password"
            required
            minLength={8}
            disabled={loading}
            className="
              w-full
              rounded-xl
              border
              border-white/10
              bg-white/5
              py-3
              pl-10
              pr-12
              text-white
              outline-none
              transition
              placeholder:text-gray-600
              focus:border-indigo-500
              disabled:opacity-60
            "
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(
                !showPassword
              )
            }
            disabled={loading}
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-gray-400
              hover:text-white
              disabled:opacity-50
            "
          >

            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}

          </button>

        </div>

        <PasswordStrength
          password={
            formData.password
          }
        />

      </div>


      {/* Confirm Password */}
      <div>

        <label className="text-sm text-gray-300">
          Confirm Password
        </label>

        <div className="relative mt-2">

          <Lock
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
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            name="confirmPassword"
            value={
              formData.confirmPassword
            }
            onChange={
              handleChange
            }
            placeholder="Confirm password"
            required
            minLength={8}
            disabled={loading}
            className="
              w-full
              rounded-xl
              border
              border-white/10
              bg-white/5
              py-3
              pl-10
              pr-12
              text-white
              outline-none
              transition
              placeholder:text-gray-600
              focus:border-indigo-500
              disabled:opacity-60
            "
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
            disabled={loading}
            className="
              absolute
              right-3
              top-1/2
              -translate-y-1/2
              text-gray-400
              hover:text-white
              disabled:opacity-50
            "
          >

            {showConfirmPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}

          </button>

        </div>

      </div>


      {/* Terms */}
      <label
        className="
          flex
          items-start
          gap-2
          text-sm
          text-gray-400
        "
      >

        <input
          type="checkbox"
          required
          disabled={loading}
          className="
            mt-1
            accent-indigo-600
          "
        />

        <span>
          I agree to the
          Terms of Service and
          Privacy Policy
        </span>

      </label>


      {/* Error */}
      {error && (
        <div
          className="
            rounded-xl
            border
            border-red-500/20
            bg-red-500/10
            px-4
            py-3
          "
        >
          <p className="text-sm text-red-400">
            {error}
          </p>
        </div>
      )}


      {/* Register Button */}
      <button
        type="submit"
        disabled={loading}
        className="
          w-full
          rounded-xl
          bg-indigo-600
          py-3
          font-medium
          text-white
          transition
          hover:bg-indigo-700
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >
        {loading
          ? "Creating account..."
          : "Create Account"}
      </button>

    </form>
  );
}