# 공공모임
지방 이전 공공기관 직원 대상의 서비스로서 데이팅 목적을 지양하고, 다른 사람들과 취미 생활을 공유함으로써 인맥교류와 자기계발을 목적하는 모임 서비스

## 기술 스택
- 백엔드 : Nodejs, Express, MySQL 5.7, redis
- 프론트엔드 : dart, flutter, sqlite
> [프론트엔드 repository 바로가기](https://github.com/jerry92k/gogooo-frontend)

## 주요 기능
- 회원가입
  - 이메인 인증(nodemailer)
- 로그인(bcrypt)
- 사용자인증(jwt)
- 프로필 생성
- 모임 개설, 참여, 관리
- 채팅(socket.io와 push)

![그림1](https://user-images.githubusercontent.com/62507373/148913617-57a90c95-ecaf-498b-a0f6-d526a230456a.png)