import { correlator } from "./index";

const sayMeow = (name: string) => `meow-meow, ${name}`;

const pause = (waitTime: number) =>
  new Promise((resolve) => setTimeout(resolve, waitTime));

describe("# 🆘🆘🆘🆘🆘🆘🆘🆘 correlation id 🆘🆘🆘🆘🆘🆘🆘🆘", () => {
  it("1. (withId) function with wrapper should run as usual", () => {
    expect(
      correlator.withId({
        fn: () => sayMeow("John"),
      })
    ).toEqual("meow-meow, John");
  });

  it("2. (withId) should set predefined string as correlation-id", () => {
    const correlationId = "Meooooooooooooow";
    let testId;

    correlator.withId({
      correlationId,
      fn: () => {
        testId = correlator.getId();
      },
    });

    expect(testId).toEqual(correlationId);
  });

  it("3. (withId) should return null when you are using getId() outside of `withId()`", () => {
    expect(correlator.getId()).toEqual(null);
  });

  it("4. (bindId) decorator should return function which can be run as usual", () => {
    const fn = correlator.bindId({
      fn: sayMeow,
    });

    expect(fn("John")).toEqual("meow-meow, John");
  });

  it("5. (bindId) should set predefined string as correlation-id", () => {
    const correlationId = "Meooooooooooooow";
    let testId;
    const decoratedFn = correlator.bindId({
      correlationId,
      fn: () => {
        testId = correlator.getId();
      },
    });

    decoratedFn();

    expect(testId).toEqual(correlationId);
  });

  it("6. (withId) should return the same correlation-id inside context", () => {
    const correlationId = "Meooooooooooooow";
    let testId1;
    let testId2;

    const someFn = () => {
      testId2 = correlator.getId();
    };

    correlator.withId({
      correlationId,
      fn: () => {
        testId1 = correlator.getId();

        someFn();
      },
    });

    expect(testId1).toEqual(correlationId);
    expect(testId2).toEqual(correlationId);
  });

  it("7. (withId) two async functions should return correct correlation-ids", async () => {
    const correlationId1 = "Meooooooooooooow";
    const correlationId2 = "Bark";
    let testId1;
    let testId2;

    await Promise.all([
      correlator.withId({
        correlationId: correlationId1,
        fn: async () => {
          await pause(100);
          testId1 = correlator.getId();
        },
      }),
      correlator.withId({
        correlationId: correlationId2,
        fn: async () => {
          await pause(200);
          testId2 = correlator.getId();
        },
      }),
    ]);

    expect(testId1).toEqual(correlationId1);
    expect(testId2).toEqual(correlationId2);
  });
});
