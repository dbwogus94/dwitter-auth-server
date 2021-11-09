module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  // ESLint 설정파일에, 충돌 방지 설정 추가
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier', 'eslint:recommended', 'plugin:prettier/recommended'],
  // 적용규칙 : 밑에 있을 수록 우선순위를 가진다.
  extends: [
    'plugin:@typescript-eslint/recommended', //
    'plugin:prettier/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // ESLint 설정파일에, .prettierrc에 설정된 값으로 충돌 방지 설정 추가
    // eslint-config-prettier 모듈이 설치되어 있어야함
    'prettier/prettier': ['error'],
  },
};
