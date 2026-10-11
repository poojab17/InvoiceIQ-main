import api from "./api";


// REGISTER
export async function registerUser({
  name,
  email,
  password,
}) {
  try {
    const response = await api.post(
      "/auth/register",
      {
        name,
        email,
        password,
      }
    );

    return response.data;

  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Registration failed"
    );
  }
}


// LOGIN
export async function loginUser({
  email,
  password,
}) {
  try {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    return response.data;

  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Login failed"
    );
  }
}


// CURRENT USER
export async function getCurrentUser() {
  try {
    const response =
      await api.get("/auth/me");

    return response.data;

  } catch (error) {
    throw new Error(
      error.response?.data?.message ||
        "Failed to restore session"
    );
  }
}