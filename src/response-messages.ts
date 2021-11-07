export const responseMessage = {
  signup: '회원 가입이 성공하여 JWT발급과 함께 로그인 처리 되었습니다.',
  login: 'JWT발급과 함께 로그인 처리 되었습니다.',
  me: 'JWT가 유효합니다.',
};

export const errorMessage = {
  signup: { 409: '중복된 아이디(username) 입니다.' },
  login: { 401: '등록된 사용자가 아니거나, 정보가 일치하지 않습니다.' },
  // me: { 401: 'JWT가 유효하지 않습니다.' },
};
