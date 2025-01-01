"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Loading from "../../../components/Loading";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TextField,
  IconButton,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import SearchIcon from "@mui/icons-material/Search";
import moment from "moment";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
    width: "auto",
    margin: "auto",
  },
});

export function AnotherTable({ data, isLoading }) {
  const router = useRouter();
  const classes = useStyles();
  // const rows = Array.isArray(data) ? data : [];
  // const [rows, setRows] = useState(data);
  const [rows, setRows] = useState(Array.isArray(data) ? data : []);
  const [searched, setSearched] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 5; // set the number of records per page
  const [isSelected, setIsSelected] = useState(false);
  const token = localStorage.getItem("token");
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
  // Memoize filteredRows to avoid unnecessary calculations
  const filteredRows = useMemo(() => {
    return rows.filter(
      (row) =>
        row.participant_name.toLowerCase().includes(searched.toLowerCase()) ||
        row.telephone_no.toLowerCase().includes(searched.toLowerCase())
    );
  }, [searched, rows]);
  // Handle search input change
  const handleSearchChange = (event) => {
    setSearched(event.target.value);
  };
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    setSelectedId(null);
  };
  // **** => //
  // Code for hiding the option box
  const dropdownRef = useRef(null);
  const toggleDropdown = (id) => {
    setSelectedId(selectedId === id ? null : id); // Toggle the dropdown visibility
  };
  // Effect to handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPopup(false); // Hide dropdown if clicking outside
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // <= ****//
  // Code for changing the status
  const [newStatus, setNewStatus] = useState(""); // Track the new payment status selection
  const [selectedId, setSelectedId] = useState(null); // Track the participant being edited
  const handleStatusChange = async (_id) => {
    setRows((prevData) =>
      prevData.map((data) => {
        if (data._id === _id) {
          // return { ...data, payment_status: newStatus || data.payment_status };
          return { ...data, payment_status: newStatus };
        }
        return data;
      })
    );
    const result = await updateDatabase(_id, newStatus);
    setIsSelected(false);
    setNewStatus("");
    setSelectedId(null);
  };
  // Update the new payment status to the database
  async function updateDatabase(_id, newStatus) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/update-payment-status2`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            _id,
            payment_status: newStatus, // Pass the new status here
          }),
        }
      ); // Closing the fetch call here
      const res = await response.json();
      console.log(res);
      if (res.ok) {
        console.log("update React here");
        return res;
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      return null;
    }
  }
  const [showPopup, setShowPopup] = useState(false); // Controls popup visibility
  const [currentImage, setCurrentImage] = useState(null);
  // Make the image disappears after the cursor is clicked everywhere
  const popupRef = useRef(null);
  const handlePopupToggle = (imageSrc) => {
    if (currentImage === imageSrc) {
      setShowPopup(false);
      setCurrentImage(null);
    } else {
      setShowPopup(true);
      setCurrentImage(imageSrc);
    }
  };
  const handleClickOutside = (event) => {
    // Check if the clicked target is outside the popupRef
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowPopup(false);
      setCurrentImage(null);
    }
  };
  useEffect(() => {
    // Add event listener for clicks
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // const getStatusColor = (payment_status) => {
  //   if (payment_status === "pending") return "#FFFF00";
  //   else if (payment_status === "completed") return "#008000";
  //   else if (payment_status === "received") return "#0000FF";
  //   else return "transparent";
  // };
  // Handle rows per page change
  //   const handleChangeRowsPerPage = (event) => {
  //     // setRowsPerPage(parseInt(event.target.value, 5));
  //     setPage(0);
  //   };
  return (
    <>
      <div className="w-full">
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Search by name or phone number"
            value={searched}
            onChange={handleSearchChange}
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
      </div>
      {/* --------------------------------分隔個條線--------------------------- */}
      <div className="flex w-full flex-col">
        <div className="divider divider-secondary mt-1 mb-1"></div>
      </div>
      <TableContainer
        component={Paper}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          margin: "auto",
          marginTop: "10px",
        }}
      >
        <Table
          className={classes.table + " bg-base-100 text-base-content"}
          aria-label="simple table"
          sx={{
            tableLayout: "fixed",
            "& .MuiTableCell-root": {
              color: "inherit !important",
              backgroundColor: "transparent", // Optional: ensure cell backgrounds are clear
              borderColor: "var(--fallback-bc, oklch(var(--bc) / 0.1))", // DaisyUI border color
              whiteSpace: "normal",
            },
            width: "100%",
            tableLayout: "fixed",
            // Optional: for consistent column widths
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: "22%",
                  fontSize: "0.75rem", // text-xs
                  fontWeight: 700, // font-bold
                  opacity: 0.6, // opacity-60
                  lineHeight: 1.5,
                }}
              >
                Name and Telephone
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: "17%",
                  whiteSpace: "nowrap",
                  fontSize: "0.75rem", // text-xs
                  fontWeight: 700, // font-bold
                  opacity: 0.6, // opacity-60
                  lineHeight: 1.5,
                }}
              >
                Program Name
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: "17%",
                  whiteSpace: "nowrap",
                  fontSize: "0.75rem", // text-xs
                  fontWeight: 700, // font-bold
                  opacity: 0.6, // opacity-60
                  lineHeight: 1.5,
                }}
              >
                Session Dates
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: "11%",
                  whiteSpace: "nowrap",
                  fontSize: "0.75rem", // text-xs
                  fontWeight: 700, // font-bold
                  opacity: 0.6, // opacity-60
                  lineHeight: 1.5,
                }}
              >
                Payment Status
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: "11%",
                  whiteSpace: "nowrap",
                  fontSize: "0.75rem", // text-xs
                  fontWeight: 700, // font-bold
                  opacity: 0.6, // opacity-60
                  lineHeight: 1.5,
                }}
              >
                Payment Image
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: "17%",
                  whiteSpace: "nowrap",
                  fontSize: "0.75rem", // text-xs
                  fontWeight: 700, // font-bold
                  opacity: 0.6, // opacity-60
                  lineHeight: 1.5,
                }}
              >
                Create Time
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  width: "8%",
                  whiteSpace: "nowrap",
                  fontSize: "0.75rem", // text-xs
                  fontWeight: 700, // font-bold
                  opacity: 0.6, // opacity-60
                  lineHeight: 1.5,
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((datium, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-primary hover:bg-opacity-30"
                  >
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{
                        whiteSpace: "normal", // Override nowrap
                        wordWrap: "break-word",
                      }}
                    >
                      <span
                        className="hover cursor-pointer text-blue-500 hover:underline"
                        onClick={() =>
                          router.push(
                            `/dashboard/participant/${datium.participant_id}`
                          )
                        }
                      >
                        <p>{datium.participant_name}</p>
                      </span>
                      <br />
                      Tel: {datium.telephone_no}
                    </TableCell>
                    <TableCell align="left">{datium.program_name_zh}</TableCell>
                    <TableCell align="left">
                      {datium.session_dates.map((date, index) => (
                        <div key={index}>-{formatDate(date)}</div>
                        // <div key={index}>
                        //   -
                        //   {new Date(date)
                        //     .toLocaleString("en-GB", {
                        //       day: "2-digit",
                        //       month: "2-digit",
                        //       year: "numeric",
                        //       hour: "2-digit",
                        //       minute: "2-digit",
                        //       hour12: true,
                        //     })
                        //     .replace(",", " ")}
                        // </div>
                      ))}
                    </TableCell>
                    <TableCell align="center">
                      <div
                        className={`rounded-lg h-5 ${
                          datium.payment_status === "Pending"
                            ? "bg-red-100 text-red-700 min-w-fit"
                            : datium.payment_status === "Received"
                            ? "bg-yellow-100 text-yellow-700 min-w-fit"
                            : datium.payment_status === "Completed"
                            ? "bg-green-100 text-green-700 min-w-fit"
                            : datium.payment_status === "Cancelled"
                            ? "bg-gray-200 text-gray-700 min-w-fit"
                            : "bg-transparent"
                        }`}
                      >
                        {datium.payment_status}
                      </div>
                    </TableCell>
                    <TableCell align="left">
                      <div className="flex items-center justify-center h-full">
                        {datium.payment_image ? (
                          <span>
                            <span
                              className="text-green-600 underline cursor-pointer"
                              onClick={() =>
                                handlePopupToggle(datium.payment_image)
                              }
                            >
                              Paid
                            </span>
                            {showPopup &&
                              currentImage === datium.payment_image && (
                                <div
                                  ref={popupRef}
                                  className="absolute z-10"
                                  style={{
                                    top: "30%",
                                    left: "45%",
                                  }}
                                >
                                  <div className="relative">
                                    <button
                                      className="absolute -top-2 -right-2 btn btn-xs btn-error cursor-pointer"
                                      onClick={() => {
                                        setShowPopup(false);
                                        setCurrentImage(null); // Reset current image
                                      }}
                                    >
                                      ✕
                                    </button>
                                    <img
                                      src={`${datium.payment_image}`}
                                      alt="Payment"
                                      className="z-10 bg-base-300 p-5 rounded shadow-2xl"
                                      style={{
                                        maxHeight: "450px",
                                        maxWidth: "450px",
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                          </span>
                        ) : (
                          <span className="text-red-600">No Image</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell align="left">
                      {formatDate(datium.createdAt)}
                      {/* {new Date(datium.createdAt)
                          .toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .replace(",", " ")} */}
                    </TableCell>
                    <TableCell align="left" className="relative">
                      <span
                        className="cursor-pointer text-blue-500 hover:underline"
                        // onClick={() =>
                        //   setSelectedId(
                        //     selectedId === datium._id ? null : datium._id
                        //   )
                        // } // Toggle logic
                        onClick={() => toggleDropdown(datium._id)}
                      >
                        Change Status
                      </span>
                      {selectedId === datium._id && (
                        <div
                          className="absolute z-10 bg-base-100 p-4 rounded shadow-2xl w-40"
                          style={{ top: "70%", right: "30%" }}
                          // new code
                          ref={dropdownRef}
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                        >
                          <select
                            className="select select-sm select-bordered w-26 max-w-xs"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                          >
                            <option value="" disabled>
                              Select Status
                            </option>
                            {datium.payment_status !== "Pending" && (
                              <option value="Pending">Pending</option>
                            )}
                            {datium.payment_status !== "Received" && (
                              <option value="Received">Received</option>
                            )}
                            {datium.payment_status !== "Completed" && (
                              <option value="Completed">Completed</option>
                            )}
                          </select>
                          <button
                            className="btn btn-sm btn-accent w-full mt-2"
                            onClick={() => handleStatusChange(datium._id)} // Call the status change function
                            disabled={!newStatus}
                          >
                            Confirm
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <div className="flex justify-center bg-base-100">
          <TablePagination
            component="div"
            count={filteredRows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[]} // Disable rows per page options
            className="bg-base-100 text-base-content"
            sx={{
              "& .MuiTableCell-root": {
                backgroundColor: "transparent", // Optional: ensure cell backgrounds are clear
                borderColor: "var(--fallback-bc, oklch(var(--bc) / 0.1))", // DaisyUI border color
              },
              "& .MuiTablePagination-actions button": {
                color: "oklch(var(--p, 0 0 0))",
                "&:hover": {
                  backgroundColor: "oklch(var(--p, 0 0 0) / 0.1)",
                },
              },
              "& .MuiTablePagination-displayedRows": {
                color: "oklch(var(--bc, 0 0 0))",
              },
            }}
          />
        </div>
      </TableContainer>
    </>
  );
}

const Payment = () => {
  const token = localStorage.getItem("token");
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      await getPaymentFromDatabase();
    };
    fetchData();
  }, []);
  const getPaymentFromDatabase = async () => {
    setIsLoading(true);
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
        const result = await res.json();
        setData(result);
        setIsLoading(false);
        // console.log(result);
      } else {
        console.log("Fail");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false); // Set loading to false after the fetch
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
      {/* -------------------data----------------------------- */}
      {isLoading && <Loading />}
      {!isLoading && (
        <AnotherTable data={data} setData={setData} isloading={isLoading} />
      )}
    </>
  );
};

export default Payment;
