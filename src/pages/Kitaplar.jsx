import React, { useEffect, useState } from "react";
import { ArrowRight, Clock, Star, BookOpen, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { db } from "../db/Firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Loader from "../layout/Loader";

const RecentBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const kitapRef = collection(db, "kitaplar");
        const kitapQuery = query(kitapRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(kitapQuery);

        // Fetch additional data for each book
        const booksWithDetails = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const bookData = { id: doc.id, ...doc.data() };

            // Fetch chapters and their comments
            const chaptersRef = collection(db, `kitaplar/${doc.id}/bolumler`);
            const chaptersSnapshot = await getDocs(chaptersRef);

            // Calculate total read count
            const totalReadCount = chaptersSnapshot.docs.reduce(
              (sum, chapter) => sum + (chapter.data().readCount || 0),
              0
            );

            const totalComments = await chaptersSnapshot.docs.reduce(
              async (promisedSum, chapter) => {
                const sum = await promisedSum;
                const commentsRef = collection(
                  db,
                  `kitaplar/${doc.id}/bolumler/${chapter.id}/yorumlar`
                );
                const commentsSnapshot = await getDocs(commentsRef);
                return sum + commentsSnapshot.docs.length;
              },
              Promise.resolve(0)
            );

            return {
              ...bookData,
              totalReadCount,
              totalComments,
            };
          })
        );

        setBooks(booksWithDetails);
      } catch (error) {
        console.error("Kitaplar alınırken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="relative dark:bg-black/95 py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-7xl mx-auto">
          <motion.h2
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-5xl font-bold text-center text-black dark:text-white mb-5"
          >
            Kitaplar
          </motion.h2>

          {books.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 mt-8"
            >
              Henüz kitap eklenmemiş.
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/90 dark:bg-white rounded-xl overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                >
                  <div className="relative group">
                    <div className="overflow-hidden">
                      <img
                        src={book.imageUrl}
                        alt={book.title}
                        className="mx-auto h-[500px] w-auto transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white dark:text-black">
                      {book.title}
                    </h3>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                        <span className="text-sm text-gray-300 dark:text-gray-600">
                          {book.totalReadCount} okuma
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-gray-300 dark:text-gray-600" />
                        <span className="text-sm text-gray-300 dark:text-gray-600">
                          {book.totalComments} yorum
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-200 dark:text-gray-700 font-medium">
                      {book.author}
                    </p>

                    <div
                      className="text-center text-white/90 dark:text-gray-500"
                      dangerouslySetInnerHTML={{
                        __html: truncateText(book.description, 100),
                      }}
                    />

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {book.sure ? book.sure : "Bulunamadı"}
                        </span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-gradient-to-r from-blue-200 to-blue-400 rounded-lg text-black text-sm font-medium flex items-center gap-2 hover:from-blue-400 hover:to-blue-600 transition-all duration-300"
                        onClick={() =>
                          (window.location.href = `/kitap/${book.id}`)
                        }
                      >
                        <span>Detaylar</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RecentBooks;
