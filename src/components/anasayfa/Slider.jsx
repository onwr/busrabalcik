import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../../db/Firebase";
import { collection, getDocs } from "firebase/firestore";
import Loader from "../../layout/Loader";

const Slider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const slidesCollection = collection(db, "slides");
        const snapshot = await getDocs(slidesCollection);
        const fetchedSlides = snapshot.docs.map((doc) => doc.data());
        setSlides(fetchedSlides);
        console.log(fetchedSlides);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="relative h-[600px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {slides.length > 0 && (
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative h-full w-full"
          >
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="h-full w-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4 text-3xl text-center font-bold md:text-6xl"
              >
                {slides[currentSlide].title}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mb-8 text-md max-w-sm md:max-w-max mx-auto md:text-2xl"
              >
                {slides[currentSlide].description}
              </motion.p>
              {slides[currentSlide].link && (
                <motion.button
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  onClick={() =>
                    (window.location.href = slides[currentSlide].link)
                  }
                  transition={{ delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-full bg-white px-8 py-3 text-lg font-semibold text-black transition-transform hover:bg-gray-100"
                >
                  Daha Fazla
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 mt-5 md:mt-0 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
      >
        <ChevronLeft size={24} />
      </motion.button>
      <motion.button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 mt-5 md:mt-0 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-all hover:bg-white/30"
      >
        <ChevronRight size={24} />
      </motion.button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => setCurrentSlide(index)}
            whileHover={{ scale: 1.2 }}
            className={`h-2 w-8 rounded-full transition-all ${
              currentSlide === index ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Slider;
