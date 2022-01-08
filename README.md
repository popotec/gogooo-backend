# gogooo-back

## 프로젝트 구조

```bash
gogooo-back
   ├── config # 설정정보
   |   └── dbCinfig.json # DB 설정정보
   |
   ├── message # 공통메시지
   |   └── resultCode.js # 응답코드
   |
   ├── models # SQL문 포함
   |   ├── meetings.js # 모임
   |   └── user.js # 사용자
   |
   ├── passport
   |   └── index.js
   └── routes # API 라우터 정보
   |   ├── meetings # 모임 정보 API
   |   |   └── index.js
   |   ├── users # 사용자 정보 API
   |   |   ├─- auth.js # 사용자 인증
   |   |   ├─- index.js
   |   |   └── user.js
   |   ├── index.js
   |   └── middlewares.js
   |
   ├── .env
   └─- app.js

```

## (DB) MariaDB

- Mac에서 실행하기

### DB 서버 시작

```bash
mysql.server start
```

### DB 서버 종료

```bash
mysql.server stop
```

### DB 서버 상태확인

```bash
mysql.server status
```

## (백엔드) Node.js 서버

### (필요시) 백엔드서버용 Node 패키지 설치

```bash
npm install
```

### 백엔드 서버 시작

```bash
npm start
```

브라우저에서 [http://localhost:8001](http://localhost:8001) 링크 확인

- 인증 설정 링크 : [http://localhost:8001/auth](http://localhost:8001/auth)
<<<<<<< HEAD

## (웹) React 서버

### 필요시 웹서버용 Node 패키지 설치

```bash
cd web
npm install
```

### 웹서버 개발서버 시작

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 링크 확인

- 비밀번호 설정 링크 : [http://localhost:3000/password-confirmation](http://localhost:3000/password-confirmation)

### push 로직

- 채팅방에서 채팅 메세지를 날리면, 소켓에 연결된(현재 채팅방에 들어와있는) 모임 참여자에게는 바로 소켓통신으로 메시지가 가고 나머지 모임 참여자에게 갈 push 알람은 push 테이블에 넣고 noti만 보냄
- 사용자는 noti를 클릭하면 해당 채팅방으로 이동하여 대화 메시지를 읽어오도록 함
- push 메시지는 7일동안만 보관되고 이후 배치로 삭제됨. 매일 7시에 읽지 않은 메시지가 있으면 알려주기(모임 참여방에서 새로운 이야기가 있습니다)
=======
>>>>>>> 7120a99b2fd209b2754f9a6de6f51b908ab528f2
