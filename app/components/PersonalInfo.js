import { NextResponse } from "next/server";

export default function PersonalInfo({
  programName,
  programPrice,
  programImage,
  programInfo,
  bookingData,
  setBookingData,
  page,
  setPage,
  formatDate,
  merchant_id,
}) {
  const getSessionLength = () => {
    try {
      const sessionLength = JSON.parse(bookingData.selectedSession);
      return Array.isArray(sessionLength) ? sessionLength.length : 1;
    } catch {
      return 1;
    }
  };

  const renderSessions = () => {
    try {
      const sessions = JSON.parse(bookingData.selectedSession);
      if (Array.isArray(sessions)) {
        return sessions.map((session, index) => (
          <div key={index}>{formatDate(session)}</div>
        ));
      } else {
        return <div>{formatDate(sessions)}</div>;
      }
    } catch {
      return <div>{formatDate(bookingData.selectedSession)}</div>;
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/add-new-participant-non-merchant`,
        {
          method: "POST",
          body: JSON.stringify({
            participant_name: bookingData.name,
            telephone_no: bookingData.phone,
            merchantId: merchant_id,
            enrolled_session_id: bookingData.session_id,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );
      const dbResponse = await res.json();
      console.log("dbResponse.message", dbResponse.message);
      console.log("dbResponse.paymentId", dbResponse.paymentId);
      setBookingData((prevData) => ({
        ...prevData,
        payment_id: dbResponse.paymentId,
      }));
      if (!res.ok) {
        throw new Error(
          `Failed to post data: ${res.status} - ${res.statusText}`
        );
      }
      console.log(bookingData);
      //move to next page
      setPage((currPage) => currPage + 1);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  return (
    <div className="body-container lg:min-h-[600px] flex flex-col lg:flex-row lg:mx-20 my-10 gap-5 lg:gap-10">
      {/* Left Container */}
      <div className="lg:w-[60%]">
        <div className="left-card relative h-full flex flex-col gap-5 px-10 lg:px-14 py-10 rounded-md shadow-lg bg-white">
          {/* Program Detail */}
          <h2 className="text-xl font-bold mb-5">Enroll Program</h2>
          <div className="progam-container flex flex-row gap-5 lg:gap-10">
            <img
              src={programImage[0]}
              className="w-20 lg:w-32 rounded"
              alt="Program"
            />
            <div className="flex flex-col items-start justify-around w-full">
              <p className="text-start text-lg font-bold">{programName}</p>
              <p className="text-start text-md">
                {programInfo.lesson_duration / 60 > 1
                  ? `${programInfo.lesson_duration / 60} hours`
                  : `${programInfo.lesson_duration / 60} hour`}

                <span className="text-sm text-gray-500 italic">
                  {" "}
                  / per lesson
                </span>
              </p>

              <p className="text-start">
                HK ${programPrice}{" "}
                <span className="text-sm text-gray-500 italic">
                  / per lesson
                </span>
              </p>
            </div>
          </div>
          <div className="divider"></div>

          {/* Personal Information */}
          <h1 className="text-lg font-bold">Personal Information</h1>

          <div className="flex flex-col gap-5 w-full py-5">
            <label className="input input-bordered flex items-center gap-2">
              Name:
              <input
                type="text"
                className="grow"
                placeholder="Type here*"
                value={bookingData.name}
                onChange={(e) =>
                  setBookingData({ ...bookingData, name: e.target.value })
                }
              />
            </label>
            <label className="input input-bordered flex items-center gap-2">
              Phone:
              <input
                type="tel"
                className="grow"
                placeholder="Type here*"
                value={bookingData.phone}
                maxLength={8}
                onChange={(e) => {
                  //only allow number
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  setBookingData({ ...bookingData, phone: value });
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Right Container */}
      <div className="lg:w-[40%]">
        <div className="right-card h-full flex flex-col gap-3 shadow-lg rounded-md bg-white px-10 lg:px-10 py-10">
          <h2 className="text-xl text-center font-bold">Confirm Program</h2>
          <div className="divider"></div>

          <div>
            <p className="font-bold">Selected Sessions:</p>
            <div>{renderSessions()}</div>
          </div>

          {/* <p className="text-gray-500 text-sm italic">
            Remark: {bookingData.remark}
          </p> */}

          {/* Bill */}
          <div className="bill-card rounded-md shadow-md my-5 bg-white">
            <h3 className="text-center font-bold text-lg bg-slate-100 w-full py-3">
              Total
            </h3>
            <div className="font-wrapper py-5 px-4 lg:px-8">
              <div className="flex flex-row justify-between">
                <p>Program Price:</p>
                <p>HK ${programPrice}</p>
              </div>
              {/* <div className="flex flex-row justify-between">
                <p>Number of People:</p>
                <p>{bookingData.numberOfPeople}</p>
              </div> */}
              <div className="flex flex-row justify-between">
                <p>Number of Session:</p>
                <p>{getSessionLength()}</p>
              </div>
              <div className="divider"></div>
              <div className="flex flex-row justify-between text-lg">
                <p>Total: </p>
                <p className="font-bold">
                  HK ${programPrice * getSessionLength()}
                </p>
              </div>
            </div>
          </div>

          <div className="btn-container flex flex-col gap-5 my-5 ">
            {/* Confirm Button */}
            <button
              className="btn btn-block btn-neutral"
              disabled={!bookingData.name || !bookingData.phone}
              onClick={handleSubmit}
            >
              Confirm Booking
            </button>
            {/* Prev Page */}
            <button
              className="btn btn-block "
              onClick={() => {
                setPage((currPage) => currPage - 1);
              }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
