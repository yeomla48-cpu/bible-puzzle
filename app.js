import { firebaseConfig, ADMIN_EMAIL } from "./firebase-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const STORAGE_KEY = "wordPuzzleNickname";
const BIBLE_BOOKS = [
["창세기",50],["출애굽기",40],["레위기",27],["민수기",36],["신명기",34],["여호수아",24],["사사기",21],["룻기",4],["사무엘상",31],["사무엘하",24],["열왕기상",22],["열왕기하",25],["역대상",29],["역대하",36],["에스라",10],["느헤미야",13],["에스더",10],["욥기",42],["시편",150],["잠언",31],["전도서",12],["아가",8],["이사야",66],["예레미야",52],["예레미야애가",5],["에스겔",48],["다니엘",12],["호세아",14],["요엘",3],["아모스",9],["오바댜",1],["요나",4],["미가",7],["나훔",3],["하박국",3],["스바냐",3],["학개",2],["스가랴",14],["말라기",4],["마태복음",28],["마가복음",16],["누가복음",24],["요한복음",21],["사도행전",28],["로마서",16],["고린도전서",16],["고린도후서",13],["갈라디아서",6],["에베소서",6],["빌립보서",4],["골로새서",4],["데살로니가전서",5],["데살로니가후서",3],["디모데전서",6],["디모데후서",4],["디도서",3],["빌레몬서",1],["히브리서",13],["야고보서",5],["베드로전서",5],["베드로후서",3],["요한일서",5],["요한이서",1],["요한삼서",1],["유다서",1],["요한계시록",22]
].map(([name,chapters])=>({name,chapters}));

const $ = (s) => document.querySelector(s);
const el = {
 firebaseStatus:$("#firebaseStatus"),firebaseStatusTitle:$("#firebaseStatusTitle"),firebaseStatusText:$("#firebaseStatusText"),loginSection:$("#loginSection"),appSection:$("#appSection"),loginForm:$("#loginForm"),nickname:$("#nickname"),loginError:$("#loginError"),currentNickname:$("#currentNickname"),changeUserButton:$("#changeUserButton"),todayLabel:$("#todayLabel"),currentPieces:$("#currentPieces"),todayParticipants:$("#todayParticipants"),myPieces:$("#myPieces"),progressPercent:$("#progressPercent"),activePhotoTitle:$("#activePhotoTitle"),activePhotoPeriod:$("#activePhotoPeriod"),pieceCounter:$("#pieceCounter"),progressBar:$("#progressBar"),photoPuzzle:$("#photoPuzzle"),photoCoverGrid:$("#photoCoverGrid"),noPhotoState:$("#noPhotoState"),readingForm:$("#readingForm"),bookSelect:$("#bookSelect"),startChapter:$("#startChapter"),endChapter:$("#endChapter"),chapterInfo:$("#chapterInfo"),reflection:$("#reflection"),readingError:$("#readingError"),todayAuthBadge:$("#todayAuthBadge"),leaderboard:$("#leaderboard"),emptyLeaderboard:$("#emptyLeaderboard"),recordList:$("#recordList"),emptyRecords:$("#emptyRecords"),archiveList:$("#archiveList"),emptyArchive:$("#emptyArchive"),toast:$("#toast"),adminOpenButton:$("#adminOpenButton"),adminModal:$("#adminModal"),adminCloseButton:$("#adminCloseButton"),adminLoginSection:$("#adminLoginSection"),adminDashboardSection:$("#adminDashboardSection"),adminLoginForm:$("#adminLoginForm"),adminPassword:$("#adminPassword"),adminLoginError:$("#adminLoginError"),adminLogoutButton:$("#adminLogoutButton"),photoUploadForm:$("#photoUploadForm"),photoTitle:$("#photoTitle"),photoPieceCount:$("#photoPieceCount"),photoStartDate:$("#photoStartDate"),photoEndDate:$("#photoEndDate"),photoFile:$("#photoFile"),photoPreviewBox:$("#photoPreviewBox"),photoPreviewImage:$("#photoPreviewImage"),photoFileName:$("#photoFileName"),photoFileInfo:$("#photoFileInfo"),photoAutoPath:$("#photoAutoPath"),photoRegisterButton:$("#photoRegisterButton"),photoUploadError:$("#photoUploadError"),photoCountBadge:$("#photoCountBadge"),emptyPhotoList:$("#emptyPhotoList"),adminPhotoList:$("#adminPhotoList"),pieceModal:$("#pieceModal"),pieceCloseButton:$("#pieceCloseButton"),pieceNumberBadge:$("#pieceNumberBadge"),pieceNickname:$("#pieceNickname"),piecePassage:$("#piecePassage"),pieceDate:$("#pieceDate"),pieceReflection:$("#pieceReflection"),pieceReflectionRow:$("#pieceReflectionRow")
};

