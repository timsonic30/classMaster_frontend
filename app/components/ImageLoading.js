import React from "react";

const ImageLoading = () => {
  return (
    <button
      type="button"
      className="btn-sm bg-teal-500 text-black flex items-center px-2 py-2 mt-1 rounded"
      disabled
    >
      <svg
        className="animate-spin h-5 w-5 mr-3"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 100 8v4a8 8 0 01-8-8z"
        />
      </svg>
      <span className="text-sm">Uploading ...</span>
    </button>
  );
};

export default ImageLoading;
