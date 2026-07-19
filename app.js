import { firebaseConfig, ADMIN_EMAIL } from "./firebase-config.js";

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
const STORAGE_KEYS = {
  nickname: "wordPuzzleNickname"
};

const TOTAL_PUZZLE_PIECES = 1189;

const BIBLE_BOOKS = [
  { name: "창세기", chapters: 50 }, { name: "출애굽기", chapters: 40 },
  { name: "레위기", chapters: 27 }, { name: "민수기", chapters: 36 },
  { name: "신명기", chapters: 34 }, { name: "여호수아", chapters: 24 },
  { name: "사사기", chapters: 21 }, { name: "룻기", chapters: 4 },
  { name: "사무엘상", chapters: 31 }, { name: "사무엘하", chapters: 24 },
  { name: "열왕기상", chapters: 22 }, { name: "열왕기하", chapters: 25 },
  { name: "역대상", chapters: 29 }, { name: "역대하", chapters: 36 },
  { name: "에스라", chapters: 10 }, { name: "느헤미야", chapters: 13 },
  { name: "에스더", chapters: 10 }, { name: "욥기", chapters: 42 },
  { name: "시편", chapters: 150 }, { name: "잠언", chapters: 31 },
  { name: "전도서", chapters: 12 }, { name: "아가", chapters: 8 },
  { name: "이사야", chapters: 66 }, { name: "예레미야", chapters: 52 },
  { name: "예레미야애가", chapters: 5 }, { name: "에스겔", chapters: 48 },
  { name: "다니엘", chapters: 12 }, { name: "호세아", chapters: 14 },
  { name: "요엘", chapters: 3 }, { name: "아모스", chapters: 9 },
  { name: "오바댜", chapters: 1 }, { name: "요나", chapters: 4 },
  { name: "미가", chapters: 7 }, { name: "나훔", chapters: 3 },
  { name: "하박국", chapters: 3 }, { name: "스바냐", chapters: 3 },
  { name: "학개", chapters: 2 }, { name: "스가랴", chapters: 14 },
  { name: "말라기", chapters: 4 }, { name: "마태복음", chapters: 28 },
  { name: "마가복음", chapters: 16 }, { name: "누가복음", chapters: 24 },
  { name: "요한복음", chapters: 21 }, { name: "사도행전", chapters: 28 },
  { name: "로마서", chapters: 16 }, { name: "고린도전서", chapters: 16 },
  { name: "고린도후서", chapters: 13 }, { name: "갈라디아서", chapters: 6 },
  { name: "에베소서", chapters: 6 }, { name: "빌립보서", chapters: 4 },
  { name: "골로새서", chapters: 4 }, { name: "데살로니가전서", chapters: 5 },
  { name: "데살로니가후서", chapters: 3 }, { name: "디모데전서", chapters: 6 },
  { name: "디모데후서", chapters: 4 }, { name: "디도서", chapters: 3 },
  { name: "빌레몬서", chapters: 1 }, { name: "히브리서", chapters: 13 },
  { name: "야고보서", chapters: 5 }, { name: "베드로전서", chapters: 5 },
  { name: "베드로후서", chapters: 3 }, { name: "요한일서", chapters: 5 },
  { name: "요한이서", chapters: 1 }, { name: "요한삼서", chapters: 1 },
  { name: "유다서", chapters: 1 }, { name: "요한계시록", chapters: 22 }
];

