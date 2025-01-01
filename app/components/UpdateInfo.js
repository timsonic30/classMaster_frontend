"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const UpdateInfo = ({ userData, onUpdateUserData }) => {
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const [phoneSuccess, setPhoneSuccess] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  const handleOnChange = (ev) => {
    const { name, value } = ev.target;
    if (name === "email") {
      setNewEmail(value);
    } else if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setNewPhoneNumber(numericValue);
    }
  };

  const handleEmailOnSubmit = async () => {
    setEmailError("");
    setEmailSuccess("");
    let emailErr = "";
    if (!newEmail) {
      emailErr = "Email Address cannot be empty";
    } else {
      const formatError = checkEmailFormat(newEmail);
      if (formatError) {
        emailErr = formatError;
      }
    }

    if (!emailErr) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/update-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: newEmail,
              username: userData.merchant_username,
            }),
          }
        );
        if (res.ok) {
          onUpdateUserData({ merchant_email: newEmail });
          // setEmailError("Successful to update email address");
          setEmailSuccess("Successfully updated email address");
        } else if (res.status === 406) {
          setEmailError("Duplicate Email");
        } else {
          setEmailError("DataBase Error");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setEmailError(emailErr);
    }
  };

  const handlePhoneOnSubmit = async () => {
    setPhoneError(""); // Initialize the error
    setPhoneSuccess("");
    let phoneErr = "";

    console.log("HAHA", newPhoneNumber);
    if (!newPhoneNumber) {
      phoneErr = "Phone number cannot be empty";
    } else if (newPhoneNumber === userData.telephone_no) {
      phoneErr =
        "New phone number cannot be as same as the current phone number";
    } else {
      const formatError = checkPhoneFormat(newPhoneNumber);
      if (formatError) {
        phoneErr = formatError;
      }
    }

    console.log("The error now is ", phoneError);

    if (!phoneErr) {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/update-phone-number`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phoneNumber: newPhoneNumber,
              username: userData.merchant_username,
            }),
          }
        );
        if (res.ok) {
          onUpdateUserData({ telephone_no: newPhoneNumber });
          setPhoneSuccess("Successful to update phone number");
        } else if (res.status === 406) {
          setPhoneError("Duplicate Number");
        } else {
          setPhoneError("DataBase Error");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setPhoneError(phoneErr);
      console.log("reach here 3");
    }
  };

  const checkPhoneFormat = (phone) => {
    const validDigits = ["2", "3", "5", "6", "7", "8", "9"];
    if (phone.length !== 8) {
      return "Phone number must be 8 digits";
    } else if (!validDigits.includes(phone[0]) || phone.slice(0, 3) === "999") {
      return "Invalid Phone number";
    }
    return null;
  };

  const checkEmailFormat = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return "Invalid Email";
    }
  };

  // discard
  const checkFormat = (merchant_email, telephone_no, newErrors) => {
    if (!(merchant_email && telephone_no)) {
      setErrors((newErrors.email_error = "電子郵件不能留空"));
      setErrors((newErrors.telephone_error = "電話號碼不能留空"));
      return;
    }

    // Check telephone number format
    const validDigits = ["2", "3", "5", "6", "7", "8", "9"];
    if (telephone_no.length !== 8) {
      newErrors.telephone_error = "電話號碼必須為8位數字";
    } else if (
      !validDigits.includes(telephone_no[0]) ||
      telephone_no.slice(1, 4) === "999"
    ) {
      newErrors.telephone_error = "電話號碼必須為有效數字";
    }
  };

  return (
    <>
      <div>
        <p>New Email</p>
        <input
          name="email"
          value={newEmail}
          onChange={handleOnChange}
          className="input input-bordered input-sm w-full max-w-xs mr-2"
          placeholder="Type here"
        />
      </div>

      <button
        className="btn btn-primary mt-2"
        type="button"
        onClick={handleEmailOnSubmit}
      >
        Change Email
      </button>
      <div className="ErrorLabel" style={{ height: "24px" }}>
        {emailError && <span className="text-red-500">{emailError}</span>}
        {emailSuccess && <span className="text-green-500">{emailSuccess}</span>}
      </div>
      <div>
        <p>New Phone Number</p>
        <input
          name="phone"
          value={newPhoneNumber}
          onChange={handleOnChange}
          className="input input-bordered input-sm w-full max-w-xs"
          placeholder="Type here"
        />
      </div>
      <button
        className="btn btn-primary mt-2"
        type="button"
        onClick={handlePhoneOnSubmit}
      >
        Change Phone Number
      </button>
      <div className="ErrorLabel" style={{ height: "24px", width: "208px" }}>
        {phoneError && <span className="text-red-500">{phoneError}</span>}
        {phoneSuccess && <span className="text-green-500">{phoneSuccess}</span>}
      </div>
    </>
  );
};

export default UpdateInfo;
