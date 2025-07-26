import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Leads from "./components/Leads";
import 'jspdf-autotable';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/side" element={<Sidebar />} />
        <Route path="/head" element={<Header />} />
        <Route path="/Leads" element={<Leads />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        
      </Routes>
    </Router>
  );
}

export default App;
