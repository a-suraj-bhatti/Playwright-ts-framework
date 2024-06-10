import { test } from "@playwright/test";

function step(message: string) {
  return function actualDecorator(
    originalMethod: any,
    context: ClassMethodDecoratorContext
  ) {
    async function replacementMethod(this: any, ...args: any[]) {
      let result;
      await test.step(`STEP: ${message}`, async () => {
        result = await originalMethod.call(this, ...args);
      });
      return result; // Return the result of the original method call
    }
    return replacementMethod;
  };
}

export default step;