let auth,db,currentUser=null,isAdmin=false,ready=false;
let nickname=localStorage.getItem(STORAGE_KEY)||"", records=[], puzzles=[], activePuzzleId="", selectedFile=null, objectUrl="";
let unsubRecords,unsubPuzzles,unsubSettings;

const dateKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const esc=(v)=>String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
const showToast=(m)=>{el.toast.textContent=m;el.toast.classList.add("show");clearTimeout(showToast.t);showToast.t=setTimeout(()=>el.toast.classList.remove("show"),2600)};
const formatDate=(s)=>s?new Intl.DateTimeFormat("ko-KR",{year:"numeric",month:"long",day:"numeric"}).format(new Date(`${s}T00:00:00`)):"";
const normalizeNickname=(v)=>v.trim().toLocaleLowerCase("ko-KR").replace(/\s+/g," ");
const hex=(v)=>Array.from(new TextEncoder().encode(v)).map(b=>b.toString(16).padStart(2,"0")).join("");
const activePuzzle=()=>puzzles.find(p=>p.id===activePuzzleId)||puzzles.find(p=>p.status==="active")||null;
const activeRecords=()=>{const p=activePuzzle();return p?records.filter(r=>r.puzzleId===p.id):[]};
const friendly=(e)=>{console.error(e);if(e?.code==="permission-denied")return "이미 오늘 인증했거나 권한이 없습니다.";if(e?.code==="auth/invalid-credential")return "관리자 비밀번호를 확인해 주세요.";return "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."};

function setStatus(type,title,text){el.firebaseStatus.classList.remove("connected","error");if(type)el.firebaseStatus.classList.add(type);el.firebaseStatusTitle.textContent=title;el.firebaseStatusText.textContent=text;}
function setReadingDisabled(v){el.readingForm.querySelectorAll("input,select,textarea,button").forEach(n=>n.disabled=v)};
function showApp(){const logged=Boolean(nickname);el.loginSection.classList.toggle("hidden",logged);el.appSection.classList.toggle("hidden",!logged);el.changeUserButton.classList.toggle("hidden",!logged);if(logged){el.currentNickname.textContent=nickname;renderAll();}}
function populateBooks(){el.bookSelect.innerHTML=BIBLE_BOOKS.map((b,i)=>`<option value="${i}">${b.name}</option>`).join("");syncChapters()}
function selectedBook(){return BIBLE_BOOKS[Number(el.bookSelect.value)]}
function syncChapters(){const b=selectedBook();el.startChapter.max=b.chapters;el.endChapter.max=b.chapters;if(+el.startChapter.value>b.chapters)el.startChapter.value=b.chapters;if(+el.endChapter.value>b.chapters)el.endChapter.value=b.chapters;updateChapterInfo()}
function chapterResult(){const b=selectedBook(),s=+el.startChapter.value,e=+el.endChapter.value;if(!Number.isInteger(s)||!Number.isInteger(e)||s<1||e<1||s>b.chapters||e>b.chapters)return{valid:false,message:`${b.name}은 1장부터 ${b.chapters}장까지 있습니다.`};if(s>e)return{valid:false,message:"시작 장은 끝 장보다 클 수 없습니다."};return{valid:true,count:e-s+1}}
function updateChapterInfo(){const r=chapterResult();el.chapterInfo.textContent=r.valid?`총 ${r.count}장 읽기 · 퍼즐 1조각`:r.message}