const elements = {
  firebaseStatus: document.querySelector("#firebaseStatus"),
  firebaseStatusTitle: document.querySelector("#firebaseStatusTitle"),
  firebaseStatusText: document.querySelector("#firebaseStatusText"),
  loginSection: document.querySelector("#loginSection"),
  appSection: document.querySelector("#appSection"),
  loginForm: document.querySelector("#loginForm"),
  nickname: document.querySelector("#nickname"),
  loginError: document.querySelector("#loginError"),
  currentNickname: document.querySelector("#currentNickname"),
  changeUserButton: document.querySelector("#changeUserButton"),
  todayLabel: document.querySelector("#todayLabel"),
  totalChapters: document.querySelector("#totalChapters"),
  todayChapters: document.querySelector("#todayChapters"),
  myChapters: document.querySelector("#myChapters"),
  progressPercent: document.querySelector("#progressPercent"),
  pieceCounter: document.querySelector("#pieceCounter"),
  progressBar: document.querySelector("#progressBar"),
  readingForm: document.querySelector("#readingForm"),
  bookSelect: document.querySelector("#bookSelect"),
  startChapter: document.querySelector("#startChapter"),
  endChapter: document.querySelector("#endChapter"),
  chapterInfo: document.querySelector("#chapterInfo"),
  reflection: document.querySelector("#reflection"),
  readingError: document.querySelector("#readingError"),
  recordList: document.querySelector("#recordList"),
  emptyRecords: document.querySelector("#emptyRecords"),
  clearRecordsButton: document.querySelector("#clearRecordsButton"),
  toast: document.querySelector("#toast"),
  adminOpenButton: document.querySelector("#adminOpenButton"),
  adminModal: document.querySelector("#adminModal"),
  adminCloseButton: document.querySelector("#adminCloseButton"),
  adminLoginSection: document.querySelector("#adminLoginSection"),
  adminDashboardSection: document.querySelector("#adminDashboardSection"),
  adminLoginForm: document.querySelector("#adminLoginForm"),
  adminPassword: document.querySelector("#adminPassword"),
  adminLoginError: document.querySelector("#adminLoginError"),
  adminLogoutButton: document.querySelector("#adminLogoutButton"),
  photoUploadForm: document.querySelector("#photoUploadForm"),
  photoTitle: document.querySelector("#photoTitle"),
  photoUrl: document.querySelector("#photoUrl"),
  photoUploadError: document.querySelector("#photoUploadError"),
  photoCountBadge: document.querySelector("#photoCountBadge"),
  emptyPhotoList: document.querySelector("#emptyPhotoList"),
  adminPhotoList: document.querySelector("#adminPhotoList"),
  activePhotoTitle: document.querySelector("#activePhotoTitle"),
  activePhotoImage: document.querySelector("#activePhotoImage"),
  photoCoverGrid: document.querySelector("#photoCoverGrid"),
  noPhotoState: document.querySelector("#noPhotoState"),
  pieceModal: document.querySelector("#pieceModal"),
  pieceCloseButton: document.querySelector("#pieceCloseButton"),
  pieceNumberBadge: document.querySelector("#pieceNumberBadge"),
  pieceNickname: document.querySelector("#pieceNickname"),
  piecePassage: document.querySelector("#piecePassage"),
  pieceDate: document.querySelector("#pieceDate"),
  pieceReflection: document.querySelector("#pieceReflection"),
  pieceReflectionRow: document.querySelector("#pieceReflectionRow")
};

let app;
let auth;
let db;
let firebaseReady = false;
let currentNickname = localStorage.getItem(STORAGE_KEYS.nickname) || "";
let currentUser = null;
let isAdminAuthenticated = false;
let records = [];
let photos = [];
let activePhotoId = "";
let unsubscribeRecords = null;
let unsubscribePhotos = null;
let unsubscribeSettings = null;

function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("여기에_") &&
    firebaseConfig.projectId &&
    !firebaseConfig.projectId.includes("여기에_") &&
    ADMIN_EMAIL &&
    ADMIN_EMAIL !== "admin@example.com"
  );
}

function setConnectionStatus(type, title, text) {
  elements.firebaseStatus.classList.remove("connected", "error");
  if (type) elements.firebaseStatus.classList.add(type);
  elements.firebaseStatusTitle.textContent = title;
  elements.firebaseStatusText.textContent = text;
}

function setFormsDisabled(disabled) {
  elements.readingForm.querySelectorAll("input, select, textarea, button")
    .forEach((node) => { node.disabled = disabled; });
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatKoreanDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short"
  }).format(date);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => elements.toast.classList.remove("show"), 2600);
}

