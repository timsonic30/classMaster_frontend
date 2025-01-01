"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import ImageUpload_Payment from "@/app/components/ImageUpload_Payment";

export default function Payment() {
  const { payment_id } = useParams();
  const [paymentInfo, setPaymentInfo] = useState(null);
  const router = useRouter();
  const [uploadedImage, setUploadedImage] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //POST Payment
  const handleImageUpload = async (image) => {
    try {
      const formData = new FormData();
      formData.append("image", image);
      formData.append("payment_id", payment_id);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      const data = await response.json();
      console.log("Upload successful:", data);
      setUploadedImage(true);
      return data;
    } catch (error) {
      console.error("Upload error:", error);
      setUploadedImage(false);
      throw error;
    }
  };

  //fetch paymentInfo GET
  const fetchPaymentInfo = async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/get-invoice-info`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paymentId: payment_id }),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch payment info");
    }
    const data = await response.json();
    console.log(data);
    setPaymentInfo(data);
  };

  useEffect(() => {
    if (payment_id) {
      fetchPaymentInfo();
    }
  }, [payment_id]);

  //Confirm Payment and Change payment_status to "received"
  const handleConfirmPayment = async () => {
    try {
      // Update payment status
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/api/update-payment-status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payment_id,
            status: "Received",
            payment_method: paymentMethod, // Include the selected payment method
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      // Navigate to receipt page
      router.push(`/payment/${payment_id}/receipt`);
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Failed to process payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  //format date
  function formatDate(dateString) {
    if (!dateString) {
      return "Please select session";
    }

    try {
      const date = new Date(dateString);

      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }

      const day = String(date.getDate()).padStart(2, "0"); // Add leading zero to day
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Add leading zero to month
      const year = date.getFullYear();
      const hours = date.getHours();
      const minutes = String(date.getMinutes()).padStart(2, "0"); // Add leading zero to minutes
      const period = hours >= 12 ? "pm" : "am";
      const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Convert to 12-hour format
      const weekday = date.toLocaleString("en", { weekday: "short" });

      return `${day}/${month}/${year} ${formattedHours}:${minutes}${period} (${weekday})`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Wrong format";
    }
  }

  return (
    <div className="p-4">
      {/* Step Indicator */}
      <ul className="steps w-full mt-5">
        <li className="step step-primary">Session Selection</li>
        <li className="step step-primary">Fill-in Personal Details</li>
        <li className="step step-primary">Payment</li>
        <li className="step">Confirm Booking</li>
      </ul>

      <div className="order-card rounded-md shadow-lg lg:mx-72 mx-4 my-8">
        <div className="card-header bg-gray-100 py-4 text-center rounded-md">
          <h2 className="text-lg font-bold">Order Information</h2>
        </div>

        {/* Order Information */}
        <div className="card-body py-5 px-10">
          {paymentInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-gray-600 mb-1 text-sm">Name</span>
                <p className="font-semibold">{paymentInfo.participant_name}</p>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-600 mb-1 text-sm">
                  Contract Number
                </span>
                <p className="font-semibold">{paymentInfo.telephone_no}</p>
              </div>
              <div className="flex flex-col">
                <span className=" mb-1 text-sm">Program</span>
                <p className="font-semibold">{paymentInfo.program_name_zh}</p>
              </div>

              <div className="flex flex-col">
                <span className=" mb-1 text-sm">Duration</span>
                <p className="font-semibold">
                  {paymentInfo.lesson_duration / 60 > 1
                    ? `${paymentInfo.lesson_duration / 60} hours`
                    : `${paymentInfo.lesson_duration / 60} hour`}

                  <span className="text-sm text-gray-500 italic">
                    {" "}
                    / per lesson
                  </span>
                </p>
              </div>

              <div className="flex flex-col">
                <span className="text-gray-600 mb-1 text-sm">
                  Session Dates
                </span>
                {paymentInfo.session_dates.map((date, i) => (
                  <p key={i} className="font-semibold">
                    {formatDate(date)}
                  </p>
                ))}
              </div>
              <div className="col-span-1 md:col-span-2">
                <hr className="my-4" />
                <div className="flex justify-between items-center py-3">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-xl font-bold">
                    HK ${paymentInfo.amount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Payment Method */}
      <div className="payment-card rounded-md shadow-lg lg:mx-72 mx-4 my-10 pb-2">
        {/* Title */}
        <div className="card-header bg-gray-100 py-4 text-center rounded-md">
          <h2 className="text-lg font-bold">Payment Method</h2>
        </div>

        <div className="content-container px-10">
          {/* FPS / Payme */}
          <div className="form-control mt-6 max-w-md mx-auto">
            <label className="text-base font-bold my-3">
              Choose your payment method*
            </label>
            {paymentInfo &&
              paymentInfo.payment_number &&
              Object.entries(paymentInfo.payment_number).map(
                ([method, number], index) => (
                  <label
                    key={index}
                    className="label cursor-pointer flex flex-row border rounded-[10px] px-5 py-5 mb-2 bg-white hover:bg-slate-100 ease-in-out duration-300 items-start"
                  >
                    <span className="label-text font-bold">
                      {method.toUpperCase()}
                      <span className="font-bold text-lg ml-5 text-primary">
                        {number}
                      </span>
                    </span>
                    <input
                      type="radio"
                      name="radio-10"
                      className="radio checked:bg-blue-500"
                      value={method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      // checked={paymentMethod === method}
                    />
                  </label>
                )
              )}
          </div>

          {/* Upload Photo */}
          <ImageUpload_Payment
            onImageUpload={handleImageUpload}
            label="Upload Payment Proof"
            required={true}
            maxSizeMB={5}
            className="max-w-md mx-auto mt-6"
          />

          {/* Buttons */}
          <div className="btn-container flex flex-col gap-3 my-10 ">
            <button
              className="btn btn-block btn-primary"
              onClick={handleConfirmPayment}
              disabled={!uploadedImage}
            >
              Confirm Payment
            </button>
            {/* <button className="btn btn-block">Back</button> */}
          </div>
        </div>
      </div>
    </div>
  );
}
