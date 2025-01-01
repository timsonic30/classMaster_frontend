"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import jwt from "jsonwebtoken";
import Loading from "@/app/components/Loading";
import UpdateInfo from "@/app/components/UpdateInfo";
import UpdatePaymentInfo from "@/app/components/UpdatePaymentInfo";
import Toast from "@/app/components/Toast";

import Link from "next/link";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmedPw, setConfirmedPw] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const router = useRouter();

  const [newPaymentDetail, setNewPaymentDetail] = useState({});

  const [merchantId, setMerchantId] = useState();

  const bookingURL = process.env.NEXT_PUBLIC_FRONTEND_API;

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      const decoded = jwt.decode(token);
      // console.log("Frontend decoded:", decoded.payload.merchant_id);
      setMerchantId(decoded.payload.merchant_id);

      // check if his has the token (that mean if he is login)
      // if (!token) {
      //   router.push("/login");
      //   return;
      // }

      try {
        // check if the token is expired
        // const decoded = jwt.decode(token);
        // if (!decoded || Date.now() >= decoded.exp * 1000) {
        //   router.push("/login");
        //   return;
        // }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/profile`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // console.log("Profile fetch response:", response);
        // setIsLogin(response.ok);

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProfileData();
  }, [router]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return <Loading />;
  }

  const handleUpdateUserData = (updatedData) => {
    setUserData((prevData) => ({
      ...prevData,
      ...updatedData,
    }));
  };

  const handleOnChange = (ev) => {
    const { name, value } = ev.target;
    if (name === "old") {
      setOldPw(value);
    } else if (name === "new") {
      setNewPw(value);
    } else if (name === "confirmed") {
      setConfirmedPw(value);
    }
  };

  const handleOnSubmit = async () => {
    setPasswordSuccess("");
    if (!(oldPw && newPw && confirmedPw)) {
      setPasswordError("Please enter all the fields first");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/verify-password`,
        {
          method: "POST",
          body: JSON.stringify({
            password: oldPw,
            username: userData.merchant_username,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        setPasswordError(
          "The current password you entered does not match the system record"
        );
      } else if (checkPasswordFormat(confirmedPw)) {
        setPasswordError(
          "The password must contain at least one numeric character, one lower letter and one upper case letter"
        );
      } else if (oldPw === confirmedPw) {
        setPasswordError(
          "The new password is the same as the current password"
        );
      } else if (newPw !== confirmedPw) {
        setPasswordError(
          "The new password and the confirmed password are different!!"
        );
      } else {
        const res = await updatePassword(newPw);
        if (res.ok) {
          setPasswordError("");
          setPasswordSuccess("Password has been updated");
          setOldPw("");
          setNewPw("");
          setConfirmedPw("");
        } else {
          setPasswordError("Password cannot be updated");
        }
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const updatePassword = async (password) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/update-password`,
        {
          method: "POST",
          body: JSON.stringify({
            password: newPw,
            username: userData.merchant_username,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return res;
    } catch (error) {
      console.log(error);
    }
  };

  const checkPasswordFormat = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return password.length < 8 || !passwordRegex.test(password);
  };

  function copyToClipboard(id) {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        Toast(`Booking URL Link Copied!`, "success");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }

  return (
    <>
      {/* --------------------------------------Page title----------------------------------- */}
      <h1 className="text-3xl mt-4 mb-2">Profile</h1>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/dashboard">Home</Link>
          </li>
          <li>
            <a>Profile</a>
          </li>
        </ul>
      </div>
      {/* --------------------------------分隔個條線--------------------------- */}
      <div className="flex w-full flex-col">
        <div className="divider divider-secondary mt-1 mb-1"></div>
      </div>
      {/* -------------------data----------------------------- */}
      <div className="flex justify-center">
        <div className="mt-2 stats stats-vertical lg:stats-horizontal shadow-md w-11/12">
          <div className="stat">
            <div className="flex mb-2">
              <div className="stat-title pl-10 w-60">Username:</div>
              <div className="infoValue ml-1">{userData.merchant_username}</div>
            </div>
            <div className="flex mb-2">
              <div className="stat-title pl-10 w-60">Email:</div>
              <div className="infoValue ml-1">
                {userData.merchant_email || "-"}
              </div>
            </div>
            <div className="flex mb-2">
              <div className="stat-title pl-10 w-60">Phone Number:</div>
              <div className="infoValue ml-1">{userData.telephone_no}</div>
            </div>
            <div className="flex mb-2">
              <div className="stat-title pl-10 w-60">Booking URL Link:</div>
              <div className="infoValue text-center">
                <button
                  className={"btn btn-sm btn-accent mb-3"}
                  onClick={() => copyToClipboard(`${bookingURL}/${merchantId}`)}
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>

          <div className="stat">
            <div className="flex">
              <div className="stat-title pl-10 w-60">Company:</div>
              <div className="infoValue">{userData.organization}</div>
            </div>
            <div className="flex">
              <div className="stat-title pl-10 w-60">FPS Number:</div>
              <div className="infoValue text-center">
                {userData.payment_number?.fps || "Not provided"}
              </div>
            </div>
            <div className="flex">
              <div className="stat-title pl-10 w-60">PayMe Number:</div>
              <div className="infoValue text-center">
                {userData.payment_number?.payme || "Not provided"}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* -------------------------分隔既線2------------------------- */}
      <div className="divider"></div>
      {/* -------------------------change info list-------------------------- */}
      {/* <p>Id: {userData.id}</p> */}

      <div className="flex justify-center">
        <div className="flex">
          <div>
            <div className="flex mb-4 stat-title">
              Change Account Information:
            </div>
            <UpdateInfo
              userData={userData}
              onUpdateUserData={handleUpdateUserData}
            />
          </div>
          <div className="flex ml-4 mt-10">
            <div>
              <div>
                <p>Current Password</p>
                <input
                  name="old"
                  value={oldPw}
                  type="password"
                  onChange={handleOnChange}
                  className="input input-bordered input-sm w-full max-w-xs mb-6"
                  placeholder="Type here"
                />
              </div>
              <div>
                <p>New Password</p>
                <input
                  name="new"
                  value={newPw}
                  type="password"
                  onChange={handleOnChange}
                  className="input input-bordered input-sm w-full max-w-xs"
                  placeholder="Type here"
                />
              </div>
              <div>
                <p>Confirm Password</p>
                <input
                  name="confirmed"
                  value={confirmedPw}
                  type="password"
                  onChange={handleOnChange}
                  className="input input-bordered input-sm w-full max-w-xs"
                  placeholder="Type here"
                />
              </div>

              <button
                className="btn btn-primary mt-2"
                type="button"
                onClick={handleOnSubmit}
              >
                Change Password
              </button>
              {passwordError && (
                <div className="text-red-500" style={{ width: "260px" }}>
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="text-green-500">{passwordSuccess}</div>
              )}
            </div>
          </div>
          <div>
            <div className="flex mb-4 stat-title ml-10">
              Update Payment Details:
            </div>
            <div className="flex ml-10 mt-4">
              <UpdatePaymentInfo
                userData={userData}
                onUpdateUserData={setUserData}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
