"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const SignUp = () => {
  const [data, setData] = useState({
    merchant_username: "",
    merchant_email: "",
    telephone_no: "",
    organization: "",
    password: "",
    subscription_period: "",
    created_program_id: [],
  });

  const [errors, setErrors] = useState({});
  const [returnError, setReturnError] = useState({});

  const router = useRouter();

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    if (name === "telephone_no") {
      const telephone = value.replace(/\D/g, "");
      setData((prev) => ({
        ...prev,
        [name]: telephone,
      }));
    } else {
      setData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {};

    const {
      merchant_username,
      merchant_email,
      telephone_no,
      organization,
      password,
    } = data;

    // Check the user name format
    if (!merchant_username) {
      newErrors.user_error = "Please enter a username";
    }

    // Check telephone number format
    const validDigits = ["2", "3", "5", "6", "7", "8", "9"];
    if (!telephone_no) {
      newErrors.telephone_error = "Please enter a phone number";
    } else if (telephone_no.length !== 8) {
      newErrors.telephone_error = "The phone number must be exactly 8 digits";
    } else if (
      !validDigits.includes(telephone_no[0]) ||
      telephone_no.slice(0, 3) === "999"
    ) {
      newErrors.telephone_error = "The phone number must be a valid digit";
    }

    // Check email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!merchant_email) {
      newErrors.email_error = "Please enter an email address";
    } else if (!emailRegex.test(merchant_email)) {
      newErrors.email_error = "The email address is invalid";
    }

    // Check password format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!password) {
      newErrors.password_error = "Please enter a password";
    } else if (password.length < 8) {
      newErrors.password_error =
        "The password must be at least 8 characters long";
    } else if (!passwordRegex.test(password)) {
      newErrors.password_error =
        "The password must contain at least one numeric character, one lower letter and one upper case letter";
    }

    // Check organization format
    if (!organization) {
      newErrors.organization_error = "Please enter your organization name";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (
      merchant_username &&
      merchant_email &&
      telephone_no &&
      organization &&
      password &&
      Object.keys(newErrors).length === 0
    ) {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/register`,
        {
          method: "POST",
          body: JSON.stringify({
            merchant_username,
            merchant_email,
            telephone_no,
            organization,
            password,
          }),
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      if (res.ok) {
        const responseData = await res.json();
        console.log("Response: ", responseData);
        router.push("/");
      } else {
        const errorData = await res.json();
        setReturnError(errorData.errors || "An error occurred");
      }
    } else {
      setReturnError("Please fill in all fields.");
    }
  }

  return (
    <div className="flex flex-row justify-center">
      <div className="artboard phone-3">
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mt-2">
            <div>Create Account</div>
          </div>
          <div className="label">
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
              name="merchant_username"
              type="text"
              className="grow"
              placeholder="Username"
              value={data.merchant_username}
              onChange={handleOnChange}
            />
          </label>
          <div className="ErrorLabel" style={{ height: "22px" }}>
            {errors.user_error && (
              <span style={{ color: "red" }}>{errors.user_error}</span>
            )}
          </div>
          <div className="label">
            <span className="label-text">Email</span>
          </div>
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
              <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
            </svg>
            <input
              name="merchant_email"
              type="text"
              className="grow"
              placeholder="Email"
              value={data.merchant_email}
              onChange={handleOnChange}
            />
          </label>
          <div className="ErrorLabel" style={{ height: "22px" }}>
            {errors.email_error && (
              <span style={{ color: "red" }}>{errors.email_error}</span>
            )}
          </div>
          <div className="label">
            <span className="label-text">Phone Number</span>
          </div>
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z"
              />
            </svg>
            <input
              name="telephone_no"
              type="text"
              className="grow"
              placeholder="Phone Number"
              value={data.telephone_no}
              onChange={handleOnChange}
              maxLength="8"
            ></input>
          </label>
          <div className="ErrorLabel" style={{ height: "22px" }}>
            {errors.telephone_error && (
              <span style={{ color: "red" }}>{errors.telephone_error}</span>
            )}
          </div>
          <div className="label">
            <span className="label-text">Organization</span>
          </div>
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M3 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5H15v-18a.75.75 0 0 0 0-1.5H3ZM6.75 19.5v-2.25a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-3a.75.75 0 0 1-.75-.75ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 0 1.5h-.75A.75.75 0 0 1 6 6.75ZM6.75 9a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM6 12.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 6a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75Zm-.75 3.75A.75.75 0 0 1 10.5 9h.75a.75.75 0 0 1 0 1.5h-.75a.75.75 0 0 1-.75-.75ZM10.5 12a.75.75 0 0 0 0 1.5h.75a.75.75 0 0 0 0-1.5h-.75ZM16.5 6.75v15h5.25a.75.75 0 0 0 0-1.5H21v-12a.75.75 0 0 0 0-1.5h-4.5Zm1.5 4.5a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Zm.75 2.25a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75h-.008ZM18 17.25a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75h-.008a.75.75 0 0 1-.75-.75v-.008Z"
              />
            </svg>
            <input
              name="organization"
              type="text"
              className="grow"
              placeholder="Organization"
              value={data.organization}
              onChange={handleOnChange}
            />
          </label>
          <div className="ErrorLabel" style={{ height: "22px" }}>
            {errors.organization_error && (
              <span style={{ color: "red" }}>{errors.organization_error}</span>
            )}
          </div>
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
              />
            </svg>
            <input
              name="password"
              type="password"
              className="grow"
              placeholder="Password"
              value={data.password}
              onChange={handleOnChange}
            />
          </label>
          <div className="ErrorLabel" style={{ height: "auto" }}>
            {errors.password_error && (
              <span style={{ color: "red" }}>{errors.password_error}</span>
            )}
          </div>
          <button type="submit" className="btn btn-active mt-2">
            Create
          </button>
        </form>
        <div
          className="ErrorLabel"
          style={{ height: "auto", fontSize: "15px" }}
        >
          {returnError.length > 0 &&
            returnError.map((el, index) => {
              return (
                <div key={index} style={{ color: "red" }}>
                  {el}
                </div>
              );
            })}
        </div>
        <p className="mt-1">
          Already have an account？
          <Link
            href="/"
            className="link link-hover underline underline-offset-2"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default function Register() {
  return <SignUp />;
}
