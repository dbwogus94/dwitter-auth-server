# Dwtter auth server 

## 소개
- Dwtter auth server 프로젝트는 Nestjs를 이해하기 위한 프로젝트 입니다.
- [Dwitter 프로젝트](https://github.com/dbwogus94/dreamCodeing-node/tree/master/dreamCodeing/projects/Dwitter/server/src)에서 인증관련 서비스를 분리하여 Nestjs로 구현하였습니다. 

## 기술 스텍
- <code>node.js</code> + <code>typescript</code>
- <code>nestjs</code>
- <code>MySQL</code> + <code>typeorm</code>
- <code>redis</code>
- <code>swagger</code>

## 브랜치 구분
- master
  - 인증 서비스가 구현된 저장소
  - nest에서 제공하는 가드, 인터셉터, 파이프등을 최대한 이용하여 구현
- nestTest
  - nestjs의 실행 과정을 이해하기 위한 로깅 구현
  - [참고](https://www.notion.so/jaehyun0119/nestjs-Providers-f36291bb35ca4b4eb0c42092c86e5366)


## REST API
- <code>POST</code> auth/signup
  - 회원가입
- <code>POST</code> auth/login
  - 로그인 + accessToken 발급
- <code>GET</code> auth/me
  - accessToken 유효 확인
- <code>GET</code> auth/refresh
  - accessToken 재발급
- <code>GET</code> auth/logout
  - 로그아웃 + 블랙리스트 등록 + accessToken 제거
