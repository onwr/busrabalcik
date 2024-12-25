import React, { useEffect, useState } from "react";
import { Book, NotebookPen, Pen, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "../../db/Firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const RecentBooks = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const kitapRef = collection(db, "kitaplar");
        const kitapQuery = query(kitapRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(kitapQuery);

        const fetchedBooks = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log(fetchedBooks);

        setBooks(fetchedBooks);
      } catch (error) {
        console.error("Kitaplar alınırken hata oluştu:", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div className="p-8 relative bg-white dark:bg-black/90">
      <motion.div
        className="absolute left-5 top-5 md:top-10 text-gray-300"
        animate={{
          rotate: [0, 10, -10, 0],
          y: [0, -10, 10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Book size={32} />
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
        <NotebookPen size={32} />
      </motion.div>

      <div className="max-w-6xl mx-auto">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-3xl font-bold text-center mb-8 dark:text-white text-gray-800"
        >
          Son Kitaplar
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {books.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-6 rounded-lg border border-black shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center justify-center gap-6">
                <img
                  src={book.imageUrl}
                  alt={book.title}
                  className="w-full h-72 object-contain"
                />
                <div className="flex items-center justify-center flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <Book className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-xl font-bold text-gray-800">
                      {book.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Pen className="w-4 h-4 text-gray-500" />
                    <p className="text-gray-600 font-medium">{book.author}</p>
                  </div>
                  <p className="text-center text-gray-500">
                    {book.description}
                  </p>
                  <motion.button
                    className="mt-4 py-2 px-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full text-white font-medium shadow-md flex items-center gap-2 group hover:from-yellow-500 hover:to-yellow-600 transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => (window.location.href = `/kitap/${book.id}`)}
                  >
                    <span>Daha Fazla</span>
                    <motion.div
                      initial={{ x: 0 }}
                      animate={{ x: [0, 5, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentBooks;
