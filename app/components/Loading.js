// export default function Loading() {
//   return (
//     <>
//       <div className="w-full h-full flex items-center justify-center">
//         <span className="loading loading-spinner loading-lg"></span>
//       </div>
//       <p>Loading</p>
//       <p>Please Wait...</p>
//     </>
//   );
// }

export default function Loading() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="loading loading-spinner loading-lg mb-4"></div>
      <div className="text-center text-lg">Loading</div>
      <div className="text-center">Please Wait...</div>
    </div>
  );
}
