// Firebase 콘솔에서 받은 웹 앱 설정값으로 바꿔 주세요.
// apiKey는 Firebase 웹 앱 식별용 설정값이며,
// 실제 접근 통제는 Firestore/Storage 보안 규칙으로 수행합니다.

export const firebaseConfig = {
  apiKey: "여기에_API_KEY",
  authDomain: "여기에_PROJECT_ID.firebaseapp.com",
  projectId: "여기에_PROJECT_ID",
  storageBucket: "여기에_STORAGE_BUCKET",
  messagingSenderId: "여기에_MESSAGING_SENDER_ID",
  appId: "여기에_APP_ID"
};

// Firebase Authentication에 미리 등록할 관리자 이메일입니다.
// 사이트 화면에서는 이메일을 묻지 않고 이 계정으로 로그인합니다.
export const ADMIN_EMAIL = "admin@example.com";
