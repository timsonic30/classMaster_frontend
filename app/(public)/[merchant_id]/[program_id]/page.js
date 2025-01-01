"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import SessionSelection from "@/app/components/SessionSelection";
import PersonalInfo from "@/app/components/PersonalInfo";
import { useRouter } from "next/navigation";

export default function Page() {
  const { program_id, merchant_id } = useParams();
  const [programInfo, setProgramInfo] = useState([]);
  const [programSessions, setProgramSessions] = useState([]);
  const [sessionInfo, setSessionInfo] = useState([]);
  const [programName, setProgramName] = useState("");
  const [programImage, setProgramImage] = useState([]);
  const [programPrice, setProgramPrice] = useState(null);
  const router = useRouter();

  //form storage
  const [page, setPage] = useState(0);
  const [bookingData, setBookingData] = useState({
    selectedSession: "",
    session_id: "",
    numberOfPeople: 0,
    remark: "",
    name: "",
    phone: "",
    session_id: [],
    payment_id: "",
  });

  useEffect(() => {
    fetchProgramSessions(program_id);
  }, [program_id]);

  useEffect(() => {
    fetchPrograms(program_id);
  }, [program_id]);

  //fetch program info
  async function fetchPrograms(program_id) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/get-program-info/${program_id}`
    );
    if (res.ok) {
      const info = await res.json();
      setProgramInfo(info);
      setProgramName(info.program_name_zh);
      setProgramImage(info.program_image);
      setProgramPrice(info.program_price_per_lesson);
    }
  }

  //fetch session info
  async function fetchProgramSessions(program_id) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/programs-sessions/${program_id}`
    );
    if (res.ok) {
      const info = await res.json();

      setSessionInfo(info);

      const sessionDates = info.map((el) => el.session_dates);
      setProgramSessions(sessionDates);
      //['2024-11-07T16:00:00.000Z', '2023-01-01T00:00:00.000Z', '2024-01-01T00:00:00.000Z', '1970-01-01T00:00:00.000Z']
      //['2024-11-15T16:00:00.000Z']
    }
  }

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

  useEffect(() => {
    if (page === 2) {
      router.push(`/payment/${bookingData.payment_id}`);
    }
  }, [page, router, bookingData.payment_id]);

  const PageDisplay = () => {
    switch (page) {
      case 0:
        return (
          <SessionSelection
            programName={programName}
            programImage={programImage}
            programPrice={programPrice}
            programInfo={programInfo}
            programSessions={programSessions}
            sessionInfo={sessionInfo}
            bookingData={bookingData}
            setBookingData={setBookingData}
            page={page}
            setPage={setPage}
            formatDate={formatDate}
          />
        );
      case 1:
        return (
          <PersonalInfo
            programName={programName}
            programPrice={programPrice}
            programImage={programImage}
            programInfo={programInfo}
            bookingData={bookingData}
            setBookingData={setBookingData}
            page={page}
            setPage={setPage}
            formatDate={formatDate}
            merchant_id={merchant_id}
          />
        );
      case 2:
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="mx-10">
      {/* breadcrumb */}
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <a href={`/${merchant_id}`}>Home</a>
          </li>
          <li>{programName}</li>
        </ul>
      </div>

      {/* steps indicator */}
      <ul className="steps w-full mt-5">
        <li className={`step ${page >= 0 ? "step-primary" : ""}`}>
          Session Selection
        </li>
        <li className={`step ${page >= 1 ? "step-primary" : ""}`}>
          Fill-in Personal Details
        </li>
        <li className={`step ${page >= 2 ? "step-primary" : ""}`}>Payment</li>
        <li className={`step ${page >= 3 ? "step-primary" : ""}`}>
          Confirm Booking
        </li>
      </ul>

      {/* Body */}
      <div>{PageDisplay()}</div>
    </div>
  );
}
