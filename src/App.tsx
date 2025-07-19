
import Login from "./component/Login";
import Register from "./component/Register2";
import Registerclient from "./component/Register1";
import { Routes, Route } from "react-router-dom"; 
import RegisterChoice from "./component/RegisterChoice";
import MobileFooter from "./component/Footer";
import Mainpage from "./component/Mainpage";
import GestionStore from "./component/GestionStore";
import Settings from "./component/PersonelInformation";

import Loginseller from "./component/Loginseller";
function App() {
  return (
    <>
      <div className="h-screen w-full">
        <Routes>
          <Route path="/" element={<RegisterChoice />} />
          <Route path="/loginclient" element={<Login />} />
          <Route path="/loginseller" element={<Loginseller />} />
          <Route path="/registerseller" element={<Register />} />
          <Route path="/registerclient" element={<Registerclient />} />
          <Route path="/Market" element={<Mainpage />} />
          <Route path="/GestionStore" element={<GestionStore />} />
          <Route path="/Loginseller" element={<Loginseller />} />
          <Route path="/Loginclient" element={<Login />} />
          <Route path="/Settings" element={<Settings />} />
        </Routes>
        <MobileFooter />
      </div>
    </>
  );
}

export default App;