function seededShuffle(n,seedText){let seed=0;for(const c of seedText)seed=(seed*31+c.charCodeAt(0))>>>0;const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){seed=(seed*1664525+1013904223)>>>0;const j=seed%(i+1);[a[i],a[j]]=[a[j],a[i]]}return a}
function gridSize(total){const cols=Math.max(1,Math.ceil(Math.sqrt(total*1.6)));return{cols,rows:Math.ceil(total/cols)}}
function renderPuzzle(){const p=activePuzzle(),rs=activeRecords().sort((a,b)=>(a.createdAtMs||0)-(b.createdAtMs||0));if(!p){el.activePhotoTitle.textContent="진행 중인 퍼즐이 없습니다";el.activePhotoPeriod.textContent="";el.pieceCounter.textContent="0 / 0";el.progressBar.style.width="0%";el.photoCoverGrid.classList.add("hidden");el.noPhotoState.classList.remove("hidden");return}
 const total=Math.max(1,Number(p.totalPieces)||1),opened=Math.min(rs.length,total),pct=Math.min(100,opened/total*100);el.activePhotoTitle.textContent=p.title;el.activePhotoPeriod.textContent=[p.startDate&&`시작 ${formatDate(p.startDate)}`,p.endDate&&`종료 ${formatDate(p.endDate)}`].filter(Boolean).join(" · ");el.pieceCounter.textContent=`${opened.toLocaleString()} / ${total.toLocaleString()}`;el.progressBar.style.width=`${pct}%`;el.progressPercent.textContent=`${pct.toFixed(pct&&pct<10?1:0)}%`;el.currentPieces.textContent=`${opened}조각`;el.photoCoverGrid.classList.remove("hidden");el.noPhotoState.classList.add("hidden");
 const {cols,rows}=gridSize(total),order=seededShuffle(total,p.id),rankByPos=new Map(order.map((pos,rank)=>[pos,rank]));el.photoCoverGrid.style.gridTemplateColumns=`repeat(${cols},1fr)`;el.photoCoverGrid.style.gridTemplateRows=`repeat(${rows},1fr)`;el.photoCoverGrid.style.aspectRatio=`${cols}/${rows}`;el.photoCoverGrid.innerHTML="";
 for(let pos=0;pos<cols*rows;pos++){const tile=document.createElement("button");tile.type="button";tile.className="puzzle-tile";const rank=rankByPos.get(pos);if(rank!==undefined&&rank<opened){const c=pos%cols,r=Math.floor(pos/cols);tile.classList.add("revealed");tile.style.backgroundImage=`url("${p.downloadURL}")`;tile.style.backgroundSize=`${cols*100}% ${rows*100}%`;tile.style.backgroundPosition=`${cols===1?0:c/(cols-1)*100}% ${rows===1?0:r/(rows-1)*100}%`;tile.dataset.recordRank=rank;tile.title=`${rank+1}번째 조각 정보 보기`}else tile.disabled=true;el.photoCoverGrid.appendChild(tile)}
}
function renderStats(){const ars=activeRecords(),today=dateKey(),mine=ars.filter(r=>normalizeNickname(r.nickname)===normalizeNickname(nickname));el.todayParticipants.textContent=`${new Set(ars.filter(r=>r.date===today).map(r=>normalizeNickname(r.nickname))).size}명`;el.myPieces.textContent=`${mine.length}조각`;const done=ars.some(r=>r.date===today&&normalizeNickname(r.nickname)===normalizeNickname(nickname));el.todayAuthBadge.textContent=done?"오늘 인증 완료":"인증 가능";el.todayAuthBadge.classList.toggle("done",done);setReadingDisabled(!ready||!activePuzzle()||done)}
function renderLeaderboard(){const counts=new Map();for(const r of activeRecords())counts.set(r.nickname,(counts.get(r.nickname)||0)+1);const sorted=[...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],"ko"));el.emptyLeaderboard.classList.toggle("hidden",sorted.length>0);el.leaderboard.innerHTML=sorted.map(([name,count],i)=>`<div class="leader-row"><span class="leader-rank">${i<3?["🥇","🥈","🥉"][i]:i+1}</span><span class="leader-name">${esc(name)}</span><span class="leader-count">${count}조각</span></div>`).join("")}
function renderRecords(){const rs=activeRecords().sort((a,b)=>(b.createdAtMs||0)-(a.createdAtMs||0)).slice(0,12);el.emptyRecords.classList.toggle("hidden",rs.length>0);el.recordList.innerHTML=rs.map(r=>`<article class="record-card"><div class="record-top"><div><span class="record-name">${esc(r.nickname)}</span><p class="record-range">${esc(r.book)} ${r.startChapter}${r.startChapter===r.endChapter?"":`~${r.endChapter}`}장</p></div><span class="record-meta">${esc(formatDate(r.date))}</span></div>${r.reflection?`<p class="record-text">${esc(r.reflection)}</p>`:""}</article>`).join("")}
function renderArchive(){const archived=puzzles.filter(p=>p.status!=="active").sort((a,b)=>(b.createdAtMs||0)-(a.createdAtMs||0));el.emptyArchive.classList.toggle("hidden",archived.length>0);el.archiveList.innerHTML=archived.map(p=>{const count=records.filter(r=>r.puzzleId===p.id).length;return`<article class="archive-item"><img class="archive-thumb" src="${esc(p.downloadURL)}" alt="${esc(p.title)}"><div class="archive-body"><h3>${esc(p.title)}</h3><div class="archive-meta">${p.status==="completed"?"완료":"대기"} · ${Math.min(count,p.totalPieces||1)} / ${p.totalPieces||1}조각</div></div></article>`}).join("")}
function renderAdmin(){el.photoCountBadge.textContent=`${puzzles.length}개`;el.emptyPhotoList.classList.toggle("hidden",puzzles.length>0);el.adminPhotoList.innerHTML=puzzles.sort((a,b)=>(b.createdAtMs||0)-(a.createdAtMs||0)).map(p=>{const count=records.filter(r=>r.puzzleId===p.id).length;const status=p.status||"waiting";return`<article class="admin-photo-item"><img src="${esc(p.downloadURL)}" alt=""><div class="admin-photo-info"><h4>${esc(p.title)}</h4><p><span class="status-${status}">${status==="active"?"진행 중":status==="completed"?"완료":"대기"}</span> · ${count} / ${p.totalPieces||1}조각</p><p>${p.startDate||p.endDate?`${p.startDate||"미정"} ~ ${p.endDate||"미정"}`:"기간 미설정"}</p></div><div class="admin-photo-actions">${status!=="active"?`<button data-activate="${p.id}">진행하기</button>`:""}<button class="secondary-button" data-edit="${p.id}">조각수 수정</button>${status==="active"?`<button class="secondary-button" data-complete="${p.id}">완료/보관</button>`:""}<button class="danger-button" data-delete="${p.id}">삭제</button></div></article>`}).join("")}
function renderAll(){el.todayLabel.textContent=new Intl.DateTimeFormat("ko-KR",{month:"long",day:"numeric",weekday:"short"}).format(new Date());renderPuzzle();renderStats();renderLeaderboard();renderRecords();renderArchive();if(isAdmin)renderAdmin()}