function populateBooks() {
  elements.bookSelect.innerHTML = BIBLE_BOOKS.map(
    (book, index) => `<option value="${index}">${book.name}</option>`
  ).join("");
  syncChapterInputs();
}

function selectedBook() {
  return BIBLE_BOOKS[Number(elements.bookSelect.value)];
}

function syncChapterInputs() {
  const book = selectedBook();
  if (!book) return;
  elements.startChapter.max = book.chapters;
  elements.endChapter.max = book.chapters;

  if (Number(elements.startChapter.value) > book.chapters) {
    elements.startChapter.value = book.chapters;
  }
  if (Number(elements.endChapter.value) > book.chapters) {
    elements.endChapter.value = book.chapters;
  }
  updateChapterInfo();
}

function calculateChapterCount() {
  const start = Number(elements.startChapter.value);
  const end = Number(elements.endChapter.value);
  const book = selectedBook();

  if (!book || !Number.isInteger(start) || !Number.isInteger(end)) {
    return { valid: false, message: "장 번호를 정확히 입력해 주세요." };
  }
  if (start < 1 || end < 1 || start > book.chapters || end > book.chapters) {
    return {
      valid: false,
      message: `${book.name}은 1장부터 ${book.chapters}장까지 있습니다.`
    };
  }
  if (start > end) {
    return { valid: false, message: "시작 장은 끝 장보다 클 수 없습니다." };
  }
  return { valid: true, count: end - start + 1 };
}

function updateChapterInfo() {
  const result = calculateChapterCount();
  elements.chapterInfo.textContent = result.valid
    ? `총 ${result.count}장 읽기`
    : result.message;
}

function showApp() {
  const hasNickname = Boolean(currentNickname);
  elements.loginSection.classList.toggle("hidden", hasNickname);
  elements.appSection.classList.toggle("hidden", !hasNickname);
  elements.changeUserButton.classList.toggle("hidden", !hasNickname);
  if (hasNickname) {
    elements.currentNickname.textContent = currentNickname;
    render();
  }
}

function normalizeRecord(documentSnapshot) {
  const data = documentSnapshot.data();
  return {
    id: documentSnapshot.id,
    nickname: data.nickname || "이름 없음",
    book: data.book || "",
    startChapter: Number(data.startChapter || 1),
    endChapter: Number(data.endChapter || 1),
    chapterCount: Number(data.chapterCount || 0),
    reflection: data.reflection || "",
    date: data.date || getLocalDateKey(),
    ownerUid: data.ownerUid || "",
    createdAt: data.createdAt?.toMillis?.() || data.createdAtMs || 0
  };
}

function normalizePhoto(documentSnapshot) {
  const data = documentSnapshot.data();
  return {
    id: documentSnapshot.id,
    title: data.title || "제목 없는 사진",
    downloadURL: data.downloadURL || "",
    createdAt: data.createdAt?.toMillis?.() || data.createdAtMs || 0
  };
}

function render() {
  const today = getLocalDateKey();
  const total = records.reduce((sum, record) => sum + record.chapterCount, 0);
  const todayTotal = records
    .filter((record) => record.date === today)
    .reduce((sum, record) => sum + record.chapterCount, 0);
  const myTotal = records
    .filter((record) => record.nickname === currentNickname)
    .reduce((sum, record) => sum + record.chapterCount, 0);
  const progress = Math.min((total / TOTAL_PUZZLE_PIECES) * 100, 100);

  elements.todayLabel.textContent = formatKoreanDate(today);
  elements.totalChapters.textContent = `${total.toLocaleString()}장`;
  elements.todayChapters.textContent = `${todayTotal.toLocaleString()}장`;
  elements.myChapters.textContent = `${myTotal.toLocaleString()}장`;
  elements.progressPercent.textContent = `${progress.toFixed(1)}%`;
  elements.pieceCounter.textContent =
    `${Math.min(total, TOTAL_PUZZLE_PIECES).toLocaleString()} / ${TOTAL_PUZZLE_PIECES.toLocaleString()}`;
  elements.progressBar.style.width = `${progress}%`;
  elements.progressBar.parentElement.setAttribute(
    "aria-valuenow",
    String(Math.min(total, TOTAL_PUZZLE_PIECES))
  );

  renderPhotoPuzzle(total);
  renderRecords();
  renderAdminPhotos();
}

