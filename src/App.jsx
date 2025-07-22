import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateLead from "./Pages/CreateLead";
import Dashboard from "./Pages/Dashboard";
import Login from "./Pages/Login";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/create-lead"
          element={
            <PrivateRoute>
              <CreateLead />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