async function ensureAnonymous(){if(!auth.currentUser)await signInAnonymously(auth)}
function subscribe() {
  unsubRecords?.();
  unsubPuzzles?.();
  unsubSettings?.();

  unsubRecords = onSnapshot(
    collection(db, "records"),
    snapshot => {
      records = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      renderAll();
    },
    error => {
      if (error?.code !== "permission-denied") {
        setStatus("error", "기록 불러오기 실패", friendly(error));
      }
    }
  );

  unsubPuzzles = onSnapshot(
    collection(db, "photos"),
    snapshot => {
      puzzles = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));
      renderAll();
    },
    error => {
      if (error?.code !== "permission-denied") {
        console.error(error);
      }
    }
  );

  unsubSettings = onSnapshot(
    doc(db, "settings", "main"),
    snapshot => {
      activePuzzleId = snapshot.exists()
        ? snapshot.data().activePhotoId || ""
        : "";
      renderAll();
    },
    error => {
      if (error?.code !== "permission-denied") {
        console.error(error);
      }
    }
  );
}
async function init(){if(!firebaseConfig?.apiKey||!ADMIN_EMAIL){setStatus("error","Firebase 설정 필요","firebase-config.js를 확인해 주세요.");return}try{const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);onAuthStateChanged(auth,async user=>{currentUser=user;isAdmin=Boolean(user?.email&&user.email.toLowerCase()===ADMIN_EMAIL.toLowerCase());el.adminLoginSection.classList.toggle("hidden",isAdmin);el.adminDashboardSection.classList.toggle("hidden",!isAdmin);if(!user){await ensureAnonymous();return}ready=true;setStatus("connected","온라인 연결됨","기록과 퍼즐이 실시간으로 동기화됩니다.");subscribe();renderAll()});await ensureAnonymous()}catch(e){setStatus("error","Firebase 연결 실패",friendly(e))}}

