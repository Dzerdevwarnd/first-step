import 'jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeOk(expectedStatusCode: number): R;
      toBeNotOk(expectedStatusCode: number): R;
    }
  }
}

export {};
