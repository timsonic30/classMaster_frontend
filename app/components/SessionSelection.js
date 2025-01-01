import { SelectDate } from "./SelectDate";
import { ImageCarousel } from "./ImageCarousel";

export default function SessionSelection({
  programName,
  programPrice,
  programInfo,
  programSessions,
  bookingData,
  setBookingData,
  page,
  setPage,
  programImage,
  sessionInfo,
  formatDate,
}) {
  return (
    <div className="lg:mx-20 ">
      <div className="body-container md:my-10 flex flex-col lg:flex-row md:gap-10 lg:items-start lg:justify-start">
        <div className="lg:flex-1 ">
          {/* image */}
          <ImageCarousel programImage={programImage} />
        </div>

        {/* Product title, Price, Confirm btn*/}
        <div className="selection-container md:mx-24 lg:mx-0 lg:flex-1 flex flex-col gap-3 ">
          <h2 className="text-2xl">{programName}</h2>
          <p className="text-xl">HK ${programPrice}</p>
          <p className="text-xl">
            Duration:{" "}
            {programInfo.lesson_duration / 60 > 1
              ? `${programInfo.lesson_duration / 60} hours`
              : `${programInfo.lesson_duration / 60} hour`}
          </p>

          {/* select for timeslot */}
          <SelectDate
            programSessions={programSessions}
            sessionInfo={sessionInfo}
            bookingData={bookingData}
            setBookingData={setBookingData}
            formatDate={formatDate}
          />

          {/* no.of ppl */}
          {/* <label className="form-control w-full">
            <div className="label">
              <span className="label-text">No of Participant*</span>
              <span className="label-text-alt"></span>
            </div>
            <select
              className="select select-bordered"
              value={bookingData.numberOfPeople}
              onChange={(e) =>
                setBookingData({
                  ...bookingData,
                  numberOfPeople: e.target.value,
                })
              }
            >
              <option>Please select</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
            </select>
          </label> */}

          {/* Remark */}
          {/* <label className="form-control">
            <div className="label">
              <span className="label-text">Remark</span>
            </div>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="Input here"
              value={bookingData.remark}
              onChange={(e) =>
                setBookingData({ ...bookingData, remark: e.target.value })
              }
            ></textarea>
          </label> */}

          <button
            className="btn btn-block mt-5"
            onClick={() => {
              setPage((page) => page + 1);
              console.log(bookingData);
            }}
            //if not selected session and no of ppl, cannot move to next step
            disabled={!bookingData.selectedSession}
          >
            Confirm Session
          </button>
        </div>
      </div>

      {/* Program description, notice */}
      <div className="my-10 md:mx-24 lg:mx-10 flex flex-col gap-5">
        <div>
          <h3 className="text-xl font-bold mb-3">Program Content</h3>
          <p>{programInfo.description}</p>
        </div>
        <div>
          <h3 className="text-xl font-bold mb-3">Enrollment Notice</h3>
          <p>{programInfo.program_notice}</p>
        </div>
      </div>
    </div>
  );
}
