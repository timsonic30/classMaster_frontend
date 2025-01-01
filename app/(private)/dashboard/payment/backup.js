"use client";

import React, { useState } from "react";
import Link from "next/link";

const Payment = () => {
  const token = localStorage.getItem("token");
  const [data, setData] = useState({});

  const handleOnClick = async () => {
    console.log("I am clicked");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/get-payment-info`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        }
      );
      if (res.ok) {
        console.log("Test OK");
        const receivedData = await res.json();
        setData(receivedData);
        console.log("here is the data", data);
      } else {
        console.log("Fail");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {/* --------------------------------------Page title----------------------------------- */}
      <h1 className="text-3xl mt-4 mb-2">Payment</h1>
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link href="/dashboard">Home</Link>
          </li>
          <li>
            <a>Payment</a>
          </li>
        </ul>
      </div>
      {/* --------------------------------分隔個條線--------------------------- */}
      <div className="flex w-full flex-col">
        <div className="divider divider-primary mt-1 mb-1"></div>
      </div>
      {/* -------------------data----------------------------- */}
      <button onClick={handleOnClick}>Click to Fetch</button>
    </>
  );
};

export default Payment;
