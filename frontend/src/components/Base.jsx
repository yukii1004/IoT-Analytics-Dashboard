import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase.jsx";
import { CgProfile } from "react-icons/cg";
import { FaChartLine } from "react-icons/fa6";
import { getDoc, doc } from "firebase/firestore";
import { GrMapLocation } from "react-icons/gr";
import logo from "/logo.png";
import leaflogo from "/leaflogo.png";
import { IoLogOutOutline, IoLogInOutline } from "react-icons/io5";
import { MdSpaceDashboard } from "react-icons/md";
import "./Base.css";

function Base({ children }) {
  const [showProfile, setShowProfile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const currentUrl = window.location.pathname;

  const toCapitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // fetches user details for the profile menu
  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserDetails(docSnap.data());
        } else {
          console.log("No such user!");
        }
      }
    });
  };
  useEffect(() => {
    fetchUserData();
  }, []);

  // handles logout
  const logoutUser = () => {
    auth.signOut();
    window.location.href = "/login";
  };

  const username = userDetails ? userDetails.username : "";

  return (
    <main>
      <nav>
        <div className="nav-left">
          <div
            className="logo-container"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <a href="/">
              <img
                src={isHovered ? logo : leaflogo}
                alt="Logo"
                width={isHovered ? 190 : 60}
                height={40}
                className={`logo ${isHovered ? "expanded" : ""}`}
              />
            </a>
          </div>
        </div>
        <div className="nav-center">
          <ul>
            <li>
              <a href="/" className={currentUrl === "/" ? "active" : ""}>
                <MdSpaceDashboard />
                Dashboard
              </a>
            </li>
            <li>
              <a
                href="/analytics"
                className={
                  currentUrl.slice(0, 10) === "/analytics" ? "active" : ""
                }
              >
                <FaChartLine />
                Analytics
              </a>
            </li>
            <li>
              <a
                href="/locator"
                className={
                  currentUrl.slice(0, 8) === "/locator" ? "active" : ""
                }
              >
                <GrMapLocation />
                Locator
              </a>
            </li>
          </ul>
        </div>
        <div className="nav-right">
          <CgProfile
            className="profile"
            onClick={() => setShowProfile((prevState) => !prevState)}
          />
        </div>
      </nav>
      <div className="children">{children}</div>
      <div className={`profile-menu ${showProfile && "active"}`}>
        <div className="greetUser">
          Hi, {userDetails ? toCapitalize(userDetails.username) : "User"}!
        </div>
        {userDetails && username === "admin" && (
          <div className="admin-dashboard">
            <a href="/admin">Admin Dashboard</a>
          </div>
        )}
        <a onClick={logoutUser}>
          {!userDetails ? "Login" : "Logout"}{" "}
          {!userDetails ? (
            <IoLogInOutline className="logout" />
          ) : (
            <IoLogOutOutline className="logout" />
          )}
        </a>
      </div>
      <footer>
        <span className="left">
          Copyright &copy;{" "}
          <a
            href="https://greenpmusemi.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Green PMU Semi
          </a>{" "}
          2024
        </span>
        <span className="right">
          Made with ❤️ by{" "}
          <a
            href="https://linkedin.com/in/nitin-karthick"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            Nitin Karthick
          </a>
        </span>
      </footer>
    </main>
  );
}

export default Base;
