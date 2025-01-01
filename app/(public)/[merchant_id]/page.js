"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const { merchant_id } = useParams();
  const [programInfo, setProgramInfo] = useState([]); //program info (object)
  const [filterType, setFilterType] = useState([]); //program type
  const [selectType, setSelectType] = useState("");

  useEffect(() => {
    ``;
    fetchPrograms(merchant_id);
  }, [merchant_id]);

  //fetch program info
  async function fetchPrograms(merchant_id) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/programs/${merchant_id}`
    );
    const info = await res.json();
    setProgramInfo(info);

    const filterType = [...new Set(info.map((el) => el.program_type))];
    setFilterType(filterType);
  }

  //Join-button filter logic
  function handleTypeChange(programType) {
    if (selectType === programType) {
      setSelectType(""); //if unclick, show all cards
    } else {
      setSelectType(programType); //if click, show filtered cards
    }
  }

  //Ensure image can display (for both Array and String)
  function getImageDisplay(img) {
    return Array.isArray(img) ? img[0] : img;
  }

  return (
    <>
      {/* filter - Joined button */}
      <div className="join mt-10 flex justify-center">
        {filterType &&
          filterType.map((programType, index) => {
            return (
              <div key={index}>
                <input
                  className="join-item btn"
                  type="radio"
                  name="options"
                  aria-label={programType}
                  onClick={() => handleTypeChange(programType)}
                  checked={selectType === programType} //if click again, the color remove
                  readOnly
                />
              </div>
            );
          })}
      </div>

      {/* program card */}
      <div className="flex justify-center flex-wrap">
        {programInfo &&
          programInfo
            .filter((el) =>
              selectType ? selectType === el.program_type : true
            )
            .map((el, index) => {
              return (
                <div
                  key={index}
                  className="card bg-base-100 w-80  shadow-xl mx-10 my-10 flex"
                >
                  <figure>
                    <img
                      className="w-80 h-80 object-cover"
                      src={getImageDisplay(el.program_image)}
                    />
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title justify-center">
                      {el.program_name_zh}
                    </h3>
                    <p className="flex justify-center">
                      時長: {el.lesson_duration / 60} 小時
                    </p>
                    <p className="flex justify-center">
                      HK ${el.program_price_per_lesson.$numberDecimal}
                    </p>
                    <div className="card-actions justify-center">
                      <button className="btn btn-primary">
                        <a href={`/${merchant_id}/${el._id}`}>View Details</a>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </>
  );
}
