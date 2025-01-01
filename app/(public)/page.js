"use client";

// Acc: 666
// Pw: a6666666
import { useState, useContext } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
// new code
import { useAuth } from "../Auth";
// import { AuthContext } from "../Auth"; // Import the AuthContext
//

export const AccountLogin = () => {
  const [data, setData] = useState({
    merchant_username: "",
    password: "",
  });

  const [error, setError] = useState("");

  // new code
  const [isLogin, setIsLogin] = useAuth();

  if (isLogin) {
    redirect("/dashboard");
  }

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { merchant_username, password } = data;

    if (merchant_username && password) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/login`, {
        method: "POST",
        body: JSON.stringify({
          merchant_username,
          password,
        }),
        headers: {
          "Content-type": "application/json",
        },
      });

      if (res.ok) {
        setError("");
        const responseData = await res.json();
        localStorage.setItem("token", responseData.token);
        console.log("Response: ", responseData);
        // new code
        setIsLogin(true);
      } else {
        setError("Wrong username or password");
      }
    } else {
      setError("Either username or password is empty");
    }
  }

  // Check the token -> whenever fetch, decrpyt the token
  // and check if the username/ id in the token is correctd
  // if yes, check the user

  return (
    <div className="flex flex-row justify-center">
      <div className="artboard phone-3">
        <form onSubmit={handleSubmit}>
          {/* <div>
            <p>帳戶名稱</p>
            <input
              name="merchant_username"
              type="text"
              placeholder="帳戶名稱"
              value={data.merchant_username}
              onChange={handleOnChange}
              required
              style={{ border: "1px solid black" }}
            ></input>
          </div>
          <br />
          <div>
            <p>密碼</p>
            <input
              name="password"
              type="password"
              placeholder="密碼"
              value={data.password}
              onChange={handleOnChange}
              required
              style={{ border: "1px solid black" }}
            ></input>
          </div> */}
          <div className="label mt-20">
            <span className="label-text">Username</span>
          </div>
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
            </svg>
            <input
              type="text"
              className="grow"
              name="merchant_username"
              placeholder="Username"
              value={data.merchant_username}
              onChange={handleOnChange}
            />
          </label>
          <br />
          <div className="label">
            <span className="label-text">Password</span>
          </div>
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              name="password"
              type="password"
              className="grow"
              value={data.password}
              placeholder="Password"
              onChange={handleOnChange}
            />
          </label>

          <div className="ErrorLabel" style={{ height: "24px" }}>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </div>
          <button type="submit" className="btn btn-active mt-4">
            Login
          </button>
        </form>
        <p className="mt-2">
          Don't have an account？
          <Link
            href="/register"
            className="link link-hover underline underline-offset-2"
          >
            Create Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default function Login() {
  return (
    <>
      <AccountLogin />
    </>
  );
}
