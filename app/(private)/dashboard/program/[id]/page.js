"use client";
import "../../../../globals.css";
import React, { useState, useEffect, Fragment } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ImageUpload from "../../../../components/ImageUpload_v2";
import { DBRef } from "bson";
import Toast from "@/app/components/Toast";
import Loading from "@/app/components/Loading";

function formatDateToLocal(dateString) {
  const date = new Date(dateString);

  // 檢查日期是否有效
  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const day = String(date.getDate()).padStart(2, "0"); // 補零
  const month = String(date.getMonth() + 1).padStart(2, "0"); // 補零
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0"); // 補零
  const period = hours >= 12 ? "pm" : "am";
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // 12小時格式
  const weekday = date.toLocaleString("en", { weekday: "short" });

  return `${day}/${month}/${year} ${formattedHours}:${minutes}${period} (${weekday})`;
}

const ProgramInfo = () => {
  const params = useParams();

  // Loading
  const [isLoading, setIsLoading] = useState(true);

  // program
  const [programInfo, setProgramInfo] = useState({});
  const [showImage, setShowImage] = useState(false);
  const [uploadImage, setUploadImage] = useState(false);
  // sessions
  const [sessionsInfo, setSessionsInfo] = useState([]);
  const [newSessionInfo, setNewSessionInfo] = useState({
    session_type: "",
    teacher: "",
    session_dates: [isoDateFunction()],
    vacancy_timeslot: 0,
    vacancy_participant: 0,
    session_notice: "",
  });
  const [sessionCreateError, setSessionCreateError] = useState("");
  const [sessionCreateSuccess, setSessionCreateSuccess] = useState("");
  const [sessionUpdating, setSessionUpdating] = useState(false);
  const [sessionUpdateError, setSessionUpdateError] = useState("");
  // const [sessionUpdateSuccess, setSessionUpdateSuccess] = useState("");

  const {
    _id,
    program_name_zh,
    program_type,
    program_subtype,
    description,
    program_notice,
    program_price_per_lesson,
    lesson_duration,
    program_image,
    isEditing,
  } = programInfo;

  const {
    session_type,
    teacher,
    session_dates,
    vacancy_timeslot,
    vacancy_participant,
    session_notice,
  } = newSessionInfo;

  useEffect(() => {
    fetchProgramInfo();
  }, []);

  // api starts

  async function fetchProgramInfo() {
    setIsLoading(true);
    let programInfoData;
    try {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/get-program-info/${params.id}`
      );
      programInfoData = await result.json();
      setIsLoading(false);
    } catch (err) {
      console.log(`fetchProgramInfo ${err}`);
    }
    try {
      const sessions_result = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/get-session-info/${programInfoData._id}`
      );
      const sessionsInfoData = await sessions_result.json();
      setProgramInfo(programInfoData);
      setSessionsInfo(sessionsInfoData);
      setIsLoading(false);
    } catch (err) {
      console.log(`fetchSessionInfo ${err}`);
    } finally {
      setIsLoading(false);
    }
  }

  async function createSessionInfo() {
    try {
      // 將 session_dates 轉換為 UTC 格式
      // 將 session_dates 轉換為 UTC 格式
      const utcSessionDates = newSessionInfo.session_dates.map((date) => {
        const dateObj = new Date(date);

        // 減去 8 小時以轉換為 UTC
        dateObj.setHours(dateObj.getHours() - 8);
        return dateObj.toISOString(); // 這會返回 UTC 格式的 ISO 字串
      });
      const createSession = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/create-session-info`,
        {
          method: "POST",
          body: JSON.stringify({
            ...newSessionInfo,
            session_dates: utcSessionDates, // 使用 UTC 格式的日期
            program_id: programInfo._id,
          }),
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      setSessionCreateSuccess("create session successfully");
    } catch (err) {
      setSessionCreateError("create session failed");
    }
  }
  async function updateProgramInfo() {
    try {
      const updateResult = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/update-program-info`,
        {
          method: "POST",
          body: JSON.stringify({
            programInfo,
          }),
          headers: {
            "Content-type": "application/json",
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  }
  // console.log("sessionsInfo", sessionsInfo);
  async function updateSessionInfo() {
    try {
      const updateResult = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/update-session-info`,
        {
          method: "POST",
          body: JSON.stringify({
            sessionsInfo,
          }),
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      const res = await updateResult.json();
      console.log("res", res.ok);
      console.log("res.message", res.message);
      if (!updateResult.ok) {
        Toast(`${res.message}`, "error");
        return;
      }
      if (res.modifiedCount === 0) {
        Toast("No Changes Made", "info");
      } else {
        Toast(
          `${res.message}, updated ${res.modifiedCount} session${
            res.modifiedCount > 1 ? "s" : ""
          }`,
          "success"
        );
      }
    } catch (err) {
      console.log(err);
    }
  }

  // api ends

  // Sessions function starts

  function isoDateFunction() {
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = String(today.getUTCMonth() + 1).padStart(2, "0"); // 月份從0開始
    const day = String(today.getUTCDate()).padStart(2, "0");

    const hongKongHours = today.getUTCHours() + 8; // 香港時間比 UTC 多 8 小時
    const hours = String(hongKongHours % 24).padStart(2, "0"); // 處理跨日的情況
    const minutes = String(today.getUTCMinutes()).padStart(2, "0");

    // 組合成 ISO 格式字串
    return `${year}-${month}-${day}T${hours}:${minutes}:00.000Z`;
  }

  function newSessionInfoInitialization() {
    setSessionCreateError("");
    setSessionCreateSuccess("");
    setNewSessionInfo({
      session_type: "",
      teacher: "",
      session_dates: [isoDateFunction()],
      vacancy_timeslot: 0,
      vacancy_participant: 0,
      session_notice: "",
    });
  }

  function toggleCreateSessionEditing(e) {
    const { name } = e.target;
    newSessionInfoInitialization();
    if (e.target?.name === "cancel") {
      newSessionInfoInitialization();
    }
  }

  function handleCreateSessionInfo(e) {
    let sessionTypeError = false;
    setSessionCreateError("");
    setSessionCreateSuccess("");
    try {
      if (
        !session_type ||
        !teacher ||
        session_dates.length === 0 ||
        !session_notice
      ) {
        setSessionCreateError("Please input all fields");
        sessionTypeError = true;
        return;
      }
      if (session_type === "timeslot" && session_dates.length > 1) {
        setSessionCreateError(
          "Only 1 session date can be added for type of timeslot"
        );
        setSessionCreateSuccess("");
        sessionTypeError = true;
      }
      newSessionInfoInitialization();
    } catch (err) {
      console.log("session type error");
    }
    if (sessionTypeError) return;
    try {
      createSessionInfo();
      setSessionCreateSuccess("Created Session Successfully");
      fetchProgramInfo();
    } catch (err) {
      console.log("failed to create session");
    }
  }

  function handleCreateSessionEdit(e) {
    const { name, value } = e.target;
    // console.log("name", name);
    // console.log("value", value);
    setSessionCreateError("");
    setSessionCreateSuccess("");
    // session_type, teacher, session_notice
    if (
      name === "session_type" ||
      name === "teacher" ||
      name === "session_notice"
    ) {
      setNewSessionInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    if (name === "vacancy_timeslot" || name === "vacancy_participant") {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        Toast("Please enter a valid non-negative decimal number", "warning");
      }
      if (numValue > 0 || value === "") {
        setNewSessionInfo((prev) => ({
          ...prev,
          [name]: numValue,
        }));
      }
    }
  }
  // console.log("newSessionInfo", newSessionInfo);
  // Function to handle date changes for new session
  function handleNewDateChange(e, index) {
    const newDate = e.target.value; // Get the user-inputted date
    // console.log("newDate", newDate);
    setNewSessionInfo((prev) => {
      const updatedDates = [...prev.session_dates];
      updatedDates[index] = `${newDate}T${updatedDates[index].split("T")[1]}`; // Combine new date with existing time
      return {
        ...prev,
        session_dates: updatedDates,
      };
    });
  }

  // Function to handle time changes for new session
  function handleNewTimeChange(e, index) {
    const newTime = e.target.value; // Get the user-inputted time
    setNewSessionInfo((prev) => {
      const updatedDates = [...prev.session_dates];
      const datePart = updatedDates[index].split("T")[0]; // Get existing date part
      updatedDates[index] = `${datePart}T${newTime}:00.000Z`; // Combine date with new time
      return {
        ...prev,
        session_dates: updatedDates,
      };
    });
  }

  // Function to handle adding a new date input for the new session
  function handleAddNewSessionDate() {
    setNewSessionInfo((prev) => ({
      ...prev,
      session_dates: [...prev.session_dates, isoDateFunction()], // Add current date
    }));
  }

  // Function to handle removing a date from the new session
  function handleRemoveNewSessionDate(index) {
    if (newSessionInfo.session_dates.length === 1) {
      setSessionCreateError(
        "This is the last session date; at least 1 date is required."
      );
      return;
    }
    setNewSessionInfo((prev) => {
      const updatedDates = [...prev.session_dates];
      updatedDates.splice(index, 1); // Remove specified date
      return {
        ...prev,
        session_dates: updatedDates,
      };
    });
  }

  function copyToClipboard(id) {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        Toast(`Session Id: ${id} copied to clipboard!`, "success");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }

  function toggleUpdateSessionEditing(e) {
    setSessionUpdating((prev) => !prev);
    // setSessionUpdateSuccess("");
    setSessionUpdateError("");
    setSessionsInfo((prev) => {
      const updatedSessions = prev.map((session) => {
        return {
          ...session,
          isEditing: !session.isEditing,
        };
      });
      return updatedSessions;
    });
    if (e.target.name === "cancel") {
      // const response = prompt(
      //   "all unsaved sessions changes will be cancelled, input 'Yes' to confirm"
      // );
      // response?.toLowerCase() === "yes" && fetchProgramInfo();
      fetchProgramInfo();
    }
  }

  function handleUpdateSessionInfo(e) {
    toggleUpdateSessionEditing(e);
    // setSessionUpdateSuccess("");
    setSessionUpdateError("");
    const response = Toast(
      `Confirm to update? No revert can be made! (Input "Yes" to continue)`,
      "warning",
      {
        withPrompt: true,
        onPromptSubmit: (response) => {
          if (response.toLowerCase() === "yes")
            try {
              let sessionTypeError = false;
              sessionsInfo.forEach((session) => {
                if (
                  session.session_type === "timeslot" &&
                  session.session_dates.length > 1
                ) {
                  // setSessionUpdateError(
                  //   "Only 1 session date can be added for type of timeslot"
                  // );
                  Toast(
                    "Only 1 session date can be added for type of timeslot",
                    "warning"
                  );
                  // setSessionUpdateSuccess("");

                  sessionTypeError = true;
                }
              });
              if (sessionTypeError) return;
              updateSessionInfo();
            } catch (err) {
              console.log("failed to update session");
            }
        },
      }
    );
  }

  function handleUpdateSessionEdit(e, sessionId) {
    const { name, value } = e.target;

    // data validation
    const numValue = Number(value);
    if (name === "vacancy_timeslot" || name === "vacancy_participant") {
      if (isNaN(numValue)) {
        console.log("check");
        Toast("Please enter a valid non-negative decimal number", "warning");
        return;
      }
    }

    const targetSessionIndex = sessionsInfo.findIndex(
      (session) => session._id === sessionId
    );

    setSessionsInfo((prev) => {
      const updatedSessions = prev.map((session, index) => {
        // session_type, teacher, session_notice
        if (index === targetSessionIndex) {
          if (
            name === "teacher" ||
            name === "session_type" ||
            name === "session_notice"
          ) {
            return {
              ...session,
              [name]: value,
            };
          }
          // vacancy_timeslot, vacancy_participant
          if (name === "vacancy_timeslot" || name === "vacancy_participant") {
            if (!isNaN(numValue) && (numValue > 0 || value === "")) {
              return {
                ...session,
                [name]: numValue,
              };
            }
          }
        }
        if (index !== targetSessionIndex) {
          return {
            ...session,
          };
        }
      });
      return updatedSessions;
    });
  }

  // function handleDateChange(e, sessionId, index) {
  //   const newDate = e.target.value; // 獲取用戶輸入的日期
  //   setSessionsInfo((prev) =>
  //     prev.map((session) => {
  //       if (session._id === sessionId) {
  //         const updatedDates = [...Object.values(session.session_dates)];
  //         updatedDates[index] = `${newDate}T${
  //           updatedDates[index].split("T")[1]
  //         }`; // 保留時間部分與新的日期結合
  //         return {
  //           ...session,
  //           session_dates: updatedDates,
  //         };
  //       }
  //       return session; // 返回未改變的 session
  //     })
  //   );
  // }

  // function handleTimeChange(e, sessionId, index) {
  //   const newTime = e.target.value; // 獲取用戶輸入的時間
  //   setSessionsInfo((prev) =>
  //     prev.map((session) => {
  //       if (session._id === sessionId) {
  //         const updatedDates = [...Object.values(session.session_dates)];
  //         const datePart = updatedDates[index].split("T")[0]; // 獲取原本的日期部分
  //         // 組合成 ISO 格式，補全秒數和毫秒
  //         updatedDates[index] = `${datePart}T${newTime}:00.000Z`;
  //         return {
  //           ...session,
  //           session_dates: updatedDates,
  //         };
  //       }
  //       return session; // 返回未改變的 session
  //     })
  //   );
  // }

  function handleDateChange(e, sessionId, index) {
    const newDate = e.target.value; // 用户输入的日期（yyyy-MM-dd 格式）
    setSessionsInfo((prev) =>
      prev.map((session) => {
        if (session._id === sessionId) {
          const updatedDates = [...Object.values(session.session_dates)];
          const timePart = updatedDates[index].split("T")[1]; // 获取原时间部分
          const hkDateTime = `${newDate}T${timePart}`; // 合并新日期与原时间
          updatedDates[index] = hkDateTime; // 直接存储香港时区的时间格式
          return {
            ...session,
            session_dates: updatedDates,
          };
        }
        return session;
      })
    );
  }

  function handleTimeChange(e, sessionId, index) {
    const newTime = e.target.value; // 用户输入的时间（hh:mm 格式）
    setSessionsInfo((prev) =>
      prev.map((session) => {
        if (session._id === sessionId) {
          const updatedDates = [...Object.values(session.session_dates)];
          const datePart = updatedDates[index].split("T")[0]; // 获取原日期部分
          const hkDateTime = `${datePart}T${newTime}:00.000`; // 合并原日期与新时间
          updatedDates[index] = hkDateTime; // 直接存储香港时区的时间格式
          return {
            ...session,
            session_dates: updatedDates,
          };
        }
        return session;
      })
    );
  }

  function handleRemoveSessionDate(sessionId, index, session_dates) {
    if (session_dates.length === 1) {
      Toast(
        "this is the last session, at least 1 session for 1 program",
        "warning"
      );
      return;
    }
    setSessionsInfo((prev) =>
      prev.map((session) => {
        if (session._id === sessionId) {
          const updatedDates = [...Object.values(session.session_dates)];
          updatedDates.splice(index, 1); // 刪除指定的日期
          return {
            ...session,
            session_dates: updatedDates,
          };
        }
        return session; // 返回未改變的 session
      })
    );
  }

  // function handleAddSessionDate(sessionId) {
  //   const isoDate = isoDateFunction();
  //   console.log("isoDate", isoDate);
  //   setSessionsInfo((prev) =>
  //     prev.map((session) => {
  //       if (session._id === sessionId) {
  //         const updatedDates = [...Object.values(session.session_dates)];
  //         updatedDates.push(isoDate); // 將當前日期添加到 session_dates
  //         return {
  //           ...session,
  //           session_dates: updatedDates,
  //         };
  //       }
  //       return session; // 返回未改變的 session
  //     })
  //   );
  // }
  function handleAddSessionDate(sessionId) {
    const isoDate = isoDateFunction();
    console.log("isoDate", isoDate);

    // 将 ISO 时间转换为 Date 对象并减去 8 小时
    const dateObj = new Date(isoDate);
    const utcTimestamp = dateObj.getTime() - 8 * 60 * 60 * 1000; // 减去 8 小时
    const utcIsoDate = new Date(utcTimestamp).toISOString(); // 转为 UTC 的 ISO 格式

    // 更新 session_dates
    setSessionsInfo((prev) =>
      prev.map((session) => {
        if (session._id === sessionId) {
          const updatedDates = [...Object.values(session.session_dates)];
          updatedDates.push(utcIsoDate); // 添加减去 8 小时后的时间
          return {
            ...session,
            session_dates: updatedDates,
          };
        }
        return session; // 返回未改变的 session
      })
    );
  }

  function handleRemoveSession(e, _id, numberOfParticipant) {
    if (numberOfParticipant > 0) {
      Toast(
        `You have ${numberOfParticipant} participant for this session. Session cannot be removed`
      );
      return;
    }
    const response = Toast(
      `Confirm to update? No revert can be made! (Input "Yes" to continue)`,
      "warning",
      {
        withPrompt: true,
        onPromptSubmit: (response) => {
          if (response.toLowerCase() === "yes") {
            try {
              Toast("Changes Saved", "success");
              deleteSessionByInactive(_id); // Perform deletion
              toggleUpdateSessionEditing(e); // Update session editing state
              fetchProgramInfo(); // Refresh program info
            } catch (err) {
              console.error("Error during session removal:", err);
            }
          } else {
            console.log("Session removal canceled by user.");
          }
        },
      }
    );
  }

  async function deleteSessionByInactive(_id) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/delete-turn-session-to-inactive`,
        {
          body: JSON.stringify({ _id }),
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch {
      console.log("deleteSessionByInactive error", err);
    }
  }

  // Session function ends

  // Program function starts
  function toggleProgramEditing(e) {
    setProgramInfo((prev) => ({
      ...prev,
      isEditing: !prev.isEditing,
    }));
    if (e.target.name === "cancel") {
      fetchProgramInfo();
    }
  }

  function handleUpdateProgramInfo() {
    const response = Toast(
      `Confirm to update? No revert can be made! (Input "Yes" to continue)`,
      "warning",
      {
        withPrompt: true,
        onPromptSubmit: (response) => {
          if (response && response.toLowerCase() === "yes") {
            Toast("Changes Saved", "success");
            setProgramInfo((prev) => ({
              ...prev,
              isEditing: !prev.isEditing,
            }));
            updateProgramInfo();
          }
        },
      }
    );
  }

  function handleProgramEdit(e) {
    const { name, value } = e.target;

    // lesson_duration or program_price_per_lesson
    if (name === "lesson_duration" || name === "program_price_per_lesson") {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        Toast("Please enter a valid non-negative decimal number", "warning");
      }
      if (numValue > 0 || value === "") {
        setProgramInfo((prev) => ({
          ...prev,
          [name]: numValue,
        }));
      }
      return;
    }

    // program_image
    if (name.includes("program_image")) {
      const keys = name.split("+");
      const arrayIndex = parseInt(keys[1]);

      setProgramInfo((prev) => ({
        ...prev,
        [keys[0]]: prev[keys[0]].map((image, index) =>
          // if index === arrayIndex, update value,
          // if index !== arrayIndex, check image.length > 0, > 0 => image, < 0 => placeholder
          index === arrayIndex
            ? value
            : image.length > 0
            ? image
            : `https://via.placeholder.com/150?text=Placeholder`
        ),
      }));
      return;
    }

    // program_subtype
    if (name.includes(".")) {
      const keys = name.split(".");
      setProgramInfo((prev) => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: value,
        },
      }));
      return;
    }

    // program_name_zh, program_type, description, program_notice
    if (name) {
      setProgramInfo((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }

  function handleShowImage() {
    setShowImage((prev) => !prev);
  }

  function handleRemoveImage(e) {
    if (programInfo.program_image.length === 1) {
      Toast("this is the last image, at least 1 image for 1 program", "info");
      return null;
    }
    // const response = Toast('Delete Image: Input "Yes" to confirm', "warning", {
    //   withPrompt: true,
    //   onPromptSubmit: (response) => {
    //     if (
    //       response &&
    //       response.toLowerCase() === "yes" &&
    //       programInfo.program_image.length > 1
    //     ) {
    //       Toast("Image Deleted", "success");
    //       setProgramInfo((prev) => ({
    //         ...prev,
    //         program_image: prev.program_image.filter(
    //           (_, idx) => idx !== parseInt(e.target.name, 10)
    //         ),
    //       }));
    //     }
    //   },
    // });

    if (programInfo.program_image.length > 1) {
      // Toast("Image Deleted", "success");
      setProgramInfo((prev) => ({
        ...prev,
        program_image: prev.program_image.filter(
          (_, idx) => idx !== parseInt(e.target.name, 10)
        ),
      }));
    }
  }

  function handleAddImage() {
    setProgramInfo((prev) => ({
      ...prev,
      program_image: [...prev.program_image, ""],
    }));
  }

  // update program image

  function handleUploadImage() {
    setUploadImage((prev) => !prev);
  }

  // Program function ends

  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && (
        <Fragment>
          {/* Program */}
          {/* --------------------------------------Page title----------------------------------- */}
          <h1 className="text-3xl mt-4 mb-2">Program Detail Page</h1>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href="../../dashboard">Home</Link>
              </li>
              <li>
                <Link href="../program">Program</Link>
              </li>
              <li>
                <a>Program Detail</a>
              </li>
            </ul>
          </div>
          {/* --------------------------------分隔個條線--------------------------- */}
          <div className="flex w-full flex-col">
            <div className="divider divider-secondary mt-1 mb-1"></div>
          </div>
          {/* --------------------------------program detail--------------------------- */}
          <div className="flex justify-center">
            <div className="mt-6 stats stats-vertical shadow w-10/12">
              {programInfo && (
                <>
                  <div className="relative">
                    {/* -------------------------------EDIT---------------------------------- */}
                    {!isEditing ? (
                      <button
                        className="btn btn-primary absolute top-5 right-5"
                        onClick={toggleProgramEditing}
                      >
                        Edit Program Detail
                      </button>
                    ) : (
                      <div className="relative">
                        <div className="absolute top-5 right-5">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={handleUpdateProgramInfo}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-sm"
                            onClick={toggleProgramEditing}
                            name="cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    {/* ------------------------------program detail list------------------------------ */}
                    {_id && (
                      <div>
                        <div className="m-6">
                          {!isEditing ? (
                            // Read
                            <>
                              <div className="flex">
                                <p className="w-28 infoTitle mb-3">
                                  Program Name:
                                </p>
                                <p>{program_name_zh}</p>
                              </div>
                              <div className="flex">
                                <p className="w-28 infoTitle mb-3">
                                  Program Type:
                                </p>
                                <p>{program_type}</p>
                              </div>
                              {/* {program_subtype && (
                            <p>
                              <p>{program_subtype.tag1}</p>
                              <p>{program_subtype.tag2}</p>
                              <p>{program_subtype.tag3}</p>
                            </p>
                          )} */}
                              <div className="flex">
                                <p className="w-28 infoTitle mb-3">
                                  Description:
                                </p>
                                <p className="w-128 mb-3">{description}</p>
                              </div>
                              <div className="flex">
                                <p className="w-28 infoTitle mb-3">
                                  Program Notice:
                                </p>
                                <p>{program_notice}</p>
                              </div>
                              <div className="flex">
                                <p className="w-44 infoTitle mb-3">
                                  Program Price Per Lesson:
                                </p>
                                <p>${program_price_per_lesson}</p>
                              </div>
                              <div className="flex">
                                <p className="w-44 infoTitle mb-3">
                                  {`Lesson Duration (mins):`}
                                </p>
                                <p>{lesson_duration} mins</p>
                              </div>
                              {/* -----------------image button-------------------- */}
                              <div>
                                <button
                                  className={
                                    "btn btn-accent mt-2 mr-2 mb-2 btn-sm"
                                  }
                                  onClick={handleShowImage}
                                >
                                  {`Program Images`}
                                </button>
                                <button
                                  className={"btn btn-accent btn-sm"}
                                  onClick={handleUploadImage}
                                >
                                  {`Upload Program Images`}
                                </button>
                                <div className="flex flex-wrap">
                                  {program_image.length > 0 &&
                                    showImage &&
                                    program_image.map((image, idx) => {
                                      return (
                                        <img
                                          className="h-48"
                                          key={idx}
                                          src={
                                            image ||
                                            "https://via.placeholder.com/150?text=Placeholder"
                                          }
                                        />
                                      );
                                    })}
                                </div>
                                {uploadImage && (
                                  <ImageUpload
                                    prog_id={_id}
                                    programInfo={programInfo}
                                    setProgramInfo={setProgramInfo}
                                  />
                                )}
                              </div>
                            </>
                          ) : (
                            // Update
                            <>
                              <div className="flex">
                                <p className="w-28 infoTitle">Program Name:</p>
                                <input
                                  className="input input-bordered input-sm w-full max-w-xs mb-1"
                                  name="program_name_zh"
                                  value={program_name_zh}
                                  onChange={handleProgramEdit}
                                />
                              </div>
                              <div className="flex">
                                <p className="w-28 infoTitle">Program Type:</p>
                                <input
                                  className="input input-bordered input-sm w-full max-w-xs mb-1"
                                  name="program_type"
                                  value={program_type}
                                  onChange={handleProgramEdit}
                                />
                              </div>
                              {/* {program_subtype && (
                            <div>
                              <div>
                                <input
                                  name="program_subtype.tag1"
                                  value={program_subtype.tag1}
                                  onChange={handleProgramEdit}
                                />
                              </div>
                              <div>
                                <input
                                  name="program_subtype.tag2"
                                  value={program_subtype.tag2}
                                  onChange={handleProgramEdit}
                                />
                              </div>
                              <div>
                                <input
                                  name="program_subtype.tag3"
                                  value={program_subtype.tag3}
                                  onChange={handleProgramEdit}
                                />
                              </div>
                            </div>
                          )} */}
                              <div className="flex">
                                <p className="w-28 infoTitle">Description:</p>
                                <div>
                                  <textarea
                                    name="description" // 使用统一的 name
                                    value={description} // 显示当前的备注内容
                                    onChange={handleProgramEdit} // 更新备注内容
                                    className="textarea textarea-bordered w-128 !important"
                                  />
                                </div>
                              </div>
                              <div className="flex">
                                <p className="w-28 infoTitle">
                                  Program Notice:
                                </p>
                                <input
                                  className="input input-bordered input-sm w-full max-w-xs mb-1"
                                  name="program_notice"
                                  value={program_notice}
                                  onChange={handleProgramEdit}
                                />
                              </div>
                              <div className="flex">
                                <p className="w-40 infoTitle">
                                  Program Price Per Lesson:
                                </p>
                                <input
                                  className="input input-bordered input-sm w-2/12 max-w-xs mb-1"
                                  name="program_price_per_lesson"
                                  type="text"
                                  value={program_price_per_lesson}
                                  onChange={handleProgramEdit}
                                />
                              </div>
                              <div className="flex">
                                <p className="w-40 infoTitle">
                                  {`Lesson Duration: (mins)`}
                                </p>
                                <input
                                  className="input input-bordered input-sm w-2/12 max-w-xs mb-1"
                                  name="lesson_duration"
                                  value={lesson_duration}
                                  onChange={handleProgramEdit}
                                  type="text"
                                />
                              </div>
                              <div>
                                <button
                                  className={"btn btn-accent btn-sm mb-2 mr-2"}
                                  onClick={handleShowImage}
                                >
                                  {`Program Images`}
                                </button>
                                <button
                                  className={"btn btn-accent btn-sm mb-2"}
                                  onClick={handleUploadImage}
                                >
                                  {`Upload Program Images`}
                                </button>
                                <div className="flex flex-wrap">
                                  {program_image.length > 0 &&
                                    showImage &&
                                    program_image.map((image, idx) => {
                                      return (
                                        <Fragment key={idx}>
                                          <div className="flex flex-col mr-2">
                                            {
                                              <img
                                                className="h-48"
                                                key={idx}
                                                src={
                                                  image ||
                                                  "https://via.placeholder.com/150?text=Placeholder"
                                                }
                                              />
                                            }
                                            <input
                                              name={`program_image+${idx}`}
                                              value={
                                                image ||
                                                "https://via.placeholder.com/150?text=Placeholder"
                                              }
                                              onChange={handleProgramEdit}
                                            />
                                            <button
                                              className={"btn btn-xs w-28 mb-2"}
                                              onClick={handleRemoveImage}
                                              name={`${idx}`}
                                            >
                                              Remove Image
                                            </button>
                                          </div>
                                        </Fragment>
                                      );
                                    })}
                                </div>
                                {showImage && (
                                  <div>
                                    <button
                                      className={
                                        "btn btn-secondary btn-sm mt-4"
                                      }
                                      onClick={handleAddImage}
                                    >
                                      Add Image
                                    </button>
                                  </div>
                                )}
                              </div>

                              {/* {program_image.length > 0 &&
                            showImage &&
                            program_image.map((image, idx) => {
                              return (
                                <img
                                  key={idx}
                                  src={
                                    image ||
                                    "https://via.placeholder.com/150?text=Placeholder"
                                  }
                                />
                              );
                            })} */}
                              {uploadImage && (
                                <ImageUpload
                                  prog_id={_id}
                                  programInfo={programInfo}
                                  setProgramInfo={setProgramInfo}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              {/* ------------------Session----------------- */}
              {/* -----------------Session Create Button-------------------- */}
              <div>
                <div className="relative">
                  <button
                    className="btn btn-primary absolute top-5 right-5"
                    onClick={handleCreateSessionInfo}
                  >
                    Create
                  </button>
                </div>
                <div className="ml-5 mt-5">
                  <div className="flex">
                    <p className="w-28 infoTitle">Session Type:</p>
                    <select
                      value={session_type}
                      onChange={(e) => handleCreateSessionEdit(e)}
                      name="session_type"
                      className="select select-bordered w-full max-w-xs select-sm mb-1"
                    >
                      <option disabled defaultValue value="">
                        Select a type
                      </option>
                      <option value="participant">participant</option>
                      <option value="timeslot">timeslot</option>
                    </select>
                  </div>
                  <div className="flex">
                    <p className="w-28 infoTitle">Teacher:</p>
                    <input
                      name="teacher"
                      value={teacher}
                      onChange={(e) => handleCreateSessionEdit(e)}
                      className="input input-bordered input-sm w-full max-w-xs mb-1"
                    />
                  </div>

                  <div>
                    <div className="flex">
                      <p className="w-24 infoTitle">Dates & Time:</p>
                      <button
                        className="btn btn-accent btn-sm mb-1"
                        onClick={(e) => handleAddNewSessionDate(e)}
                      >
                        +
                      </button>
                    </div>
                    {session_dates.map((date, index) => {
                      const [datePart, timePart] = date.split("T");

                      return (
                        <div key={index}>
                          <input
                            type="date"
                            value={datePart}
                            onChange={(e) => handleNewDateChange(e, index)}
                            className="input input-bordered input-sm w-52 max-w-xs mb-1 mr-1"
                          />
                          <input
                            type="time"
                            value={timePart.split(".")[0]} // ignore ms
                            onChange={(e) => handleNewTimeChange(e, index)}
                            className="input input-bordered input-sm w-52 max-w-xs mb-1"
                          />
                          <button
                            className="btn btn-sm ml-2"
                            onClick={() => handleRemoveNewSessionDate(index)}
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  {session_type === "timeslot" && (
                    <>
                      <div className="flex">
                        <p className="w-32 infoTitle">Timeslot Vacancy:</p>
                        <input
                          name="vacancy_timeslot"
                          value={vacancy_timeslot}
                          onChange={(e) => handleCreateSessionEdit(e)}
                          className="input input-bordered input-sm w-full max-w-xs mb-1"
                        />
                      </div>
                      <div className="flex">
                        <p className="w-32 infoTitle">Participant Vacancy:</p>
                        <input
                          name="vacancy_participant"
                          value={vacancy_participant}
                          onChange={(e) => handleCreateSessionEdit(e)}
                          className="input input-bordered input-sm w-full max-w-xs mb-1"
                        />
                      </div>
                    </>
                  )}
                  {session_type === "participant" && (
                    <>
                      <div className="flex">
                        <p className="w-32 infoTitle">Participant Vacancy:</p>
                        <input
                          name="vacancy_participant"
                          value={vacancy_participant}
                          onChange={(e) => handleCreateSessionEdit(e)}
                          className="input input-bordered input-sm w-full max-w-xs mb-1"
                        />
                      </div>
                    </>
                  )}
                  <div className="flex">
                    <p className="w-28 infoTitle">Session Notice:</p>
                    <input
                      name="session_notice"
                      value={session_notice}
                      onChange={(e) => handleCreateSessionEdit(e)}
                      className="input input-bordered input-sm w-full max-w-xs mb-4"
                    />
                  </div>
                  {/* ---------------------------warn msg------------------------ */}
                  {(sessionCreateSuccess && (
                    <p className="text-green-500">{`${sessionCreateSuccess}`}</p>
                  )) ||
                    (sessionCreateError && (
                      <p className="text-red-500">{`${sessionCreateError}`}</p>
                    ))}
                </div>
              </div>

              {/* Session Edit Button */}
              <div>
                {!sessionUpdating ? (
                  <div className="relative">
                    <button
                      className="btn btn-primary absolute top-5 right-5"
                      onClick={toggleUpdateSessionEditing}
                    >
                      Edit All Sessions
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <div className="absolute top-5 right-5">
                        <button
                          className="btn btn-sm btn-success"
                          onClick={handleUpdateSessionInfo}
                        >
                          Save All Sessions
                        </button>
                        <button
                          className="btn btn-sm"
                          name="cancel"
                          onClick={toggleUpdateSessionEditing}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {/* Session */}
                {sessionsInfo[0]?._id &&
                  sessionsInfo.map(
                    (
                      {
                        _id,
                        session_dates,
                        session_notice,
                        session_type,
                        vacancy_participant,
                        vacancy_timeslot,
                        numberOfParticipant,
                        availableSeats,
                        teacher,
                        isEditing,
                      },
                      idx
                    ) => {
                      const formattedDates = session_dates
                        .map(formatDateToLocal)
                        .join(", ");
                      // console.log("session_dates", session_dates);
                      // console.log("formattedDates", formattedDates);
                      {
                        if (!isEditing) {
                          return (
                            <div key={_id} className="mt-5 ml-5">
                              <div className="flex">
                                <p className="w-52 infoTitle">Session Type:</p>
                                <p>{session_type}</p>
                              </div>
                              <div className="flex">
                                <p className="w-52 infoTitle">Teacher:</p>
                                <p>{teacher}</p>
                              </div>
                              <div className="flex">
                                <p className="w-52 infoTitle">Dates:</p>
                                <p>{formattedDates}</p>
                              </div>
                              {session_type === "timeslot" && (
                                <div className="flex">
                                  <p className="w-52 infoTitle">
                                    Timeslot Vacancy:
                                  </p>
                                  <p>{vacancy_timeslot}</p>
                                </div>
                              )}
                              <div className="flex">
                                <p className="w-52 infoTitle">
                                  Participant Vacancy:
                                </p>
                                <p> {vacancy_participant}</p>
                              </div>
                              <div className="flex">
                                <p className="w-52 infoTitle">
                                  Number of Enrolled Participant(s):
                                </p>
                                <p>{numberOfParticipant}</p>
                              </div>
                              <div className="flex">
                                <p className="w-52 infoTitle">
                                  Available Seats:
                                </p>
                                {availableSeats !== 0 ? (
                                  availableSeats
                                ) : (
                                  <p className="text-red-500">
                                    {availableSeats}
                                  </p>
                                )}
                              </div>
                              <div className="flex">
                                <p className="w-52 infoTitle">
                                  Session Notice:
                                </p>
                                <p> {session_notice}</p>
                              </div>
                              <div className="flex">
                                <div className="flex items-center">
                                  <p className="w-52 infoTitle">Session Id:</p>{" "}
                                  <p className="opacity-60">{_id}</p>
                                </div>
                                <button
                                  className={"btn btn-accent btn-sm ml-2 mb-3"}
                                  onClick={() => copyToClipboard(_id)}
                                >
                                  Copy Session Id
                                </button>
                              </div>
                              <div>
                                {/* {sessionUpdateSuccess && (
                              <p className="text-green-500">{`${sessionUpdateSuccess}`}</p>
                            )} */}
                                {sessionUpdateError && (
                                  <p className="text-red-500">{`${sessionUpdateError}`}</p>
                                )}
                              </div>
                              <hr />
                            </div>
                          );
                        }
                        if (isEditing) {
                          return (
                            <div key={_id} className="ml-5 mt-5">
                              <div className="flex">
                                <p className="w-28 infoTitle">Session Type:</p>
                                <select
                                  value={session_type}
                                  onChange={(e) =>
                                    handleUpdateSessionEdit(e, _id)
                                  }
                                  name="session_type"
                                  className="select select-bordered w-full max-w-xs select-sm mb-1"
                                >
                                  <option value="participant">
                                    participant
                                  </option>
                                  <option value="timeslot">timeslot</option>
                                </select>
                              </div>
                              <div className="flex">
                                <p className="w-28 infoTitle">Teacher:</p>
                                <input
                                  name="teacher"
                                  value={teacher}
                                  onChange={(e) =>
                                    handleUpdateSessionEdit(e, _id)
                                  }
                                  className="input input-bordered input-sm w-full max-w-xs mb-1"
                                />
                              </div>
                              <div>
                                <div className="flex">
                                  <p className="w-28 infoTitle">
                                    Dates & Time:
                                  </p>
                                  <button
                                    className="btn btn-accent btn-sm mb-1"
                                    onClick={() => handleAddSessionDate(_id)}
                                  >
                                    +
                                  </button>
                                </div>
                                {session_dates.map((date, index) => {
                                  const [datePart, timePart] = date.split("T");
                                  return (
                                    <div key={index}>
                                      {/* <input
                                    type="date"
                                    value={datePart}
                                    onChange={(e) =>
                                      handleDateChange(e, _id, index)
                                    }
                                    className="input input-bordered input-sm w-52 max-w-xs mb-1 mr-1"
                                  />
                                  <input
                                    type="time"
                                    value={timePart.split(".")[0]} // ignore ms
                                    onChange={(e) =>
                                      handleTimeChange(e, _id, index)
                                    }
                                    className="input input-bordered input-sm w-52 max-w-xs mb-1"
                                  /> */}
                                      <input
                                        type="date"
                                        value={new Date(
                                          session_dates[index]
                                        ).toLocaleDateString("en-CA", {
                                          timeZone: "Asia/Hong_Kong",
                                        })} // 转为香港时区的日期
                                        onChange={(e) =>
                                          handleDateChange(e, _id, index)
                                        }
                                        className="input input-bordered input-sm w-52 max-w-xs mb-1 mr-1"
                                      />
                                      <input
                                        type="time"
                                        value={new Date(
                                          session_dates[index]
                                        ).toLocaleTimeString("en-US", {
                                          timeZone: "Asia/Hong_Kong",
                                          hour12: false, // 确保为 24 小时制或适配 DaisyUI
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })} // 转为香港时区的时间
                                        onChange={(e) =>
                                          handleTimeChange(e, _id, index)
                                        }
                                        className="input input-bordered input-sm w-52 max-w-xs mb-1"
                                      />

                                      <button
                                        className="btn btn-sm ml-2"
                                        onClick={() =>
                                          handleRemoveSessionDate(
                                            _id,
                                            index,
                                            session_dates
                                          )
                                        }
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                              {session_type === "timeslot" && (
                                <div className="flex">
                                  <p className="w-32 infoTitle">
                                    Timeslot Vacancy:
                                  </p>
                                  <input
                                    name="vacancy_timeslot"
                                    value={vacancy_timeslot}
                                    onChange={(e) =>
                                      handleUpdateSessionEdit(e, _id)
                                    }
                                    className="input input-bordered input-sm w-full max-w-xs mb-1"
                                  />
                                </div>
                              )}
                              <div className="flex">
                                <p className="w-32 infoTitle">
                                  Participant Vacancy:
                                </p>
                                <input
                                  name="vacancy_participant"
                                  value={vacancy_participant}
                                  onChange={(e) =>
                                    handleUpdateSessionEdit(e, _id)
                                  }
                                  className="input input-bordered input-sm w-full max-w-xs mb-1"
                                />
                              </div>
                              <div className="flex">
                                <p className="w-52 infoTitle">
                                  Number of Enrolled Participant(s):
                                </p>
                                <p className="mb-1">{numberOfParticipant}</p>
                              </div>
                              <div className="flex">
                                <p className="w-32 infoTitle">
                                  Available Seats:
                                </p>{" "}
                                <p className="mb-1">N/A</p>
                              </div>
                              <div className="flex">
                                <p className="w-32 infoTitle">
                                  Session Notice:
                                </p>
                                <input
                                  name="session_notice"
                                  value={session_notice}
                                  onChange={(e) =>
                                    handleUpdateSessionEdit(e, _id)
                                  }
                                  className="input input-bordered input-sm w-full max-w-xs mb-1"
                                />
                              </div>
                              <div className="flex">
                                <div className="flex items-center">
                                  <p className="w-32 infoTitle">Session Id:</p>
                                  <p className="opacity-60">{_id}</p>
                                </div>
                                <button
                                  className={"btn btn-accent btn-sm ml-2 mb-3"}
                                  onClick={() => copyToClipboard(_id)}
                                >
                                  Copy Session Id
                                </button>
                              </div>
                              <div className="relative">
                                <button
                                  className="btn btn-sm btn-error absolute bottom-3 right-5"
                                  onClick={(e) =>
                                    handleRemoveSession(
                                      e,
                                      _id,
                                      numberOfParticipant
                                    )
                                  }
                                >
                                  Remove Session
                                </button>
                              </div>
                              <div>
                                {/* {(sessionUpdateSuccess && (
                              <p className="text-green-500">{`${sessionUpdateSuccess}`}</p>
                            )) || */}
                                {sessionUpdateError && (
                                  <p className="text-red-500">{`${sessionUpdateError}`}</p>
                                )}
                              </div>
                              <hr />
                            </div>
                          );
                        }
                      }
                    }
                  )}
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </>
  );
};
export default ProgramInfo;
