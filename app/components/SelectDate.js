export function SelectDate({
  programSessions,
  sessionInfo,
  bookingData,
  setBookingData,
  formatDate,
}) {
  //check single lesson or multiple lesson
  const arrlength = programSessions.map((el) => el.length);

  if (!programSessions || programSessions.length === 0) {
    return <div className="text-center py-4">No session to enroll</div>;
  }

  return (
    <div>
      {arrlength[0] === 1 ? (
        //------------------- single lesson program -------------------

        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Program Sessions*</span>
          </div>
          <select
            className="select select-bordered"
            value={bookingData.selectedSession || ""} // Controlled value
            onChange={(e) => {
              const selectedSessionId = e.target.value;
              const selectedSession = sessionInfo.find((el) =>
                el.session_dates.includes(selectedSessionId)
              );
              setBookingData({
                ...bookingData,
                selectedSession: selectedSessionId,
                session_id: [selectedSession?._id] || null,
              });
            }}
          >
            <option disabled value="">
              Please select
            </option>
            {sessionInfo &&
              sessionInfo.flatMap((el) =>
                el.session_dates.map((j, i) => (
                  <option key={`${el._id}-${i}`} value={j}>
                    {formatDate(j)}
                  </option>
                ))
              )}
          </select>
        </label>
      ) : (
        //------------------- multiple lesson program -------------------
        <div className="form-control">
          {sessionInfo.map((el, index) => {
            return (
              <label
                key={index}
                className="label cursor-pointer flex flex-row border rounded-[30px] px-5 py-5 mb-2 bg-white hover:bg-slate-100 ease-in-out duration-300 items-start"
              >
                <input
                  type="radio"
                  className="radio checked:bg-blue-500"
                  name="radio-10"
                  onChange={(e) =>
                    setBookingData({
                      ...bookingData,
                      selectedSession: e.target.value,
                      session_id: [el._id],
                    })
                  }
                  value={JSON.stringify(el.session_dates)}
                  defaultChecked={
                    el.session_dates === bookingData.selectedSession
                  }
                />

                <span className="label-text flex-1 ml-5 bg-grey ">
                  <p className="text-base font-bold mb-2">Dates</p>
                  {el.session_dates.map((j, i) => (
                    <div key={i}>* {formatDate(j)}</div>
                  ))}
                </span>
                <div className="flex flex-col items-start flex-1 bg-grey">
                  <p className="font-bold mb-2">Details</p>
                  <p className="text-sm">Teacher: {el.teacher}</p>
                  <p className="text-sm">Notice: {el.session_notice}</p>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