function renderRecords() {
  elements.emptyRecords.classList.toggle("hidden", records.length > 0);
  const recentRecords = [...records]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 30);

  elements.recordList.innerHTML = recentRecords.map((record) => {
    const extraText = record.reflection
      ? `<p class="record-text">묵상: ${escapeHtml(record.reflection)}</p>`
      : "";

    return `
      <article class="record-card">
        <div class="record-top">
          <div>
            <div class="record-name">${escapeHtml(record.nickname)}</div>
            <p class="record-range">
              ${escapeHtml(record.book)} ${record.startChapter}${
                record.startChapter === record.endChapter ? "" : `~${record.endChapter}`
              }장 · ${record.chapterCount}조각
            </p>
          </div>
          <span class="record-meta">${formatKoreanDate(record.date)}</span>
        </div>
        ${extraText}
      </article>
    `;
  }).join("");
}

function seededShuffle(length, seed = 2027) {
  const values = Array.from({ length }, (_, index) => index);
  let state = seed >>> 0;

  function random() {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  for (let index = values.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [values[index], values[target]] = [values[target], values[index]];
  }
  return values;
}

const PUZZLE_ORDER = seededShuffle(TOTAL_PUZZLE_PIECES);

function buildChapterDetails() {
  const details = [];
  [...records]
    .sort((a, b) => a.createdAt - b.createdAt)
    .forEach((record) => {
      for (let chapter = record.startChapter; chapter <= record.endChapter; chapter += 1) {
        details.push({
          nickname: record.nickname,
          book: record.book,
          chapter,
          date: record.date,
          reflection: record.reflection || ""
        });
      }
    });
  return details.slice(0, TOTAL_PUZZLE_PIECES);
}

function getActivePhoto() {
  return photos.find((photo) => photo.id === activePhotoId) || photos[0] || null;
}

function renderPhotoPuzzle(totalChaptersRead) {
  const activePhoto = getActivePhoto();
  const hasPhoto = Boolean(activePhoto?.downloadURL);

  elements.activePhotoImage.classList.toggle("hidden", !hasPhoto);
  elements.photoCoverGrid.classList.toggle("hidden", !hasPhoto);
  elements.noPhotoState.classList.toggle("hidden", hasPhoto);

  if (!hasPhoto) {
    elements.activePhotoTitle.textContent = "등록된 퍼즐 사진이 없습니다";
    elements.activePhotoImage.removeAttribute("src");
    elements.photoCoverGrid.replaceChildren();
    return;
  }

  elements.activePhotoTitle.textContent = activePhoto.title;
  elements.activePhotoImage.src = activePhoto.downloadURL;

  const chapterDetails = buildChapterDetails();
  const openCount = Math.min(totalChaptersRead, TOTAL_PUZZLE_PIECES);
  const detailByPosition = new Map();

  for (let rank = 0; rank < openCount; rank += 1) {
    detailByPosition.set(PUZZLE_ORDER[rank], {
      rank,
      detail: chapterDetails[rank] || null
    });
  }

  const fragment = document.createDocumentFragment();
  for (let position = 0; position < TOTAL_PUZZLE_PIECES; position += 1) {
    const pieceData = detailByPosition.get(position);
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = `photo-cover-cell${pieceData ? " open" : ""}`;
    cell.setAttribute(
      "aria-label",
      pieceData ? `열린 퍼즐 조각 ${pieceData.rank + 1}` : `잠긴 퍼즐 조각 ${position + 1}`
    );

    if (pieceData) {
      cell.dataset.pieceRank = String(pieceData.rank);
    } else {
      cell.disabled = true;
    }
    fragment.appendChild(cell);
  }
  elements.photoCoverGrid.replaceChildren(fragment);
}

function openPieceModal(rank) {
  const detail = buildChapterDetails()[rank];
  if (!detail) return;

  elements.pieceNumberBadge.textContent = `#${rank + 1}`;
  elements.pieceNickname.textContent = detail.nickname;
  elements.piecePassage.textContent = `${detail.book} ${detail.chapter}장`;
  elements.pieceDate.textContent = formatKoreanDate(detail.date);
  elements.pieceReflection.textContent = detail.reflection;
  elements.pieceReflectionRow.classList.toggle("hidden", !detail.reflection);
  elements.pieceModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closePieceModal() {
  elements.pieceModal.classList.add("hidden");
  document.body.style.overflow = "";
}

function renderAdminPhotos() {
  elements.photoCountBadge.textContent = `${photos.length}장`;
  elements.emptyPhotoList.classList.toggle("hidden", photos.length > 0);

  elements.adminPhotoList.innerHTML = photos.map((photo) => `
    <article class="admin-photo-card ${getActivePhoto()?.id === photo.id ? "active" : ""}">
      <img class="admin-photo-thumb" src="${photo.downloadURL}" alt="${escapeHtml(photo.title)}" />
      <div class="admin-photo-info">
        <strong>${escapeHtml(photo.title)}</strong>
        <span>${photo.createdAt ? new Date(photo.createdAt).toLocaleString("ko-KR") : "업로드 중"}</span>
        ${getActivePhoto()?.id === photo.id ? "<span>현재 퍼즐 사진</span>" : ""}
      </div>
      <div class="admin-photo-actions">
        <button type="button" class="secondary-button" data-activate-photo="${photo.id}">
          선택
        </button>
        <button type="button" class="danger-button" data-delete-photo="${photo.id}">
          삭제
        </button>
      </div>
    </article>
  `).join("");
}

function updateAdminModalView() {
  elements.adminLoginSection.classList.toggle("hidden", isAdminAuthenticated);
  elements.adminDashboardSection.classList.toggle("hidden", !isAdminAuthenticated);
  elements.clearRecordsButton.classList.toggle("hidden", !isAdminAuthenticated);
}

function openAdminModal() {
  elements.adminModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  updateAdminModalView();
}

function closeAdminModal() {
  elements.adminModal.classList.add("hidden");
  document.body.style.overflow = "";
  elements.adminLoginError.textContent = "";
  elements.photoUploadError.textContent = "";
}

async function ensureAnonymousUser() {
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

function subscribeToOnlineData() {
  unsubscribeRecords?.();
  unsubscribePhotos?.();
  unsubscribeSettings?.();

  const recordsQuery = query(collection(db, "records"), orderBy("createdAt", "desc"));
  const photosQuery = query(collection(db, "photos"), orderBy("createdAt", "desc"));

  unsubscribeRecords = onSnapshot(recordsQuery, (snapshot) => {
    records = snapshot.docs.map(normalizeRecord);
    render();
  }, handleFirebaseError);

  unsubscribePhotos = onSnapshot(photosQuery, (snapshot) => {
    photos = snapshot.docs.map(normalizePhoto);
    render();
  }, handleFirebaseError);

  unsubscribeSettings = onSnapshot(doc(db, "settings", "main"), (snapshot) => {
    activePhotoId = snapshot.exists() ? snapshot.data().activePhotoId || "" : "";
    render();
  }, handleFirebaseError);
}

function handleFirebaseError(error) {
  console.error(error);
  setConnectionStatus("error", "Firebase 오류", friendlyFirebaseError(error));
}

function friendlyFirebaseError(error) {
  const code = error?.code || "";
  if (code.includes("permission-denied")) return "보안 규칙에서 접근이 거부됐습니다.";
  if (code.includes("auth/invalid-credential")) return "관리자 비밀번호가 올바르지 않습니다.";
  if (code.includes("auth/operation-not-allowed")) return "Firebase에서 익명 또는 이메일 로그인을 활성화해 주세요.";
  return error?.message || "알 수 없는 오류가 발생했습니다.";
}

async function initializeFirebase() {
  if (!hasFirebaseConfig()) {
    setConnectionStatus(
      "error",
      "Firebase 설정이 필요합니다",
      "firebase-config.js에 프로젝트 설정값과 관리자 이메일을 입력해 주세요."
    );
    setFormsDisabled(true);
    return;
  }

  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    onAuthStateChanged(auth, async (user) => {
      currentUser = user;
      isAdminAuthenticated = Boolean(user?.email && user.email === ADMIN_EMAIL);
      updateAdminModalView();

      if (!user) {
        await ensureAnonymousUser();
        return;
      }

      if (!firebaseReady) {
        firebaseReady = true;
        subscribeToOnlineData();
        setFormsDisabled(false);
        setConnectionStatus(
          "connected",
          "온라인 공동 저장 연결됨",
          "이제 다른 기기에서도 같은 인증 기록과 퍼즐을 확인할 수 있습니다."
        );
      }
    });

    await ensureAnonymousUser();
  } catch (error) {
    handleFirebaseError(error);
    setFormsDisabled(true);
  }
}

elements.loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const nickname = elements.nickname.value.trim();

  if (nickname.length < 2) {
    elements.loginError.textContent = "닉네임은 2글자 이상 입력해 주세요.";
    return;
  }

  currentNickname = nickname;
  localStorage.setItem(STORAGE_KEYS.nickname, currentNickname);
  elements.nickname.value = "";
  elements.loginError.textContent = "";
  showApp();
  showToast(`${currentNickname}님, 말씀 여정에 참여했어요.`);
});

