"use client";
import { useState, useEffect } from "react";
import Logout from "./Logout";
import Link from "next/link";
import { useAuth } from "../Auth";
import { usePathname } from "next/navigation";
import { themeChange } from "theme-change";

function Header() {
  const [isLogin, setIsLogin] = useAuth();
  const pathname = usePathname();
  const [currentTheme, setCurrentTheme] = useState("");
  const includesDashboard = pathname?.includes("dashboard");

  console.log("login status in Navbar.js: ", isLogin);

  // Initial theme setup
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
      setCurrentTheme(savedTheme);
    }
    themeChange(false);
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (currentTheme) {
      document.documentElement.setAttribute("data-theme", currentTheme);
      localStorage.setItem("theme", currentTheme);
      themeChange(false);
    }
  }, [currentTheme]); // Run whenever currentTheme changes

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
  };

  return (
    <nav>
      {/* logo button */}
      <div
        className={`navbar shadow-md ${
          includesDashboard ? "bg-primary" : "bg-base-300"
        }`}
      >
        <div className="flex-1">
          {includesDashboard ? (
            <Link
              href="/dashboard"
              className="btn text-xl text-primary-content max-lg:ml-16"
            >
              <div className="flex flex-row items-center">
                <img
                  className="w-20 h-auto"
                  src="https://i.ibb.co/F894pwB/masterclass-logo-pink.png"
                ></img>
                <div className="font-[Montserrat] text-xl font-light text-base-content">
                  CLASS
                  <span className="text-[#4c71ef] font-bold text-xl ">
                    MASTER
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <Link href="/home" className="btn btn-ghost text-xl">
              <div className="flex flex-row items-center">
                <img
                  className="w-20 h-auto"
                  src="https://i.ibb.co/F894pwB/masterclass-logo-pink.png"
                ></img>
                <div className="font-[Montserrat] text-xl  font-light">
                  CLASS
                  <span className="text-[#4c71ef] font-bold text-xl ">
                    MASTER
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>
        {/* theme control list */}
        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className={`btn btn-ghost m-1 bg-primary text-primary-content ${
              includesDashboard ? "" : "hover:text-base-content"
            }`}
          >
            Theme
            <svg
              width="12px"
              height="12px"
              className="inline-block h-2 w-2 fill-current opacity-60"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2048 2048"
            >
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="dropdown-content bg-base-200 rounded-box z-[1] w-auto p-2 shadow-2xl"
          >
            {[
              "light",
              "pastel",
              "nord",
              "cupcake",
              "lemonade",
              "dark",
              "business",
              "dracula",
              "coffee",
            ].map((theme) => (
              <li key={theme}>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start font-normal focus:bg-neutral focus:text-neutral-content"
                  aria-label={theme.charAt(0).toUpperCase() + theme.slice(1)}
                  value={theme}
                  onChange={() => handleThemeChange(theme)}
                  checked={currentTheme === theme}
                />
              </li>
            ))}
          </ul>
        </div>
        {/* dot list */}
        {includesDashboard && (
          <div className="flex-none dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-square btn-ghost mb-1 text-primary-content"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="inline-block h-5 w-5 stroke-current"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                ></path>
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-[1] w-auto p-2 shadow-2xl"
            >
              {isLogin && <Logout />}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Header;
