import React from "react";
import Header from "../components/Header";
import Slider from "../components/anasayfa/Slider";
import About from "../components/anasayfa/About";
import SonKitaplar from "../components/anasayfa/SonKitaplar";
import Footer from "../components/Footer";

const Anasayfa = () => {
  return (
    <div>
      <Header />
      <Slider />
      <About />
      <SonKitaplar />
      <Footer />
    </div>
  );
};

export default Anasayfa;
