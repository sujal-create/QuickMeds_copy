import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Doctor from "./pages/Doctor";
import Login from "./pages/Login";
import Appointment from "./pages/Appointment";
import MessageAdmin from "./pages/MessageAdmin";
import ApplicationsAdmin from "./pages/ApplicationsAdmin";
import AppointmentsAdmin from "./pages/AppointmentsAdmin";
import AdminLogin from "./pages/AdminLogin";
import SignUp from "./pages/SignUp";
import Careers from "./pages/Careers";
import JobApplication from "./pages/JobApplication";
import UserAppointments from "./pages/UserAppointments";
import Feedback from "./pages/Feedback";
import PaymentPage from "./pages/Paymentpage";
import AdminAddJob from "./pages/admin/AdminAddJob";

import PropTypes from "prop-types";

import AdminLayout from "./layouts/AdminLayout";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Chatbot from "./components/Chatbot/Chatbot";

import SSO from "./pages/SSO";


// ======================================================
// USER LAYOUT
// ======================================================

const UserLayout = ({ children }) => (
  <div className="mx-4 sm:mx-[10%]">
    <Navbar />

    {children}

    <Chatbot />

    <Footer />
  </div>
);


// ======================================================
// REDIRECT ADMIN TO DASHBOARD
// ======================================================

const RedirectAdminToDashboard = () => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const location = useLocation();

  useEffect(() => {
    if (isAdmin && location.pathname === "/") {
      window.location.replace("/admin/messages");
    }
  }, [isAdmin, location]);

  return null;
};


// ======================================================
// APP
// ======================================================

const App = () => {
  const isAdmin =
    localStorage.getItem("isAdmin") === "true";

  return (
    <>
      <ScrollToTop />

      <RedirectAdminToDashboard />

      <Routes>

        {/* ==================================================
            ADMIN ROUTES
        ================================================== */}

        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            path="messages"
            element={<MessageAdmin />}
          />

          <Route
            path="applications"
            element={<ApplicationsAdmin />}
          />

          <Route
            path="appointments"
            element={<AppointmentsAdmin />}
          />

          <Route
            path="add-job"
            element={<AdminAddJob />}
          />
        </Route>


        {/* ==================================================
            ADMIN LOGIN
        ================================================== */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />


        {/* ==================================================
            REGULAR USER ROUTES
        ================================================== */}

        {!isAdmin && (
          <>

            {/* HOME */}

            <Route
              path="/"
              element={
                <UserLayout>
                  <Home />
                </UserLayout>
              }
            />


            {/* ABOUT */}

            <Route
              path="/about"
              element={
                <UserLayout>
                  <About />
                </UserLayout>
              }
            />


            {/* CONTACT */}

            <Route
              path="/contact"
              element={
                <UserLayout>
                  <Contact />
                </UserLayout>
              }
            />


            {/* DOCTORS */}

            <Route
              path="/doctors"
              element={
                <UserLayout>
                  <Doctor />
                </UserLayout>
              }
            />


            {/* DOCTORS BY SPECIALITY */}

            <Route
              path="/doctors/:speciality"
              element={
                <UserLayout>
                  <Doctor />
                </UserLayout>
              }
            />


            {/* LOGIN */}

            <Route
              path="/login"
              element={
                <UserLayout>
                  <Login />
                </UserLayout>
              }
            />


            {/* SIGNUP */}

            <Route
              path="/signup"
              element={
                <UserLayout>
                  <SignUp />
                </UserLayout>
              }
            />


            {/* ==================================================
                CUREGO SSO
            ================================================== */}

            <Route
              path="/sso"
              element={
                <UserLayout>
                  <SSO />
                </UserLayout>
              }
            />


            {/* APPOINTMENT */}

            <Route
              path="/appointment/:DocId"
              element={
                <UserLayout>
                  <Appointment />
                </UserLayout>
              }
            />


            {/* CAREERS */}

            <Route
              path="/careers"
              element={
                <UserLayout>
                  <Careers />
                </UserLayout>
              }
            />


            {/* JOB APPLICATION */}

            <Route
              path="/apply/:jobId"
              element={
                <UserLayout>
                  <JobApplication />
                </UserLayout>
              }
            />


            {/* USER APPOINTMENTS */}

            <Route
              path="/my-appointments"
              element={
                <UserLayout>
                  <UserAppointments />
                </UserLayout>
              }
            />


            {/* FEEDBACK */}

            <Route
              path="/feedback"
              element={
                <UserLayout>
                  <Feedback />
                </UserLayout>
              }
            />


            {/* PAYMENT */}

            <Route
              path="/payment"
              element={
                <UserLayout>
                  <PaymentPage />
                </UserLayout>
              }
            />

          </>
        )}


        {/* ==================================================
            FALLBACK
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </>
  );
};


// ======================================================
// PROP TYPES
// ======================================================

UserLayout.propTypes = {
  children: PropTypes.node.isRequired,
};


export default App;