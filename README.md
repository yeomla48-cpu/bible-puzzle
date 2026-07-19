# 말씀의 발자취 — GitHub Pages + Firebase Firestore 버전

## 사용 구조

- GitHub Pages: 사이트 배포
- GitHub 저장소 `puzzles` 폴더: 퍼즐 사진 보관
- Firebase Authentication: 일반 사용자 익명 인증, 관리자 로그인
- Firebase Firestore: 성경 읽기 기록, 사진 주소, 현재 퍼즐 설정 저장

Firebase Storage는 사용하지 않습니다.

## 관리자 사진 등록 방식

1. GitHub 저장소의 `puzzles` 폴더에 사진을 올립니다.
2. 사진 파일의 주소를 복사합니다.
3. 사이트 관리자 화면에서 사진 제목과 주소를 입력합니다.
4. 등록된 사진 중 현재 사용할 사진을 선택합니다.

## GitHub에 올릴 파일

아래 파일들을 저장소 최상위에 올립니다.

- index.html
- style.css
- app.js
- firebase-config.js
- firestore.rules
- README.md

`puzzles` 폴더는 사진을 보관하는 용도입니다.

## 아직 필요한 설정

1. firebase-config.js에 실제 Firebase 설정값 입력
2. ADMIN_EMAIL을 관리자 이메일로 변경
3. Firestore Rules에 관리자 이메일 반영
4. GitHub Pages 활성화
5. 실제 읽기 인증 테스트
