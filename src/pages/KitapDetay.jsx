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
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import Loader from "../layout/Loader";
import { Clock, Tag, MessageSquare, Plus, Heart, Trash2 } from "lucide-react";

const KitapDetay = () => {
  const { id } = useParams();
  const [kitap, setKitap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [newSectionComment, setNewSectionComment] = useState("");
  const [selectedQuote, setSelectedQuote] = useState("");
  const [ad, setAd] = useState("");
  const [comments, setComments] = useState([]);
  const [sectionComments, setSectionComments] = useState([]);
  const [sections, setSections] = useState([]);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [likedSections, setLikedSections] = useState({});
  const [selectedParagraph, setSelectedParagraph] = useState(null);
  const [paragraphComments, setParagraphComments] = useState({});
  const [isParagraphCommentModalOpen, setIsParagraphCommentModalOpen] =
    useState(false);
  const [newParagraphComment, setNewParagraphComment] = useState("");
  const [userLikes, setUserLikes] = useState(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [paragraphCommentCounts, setParagraphCommentCounts] = useState({});

  useEffect(() => {
    const adminStatus =
      localStorage.getItem("aniliscenanisAdminLoggedenIn") === "true";
    setIsAdmin(adminStatus);
  }, []);

  const checkLikedSections = async () => {
    try {
      const likedSectionsRef = doc(
        db,
        "kitaplar",
        id,
        "likedSections",
        "users"
      );
      const likedSectionsDoc = await getDoc(likedSectionsRef);

      if (likedSectionsDoc.exists()) {
        setLikedSections(likedSectionsDoc.data());
      }

      const storedLikes = localStorage.getItem(`userLikes_${id}`);
      if (storedLikes) {
        setUserLikes(new Set(JSON.parse(storedLikes)));
      }
    } catch (error) {
      console.error("Beğeni durumu kontrol edilirken hata oluştu:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteDoc(doc(db, "kitaplar", id, "yorumlar", commentId));
      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("Yorum silinirken hata oluştu:", error);
    }
  };

  const handleDeleteParagraphComment = async (commentId) => {
    if (!selectedSection || !selectedParagraph) return;
    try {
      await deleteDoc(
        doc(
          db,
          "kitaplar",
          id,
          "bolumler",
          selectedSection.docId,
          "paragrafYorumlari",
          selectedParagraph,
          "yorumlar",
          commentId
        )
      );
      setParagraphComments((prev) => ({
        ...prev,
        [selectedParagraph]: prev[selectedParagraph].filter(
          (comment) => comment.id !== commentId
        ),
      }));
    } catch (error) {
      console.error("Paragraf yorumu silinirken hata oluştu:", error);
    }
  };

  const handleLikeSection = async () => {
    if (!selectedSection) return;

    const sectionId = selectedSection.docId;
    if (userLikes.has(sectionId)) return;

    try {
      const sectionRef = doc(db, "kitaplar", id, "bolumler", sectionId);
      const newLikes = (selectedSection.likes || 0) + 1;
      const likedSectionsRef = doc(
        db,
        "kitaplar",
        id,
        "likedSections",
        "users"
      );

      await Promise.all([
        updateDoc(sectionRef, { likes: newLikes }),
        setDoc(
          likedSectionsRef,
          { ...likedSections, [sectionId]: true },
          { merge: true }
        ),
      ]);

      setSelectedSection({ ...selectedSection, likes: newLikes });
      setSections((prevSections) =>
        prevSections.map((sec) =>
          sec.docId === sectionId ? { ...sec, likes: newLikes } : sec
        )
      );

      const newUserLikes = new Set(userLikes).add(sectionId);
      setUserLikes(newUserLikes);
      localStorage.setItem(
        `userLikes_${id}`,
        JSON.stringify(Array.from(newUserLikes))
      );
      setLikedSections((prev) => ({ ...prev, [sectionId]: true }));
    } catch (error) {
      console.error("Beğeni eklenirken hata oluştu:", error);
    }
  };

  const getParagraphComments = async (paragraphId) => {
    try {
      const commentsRef = collection(
        db,
        "kitaplar",
        id,
        "bolumler",
        selectedSection.docId,
        "paragrafYorumlari",
        paragraphId,
        "yorumlar"
      );
      const q = query(commentsRef, orderBy("tarih", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Paragraf yorumları çekilirken hata oluştu:", error);
      return [];
    }
  };

  const handleParagraphCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newParagraphComment.trim() || !selectedParagraph) return;

    try {
      const commentRef = collection(
        db,
        "kitaplar",
        id,
        "bolumler",
        selectedSection.docId,
        "paragrafYorumlari",
        selectedParagraph,
        "yorumlar"
      );

      const docRef = await addDoc(commentRef, {
        yorum: newParagraphComment,
        kullaniciAdi: ad,
        tarih: serverTimestamp(),
      });

      setParagraphComments((prev) => ({
        ...prev,
        [selectedParagraph]: [
          {
            id: docRef.id,
            yorum: newParagraphComment,
            kullaniciAdi: ad,
            tarih: new Date(),
          },
          ...(prev[selectedParagraph] || []),
        ],
      }));

      setAd("");
      setNewParagraphComment("");
    } catch (error) {
      console.error("Paragraf yorumu eklenirken hata oluştu:", error);
    }
  };

  const handleSectionCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newSectionComment.trim() || !selectedSection) return;

    try {
      const yorumlarRef = collection(
        db,
        "kitaplar",
        id,
        "bolumler",
        selectedSection.docId,
        "yorumlar"
      );
      const docRef = await addDoc(yorumlarRef, {
        yorum: newSectionComment,
        alinti: selectedQuote,
        tarih: serverTimestamp(),
        kullaniciAdi: ad,
      });

      setSectionComments((prevComments) => [
        {
          id: docRef.id,
          yorum: newSectionComment,
          alinti: selectedQuote,
          tarih: new Date(),
          kullaniciAdi: ad,
        },
        ...prevComments,
      ]);

      setNewSectionComment("");
      setSelectedQuote("");
      setIsCommentModalOpen(false);
    } catch (error) {
      console.error("Bölüm yorumu eklenirken hata oluştu:", error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const yorumlarRef = collection(db, "kitaplar", id, "yorumlar");
      const docRef = await addDoc(yorumlarRef, {
        yorum: newComment,
        tarih: serverTimestamp(),
        kullaniciAdi: ad,
      });

      setComments((prevComments) => [
        {
          id: docRef.id,
          yorum: newComment,
          tarih: new Date(),
          kullaniciAdi: ad,
        },
        ...prevComments,
      ]);

      setNewComment("");
    } catch (error) {
      console.error("Yorum eklenirken hata oluştu:", error);
    }
  };

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
            likes: doc.data().likes || 0,
            createdAt: doc.data().createdAt?.toDate() || new Date(0), // Tarihi al veya varsayılan değer ver
          }));

          // Bölümleri sırala: Önce giriş, sonra createdAt'e göre yeniden eskiye
          const sortedBolumler = bolumlerData.sort((a, b) => {
            // Eğer a giriş bölümüyse en başa al
            if (a.giris && !b.giris) return -1;
            if (!a.giris && b.giris) return 1;

            // İkisi de giriş veya ikisi de normal bölümse, createdAt'e göre sırala
            // Yeni eklenenler sonda olacak şekilde sırala (eskiden yeniye)
            return a.createdAt - b.createdAt;
          });

          setSections(sortedBolumler || []);
        }
        await checkLikedSections();
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

  useEffect(() => {
    if (selectedSection?.icerik && paragraphCommentCounts) {
      const modalContent = document.querySelector(".modal-content");
      if (modalContent) {
        modalContent.innerHTML = processContent(selectedSection.icerik);

        // Tüm içerik elemanlarını hedefleyip stil ekle
        const allElements = modalContent.getElementsByTagName("*");
        Array.from(allElements).forEach((element) => {
          if (!element.classList.contains("comment-btn")) {
            element.classList.add("text-gray-900", "dark:text-gray-100");
          }
        });
      }
    }
  }, [selectedSection?.icerik, paragraphCommentCounts]);

  const processContent = (content) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    const paragraphs = Array.from(doc.getElementsByTagName("p")).filter(
      (p) => p.textContent.trim() !== ""
    );

    paragraphs.forEach((p, index) => {
      const paragraphId = `p-${index}`;
      p.setAttribute("id", paragraphId);
      p.style.position = "relative";

      const commentCount = paragraphCommentCounts[paragraphId] || 0;

      const commentButton = document.createElement("button");
      commentButton.innerHTML = `
      <div class="inline-flex items-center gap-1 text-sm dark:text-white text-black hover:text-blue-600 cursor-pointer">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        ${
          commentCount > 0
            ? `<span class="absolute -top-2 -right-2 bg-red-300 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">${commentCount}</span>`
            : ""
        }
      </div>
    `;
      commentButton.className = "comment-btn";
      commentButton.setAttribute("data-paragraph-id", paragraphId);
      commentButton.style.position = "absolute";
      commentButton.style.top = "90%";
      commentButton.style.right = "0%";
      commentButton.style.transform = "translateY(-50%)";

      document.addEventListener("click", (event) => {
        const target = event.target.closest(".comment-btn");
        if (target) {
          const paragraphId = target.getAttribute("data-paragraph-id");
          setIsParagraphCommentModalOpen(true);
          setSelectedParagraph(paragraphId);
          getParagraphComments(paragraphId).then((comments) => {
            setParagraphComments((prev) => ({
              ...prev,
              [paragraphId]: comments,
            }));
          });
        }
      });
      p.appendChild(commentButton);
    });

    return doc.body.innerHTML;
  };

  // Yorum sayısını çekmek için bir `useEffect`
  useEffect(() => {
    const fetchParagraphComments = async () => {
      if (!selectedSection || !isModalOpen) return;

      try {
        const paragrafYorumlari = {};
        const paragraphs = document.querySelectorAll(".modal-content p");

        if (!paragraphs.length) {
          console.warn("Paragraflar bulunamadı, DOM tam yüklenmemiş olabilir.");
          return;
        }

        await Promise.all(
          Array.from(paragraphs).map(async (p) => {
            const paragraphId = p.id;
            if (!paragraphId) return;

            const yorumlarRef = collection(
              db,
              "kitaplar",
              id,
              "bolumler",
              selectedSection.docId,
              "paragrafYorumlari",
              paragraphId,
              "yorumlar"
            );

            const yorumlarSnapshot = await getDocs(yorumlarRef);
            paragrafYorumlari[paragraphId] = yorumlarSnapshot.size || 0;
          })
        );

        setParagraphCommentCounts(paragrafYorumlari);
        console.log("Güncellenen Yorumlar:", paragrafYorumlari);
      } catch (error) {
        console.error("Bölüm yorumları çekilirken hata oluştu:", error);
      }
    };

    if (isModalOpen && selectedSection) {
      const timer = setTimeout(() => {
        fetchParagraphComments();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [id, selectedSection, isModalOpen]);

  const handleSectionRead = async (section) => {
    try {
      const sectionRef = doc(db, "kitaplar", id, "bolumler", section.docId);
      const newReadCount = (section.readCount || 0) + 1;

      await updateDoc(sectionRef, {
        readCount: newReadCount,
      });

      setSections((prevSections) =>
        prevSections.map((sec) =>
          sec.docId === section.docId
            ? { ...sec, readCount: newReadCount }
            : sec
        )
      );

      openModal(section);
    } catch (error) {
      console.error("Okuma sayısı artırılırken hata oluştu:", error);
    }
  };

  const openModal = (section) => {
    setSelectedSection(section);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSection(null);
  };

  if (loading) {
    return <Loader />;
  }

  if (!kitap) {
    return <div>Kitap bilgisi bulunamadı.</div>;
  }

  return (
    <div>
      <Header />
      <div className="mx-auto px-2 xl:px-0 select-none bg-white/5 dark:bg-black/80 py-8">
        <div className="flex md:flex-row px-4 lg:px-0 flex-col-reverse container max-w-screen-xl justify-between items-center lg:items-start mx-auto gap-5 lg:gap-10">
          <div className="text-center md:text-left w-full">
            <p className="text-6xl md:text-7xl text-black font-medium dark:text-white">
              {kitap.title}
            </p>
            <p className="text-black/80 dark:text-gray-100 text-lg my-2">
              {kitap.author}
            </p>
            <div className="prose max-w-none mt-4">
              <div
                className="text-black/90 dark:text-white text-base leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: kitap.description,
                }}
              />
            </div>
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
          <div>
            <img
              src={kitap.imageUrl}
              alt="Kitap Resmi"
              className="w-[520px] rounded h-auto"
            />
          </div>
        </div>

        <div className="container max-w-screen-xl mx-auto mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {sections.map((section) => (
            <div
              key={section.docId}
              className="bg-black dark:bg-black/30 p-4 rounded-lg text-white dark:text-white shadow-md hover:bg-gray-700"
            >
              <h3 className="text-xl font-semibold text-center">
                {section.name}
              </h3>
              <p className="mt-2 text-xs text-center">
                Okunma Sayısı: {section.readCount || 0}
              </p>
              <p className="text-center text-xs">
                Tahmini Okuma Süresi: {section.estimatedTime}
              </p>
              <button
                onClick={() => handleSectionRead(section)}
                className="mt-4 w-full py-2 border border-blue-600 text-white rounded hover:bg-blue-500 duration-300"
              >
                Oku
              </button>
            </div>
          ))}
        </div>

        <div className="container max-w-screen-xl mx-auto mt-8">
          <div className="bg-black dark:bg-black/30 p-6 rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="text-white" />
              <h2 className="text-2xl text-white font-semibold">Yorumlar</h2>
            </div>

            <form onSubmit={handleCommentSubmit} className="mb-6">
              <input
                value={ad}
                onChange={(e) => setAd(e.target.value)}
                className="w-full mb-2 p-3 rounded-lg bg-white dark:bg-gray-700 dark:text-white placeholder-black text-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adınız"
                required
              />
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white placeholder-black dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="bg-white relative dark:bg-black/40 p-4 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-black/80 dark:text-blue-400 font-medium">
                      {comment.kullaniciAdi}
                    </span>
                    <span className="text-gray-700 text-sm">
                      {comment.tarih?.toDate?.()?.toLocaleDateString?.() ||
                        "Şimdi"}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 absolute top-10 right-4 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <p className="text-black font-medium dark:text-white">
                    {comment.yorum}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isModalOpen && selectedSection && (
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 w-full max-w-4xl rounded-lg shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {selectedSection.name}
                </h2>
                <button
                  onClick={handleLikeSection}
                  disabled={userLikes.has(selectedSection.docId)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                    userLikes.has(selectedSection.docId)
                      ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  <Heart
                    size={18}
                    fill={
                      userLikes.has(selectedSection.docId)
                        ? "currentColor"
                        : "none"
                    }
                  />
                  <span>{selectedSection.likes || 0}</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-2 md:p-4 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 min-h-[200px]">
                  <div className="max-w-none modal-content"></div>
                </div>
              </div>

              <div className="p-4 border-t dark:border-gray-700">
                <button
                  onClick={closeModal}
                  className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        )}

        {isCommentModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-neutral-800 container max-w-lg w-full p-8 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Yorum Ekle
              </h2>
              <form onSubmit={handleSectionCommentSubmit}>
                <input
                  value={ad}
                  onChange={(e) => setAd(e.target.value)}
                  className="w-full mb-2 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Adınız"
                  required
                />
                <textarea
                  value={selectedQuote}
                  onChange={(e) => setSelectedQuote(e.target.value)}
                  className="w-full mb-2 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Alıntı yapmak istediğiniz metni buraya yapıştırın..."
                  rows="2"
                />
                <textarea
                  value={newSectionComment}
                  onChange={(e) => setNewSectionComment(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Yorumunuzu yazın..."
                  rows="3"
                  required
                />
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Gönder
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCommentModalOpen(false)}
                    className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isParagraphCommentModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-neutral-800 container max-w-lg w-full p-8 rounded-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                Paragrafa Yorum Ekle
              </h2>

              <div className="mb-4 text-gray-300">
                <p className="italic border-l-4 border-gray-500 pl-4">
                  {selectedParagraph &&
                    document.getElementById(selectedParagraph)?.textContent}
                </p>
              </div>

              <form onSubmit={handleParagraphCommentSubmit}>
                <input
                  value={ad}
                  onChange={(e) => setAd(e.target.value)}
                  className="w-full mb-2 p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Adınız"
                  required
                />
                <textarea
                  value={newParagraphComment}
                  onChange={(e) => setNewParagraphComment(e.target.value)}
                  className="w-full p-3 rounded-lg bg-gray-700 text-white placeholder-gray-400"
                  placeholder="Yorumunuzu yazın..."
                  rows="3"
                  required
                />

                <div className="mt-4 max-h-40 overflow-y-auto">
                  {paragraphComments[selectedParagraph]?.map(
                    (comment, index) => (
                      <div
                        key={comment.id || index}
                        className="bg-gray-700 relative p-3 rounded mb-2"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-blue-400">
                            {comment.kullaniciAdi}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {comment.tarih
                              ?.toDate?.()
                              ?.toLocaleDateString?.() || "Şimdi"}
                          </span>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteParagraphComment(comment.id)
                              }
                              className="text-red-500 absolute top-10 right-4 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        <p className="text-white">{comment.yorum}</p>
                      </div>
                    )
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Gönder
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsParagraphCommentModalOpen(false)}
                    className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default KitapDetay;
