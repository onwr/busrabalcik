import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../../../db/Firebase";
import JoditEditor from "jodit-react";
import Loader from "../../../layout/Loader";

const BooksComponent = () => {
  const editor = useRef(null);
  const [books, setBooks] = useState(null);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    description: "",
    sure: "",
    kategori: "",
    imageUrl: "",
  });
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [kitapId, setKitapId] = useState("");
  const [kitapDetay, setKitapDetay] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [newChapter, setNewChapter] = useState({
    name: "",
    estimatedTime: "",
    icerik: "",
  });
  const [editingChapter, setEditingChapter] = useState(null);
  const placeholder = "Bölüm içeriğini buraya yazınız...";
  const [editingBook, setEditingBook] = useState(null);

  const handleEditBook = async () => {
    if (!editingBook) return;

    try {
      const bookDoc = doc(db, "kitaplar", kitapId);
      await updateDoc(bookDoc, {
        title: editingBook.title,
        author: editingBook.author,
        description: editingBook.description,
        kategori: editingBook.kategori,
        sure: editingBook.sure,
      });

      setBooks(
        books.map((book) =>
          book.docId === kitapId ? { ...book, ...editingBook } : book
        )
      );
      setEditingBook(null);
      alert("Kitap bilgileri güncellendi!");
    } catch (error) {
      console.error("Kitap güncellenirken hata oluştu:", error);
      alert("Güncelleme sırasında bir hata oluştu!");
    }
  };

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || "Start typing...",
    }),
    [placeholder]
  );

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const kitapRef = collection(db, "kitaplar");
        const kitapQuery = query(kitapRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(kitapQuery);
        const fetchedBooks = querySnapshot.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }));

        setBooks(fetchedBooks);
      } catch (error) {
        console.error("Kitaplar alınırken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  useEffect(() => {
    const fetchChapters = async () => {
      if (kitapId) {
        try {
          console.log(kitapId);

          const chaptersRef = collection(db, `kitaplar/${kitapId}/bolumler`);
          const chaptersQuery = query(chaptersRef, orderBy("createdAt", "asc"));
          const querySnapshot = await getDocs(chaptersQuery);
          const fetchedChapters = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChapters(fetchedChapters);
        } catch (error) {
          console.error("Bölümler alınırken hata oluştu:", error);
        }
      }
    };
    fetchChapters();
  }, [kitapId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  const handleChapterInputChange = (event) => {
    const { name, value } = event.target;
    setNewChapter({ ...newChapter, [name]: value });
  };

  const handleJoditChange = (content) => {
    setNewChapter({ ...newChapter, icerik: content });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result);
        setNewBook({ ...newBook, imageUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.kategori) {
      alert("Lütfen gerekli alanları doldurun.");
      return;
    }

    try {
      const kitapRef = collection(db, "kitaplar");
      await addDoc(kitapRef, {
        ...newBook,
        createdAt: serverTimestamp(),
      });

      const kitapQuery = query(kitapRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(kitapQuery);
      const updatedBooks = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBooks(updatedBooks);

      setNewBook({
        title: "",
        author: "",
        description: "",
        sure: "",
        kategori: "",
        imageUrl: "",
      });
      setSelectedImage("");
    } catch (error) {
      console.error("Kitap eklenirken hata oluştu:", error);
    }
  };

  const handleAddChapter = async () => {
    if (!newChapter.name || !newChapter.icerik) return;

    try {
      const chaptersRef = collection(db, `kitaplar/${kitapId}/bolumler`);
      await addDoc(chaptersRef, {
        ...newChapter,
        readCount: 0,
        createdAt: serverTimestamp(),
      });

      const chaptersQuery = query(chaptersRef, orderBy("createdAt", "asc"));
      const querySnapshot = await getDocs(chaptersQuery);
      const updatedChapters = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChapters(updatedChapters);

      alert("Bölüm başarıyla eklendi!");
      setNewChapter({
        name: "",
        estimatedTime: "",
        icerik: "",
      });
    } catch (error) {
      console.error("Bölüm eklenirken hata oluştu:", error);
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      const kitapDoc = doc(db, "kitaplar", id);
      await deleteDoc(kitapDoc);

      setBooks(books.filter((book) => book.docId !== id));
    } catch (error) {
      console.error("Kitap silinirken hata oluştu:", error);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      const chapterDoc = doc(db, `kitaplar/${kitapId}/bolumler`, chapterId);
      await deleteDoc(chapterDoc);
      setChapters(chapters.filter((chapter) => chapter.id !== chapterId));
    } catch (error) {
      console.error("Bölüm silinirken hata oluştu:", error);
    }
  };

  const handleUpdateChapter = async () => {
    if (!editingChapter || !editingChapter.name || !editingChapter.icerik)
      return;

    try {
      const chapterDoc = doc(
        db,
        `kitaplar/${kitapId}/bolumler`,
        editingChapter.id
      );
      await updateDoc(chapterDoc, {
        name: editingChapter.name,
        icerik: editingChapter.icerik,
      });

      setChapters(
        chapters.map((chapter) =>
          chapter.id === editingChapter.id ? editingChapter : chapter
        )
      );
      setEditingChapter(null);
      alert("Düzenleme kaydedildi!");
    } catch (error) {
      console.error("Bölüm güncellenirken hata oluştu:", error);
    }
  };

  if (loading) {
    return <Loader />;
  }
  if (!books) {
    return <p>Kitap yok</p>;
  }

  const currentBook = books.find((book) => book.docId === kitapId);

  return (
    <div className="container mx-auto p-4">
      {!kitapDetay ? (
        <>
          <h2 className="text-2xl font-semibold mb-4">Kitap Ekleme</h2>
          <div className="mb-6">
            <input
              type="text"
              name="title"
              placeholder="Kitap Başlığı"
              value={newBook.title}
              onChange={handleInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="text"
              name="author"
              placeholder="Yazar Adı"
              value={newBook.author}
              onChange={handleInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <textarea
              name="description"
              placeholder="Açıklama"
              value={newBook.description}
              onChange={handleInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="text"
              name="sure"
              placeholder="Okuma Süresi"
              value={newBook.sure}
              onChange={handleInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="text"
              name="kategori"
              placeholder="Kategori"
              value={newBook.kategori}
              onChange={handleInputChange}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mb-2 p-2 border border-gray-300 rounded w-full"
            />
            {selectedImage && (
              <img
                src={selectedImage}
                alt="Preview"
                className="mb-2 w-32 h-32 object-cover"
              />
            )}
            <button
              onClick={handleAddBook}
              className="p-2 bg-blue-500 text-white rounded mt-2 w-full"
            >
              Kitap Ekle
            </button>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Kitaplarım</h2>
          <div className="space-y-4">
            {books.map((book) => (
              <div
                key={book.title}
                className="flex md:flex-row flex-col gap-4 md:gap-0 items-center justify-between p-4 border border-gray-200 rounded"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-16 h-20 object-cover"
                  />
                  <div>
                    <p className="font-semibold">{book.title}</p>
                    <p className="text-gray-500">{book.author}</p>
                    <p className="text-gray-400 text-sm">{book.kategori}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setKitapId(book.docId);
                      setKitapDetay(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 px-5 py-1 rounded-lg text-white"
                  >
                    Detaylar
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.docId)}
                    className="bg-red-500 px-5 py-1 rounded-lg text-white hover:bg-red-600"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Kitap Detayları</h2>
            <button
              onClick={() => {
                setKitapDetay(false);
                setKitapId("");
                setChapters([]);
              }}
              className="bg-gray-400 px-5 py-1 rounded-lg text-white"
            >
              Geri Dön
            </button>
          </div>

          {currentBook && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex gap-6">
                <img
                  src={currentBook.imageUrl}
                  alt={currentBook.title}
                  className="w-32 h-40 object-cover rounded"
                />
                {editingBook ? (
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={editingBook.title}
                      onChange={(e) =>
                        setEditingBook({
                          ...editingBook,
                          title: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                      placeholder="Kitap Başlığı"
                    />
                    <input
                      type="text"
                      value={editingBook.author}
                      onChange={(e) =>
                        setEditingBook({
                          ...editingBook,
                          author: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                      placeholder="Yazar"
                    />
                    <textarea
                      value={editingBook.description}
                      onChange={(e) =>
                        setEditingBook({
                          ...editingBook,
                          description: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                      placeholder="Açıklama"
                      rows="3"
                    />
                    <input
                      type="text"
                      value={editingBook.kategori}
                      onChange={(e) =>
                        setEditingBook({
                          ...editingBook,
                          kategori: e.target.value,
                        })
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                      placeholder="Kategori"
                    />
                    <input
                      type="text"
                      value={editingBook.sure}
                      onChange={(e) =>
                        setEditingBook({ ...editingBook, sure: e.target.value })
                      }
                      className="p-2 border border-gray-300 rounded w-full"
                      placeholder="Okuma Süresi"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditBook}
                        className="bg-green-500 px-4 py-1 rounded text-white"
                      >
                        Kaydet
                      </button>
                      <button
                        onClick={() => setEditingBook(null)}
                        className="bg-gray-500 px-4 py-1 rounded text-white"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {currentBook.title}
                        </h3>
                        <p className="text-gray-600">{currentBook.author}</p>
                        <p className="text-gray-500 mt-2">
                          {currentBook.description}
                        </p>
                        <p className="text-gray-500">
                          Kategori: {currentBook.kategori}
                        </p>
                        <p className="text-gray-500">
                          Okuma Süresi: {currentBook.sure}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingBook({ ...currentBook })}
                        className="bg-blue-500 h-8 px-4 rounded text-white"
                      >
                        Düzenle
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Bölüm Ekle</h3>
            <div className="space-y-2">
              <input
                type="text"
                name="name"
                placeholder="Bölüm Başlığı"
                value={newChapter.name}
                onChange={handleChapterInputChange}
                className="p-2 border border-gray-300 rounded w-full"
              />
              <input
                type="text"
                name="estimatedTime"
                placeholder="Tahmini Okuma Süresi"
                value={newChapter.sure}
                onChange={handleChapterInputChange}
                className="p-2 border border-gray-300 rounded w-full"
              />
              <JoditEditor
                ref={editor}
                value={newChapter.icerik}
                config={config}
                tabIndex={2}
                onChange={handleJoditChange}
              />
              <button
                onClick={handleAddChapter}
                className="p-2 bg-blue-500 text-white rounded w-full"
              >
                Bölüm Ekle
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Bölümler</h3>
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="p-4 border border-gray-200 rounded"
                >
                  {editingChapter?.id === chapter.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingChapter.name || ""}
                        onChange={(e) =>
                          setEditingChapter({
                            ...editingChapter,
                            name: e.target.value,
                          })
                        }
                        className="p-2 border border-gray-300 rounded w-full"
                      />

                      <JoditEditor
                        value={editingChapter.icerik || ""}
                        onChange={(content) =>
                          setEditingChapter({
                            ...editingChapter,
                            icerik: content,
                          })
                        }
                        className="border border-gray-300 rounded"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateChapter}
                          className="bg-green-500 px-4 py-1 rounded text-white"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={() => setEditingChapter(null)}
                          className="bg-gray-500 px-4 py-1 rounded text-white"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">{chapter.name}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingChapter(chapter)}
                            className="bg-blue-500 px-4 py-1 rounded text-white"
                          >
                            Düzenle
                          </button>
                          <button
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="bg-red-500 px-4 py-1 rounded text-white"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                      <div className="mb-5 flex items-center gap-5">
                        <p className="text-gray-600 whitespace-pre-wrap">
                          Okunma Sayısı: {chapter.readCount}
                        </p>
                        <p className="text-gray-600 whitespace-pre-wrap">
                          Tahmini Süre: {chapter.estimatedTime}
                        </p>
                      </div>
                      <p className="text-lg font-semibold">İçerik:</p>
                      <p
                        className="max-h-32 overflow-hidden overflow-y-auto border p-1 mt-1"
                        dangerouslySetInnerHTML={{ __html: chapter.icerik }}
                      ></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksComponent;
