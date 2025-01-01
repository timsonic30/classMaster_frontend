"use client";
import "../../../../globals.css";
import React, { useState, useEffect, Fragment } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
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

const ParticipantInfo = () => {
  const params = useParams();
  const token = localStorage.getItem("token");
  const [participant, setParticipant] = useState({});
  const [programDataPackage, setProgramDataPackage] = useState([]);
  const { _id, participant_name, telephone_no, isEditing, merchants_remarks } =
    participant;
  const [sessionIds, setSessionIds] = useState([""]);
  const [updateSessionErrorMsg, setUpdateSessionErrorMsg] = useState("");
  const [updateSessionSuccessMsg, setUpdateSessionSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  if (!token) {
    Toast("No authorization token found.", "error");
    return;
  }

  useEffect(() => {
    fetchParticipants();
  }, []);

  async function fetchParticipants() {
    setIsLoading(true);
    try {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/all-participants`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const participantsData = await result.json();
      const participantData = participantsData.filter(
        (participant) => participant._id === params.id
      );

      const sessionResult = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/get-programId-by-sessionId`,
        {
          method: "POST",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(participantData[0].enrolled_session_id),
        }
      );
      //_id: 1, program_id: 1, session_dates: 1
      const sessionResultWithProgramId = await sessionResult.json();

      if (participantData.length > 0) {
        setParticipant(participantData[0]);
      } else {
        Toast("Participant not found.", "info");
      }
      setProgramDataPackage(sessionResultWithProgramId);

      if (!result.ok) {
        console.error("Participants Details fetch fail");
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      throw new Error("Failed Token");
    } finally {
      setIsLoading(false);
    }
  }

  async function updateParticipantInfo() {
    try {
      const updateResult = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/update-participant-info`,
        {
          method: "POST",
          body: JSON.stringify({
            _id,
            participant_name,
            telephone_no,
            merchants_remarks,
          }),
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const response = await updateResult.json();

      if (response.success) {
        Toast("Participant info updated successfully!", "success");
      } else {
        Toast("Failed to update participant info!", "error");
      }
    } catch (err) {
      console.log(err);
      Toast("An error occurred while updating participant info!", "error");
    }
  }

  async function updateParticipantInfo_session() {
    try {
      console.log("");
      const updateParticipantSession = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/update-participant-info-session`,
        {
          body: JSON.stringify({
            participantId: participant._id,
            sessionIds,
          }),
          method: "POST",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const res = await updateParticipantSession.json();
      console.log("res.message", res.message);
      if (!updateParticipantSession.ok) {
        // 處理非200的響應
        setUpdateSessionErrorMsg(res.message || "Update failed");
        return;
      }

      setUpdateSessionSuccessMsg(
        `${res.message}, added ${res.modifiedCount} session id`
      );
      fetchParticipants();
    } catch (err) {
      console.log("updateParticipantInfo_session", err);
      setUpdateSessionErrorMsg("An unexpected error occurred");
    }
  }

  function toggleParticipantEditing(e) {
    setParticipant((prev) => ({
      ...prev,
      isEditing: !prev.isEditing,
    }));
    if (e.target.name === "cancel") {
      fetchParticipants();
    }
  }

  function handleUpdateParticipantInfo() {
    const response = Toast(
      `Confirm to update? No revert can be made! (Input "Yes" to continue)`,
      "warning",
      {
        withPrompt: true,
        onPromptSubmit: (response) => {
          if (response && response.toLowerCase() === "yes") {
            setParticipant((prev) => ({
              ...prev,
              isEditing: !prev.isEditing,
            }));
            updateParticipantInfo();
          }
        },
      }
    );
  }

  function handleParticipantEdit(e) {
    const { name, value } = e.target;

    // 如果是普通字段（例如 participant_name, telephone_no 等），直接更新它
    if (name && !name.startsWith("remarks_")) {
      setParticipant((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // 如果是 merchants_remarks 字段（备注），直接更新备注
    if (name === "merchants_remarks") {
      setParticipant((prev) => ({
        ...prev,
        merchants_remarks: value, // 直接更新备注内容
      }));
    }
  }

  const addSessionId = () => {
    setSessionIds([...sessionIds, ""]);
    setUpdateSessionErrorMsg("");
    setUpdateSessionSuccessMsg("");
  };

  const removeSessionId = () => {
    if (sessionIds.length > 1) {
      setSessionIds(sessionIds.slice(0, sessionIds.length - 1));
      setUpdateSessionErrorMsg("");
      setUpdateSessionSuccessMsg("");
    }
  };

  const handleSessionInputChange = (index, value) => {
    setSessionIds((prevSessionIds) => {
      const newSessionIds = [...prevSessionIds];
      newSessionIds[index] = value;
      return newSessionIds;
    });
    setUpdateSessionErrorMsg("");
    setUpdateSessionSuccessMsg("");
  };

  const handleUpdateSessions = () => {
    setUpdateSessionSuccessMsg("");
    setUpdateSessionErrorMsg("");
    try {
      const isValidObjectId = (id) => {
        const objectIdRegex = /^[a-fA-F0-9]{24}$/;
        return objectIdRegex.test(id);
      };

      // Session Id Object Id Validation
      const invalidIds = sessionIds
        .map((id, index) => (isValidObjectId(id) ? null : index + 1))
        .filter((index) => index !== null); //

      if (invalidIds.length > 0) {
        const errorMessage =
          invalidIds.length === 1
            ? `Invalid Session Id found at: ${invalidIds[0]}`
            : `Invalid Session Ids found at: ${invalidIds.join(", ")}`;
        setUpdateSessionErrorMsg(errorMessage);
        return;
      }

      // Session Id Object Id duplication checking
      const nonDuplicatedSessionIds = [...new Set(sessionIds)];
      if (nonDuplicatedSessionIds.length !== sessionIds.length) {
        setUpdateSessionErrorMsg(`Session Ids are repeated, please check`);
        return;
      }
      updateParticipantInfo_session();
    } catch (err) {
      console.log("handleUpdateSessions", err);
    }
  };

  async function deleteEnrolledSession(sessionId) {
    try {
      const deleteEnrolledSession = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/delete-participant-enrolled-session`,
        {
          body: JSON.stringify({
            participantId: participant._id,
            sessionId,
          }),
          method: "DELETE",
          headers: {
            "Content-type": "application/json",
          },
        }
      );
      const res = await deleteEnrolledSession.json();
      if (!deleteEnrolledSession.ok) {
        console.log("deleteEnrolledSession error", res.message);
        throw new Error(res.message);
      }
      fetchParticipants();
    } catch (err) {
      console.log("deleteEnrolledSession error", err);
      throw err;
    }
  }

  const handleRemoveEnrolledSession = (sessionId) => {
    try {
      const response = Toast(
        `DELETE WARMING: Input "Yes" to confirm`,
        "warning",
        {
          withPrompt: true,
          onPromptSubmit: (response) => {
            if (response && response.toLowerCase() === "yes") {
              Toast("Changes Saved", "success");
              deleteEnrolledSession(sessionId);
            }
          },
        }
      );
    } catch (err) {
      console.log("handleRemoveEnrolledSession", err);
    }
  };

  function copyToClipboard(id) {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        Toast(`Session Id ${id} copied to clipboard!`, "success");
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }

  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && (
        <Fragment>
          {/* --------------------------------------Page title----------------------------------- */}
          <h1 className="text-3xl mt-4 mb-2">Participant Detail Page</h1>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href="../../dashboard">Home</Link>
              </li>
              <li>
                <Link href="../participant">Participant</Link>
              </li>
              <li>
                <a>Participant Detail</a>
              </li>
            </ul>
          </div>
          {/* --------------------------------分隔個條線--------------------------- */}
          <div className="flex w-full flex-col">
            <div className="divider divider-secondary mt-1 mb-1"></div>
          </div>

          {/* ---------------------------------parti detail------------------------- */}

          <div className="flex justify-center">
            <div className="mt-6 stats stats-vertical shadow w-10/12">
              <div className="stat">
                {!isEditing
                  ? //read
                    _id && (
                      <div key={_id}>
                        <div className="flex mb-2 items-center justify-between">
                          <div className="flex">
                            <p className="w-24 infoTitle">Name:</p>
                            <p> {participant_name}</p>
                          </div>

                          <button
                            className="btn btn-primary w-16"
                            onClick={toggleParticipantEditing}
                          >
                            Edit
                          </button>
                        </div>
                        <div className="flex mb-4">
                          <p className="w-24 infoTitle">Tel:</p>
                          <p> {telephone_no}</p>
                        </div>
                        <div className="flex items-top mb-4">
                          <p className="w-24 infoTitle">remarks:</p>
                          <div>
                            {merchants_remarks && (
                              <div>{merchants_remarks}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  : //update
                    _id && (
                      <div key={_id}>
                        <div className="flex mb-2 items-center justify-between">
                          <div className="flex">
                            <p className="w-36 infoTitle">Name:</p>
                            <input
                              name="participant_name"
                              value={participant_name}
                              onChange={handleParticipantEdit}
                              className="input input-bordered input-sm w-full max-w-xs mb-1"
                            />
                          </div>

                          <>
                            <div className="flex">
                              <button
                                className="btn btn-success"
                                onClick={handleUpdateParticipantInfo}
                              >
                                Save
                              </button>
                              <button
                                className="btn "
                                onClick={toggleParticipantEditing}
                                name="cancel"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        </div>
                        <div className="flex mb-4">
                          <p className="w-24 infoTitle">Tel:</p>
                          <input
                            name="telephone_no"
                            value={telephone_no}
                            onChange={handleParticipantEdit}
                            className="input input-bordered input-sm w-60 max-w-xs mb-1"
                            maxLength={8}
                          />
                        </div>
                        <div className="flex items-top mb-4">
                          <p className="w-24 infoTitle">remarks:</p>
                          <div>
                            <textarea
                              name="merchants_remarks" // 使用统一的 name
                              value={merchants_remarks || ""} // 显示当前的备注内容
                              onChange={handleParticipantEdit} // 更新备注内容
                              className="textarea textarea-bordered w-96 !important"
                            />
                          </div>
                        </div>
                      </div>
                    )}
              </div>
              {/* -----------------------------------add session----------------------------------- */}
              {participant._id && (
                <div className="flex mt-2 mb-2 justify-between">
                  <div className="ml-6">
                    <div className="flex items-center mb-4 mt-3">
                      <div className="w-24 infoTitle mr-2">
                        Enrolled Session:
                      </div>
                      <button
                        className="btn ml-1 mt-1 mb-1 w-12 btn-accent"
                        onClick={addSessionId}
                      >
                        +
                      </button>
                      <button
                        className="btn ml-1 mt-1 mb-1 w-12 "
                        onClick={removeSessionId}
                      >
                        -
                      </button>
                    </div>
                    <div id="container" className="mb-2">
                      {sessionIds.map((sessionId, index) => (
                        <div key={index}>
                          <input
                            className="input input-bordered input-sm w-full max-w-xs mb-1"
                            type="text"
                            value={sessionId}
                            placeholder={`Session Id ${index + 1}`}
                            onChange={(e) =>
                              handleSessionInputChange(index, e.target.value)
                            }
                          />
                        </div>
                      ))}
                    </div>
                    {updateSessionErrorMsg && (
                      <div className="text-red-500">
                        {updateSessionErrorMsg}
                      </div>
                    )}
                    {updateSessionSuccessMsg && (
                      <div className="text-green-500">
                        {updateSessionSuccessMsg}
                      </div>
                    )}
                  </div>
                  <button
                    className="btn w-16 mr-6 mt-4 btn-primary"
                    onClick={() => handleUpdateSessions()}
                  >
                    Create
                  </button>
                </div>
              )}

              <div className="stat">
                {programDataPackage.length > 0 &&
                  programDataPackage.map(({ programInfo, sessionInfo }) => {
                    const formattedDates = sessionInfo.session_dates
                      .map(formatDateToLocal)
                      .join(", ");
                    return (
                      <div key={programInfo._id + "-" + sessionInfo._id}>
                        <div className="flex items-center justify-between">
                          <p className="infoTitle">Program Name:</p>
                          {programDataPackage.length === 1 ? (
                            <button
                              disabled
                              className="btn btn-sm w-16 btn-error "
                              onClick={() =>
                                handleRemoveEnrolledSession(sessionInfo._id)
                              }
                            >
                              Remove
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm w-16 btn-error"
                              onClick={() =>
                                handleRemoveEnrolledSession(sessionInfo._id)
                              }
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="mb-3 ml-10 mt-2">
                          {programInfo.program_name_zh}
                        </p>
                        <p className="infoTitle mb-4">Session Date:</p>
                        <p className="mb-3 ml-10 mt-2">{formattedDates}</p>
                        {/* session id && button */}
                        <div className="flex flex-col w-full">
                          <p className="infoTitle mb-4">Session Id:</p>{" "}
                          <div className="flex flex-row">
                            <p className="mb-3 ml-10 mt-2">{sessionInfo._id}</p>
                            <button
                              className={"btn btn-sm btn-accent ml-2 mb-3"}
                              onClick={() => copyToClipboard(sessionInfo._id)}
                            >
                              Copy Session Id
                            </button>
                          </div>
                        </div>
                        <div className="divider "></div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </Fragment>
      )}
    </>
  );
};
export default ParticipantInfo;
