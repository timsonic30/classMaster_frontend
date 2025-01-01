"use client";
import { useEffect, useState } from "react";
import { useAuth } from "../Auth";
// const Logout = () => {
//   const router = useRouter();
//   const [isAuth, setIsAuth] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     setIsAuth(!!token); // Check if token exists
//   }, []);

//   const handleLogout = () => {
//     setLoading(true);
//     localStorage.removeItem("token");
//     setIsAuth(false);
//     setLoading(false);
//     router.push("/");
//   };
//   if (!isAuth) return null;

//   return (
//     <li>
//       {loading ? (
//         <span>Loading...</span>
//       ) : (
//         <button onClick={handleLogout}>Logout</button>
//       )}
//     </li>
//   );
// };

// export default Logout;

const Logout = () => {
  const [, setIsLogin] = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLogin(false);
  };

  return (
    <li>
      <button className="text-base" onClick={handleLogout}>
        Logout
      </button>
    </li>
  );
};

export default Logout;
