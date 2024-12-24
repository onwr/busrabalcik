import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../../db/Firebase";
import Loader from "../../../layout/Loader";

const Anasayfa = () => {
  const [slides, setSlides] = useState([]);
  const [newSlide, setNewSlide] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const slidesCollection = collection(db, "slides");
        const snapshot = await getDocs(slidesCollection);
        const fetchedSlides = snapshot.docs.map((doc) => ({
          docId: doc.id,
          ...doc.data(),
        }));
        setSlides(fetchedSlides);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setNewSlide((prev) => ({ ...prev, image: base64 }));
      } catch (error) {
        console.error("Error converting file to Base64:", error);
      }
    }
  };

  const handleAddSlide = async () => {
    if (!newSlide.title || !newSlide.image) {
      alert("Lütfen gerekli alanları doldurun!");
      return;
    }
    try {
      const slidesCollection = collection(db, "slides");
      const docRef = await addDoc(slidesCollection, newSlide);
      setSlides((prev) => [...prev, { id: docRef.id, ...newSlide }]);
      setNewSlide({ title: "", description: "", image: "", link: "" });
    } catch (error) {
      console.error("Error adding slide:", error);
    }
  };

  const handleDeleteSlide = async (id) => {
    try {
      const slideRef = doc(db, "slides", id);
      await deleteDoc(slideRef);
      setSlides((prev) => prev.filter((slide) => slide.docId !== id));
      alert("Slide başarıyla silindi!");
    } catch (error) {
      alert("Slide silme sırasında bir hata oluştu!");
      console.error("Error deleting slide:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Anasayfa Slider Yönetimi</h1>

      <div className="mb-6 border p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Yeni Slider Ekle</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Başlık"
            value={newSlide.title}
            onChange={(e) =>
              setNewSlide({ ...newSlide, title: e.target.value })
            }
            className="w-full border rounded p-2"
          />
          <textarea
            placeholder="Açıklama"
            value={newSlide.description}
            onChange={(e) =>
              setNewSlide({ ...newSlide, description: e.target.value })
            }
            className="w-full border rounded p-2"
            rows="3"
          />
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full border rounded p-2 mb-2"
            />
            <p className="text-sm text-gray-600">Ya da bir URL girin:</p>
            <input
              type="text"
              placeholder="Resim URL"
              value={newSlide.image}
              onChange={(e) =>
                setNewSlide({ ...newSlide, image: e.target.value })
              }
              className="w-full border rounded p-2"
            />
          </div>
          <input
            type="text"
            placeholder="Link"
            value={newSlide.link}
            onChange={(e) => setNewSlide({ ...newSlide, link: e.target.value })}
            className="w-full border rounded p-2"
          />
          <button
            onClick={handleAddSlide}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Slider Ekle
          </button>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="border rounded p-4 shadow relative bg-white"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="text-lg font-bold mt-2">{slide.title}</h3>
              <p className="text-sm text-gray-600">{slide.description}</p>
              <a
                href={slide.link}
                className="text-blue-500 underline text-sm mt-1 block"
              >
                Bağlantı: {slide.link}
              </a>
              <button
                onClick={() => handleDeleteSlide(slide.docId)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2"
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Anasayfa;