el.loginForm.addEventListener("submit",e=>{e.preventDefault();const n=el.nickname.value.trim();if(n.length<2){el.loginError.textContent="닉네임은 2글자 이상 입력해 주세요.";return}nickname=n;localStorage.setItem(STORAGE_KEY,nickname);el.loginError.textContent="";showApp();showToast(`${nickname}님, 반가워요!`)});
el.changeUserButton.addEventListener("click",()=>{localStorage.removeItem(STORAGE_KEY);nickname="";showApp()});el.bookSelect.addEventListener("change",syncChapters);el.startChapter.addEventListener("input",updateChapterInfo);el.endChapter.addEventListener("input",updateChapterInfo);
el.readingForm.addEventListener("submit",async e=>{e.preventDefault();const p=activePuzzle(),r=chapterResult();if(!p){el.readingError.textContent="현재 진행 중인 퍼즐이 없습니다.";return}if(!r.valid){el.readingError.textContent=r.message;return}const key=`${p.id}_${dateKey()}_${hex(normalizeNickname(nickname))}`,button=el.readingForm.querySelector("button[type=submit]");button.disabled=true;try{await setDoc(doc(db,"records",key),{recordKey:key,puzzleId:p.id,nickname,nicknameLower:normalizeNickname(nickname),book:selectedBook().name,startChapter:+el.startChapter.value,endChapter:+el.endChapter.value,chapterCount:r.count,pieceCount:1,reflection:el.reflection.value.trim(),date:dateKey(),ownerUid:currentUser.uid,createdAt:serverTimestamp(),createdAtMs:Date.now()});el.reflection.value="";el.readingError.textContent="";showToast(`${r.count}장 인증 완료! 퍼즐 1조각이 열렸어요.`)}catch(err){el.readingError.textContent=err?.code==="permission-denied"?"오늘은 이미 인증했습니다. 내일 다시 참여해 주세요.":friendly(err)}finally{renderStats();button.disabled=false}});

