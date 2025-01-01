export function ConfirmBooking({
  programName,
  programPrice,
  bookingData,
  setBookingData,
  page,
  setPage,
}) {
  return (
    <div>
      <h1>請上傳您的付款證明</h1>
      <button
        onClick={() => {
          setPage((page) => page - 1);
        }}
      >
        Back
      </button>
    </div>
  );
}
