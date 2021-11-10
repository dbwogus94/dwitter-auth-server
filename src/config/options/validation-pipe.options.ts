export const ValidationPipeOptions: any = {
  // true면 유효성 데코레이터를 사용하지 않는 속성이 값으로 들어오는 경우 제거한다.
  whitelist: true,
  // true면 whitlist에서 속성을 제거하는 대신 예외를 발생
  forbidNonWhitelisted: false,
  // true면 요청 payload를 dto로 변환
  transform: true,
};