elements.changeUserButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.nickname);
  currentNickname = "";
  showApp();
});

elements.bookSelect.addEventListener("change", syncChapterInputs);
elements.startChapter.addEventListener("input", updateChapterInfo);
elements.endChapter.addEventListener("input", updateChapterInfo);

elements.readingForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const result = calculateChapterCount();

  if (!firebaseReady || !currentUser) {
    elements.readingError.textContent = "Firebase 연결이 완료된 뒤 다시 시도해 주세요.";
    return;
  }
  if (!result.valid) {
    elements.readingError.textContent = result.message;
    return;
  }

  const submitButton = elements.readingForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;

  try {
    const book = selectedBook();
    await addDoc(collection(db, "records"), {
      nickname: currentNickname,
      nicknameLower: currentNickname.toLocaleLowerCase("ko-KR"),
      book: book.name,
      startChapter: Number(elements.startChapter.value),
      endChapter: Number(elements.endChapter.value),
      chapterCount: result.count,
      reflection: elements.reflection.value.trim(),
      date: getLocalDateKey(),
      ownerUid: currentUser.uid,
      createdAt: serverTimestamp(),
      createdAtMs: Date.now()
    });

    elements.reflection.value = "";
    elements.readingError.textContent = "";
    showToast(`${result.count}장 인증 완료! 퍼즐 ${result.count}조각이 열렸어요.`);
  } catch (error) {
    elements.readingError.textContent = friendlyFirebaseError(error);
  } finally {
    submitButton.disabled = false;
  }
});

