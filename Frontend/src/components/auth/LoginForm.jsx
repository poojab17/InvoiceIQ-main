import { useState } from "react";

import {
  Eye,
  EyeOff,
  Mail,
  Lock,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await login({
        email: formData.email,
        password: formData.password,
      });

      const redirectPath =
        location.state?.from ||
        "/dashboard";

      navigate(
        redirectPath,
        {
          replace: true,
        }
      );

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        err?.message ||
          "Unable to login"
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
            value={formData.email}
            onChange={handleChange}
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
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
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

      </div>


      {/* Remember + Forgot */}
      <div className="flex items-center justify-between gap-4">

        <label
          className="
            flex
            items-center
            gap-2
            text-sm
            text-gray-400
          "
        >

          <input
            type="checkbox"
            className="accent-indigo-600"
          />

          Remember me

        </label>


        <Link
          to="/forgot-password"
          className="
            text-sm
            text-indigo-400
            hover:text-indigo-300
          "
        >
          Forgot password?
        </Link>

      </div>


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


      {/* Login */}
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
          ? "Signing in..."
          : "Login"}
      </button>

    </form>
  );
}