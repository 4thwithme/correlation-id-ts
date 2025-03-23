import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

const asyncLocalStorage: AsyncLocalStorage<{
  correlationId: string;
}> = new AsyncLocalStorage();

interface IWithIdFnArgs<T> {
  correlationId: string;
  fn: () => T;
}

interface IDecoratorWithIdFnArgs<T> {
  correlationId?: string;
  fn: () => T;
}

interface IBindArgs<W> {
  correlationId: string;
  fn: (...args: any[]) => W;
}

interface IDecoratorBindArgs<W> {
  correlationId?: string;
  fn: (...args: any[]) => W;
}

const withIdFn = function <T>({ correlationId, fn }: IWithIdFnArgs<T>): T {
  return asyncLocalStorage.run({ correlationId }, () => fn());
};

const bindIdFn = function <W>({
  correlationId,
  fn,
}: IBindArgs<W>): (...args: any[]) => W {
  return (...args) =>
    asyncLocalStorage.run({ correlationId }, () => fn(...args));
};

type O = (
  func: <S>(args: IWithIdFnArgs<S>) => S
) => <S>(args: IDecoratorWithIdFnArgs<S>) => S;

type P = (
  func: <W>(args: IBindArgs<W>) => (...args: any[]) => W
) => <W>(args: IDecoratorBindArgs<W>) => (...args: any[]) => W;

type ConfigureArgsType = P & O;

const configureArgs = <ConfigureArgsType>function (func) {
  return ({ correlationId, fn }) => {
    if (!fn) {
      throw Error("Missing fn parameter");
    }

    const id: string = correlationId ?? randomUUID();
    return func({ correlationId: id, fn });
  };
};

const getId = function (): string | null {
  const store = asyncLocalStorage.getStore();
  return store?.correlationId ?? null;
};

export const correlator = {
  withId: configureArgs(withIdFn),
  bindId: configureArgs(bindIdFn),
  getId,
};

export function runWithNewCorrelationId(runFunction: (id: string) => unknown) {
  const id = correlator.getId() ?? randomUUID();
  correlator.withId({
    correlationId: id,
    fn: () => runFunction(id),
  });
}
