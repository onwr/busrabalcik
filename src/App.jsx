import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Anasayfa from "./pages/Anasayfa";
import Kitaplarim from "./pages/Kitaplar";
import Iletisim from "./pages/Iletisim";
import KitapDetay from "./pages/KitapDetay";
import Panel from "./pages/admin/Panel";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Anasayfa />} />
          <Route path="/kitaplar" element={<Kitaplarim />} />
          <Route path="/iletisim" element={<Iletisim />} />
          <Route path="/kitap/:id" element={<KitapDetay />} />
          <Route path="/yonetici/panel" element={<Panel />} />
          <Route path="*" element={<Anasayfa />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
