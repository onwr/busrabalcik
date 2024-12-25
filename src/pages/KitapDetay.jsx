import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { db } from "../db/Firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  updateDoc,
} from "firebase/firestore";
import Loader from "../layout/Loader";
import { Clock, Tag, MessageSquare } from "lucide-react";

const KitapDetay = () => {
  const { id } = useParams();
  const [kitap, setKitap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [ad, setAd] = useState("");
  const [comments, setComments] = useState([]);
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const kitapCek = async () => {
      try {
        const kitapDoc = doc(db, "kitaplar", id);
        const kitapBolumRef = collection(db, "kitaplar", id, "bolumler");
        const kitapSnapshot = await getDoc(kitapDoc);
        const kitapBolumSnapshot = await getDocs(kitapBolumRef);

        if (kitapSnapshot.exists()) {
          setKitap(kitapSnapshot.data());
          const bolumlerData = kitapBolumSnapshot.docs.map((doc) => ({
            docId: doc.id,
            ...doc.data(),
          }));
          setSections(bolumlerData || []);
        } else {
          console.log("Kitap bulunamadı!");
        }
      } catch (error) {
        console.error("Hata oluştu: ", error);
      } finally {
        setLoading(false);
      }
    };

    const yorumlariCek = async () => {
      try {
        const yorumlarRef = collection(db, "kitaplar", id, "yorumlar");
        const q = query(yorumlarRef, orderBy("tarih", "desc"));
        const querySnapshot = await getDocs(q);
        const yorumlar = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(yorumlar);
      } catch (error) {
        console.error("Yorumlar çekilirken hata oluştu:", error);
      }
    };

    kitapCek();
    yorumlariCek();
  }, [id]);

  if (loading) {
    return <Loader />;
  }

  if (!kitap) {
    return <div>Kitap bilgisi bulunamadı.</div>;
  }

  const openModal = (section) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const yorumlarRef = collection(db, "kitaplar", id, "yorumlar");
      await addDoc(yorumlarRef, {
        yorum: newComment,
        tarih: serverTimestamp(),
        kullaniciAdi: ad,
      });

      setComments((prevComments) => [
        {
          yorum: newComment,
          tarih: new Date(),
          kullaniciAdi: ad,
        },
        ...prevComments,
      ]);

      setAd("");
      setNewComment("");
    } catch (error) {
      console.error("Yorum eklenirken hata oluştu:", error);
    }
  };

  const handleSectionRead = async (section) => {
    try {
      const sectionRef = doc(db, "kitaplar", id, "bolumler", section.docId);
      await updateDoc(sectionRef, {
        readCount: section.readCount + 1,
      });

      setSections((prevSections) =>
        prevSections.map((sec) =>
          sec.id === section.id ? { ...sec, readCount: sec.readCount + 1 } : sec
        )
      );

      openModal(section);
    } catch (error) {
      console.error("Okuma sayısı artırılırken hata oluştu:", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="mx-auto bg-white/5 dark:bg-black/80 py-8">
        <div className="flex md:flex-row flex-col-reverse container max-w-screen-xl justify-center items-center mx-auto gap-10">
          <div className="text-center md:text-left max-w-xl">
            <p className="text-6xl md:text-7xl text-black font-medium dark:text-white">
              {kitap.title}
            </p>
            <p className="text-black/80 dark:text-gray-100 text-lg my-2">
              {kitap.author}
            </p>
            <p className="text-black/90 dark:text-white">{kitap.description}</p>
            <div className="mt-6 flex justify-center md:justify-start space-x-6 text-black/70 dark:text-white">
              <div className="flex items-center">
                <Clock className="text-xl mr-2" />
                <span>{kitap.sure ? kitap.sure : "Bulunamadı"}</span>
              </div>
              <div className="flex items-center">
                <Tag className="text-xl mr-2" />
                <span>{kitap.kategori ? kitap.kategori : "Bulunamadı"}</span>
              </div>
            </div>
          </div>
          <div className="">
            <img
              src={kitap.imageUrl}
              alt="Kitap Resmi"
              className="w-auto rounded h-[500px]"
            />
          </div>
        </div>

        <div className="container max-w-screen-xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-black/80 dark:bg-black/30 p-4 rounded-lg text-white shadow-md hover:bg-gray-700"
            >
              <h3 className="text-xl font-semibold text-center">
                {section.name}
              </h3>
              <p className="mt-2 text-xs text-center">
                Okunma Sayısı: {section.readCount}
              </p>
              <p className="text-center text-xs">
                Tahmini Okuma Süresi: {section.estimatedTime}
              </p>
              <button
                onClick={() => handleSectionRead(section)}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Oku
              </button>
            </div>
          ))}
        </div>

        <div className="container max-w-screen-xl mx-auto mt-8">
          <div className="bg-black/80 dark:bg-black/30 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="text-white" />
              <h2 className="text-2xl text-white font-semibold">Yorumlar</h2>
            </div>

            <form onSubmit={handleCommentSubmit} className="mb-6">
              <input
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                className="w-full mb-2 p-3 rounded-lg  bg-white dark:bg-gray-700 text-white placeholder-black/70 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adınız"
                required
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full mb-2 p-3 rounded-lg  bg-white dark:bg-gray-700 text-white placeholder-black/70 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Yorumunuzu yazın..."
                rows="2"
              />
              <button
                type="submit"
                className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Yorum Yap
              </button>
            </form>

            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div
                  key={comment.id || index}
                  className="bg-black/40 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-400 font-medium">
                      {comment.kullaniciAdi}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {comment.tarih?.toDate?.()?.toLocaleDateString?.() ||
                        "Şimdi"}
                    </span>
                  </div>
                  <p className="text-white">{comment.yorum}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isModalOpen && selectedSection && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-neutral-800 container max-w-screen-lg w-full p-8 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                {selectedSection.name}
              </h2>
              <p
                className="mb-4 text-white max-h-80 overflow-hidden overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: selectedSection.icerik }}
              ></p>
              <button
                onClick={closeModal}
                className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Kapat
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default KitapDetay;