elements.adminOpenButton.addEventListener("click", openAdminModal);
elements.adminCloseButton.addEventListener("click", closeAdminModal);
elements.adminModal.querySelector("[data-close-admin]").addEventListener("click", closeAdminModal);

elements.adminLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  elements.adminLoginError.textContent = "";

  if (!firebaseReady) {
    elements.adminLoginError.textContent = "Firebase 연결을 먼저 완료해 주세요.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, elements.adminPassword.value);
    elements.adminPassword.value = "";
    showToast("관리자로 로그인했습니다.");
  } catch (error) {
    elements.adminLoginError.textContent = friendlyFirebaseError(error);
  }
});

elements.adminLogoutButton.addEventListener("click", async () => {
  await signOut(auth);
  await ensureAnonymousUser();
  closeAdminModal();
  showToast("관리자에서 로그아웃했습니다.");
});

elements.photoUploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isAdminAuthenticated) {
    elements.photoUploadError.textContent = "관리자 로그인이 필요합니다.";
    return;
  }

  const title = elements.photoTitle.value.trim();
  const downloadURL = elements.photoUrl.value.trim();

  if (!title || !downloadURL) {
    elements.photoUploadError.textContent = "사진 제목과 이미지 주소를 모두 입력해 주세요.";
    return;
  }

  try {
    new URL(downloadURL);
  } catch {
    elements.photoUploadError.textContent = "올바른 이미지 주소를 입력해 주세요.";
    return;
  }

  const submitButton = elements.photoUploadForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  elements.photoUploadError.textContent = "";

  try {
    const photoDocument = await addDoc(collection(db, "photos"), {
      title,
      downloadURL,
      createdAt: serverTimestamp(),
      createdAtMs: Date.now(),
      uploadedBy: currentUser.uid
    });

    if (!activePhotoId) {
      await setDoc(doc(db, "settings", "main"), {
        activePhotoId: photoDocument.id,
        updatedAt: serverTimestamp()
      }, { merge: true });
    }

    elements.photoUploadForm.reset();
    showToast("퍼즐 사진 주소를 등록했습니다.");
  } catch (error) {
    elements.photoUploadError.textContent = friendlyFirebaseError(error);
  } finally {
    submitButton.disabled = false;
  }
});

