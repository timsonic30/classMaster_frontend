"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "../../../globals.css";
import { jwtDecode } from "jwt-decode";
import Loading from "../../../components/Loading";

const Participant = () => {
  // Same as the code in program folder page.js. The simplest method to get the merchantId of the login user
  // Need to comment out the above code for testing with login
  const token = localStorage.getItem("token");
  const [participants, setParticipants] = useState([]);
  // for create parti
  const [partiName, setPartiName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [sessionIds, setSessionIds] = useState([""]);
  // for create participant button control
  const [showPopup, setShowPopup] = useState(false); // Controls popup visibility
  //for searchBar
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedParticipants, setDisplayedParticipants] =
    useState(participants);
  //for loading bar
  const [isLoading, setIsLoading] = useState(true);

  const handleSessionInputChange = (index, value) => {
    setSessionIds((prevSessionIds) => {
      const newSessionIds = [...prevSessionIds];
      newSessionIds[index] = value;
      return newSessionIds;
    });
  };

  const handlePopupToggle = () => {
    setShowPopup((prev) => !prev);
    if (!showPopup) {
      // Reset fields if opening the popup
      setPartiName("");
      setTelephone("");
      setSessionIds([""]);
      setSuccess("");
      setError("");
    }
  };

  const addSessionId = () => {
    setSessionIds([...sessionIds, ""]);
  };

  const removeSessionId = () => {
    if (sessionIds.length > 1) {
      setSessionIds(sessionIds.slice(0, sessionIds.length - 1));
    }
  };

  const isValidObjectId = (id) => {
    const objectIdRegex = /^[a-fA-F0-9]{24}$/;
    return objectIdRegex.test(id);
  };

  const router = useRouter();

  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search term is empty, show all participants
      setDisplayedParticipants(participants);
    } else {
      // Filter participants based on search term
      const filtered = participants?.filter((participant) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          participant.participant_name.toLowerCase().includes(searchLower) ||
          participant.telephone_no.toLowerCase().includes(searchLower)
        );
      });
      setDisplayedParticipants(filtered);
    }
  }, [searchTerm, participants]);

  // older version
  // async function handleSubmit() {
  //   setError("");
  //   // ----------------------------create 新parti-----------------------------------
  //   if (partiName && telephone && sessionIds.length > 0) {
  //     // Session Id Object Id Validation
  //     const invalidIds = sessionIds
  //       .map((id, index) => (isValidObjectId(id) ? null : index + 1))
  //       .filter((index) => index !== null); //

  //     if (invalidIds.length > 0) {
  //       const errorMessage =
  //         invalidIds.length === 1
  //           ? `Invalid Session Id found at: ${invalidIds[0]}`
  //           : `Invalid Session Ids found at: ${invalidIds.join(", ")}`;
  //       setError(errorMessage);
  //       return;
  //     }

  //     setShowAddList(false);
  //     const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/add-new-participant`, {
  //       method: "POST",
  //       body: JSON.stringify({
  //         participant_name: partiName,
  //         telephone_no: telephone,
  //         enrolled_session_id: sessionIds,
  //       }),
  //       headers: {
  //         "Content-type": "application/json",
  //       },
  //     });

  //     const responseText = await res.text();
  //     console.log("Response text:", responseText);

  //     if (res.ok) {
  //       setPartiName("");
  //       setTelephone("");
  //       setSessionIds([""]);
  //       fetchParticipants();
  //     } else {
  //       setError("Create failed");
  //     }
  //   } else {
  //     setError(
  //       "Please input all fields and at least 1 Session Id should be added."
  //     );
  //   }
  // }

  // wilson version
  async function handleSubmit() {
    setError("");
    setSuccess("");

    const validDigits = ["2", "3", "5", "6", "7", "8", "9"];
    if (telephone.length !== 8) {
      setError("The phone number must be 8 digits");
      return;
    } else if (
      !validDigits.includes(telephone[0]) ||
      telephone.slice(0, 3) === "999"
    ) {
      setError("The phone number must be a valid number");
      return;
    }

    if (partiName && telephone && sessionIds.length > 0) {
      // Session Id Object Id Validation
      const invalidIds = sessionIds
        .map((id, index) => (isValidObjectId(id) ? null : index + 1))
        .filter((index) => index !== null); //

      if (invalidIds.length > 0) {
        const errorMessage =
          invalidIds.length === 1
            ? `Invalid Session Id found at: ${invalidIds[0]}`
            : `Invalid Session Ids found at: ${invalidIds.join(", ")}`;
        setError(errorMessage);
        return;
      }

      // Session Id Object Id duplication checking
      const nonDuplicatedSessionIds = [...new Set(sessionIds)];
      if (nonDuplicatedSessionIds.length !== sessionIds.length) {
        setError(`Session Ids are repeated, please check`);
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/add-new-participant`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            participant_name: partiName,
            telephone_no: telephone,
            enrolled_session_id: sessionIds,
          }),
        }
      );

      const responseText = await res.json();
      console.log("Response text:", responseText);

      if (res.ok) {
        setPartiName("");
        setTelephone("");
        setSessionIds([""]);
        fetchParticipants();
        setSuccess(`Create success, new participant is added`);
        fetchParticipants();
      } else {
        setError(`Create failed, ${responseText.message}`);
      }
    } else {
      setError(
        "Please input all fields and at least 1 Session Id should be added."
      );
    }
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
      console.log("participantsData fetched");
      // console.log("participantsData", participantsData);
      if (!result.ok) {
        setError("Sorry Please Check Participants Later");
      } else {
        setParticipants(participantsData);
        setIsLoading(false);
      }
    } catch (err) {
      console.log(`participantsData ${err}`);
      console.log("result.message", result.message);
      throw new Error("Failed Token");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && (
        <div>
          {/* --------------------------------------Page title----------------------------------- */}
          <h1 className="text-3xl mt-4 mb-2">Participant Page</h1>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href="/dashboard">Home</Link>
              </li>
              <li>
                <a>Participant</a>
              </li>
            </ul>
          </div>
          {/* -------------------------search bar----------------------- */}
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              className="grow"
              placeholder="Search by name or phone number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                clipRule="evenodd"
              />
            </svg>
          </label>
          {/* --------------------------------分隔個條線--------------------------- */}
          <div className="flex w-full flex-col">
            <div className="divider divider-secondary mt-1 mb-1"></div>
          </div>
          {/* -------------------------------Create Participant button-------------------------- */}
          <div className="relative">
            <button
              className="btn mt-1 mb-4 btn-primary"
              onClick={handlePopupToggle}
            >
              Create Participant
            </button>
            {showPopup && (
              <div
                className="absolute z-10 bg-base-100 p-4 rounded shadow-2xl"
                style={{ top: "100%", left: "0" }}
              >
                <div>
                  <input
                    value={partiName}
                    placeholder="Participant Name"
                    onChange={(e) => setPartiName(e.target.value)}
                    className="input input-bordered input-sm w-full max-w-xs mb-1"
                  />
                </div>
                <div>
                  <input
                    value={telephone}
                    placeholder="Telephone Number"
                    onChange={(e) => setTelephone(e.target.value)}
                    maxLength="8"
                    className="input input-bordered input-sm w-full max-w-xs mb-1"
                  />
                </div>
                <div>
                  <div className="flex items-center mb-4">
                    <div className="infoTitle">Session:</div>
                    <button
                      className="btn ml-1 mt-1 w-12 btn-accent"
                      onClick={addSessionId}
                    >
                      +
                    </button>
                    <button
                      className="btn ml-1 mt-1  w-12"
                      onClick={removeSessionId}
                    >
                      -
                    </button>
                  </div>
                  <div className="flex flex-col">
                    {sessionIds.map((sessionId, index) => (
                      <input
                        className="input input-bordered input-sm w-full max-w-xs mb-1"
                        key={index}
                        value={sessionId}
                        placeholder={`Session Id ${index + 1}`}
                        onChange={(e) =>
                          handleSessionInputChange(index, e.target.value)
                        }
                      />
                    ))}
                  </div>
                </div>
                <button
                  className="btn mb-4 mt-4 text-xs btn-accent"
                  onClick={handleSubmit}
                >
                  Create
                </button>
                {error && <p className="text-red-500">{error}</p>}
              </div>
            )}
            {success && <p className="text-green-500">{success}</p>}
          </div>

          {/* ---------------------list of parti----------------------- */}
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Remarks</th>
                  <th>Phone Number</th>
                </tr>
              </thead>
              {/* table body */}
              <tbody>
                <>
                  {/* 搵唔到野 */}
                  {searchTerm && displayedParticipants?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No results found for "{searchTerm}"
                      </td>
                    </tr>
                  ) : (
                    // table本身有野or搵到野
                    displayedParticipants?.map(
                      (
                        {
                          participant_name,
                          _id,
                          telephone_no,
                          merchants_remarks,
                        },
                        idx
                      ) => (
                        <tr
                          key={_id}
                          className="hover:bg-primary cursor-pointer hover:bg-opacity-30"
                          onClick={() =>
                            router.push(`/dashboard/participant/${_id}`)
                          }
                        >
                          <th>{idx + 1}</th>
                          <td>{participant_name}</td>
                          <td>{merchants_remarks}</td>
                          <td>{telephone_no}</td>
                        </tr>
                      )
                    )
                  )}
                </>
              </tbody>
            </table>
          </div>
          {/* -----------------------------------change Pages button------------------------------------ */}
          {/* <div className="join mt-2">
        <input
          className="join-item btn btn-square"
          type="radio"
          name="options"
          aria-label="1"
          defaultChecked
        />
        <input
          className="join-item btn btn-square"
          type="radio"
          name="options"
          aria-label="2"
        />
        <input
          className="join-item btn btn-square"
          type="radio"
          name="options"
          aria-label="3"
        />
        <input
          className="join-item btn btn-square"
          type="radio"
          name="options"
          aria-label="4"
        />
      </div> */}
        </div>
      )}
    </>
  );
};

export default Participant;
