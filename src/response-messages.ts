export const responseMessage = {
  signup: {
    201: '회원 가입에 성공하여, JWT발급과 함께 로그인 처리 되었습니다.',
  },
  login: {
    201: 'JWT발급과 함께 로그인 처리 되었습니다.',
  },
  me: {
    200: 'JWT가 유효합니다.',
  },
  refresh: {
    200: 'Access JWT가 새로 발급 되었습니다.',
  },
  logout: {
    204: '로그아웃이 처리와 함께 JWT(Access/Refresh)가 만료 되었습니다.',
  },
};

export const errorMessage = {
  signup: { 409: '중복된 아이디(username) 입니다.' },
  login: { 401: '등록된 사용자가 아니거나, 정보가 일치하지 않습니다.' },
  me: { default: 'Unauthorized(인증 오류)' },
  refresh: { default: 'Unauthorized(인증 오류)' },
  logout: { default: 'Unauthorized(인증 오류)' },
};
