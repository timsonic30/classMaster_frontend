"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CreateProgram from "../../../components/CreateProgram";
import Loading from "../../../components/Loading";

const Program = () => {
  // The simplest method to get the merchantId of the login user -> less safety??
  // Need to comment out the above code for testing with login
  const token = localStorage.getItem("token");
  // const decoded = jwtDecode(merchantIdToken);
  // const merchantId = decoded.payload.merchant_id;
  const [programs, setPrograms] = useState([]);
  // for create programs button control
  const [showPopup, setShowPopup] = useState(true); // Controls popup visibility
  //for searchBar
  const [searchTerm, setSearchTerm] = useState("");
  const [displayedPrograms, setDisplayedPrograms] = useState(programs);
  //for loading bar
  const [isLoading, setIsLoading] = useState(true);

  // for creating program input fields
  const [program, setProgram] = useState({
    progName: "",
    progType: "",
    progSubType: {},
    imageLink: [],
    description: "",
    progNotice: "",
    progPrice: "",
    duration: "",
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    setIsLoading(true);
    try {
      const result = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/all-programs`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const programsData = await result.json();

      if (!result.ok) {
        console.error("Program fetch fail!");
      } else {
        setIsLoading(false);
        setPrograms(programsData);
      }
    } catch (err) {
      throw new Error("Failed Token");
    } finally {
      setIsLoading(false);
    }
  }

  const router = useRouter();

  useEffect(() => {
    if (!searchTerm.trim()) {
      // If search term is empty, show all participants
      setDisplayedPrograms(programs);
    } else {
      // Filter participants based on search term
      const filtered = programs?.filter((programs) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          programs.program_name_zh?.toLowerCase().includes(searchLower) ||
          programs.program_type?.toLowerCase().includes(searchLower)
        );
      });
      setDisplayedPrograms(filtered);
    }
  }, [searchTerm, programs]);

  const handlePopupToggle = () => {
    setShowPopup((prev) => !prev);
  };

  return (
    <>
      {isLoading && <Loading />}
      {!isLoading && (
        <div>
          {/* --------------------------------------Page title----------------------------------- */}
          <h1 className="text-3xl mt-4 mb-2">Programs Page</h1>
          <div className="breadcrumbs text-sm">
            <ul>
              <li>
                <Link href="/dashboard">Home</Link>
              </li>
              <li>
                <a>Program</a>
              </li>
            </ul>
          </div>
          {/* -------------------------search bar----------------------- */}
          <label className="input input-bordered flex items-center gap-2">
            <input
              type="text"
              className="grow"
              placeholder="Search by name or type"
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
              className="btn btn-primary mt-1 mb-4"
              onClick={handlePopupToggle}
            >
              Create Program
            </button>
            {!showPopup && (
              <div
                className="absolute z-10 bg-base-100 p-4 rounded shadow-2xl"
                style={{ top: "100%", left: "0" }}
              >
                <CreateProgram
                  showPopup={showPopup}
                  setShowPopup={setShowPopup}
                  programs={programs}
                  setPrograms={setPrograms}
                />
              </div>
            )}
          </div>

          {/* ---------------------list of program----------------------- */}
          <div className="overflow-x-auto">
            <table className="table">
              {/* head */}
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Price Per Lesson</th>
                </tr>
              </thead>
              {/* table body */}

              <tbody>
                <>
                  {/* 搵唔到野 */}
                  {searchTerm && displayedPrograms?.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        No results found for "{searchTerm}"
                      </td>
                    </tr>
                  ) : (
                    // table本身有野or搵到野
                    displayedPrograms?.map(
                      (
                        {
                          program_name_zh,
                          program_type,
                          program_price_per_lesson,
                          _id,
                        },
                        idx
                      ) => (
                        <tr
                          key={_id}
                          className="hover:bg-primary cursor-pointer hover:bg-opacity-30"
                          onClick={() =>
                            router.push(`/dashboard/program/${_id}`)
                          }
                        >
                          <th>{idx + 1}</th>
                          <td>{program_name_zh}</td>
                          <td>{program_type}</td>
                          <td className="whitespace-pre">
                            {"        "}$
                            {program_price_per_lesson.$numberDecimal}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default Program;
