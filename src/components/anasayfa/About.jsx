import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Pen, Quote } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../db/Firebase";
import Loader from "../../layout/Loader";

const About = () => {
  const [hakkinda, setHakkinda] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHakkinda = async () => {
      try {
        const hakkindaRef = doc(db, "hakkinda", "metin");
        const hakkindaDoc = await getDoc(hakkindaRef);
        if (hakkindaDoc.exists()) {
          setHakkinda(hakkindaDoc.data());
        }
      } catch (error) {
        alert("Bir hata oluştu.");
        console.error("Hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHakkinda();
  }, []);

  return (
    <div>
      {loading ? (
        <Loader />
      ) : (
        <div className="relative bg-white dark:bg-black/90 py-20">
          <motion.div
            className="absolute left-5 top-40 hidden md:block text-gray-300"
            animate={{
              rotate: [0, -10, 10, 0],
              y: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <BookOpen size={32} />
          </motion.div>

          <motion.div
            className="absolute right-5 top-40 hidden md:block text-gray-300"
            animate={{
              rotate: [0, -10, 10, 0],
              y: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Pen size={32} />
          </motion.div>

          <div className="mx-auto max-w-6xl px-4">
            <motion.div
              className="relative rounded-2xl bg-black/90 dark:bg-white p-8 shadow-2xl md:grid md:grid-cols-2 md:gap-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="relative h-[400px] overflow-hidden rounded-xl"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={hakkinda.resim ? hakkinda.resim : ""}
                  alt="Anıl Cenan Kimdir"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </motion.div>

              <div className="flex flex-col justify-center p-4">
                <motion.div
                  className="mb-6 flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Quote
                    className="mr-3 hidden md:block text-blue-500"
                    size={32}
                  />
                  <h2 className="text-4xl font-bold text-white dark:text-gray-800">
                    {hakkinda.baslik ? hakkinda.baslik : "Başlık bulunamadı."}
                  </h2>
                </motion.div>

                <motion.p
                  className="mb-6 text-lg leading-relaxed text-white/80 dark:text-gray-600"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  {hakkinda.metin ? hakkinda.metin : "İçerik bulunamadı."}
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default About;
