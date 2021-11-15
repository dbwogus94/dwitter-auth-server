import { errorMessage, responseMessage } from './response-messages';

export const apiBearerAuthName = 'access-token';

// 스웨거 api 응답 메세지 설정
export const apiResponse = {
  common: {
    400: { description: '필수 값에 값이 없거나, 유효하지 않습니다.' },
    401: { description: 'Unauthorized(인증 오류)' },
  },
  signup: {
    201: { description: responseMessage.signup[201] },
    308: { description: 'Permanent Redirect: POST /auth/login', status: 308 },
    409: { description: errorMessage.signup[409] },
  },
  login: {
    201: { description: responseMessage.login[201] },
    401: { description: errorMessage.login[401] },
  },
  me: {
    200: { description: responseMessage.me[200] },
    401: { description: errorMessage.me['default'] },
  },
  refresh: {
    200: { description: responseMessage.refresh[200] },
    401: { description: errorMessage.refresh[401] },
  },
  logout: {
    204: { description: responseMessage.logout[204] },
    401: { description: errorMessage.logout['default'] },
  },
};

// 스웨거 api 설명 설정
export const apiOperations = {
  signup: {
    summary: '회원가입',
    description: '회원가입 요청, 성공이면 redirect "POST /auth/login"으로 자동 로그인 요청',
  },
  login: {
    summary: '로그인',
    description: '로그인 요청, Access Token 발급',
  },
  me: {
    summary: 'Access Token 확인',
    description: 'Access Token 유효한지 확인 요청',
  },
  refresh: {
    summary: 'Access Token 재발급',
    description: 'Access Token 재발급 요청',
  },
  logout: {
    summary: '로그아웃',
    description: '로그아웃 요청, Access Token 제거',
  },
};
