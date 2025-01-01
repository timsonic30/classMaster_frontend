"use client";
import React, { useState, useEffect, useRef } from "react";

const ImageUpload = ({ prog_id, programInfo, setProgramInfo }) => {
  const [error, setError] = useState(""); // set the error message
  const [Success, setSuccess] = useState(""); // set the successful message

  const [linkError, setLinkError] = useState(""); // set the error message for website link
  const [linkSuccess, setLinkSuccess] = useState(""); // set the successful message for website link

  const [file, setFile] = useState(null);
  const [filepath, setFilePath] = useState(""); // Store the Base64 URL for sending
  const [downloadFilePath, setDownloadFilePath] = useState(""); // Store the optimized URL
  const [previewURL, setPreviewURL] = useState(null); // set the preview imgae
  const [isValid, setIsValid] = useState(false); // check if the image type is valid
  const [link, setLink] = useState(""); // the entered website link
  const [isLinkImageLoading, setIsLinkImageLoading] = useState(false);
  const [isFileImageLoading, setIsFileImageLoading] = useState(false);

  const filePickerRef = useRef();
  const token = localStorage.getItem("token");

  const handleFileSelect = (selectedFile) => {
    setError("");
    setSuccess("");
    setFile(selectedFile);
  };

  const pickedHandler = (ev) => {
    let pickedFile;

    if (ev.target.files && ev.target.files.length === 1) {
      pickedFile = ev.target.files[0];
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (validTypes.includes(pickedFile.type)) {
        setFile(pickedFile);
        setIsValid(true);
        setError("");

        // // Create a preview URL for the selected file
        // const fileReader = new FileReader();
        // fileReader.onload = () => {
        //   setPreviewURL(fileReader.result); // Set the preview URL
        //   setFilePath(fileReader.result); // Set the Base64 URL
        // };
        // fileReader.readAsDataURL(pickedFile); // Read the new file
        handleFileSelect(pickedFile); // Handle file selection
      } else {
        setIsValid(false);
        setError("Image format error");
      }
    } else {
      // If no file is selected
      setIsValid(false);
      setError("");
    }
  };

  const handleOnChange = (ev) => {
    setLink(ev.target.value);
  };

  const handleLinkOnSubmit = async () => {
    setLinkError("");
    setLinkSuccess("");
    if (!link) {
      setLinkError("Please enter the URL");
    } else {
      setIsLinkImageLoading(true);
      const newLink = link.trim(); // remove space from the start and at the end

      const formattedLink =
        newLink.startsWith("https://") || newLink.startsWith("http://")
          ? newLink
          : `https://${newLink}`;

      const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,6}(\/.*)?$/i;
      if (!urlPattern.test(formattedLink)) {
        setLinkError("Invalid URL format");
      } else {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_API}/upload-image`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ image: formattedLink, prog_id: prog_id }),
            }
          );
          setIsLinkImageLoading(false);

          if (response.ok) {
            const data = await response.json();

            setLinkSuccess("Successfully uploaded");
            setLink("");
            setProgramInfo((prev) => ({
              ...prev,
              program_image: [...prev.program_image, data.imageURL],
            }));
          } else {
            setLinkError("Unable to connect to server");
          }
        } catch (error) {
          console.log("The error is ", error);
          setLinkError("Unable to connect to server");
          setIsLinkImageLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    if (!file) return;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewURL(fileReader.result);
      setFilePath(fileReader.result); // Set the Base64 URL
    };
    fileReader.readAsDataURL(file); // Create a URL for the image
  }, [file]);

  const pickImageHandler = () => {
    filePickerRef.current.click();
    setSuccess("");
  };

  const handleOnSubmit = async () => {
    if (!file) {
      setError("Please select a picture");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      const base64String = reader.result; // This is the Base64 string

      try {
        setIsFileImageLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API}/upload-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json", // Set content type to JSON
            },
            body: JSON.stringify({ image: base64String, prog_id: prog_id }), // Send Base64 in JSON
          }
        );

        console.log("Response from server:", response);
        setIsFileImageLoading(false);

        if (!response.ok) {
          throw new Error("Unable to upload image");
        }

        const data = await response.json();
        console.log("Image sent successfully!", data);
        setProgramInfo((prev) => ({
          ...prev,
          program_image: [...prev.program_image, data.imageURL],
        }));
        setSuccess("Picture uploaded successfully");
        setFile(null);
        setFilePath("");
        setPreviewURL(null);
        setDownloadFilePath(data.imageURL); // return the URL from backend
      } catch (err) {
        console.error("Error during upload:", err);
        setError("Unable to upload image");
        setIsFileImageLoading(false);
      }
    };

    reader.onerror = () => {
      setError("Unable to read image");
      setIsLoading(false);
    };
  };

  // Code for drag-and-drop upload image function
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const droppedFile = event.dataTransfer.files[0];
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (validTypes.includes(droppedFile.type)) {
        setFile(droppedFile);
        setIsValid(true);
        setError("");
        handleFileSelect(droppedFile);
      } else {
        setIsValid(false);
        setError("Image format error");
      }
    }
  };

  return (
    <>
      <input
        name="image"
        ref={filePickerRef}
        type="file"
        style={{ display: "none" }}
        accept=".jpg,.png,.jpeg,.jfif"
        onChange={pickedHandler}
      />
      <div
        onDragEnter={handleDragEnter} // for drag-and-drop upload image function
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewURL && (
          <img className="w-48 h-48" src={previewURL} alt="Preview" />
        )}
        {!previewURL && (
          <p className="w-48 h-48 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
            Picture preview
          </p>
        )}
      </div>
      <div>
        <button
          className="btn mt-2 btn-secondary mb-2 text-xs btn-sm"
          type="button"
          onClick={pickImageHandler}
        >
          Import picture
        </button>
      </div>
      {!isValid && <div>{error}</div>}
      <div>
        {!!file && !isFileImageLoading && (
          <button
            className="btn btn-sm btn-secondary"
            type="button"
            onClick={handleOnSubmit}
          >
            Send
          </button>
        )}
        {isFileImageLoading && (
          <button
            className="btn btn-sm btn-secondary"
            type="button"
            disabled={true}
          >
            Uploading ...
          </button>
        )}
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {Success && <div style={{ color: "green" }}>{Success}</div>}
      <p>or enter a URL link:</p>
      <input
        name="link"
        type="text"
        value={link}
        onChange={handleOnChange}
        className="border-solid input input-bordered input-sm w-full max-w-xs"
        placeholder="URL Link"
      />
      {!isLinkImageLoading ? (
        <button
          className="btn btn-sm btn-secondary text-xs ml-2"
          type="button"
          onClick={handleLinkOnSubmit}
        >
          Send
        </button>
      ) : (
        <button
          className="btn btn-sm btn-secondary text-xs ml-2"
          type="button"
          disabled={true}
        >
          Uploading ...
        </button>
      )}
      {linkError && <div style={{ color: "red" }}>{linkError}</div>}
      {linkSuccess && <div style={{ color: "green" }}>{linkSuccess}</div>}
      {/* {downloadFilePath && <img src={downloadFilePath} alt="Uploaded" />} */}
    </>
  );
};

export default ImageUpload;