elements.adminPhotoList.addEventListener("click", async (event) => {
  const activateButton = event.target.closest("[data-activate-photo]");
  const deleteButton = event.target.closest("[data-delete-photo]");

  if (!isAdminAuthenticated) return;

  if (activateButton) {
    await setDoc(doc(db, "settings", "main"), {
      activePhotoId: activateButton.dataset.activatePhoto,
      updatedAt: serverTimestamp()
    }, { merge: true });
    showToast("현재 퍼즐 사진을 변경했습니다.");
  }

  if (deleteButton) {
    const photoId = deleteButton.dataset.deletePhoto;
    const photo = photos.find((item) => item.id === photoId);
    if (!photo) return;

    const confirmed = window.confirm(`"${photo.title}" 사진을 삭제할까요?`);
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, "photos", photoId));

      if (activePhotoId === photoId) {
        const nextPhoto = photos.find((item) => item.id !== photoId);
        await setDoc(doc(db, "settings", "main"), {
          activePhotoId: nextPhoto?.id || "",
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      showToast("사진을 삭제했습니다.");
    } catch (error) {
      showToast(friendlyFirebaseError(error));
    }
  }
});

elements.clearRecordsButton.addEventListener("click", async () => {
  if (!isAdminAuthenticated) return;
  const confirmed = window.confirm("온라인에 저장된 모든 읽기 기록을 삭제할까요?");
  if (!confirmed) return;

  try {
    const snapshot = await getDocs(collection(db, "records"));
    const batches = [];
    let batch = writeBatch(db);
    let count = 0;

    for (const recordDocument of snapshot.docs) {
      batch.delete(recordDocument.ref);
      count += 1;
      if (count === 450) {
        batches.push(batch.commit());
        batch = writeBatch(db);
        count = 0;
      }
    }
    if (count > 0) batches.push(batch.commit());
    await Promise.all(batches);
    showToast("모든 읽기 기록을 삭제했습니다.");
  } catch (error) {
    showToast(friendlyFirebaseError(error));
  }
});

elements.photoCoverGrid.addEventListener("click", (event) => {
  const piece = event.target.closest("[data-piece-rank]");
  if (!piece) return;
  openPieceModal(Number(piece.dataset.pieceRank));
});

elements.pieceCloseButton.addEventListener("click", closePieceModal);
elements.pieceModal.querySelector("[data-close-piece]").addEventListener("click", closePieceModal);

populateBooks();
showApp();
setFormsDisabled(true);
initializeFirebase();
