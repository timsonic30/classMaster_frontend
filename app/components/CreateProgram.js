"use client";
import { useState } from "react";

const CreateProgram = ({ programs, setPrograms }) => {
  const token = localStorage.getItem("token");
  // for creating program input fields
  const [program, setProgram] = useState({
    progName: "",
    progType: "",
    // progSubType: {},
    imageLink: [""],
    description: "",
    progNotice: "",
    progPrice: "",
    duration: "",
  });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleOnChange = (ev) => {
    const { name, value } = ev.target;

    if (name === "progPrice" || name === "duration") {
      // Allow only numeric input (including decimal point)
      if (/^\d*\.?\d*$/.test(value)) {
        setProgram((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
      return;
    }

    // Update state for other fields
    setProgram((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageInputChange = (index, value) => {
    setProgram((prev) => {
      const newImageLinks = [...prev.imageLink]; // Create a copy of the current image link array
      newImageLinks[index] = value; // Update the specific index with the new value
      return {
        ...prev,
        imageLink: newImageLinks, // Set the updated image link array
      };
    });
  };

  const addImage = () => {
    setProgram((prev) => ({
      ...prev,
      imageLink: [...prev.imageLink, ""], // Add a new empty string for a new input
    }));
  };

  const removeImage = () => {
    if (program.imageLink.length > 1) {
      setProgram((prev) => ({
        ...prev,
        imageLink: prev.imageLink.slice(0, prev.imageLink.length - 1), // Remove the last input
      }));
    }
  };

  const handleOnSubmit = async () => {
    setError("");
    setSuccess("");

    for (const key in program) {
      if (program[key] === "") {
        setError(`Please fill in all the fields.`);
        return;
      }
    }

    const isEmpty = program.imageLink.some((link) => link.trim() === "");
    if (isEmpty && program.imageLink.length === 1) {
      setError(`Please fill in all the fields.`);
      return;
    } else if (isEmpty) {
      setError(
        `Please fill in the image link input box or delete the empty image link input box.`
      );
      return;
    }

    for (const link of program.imageLink) {
      const newLink = link.trim(); // remove space from the start and at the end
      const formattedLink =
        newLink.startsWith("https://") || newLink.startsWith("http://")
          ? newLink
          : `https://${newLink}`;

      const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/.*)?$/i;
      if (!urlPattern.test(formattedLink)) {
        setError("Invalid link format");
        return;
      }
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API}/add-new-program`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
        body: JSON.stringify(program),
      }
    );

    if (res.ok) {
      const result = await res.json();
      const prog = result.program;

      setSuccess("Successful to create Program");
      setPrograms((prev) => [
        ...prev,
        {
          _id: prog._id,
          program_name_zh: prog.program_name_zh,
          program_type: prog.program_type,
          program_price_per_lesson: prog.program_price_per_lesson,
        },
      ]);

      setProgram({
        progName: "",
        progType: "",
        // progSubType: {},
        imageLink: [""],
        description: "",
        progNotice: "",
        progPrice: "",
        duration: "",
      });
    } else {
      console.log("Fail to create Program");
      setError("Server Error");
    }
  };

  return (
    <>
      <div>
        <div className="flex">
          <input
            name="progName"
            value={program.progName}
            placeholder={`Program Name`}
            onChange={handleOnChange}
            className="input input-bordered input-sm w-full max-w-xs mb-1"
          />
        </div>
        <div className="flex">
          <input
            name="progType"
            value={program.progType}
            placeholder={`Program Type`}
            onChange={handleOnChange}
            className="input input-bordered input-sm w-full max-w-xs mb-1"
          />
        </div>
        <div className="flex">
          <input
            className="input input-bordered input-sm w-full max-w-xs mb-1"
            name="progPrice"
            value={program.progPrice}
            placeholder={`Program Price Per Lesson`}
            onChange={handleOnChange}
          />
        </div>
        <div>
          {/* <input
                name="progSubType"
                value={program.progSubType}
                placeholder={`Program Sub Type`}
                onChange={handleOnChange}
              /> */}
        </div>

        <div className="flex">
          <input
            className="input input-bordered input-sm w-full max-w-xs mb-1"
            name="description"
            value={program.description}
            placeholder={`Description`}
            onChange={handleOnChange}
          />
        </div>
        <div className="flex">
          <input
            className="input input-bordered input-sm w-full max-w-xs mb-1"
            name="progNotice"
            value={program.progNotice}
            placeholder={`Program Notice`}
            onChange={handleOnChange}
          />
        </div>

        <div className="flex">
          <input
            className="input input-bordered input-sm w-full max-w-xs mb-1"
            name="duration"
            value={program.duration}
            placeholder={`Lesson Duration (mins)`}
            onChange={handleOnChange}
          />
        </div>
        <div>
          <div className="flex items-center mt-1 mb-1">
            <div className="mr-1 infoTitle">Image Link: </div>
            <button className="btn btn-accent w-12 mr-1" onClick={addImage}>
              +
            </button>
            <button className="btn w-12" onClick={removeImage}>
              -
            </button>
          </div>
          <div id="container">
            {program.imageLink.map((linkId, index) => (
              <div key={index}>
                <input
                  className="input input-bordered input-sm w-full max-w-xs mb-1"
                  type="text"
                  value={linkId}
                  placeholder={`Image Link ${index + 1}`}
                  onChange={(e) =>
                    handleImageInputChange(index, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <div id="container"></div>
          <br />
        </div>
        <button
          className="btn  btn-accent mb-4 text-xs"
          onClick={handleOnSubmit}
        >
          Create
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}
      </div>
    </>
  );
};

export default CreateProgram;
