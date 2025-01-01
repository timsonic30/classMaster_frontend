"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Logout from "./components/Logout";
// import { useRouter } from "next/navigation";
import Loading from "./components/Loading";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // new code
  const authState = useState(false);
  const [ready, setReady] = useState(false); // Use to give the loading screen before the feching is completed
  const [isLogin, setIsLogin] = authState;
  // const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        // router.push("/login");
        setIsLogin(false);
        setReady(true);
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/profile`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsLogin(response.ok);
      setReady(true);
      console.log("After login in Auth.js: the state is: ", isLogin);
    };

    fetchProfileData();
  }, []);
  // Loading problem with error?
  return (
    <AuthContext.Provider value={authState}>
      {ready ? children : <Loading />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
