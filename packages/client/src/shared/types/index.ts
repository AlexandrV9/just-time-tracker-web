export * from "./validation";

export type Updater<T> = ((state: T) => T) | T;
