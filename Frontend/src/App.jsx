import React from "react";
import Navbar from "./components/Navbar";
import Interviewer from "./components/Interviewer";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <div className="app-wrapper">
        <Interviewer />
      </div>
    </>
  );
}

export default App;
