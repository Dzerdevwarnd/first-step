/* import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.testing' }); // использования файла .env.test */

expect.extend({
  toBeOk(response, expectedStatus) {
    const { status, text } = response;

    if (status === expectedStatus) {
      return {
        message: () =>
          `Expected status ${expectedStatus} and received ${status}.`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected status ${expectedStatus}, but received ${status}.\nResponse body:\n${text}`,
        pass: false,
      };
    }
  },
  toBeNotOk(response, expectedStatusCode) {
    const { status, text } = response;

    if (status === expectedStatusCode) {
      return {
        message: () => 'Error as expected',
        pass: true,
      };
    } else {
      return {
        message: () =>
          `Expected status ${expectedStatusCode}, but received ${status}.\nResponse body:\n${text}`,
        pass: false,
      };
    }
  },
});
