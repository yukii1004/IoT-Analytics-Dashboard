import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { auth, db } from "./firebase";
import { getDoc, doc } from "firebase/firestore";
import { User } from "firebase/auth";
import { CgProfile } from "react-icons/cg";
import { FaChartLine } from "react-icons/fa6";
import { GrMapLocation } from "react-icons/gr";
import { IoLogOutOutline, IoLogInOutline } from "react-icons/io5";
import { MdSpaceDashboard } from "react-icons/md";

interface UserDetails {
  username: string;
}

interface BaseProps {
  children: React.ReactNode;
}

export default function Base({ children }: BaseProps) {
  const [showProfile, setShowProfile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  const toCapitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const fetchUserData = async (user: User) => {
    const docRef = doc(db, "Users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserDetails(docSnap.data() as UserDetails);
    } else {
      console.log("No such user!");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user);
      } else {
        setUserDetails(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logoutUser = () => {
    auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="min-h-16 bg-black shadow-md">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
            <div className="h-16 flex px-8" style={{ width: "10%" }}>
              <Link to="/" className="flex items-center">
                <img
                  src={isHovered ? "/logo.png" : "/leaflogo.png"}
                  alt="Logo"
                  className={`h-12 w-auto transition-all duration-300 ${
                    isHovered ? "w-48" : "w-12"
                  }`}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                />
              </Link>
            </div>

          {/* Navigation Links */}
          <div className="h-16 hidden justify-evenly sm:flex sm:space-x-8" style={{ width: "80%" }}>
            <Link
              to="/"
              className={`${
                location.pathname === "/"
                  ? "border-green-500 border-b-[3px]  text-gray-100 hover:text-gray-100"
                  : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300"
              } inline-flex items-center px-1 pt-1 border-b-2 text-lg font-medium`}
            >
              <MdSpaceDashboard className="mr-1 h-7 w-7" />
              Dashboard
            </Link>
            <Link
              to="/analytics"
              className={`${
                location.pathname.startsWith("/analytics")
                  ? "border-green-500 border-b-[3px] text-gray-100 hover:text-gray-100"
                  : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300"
              } inline-flex items-center px-1 pt-1 border-b-2 text-lg font-medium`}
            >
              <FaChartLine className="mr-1 h-7 w-7" />
              Analytics
            </Link>
            <Link
              to="/locator"
              className={`${
                location.pathname.startsWith("/locator")
                  ? "border-green-500 border-b-[3px] text-gray-100 hover:text-gray-100"
                  : "border-transparent text-gray-400 hover:border-gray-300 hover:text-gray-300"
              } inline-flex items-center px-1 pt-1 border-b-2 text-lg font-medium`}
            >
              <GrMapLocation className="mr-1 h-7 w-7" />
              Locator
            </Link>
          </div>

          {/* User Profile Menu */}
          <div className="h-16 flex items-center justify-center" style={{ width: "10%" }} ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="rounded-full flex text-sm"
              aria-expanded={showProfile}
              aria-haspopup="true"
            >
              <CgProfile className="h-12 w-12 rounded-full" style = {{color: "white"}} />
            </button>
            {showProfile && (
              <div className="absolute right-2 top-16 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-100" style={{ zIndex: 10 }}>
                <div className="px-4 py-2 text-sm  text-gray-700">
                  Hi,{" "}
                  {userDetails ? toCapitalize(userDetails.username) : "User"}!
                </div>
                {userDetails && userDetails.username === "admin" && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-sm font-normal text-gray-700 hover:text-gray-900 hover:bg-gray-200"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={logoutUser}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:rounded-md"
                >
                  {userDetails ? "Logout" : "Login"}{" "}
                  {userDetails ? (
                    <IoLogOutOutline className="inline" />
                  ) : (
                    <IoLogInOutline className="inline" />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow">{children}</main>

      <footer className="bg-black shadow-md py-4">
        <div className="flex justify-between items-center px-6">
          <span className="text-gray-300 text-base">
            Copyright ©{" "}
            <a
              href="https://greenpmusemi.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-600"
            >
              Green PMU Semi
            </a>{" "}
            2024
          </span>
          <span className="text-gray-300 text-base">
            Made with ❤️ by{" "}
            <a
              href="https://linkedin.com/in/nitin-karthick"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-600"
            >
              Nitin Karthick
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