function openAdmin(){el.adminModal.classList.remove("hidden");el.adminLoginSection.classList.toggle("hidden",isAdmin);el.adminDashboardSection.classList.toggle("hidden",!isAdmin);if(isAdmin)renderAdmin()};function closeAdmin(){el.adminModal.classList.add("hidden")};el.adminOpenButton.addEventListener("click",openAdmin);el.adminCloseButton.addEventListener("click",closeAdmin);el.adminModal.querySelector("[data-close-admin]").addEventListener("click",closeAdmin);
el.adminLogoutButton.addEventListener("click", async () => {
  // 기존 Firestore 실시간 감시 종료
  unsubRecords?.();
  unsubPuzzles?.();
  unsubSettings?.();

  unsubRecords = null;
  unsubPuzzles = null;
  unsubSettings = null;

  await signOut(auth);
  await ensureAnonymous();

  closeAdmin();
  showToast("관리자에서 로그아웃했습니다.");
});
const buildUrl=n=>`./puzzles/${encodeURIComponent(n)}`;const sizeText=s=>s<1048576?`${(s/1024).toFixed(1)}KB`:`${(s/1048576).toFixed(1)}MB`;function clearFile(){if(objectUrl)URL.revokeObjectURL(objectUrl);selectedFile=null;objectUrl="";el.photoPreviewBox.classList.add("hidden");el.photoRegisterButton.disabled=true;el.photoAutoPath.textContent="사진을 선택하면 표시됩니다."}
el.photoFile.addEventListener("change",()=>{const f=el.photoFile.files?.[0];el.photoUploadError.textContent="";if(!f)return clearFile();if(!["image/jpeg","image/png","image/webp"].includes(f.type)||f.size>10*1024*1024){el.photoUploadError.textContent="JPG, PNG, WEBP 10MB 이하 파일만 가능합니다.";el.photoFile.value="";return clearFile()}if(objectUrl)URL.revokeObjectURL(objectUrl);selectedFile=f;objectUrl=URL.createObjectURL(f);el.photoPreviewImage.src=objectUrl;el.photoFileName.textContent=f.name;el.photoFileInfo.textContent=sizeText(f.size);el.photoPreviewBox.classList.remove("hidden");el.photoAutoPath.textContent=buildUrl(f.name);el.photoRegisterButton.disabled=false;if(!el.photoTitle.value.trim())el.photoTitle.value=f.name.replace(/\.[^.]+$/,"")});
function imageExists(url){return new Promise(res=>{const i=new Image();i.onload=()=>res(true);i.onerror=()=>res(false);i.src=`${url}?v=${Date.now()}`})}
el.photoUploadForm.addEventListener("submit",async e=>{e.preventDefault();if(!isAdmin)return;const title=el.photoTitle.value.trim(),total=+el.photoPieceCount.value;if(!selectedFile||!title||!Number.isInteger(total)||total<1){el.photoUploadError.textContent="사진, 제목, 조각 수를 확인해 주세요.";return}const url=buildUrl(selectedFile.name),btn=el.photoRegisterButton;btn.disabled=true;btn.textContent="사진 확인 중...";try{if(!await imageExists(url)){el.photoUploadError.textContent=`GitHub puzzles 폴더에서 ${selectedFile.name} 파일을 찾지 못했습니다.`;return}await addDoc(collection(db,"photos"),{title,downloadURL:url,fileName:selectedFile.name,totalPieces:total,startDate:el.photoStartDate.value||"",endDate:el.photoEndDate.value||"",status:"waiting",createdAt:serverTimestamp(),createdAtMs:Date.now(),uploadedBy:currentUser.uid});el.photoUploadForm.reset();el.photoPieceCount.value=620;clearFile();showToast("대기 퍼즐로 등록했습니다.")}catch(err){el.photoUploadError.textContent=friendly(err)}finally{btn.textContent="대기 퍼즐로 등록하기";btn.disabled=!selectedFile}});
el.adminPhotoList.addEventListener("click",async e=>{if(!isAdmin)return;const activate=e.target.closest("[data-activate]"),edit=e.target.closest("[data-edit]"),complete=e.target.closest("[data-complete]"),del=e.target.closest("[data-delete]");try{if(activate){const id=activate.dataset.activate,old=activePuzzle();const batch=writeBatch(db);if(old&&old.id!==id)batch.update(doc(db,"photos",old.id),{status:"completed",completedAt:serverTimestamp()});batch.update(doc(db,"photos",id),{status:"active",activatedAt:serverTimestamp()});batch.set(doc(db,"settings","main"),{activePhotoId:id,updatedAt:serverTimestamp()},{merge:true});await batch.commit();showToast("새 퍼즐을 시작했습니다.")}if(edit){const p=puzzles.find(x=>x.id===edit.dataset.edit),count=records.filter(r=>r.puzzleId===p.id).length;const value=prompt(`현재 ${count}조각을 획득했습니다. 새 총 조각 수를 입력하세요.`,p.totalPieces);if(value===null)return;const total=Number(value);if(!Number.isInteger(total)||total<1||total>5000)return alert("1~5000 사이의 정수를 입력해 주세요.");if(total<count&&!confirm(`현재 획득 조각(${count})보다 작아 즉시 완성됩니다. 계속할까요?`))return;await updateDoc(doc(db,"photos",p.id),{totalPieces:total,updatedAt:serverTimestamp()});showToast("총 조각 수가 즉시 반영되었습니다.")}if(complete){const id=complete.dataset.complete;if(!confirm("현재 퍼즐을 완료하고 보관할까요?"))return;await updateDoc(doc(db,"photos",id),{status:"completed",completedAt:serverTimestamp()});await setDoc(doc(db,"settings","main"),{activePhotoId:"",updatedAt:serverTimestamp()},{merge:true});showToast("퍼즐을 보관함으로 이동했습니다.")}if(del){const id=del.dataset.delete,p=puzzles.find(x=>x.id===id);if(!confirm(`\"${p.title}\" 퍼즐을 삭제할까요? 기록은 남습니다.`))return;await deleteDoc(doc(db,"photos",id));if(activePuzzleId===id)await setDoc(doc(db,"settings","main"),{activePhotoId:""},{merge:true});showToast("퍼즐을 삭제했습니다.")}}catch(err){showToast(friendly(err))}});
el.photoCoverGrid.addEventListener("click",e=>{const t=e.target.closest("[data-record-rank]");if(!t)return;const rs=activeRecords().sort((a,b)=>(a.createdAtMs||0)-(b.createdAtMs||0)),r=rs[+t.dataset.recordRank];if(!r)return;el.pieceNumberBadge.textContent=`#${+t.dataset.recordRank+1}`;el.pieceNickname.textContent=r.nickname;el.piecePassage.textContent=`${r.book} ${r.startChapter}${r.startChapter===r.endChapter?"":`~${r.endChapter}`}장`;el.pieceDate.textContent=formatDate(r.date);el.pieceReflection.textContent=r.reflection||"";el.pieceReflectionRow.classList.toggle("hidden",!r.reflection);el.pieceModal.classList.remove("hidden")});const closePiece=()=>el.pieceModal.classList.add("hidden");el.pieceCloseButton.addEventListener("click",closePiece);el.pieceModal.querySelector("[data-close-piece]").addEventListener("click",closePiece);

populateBooks();showApp();setReadingDisabled(true);init();
