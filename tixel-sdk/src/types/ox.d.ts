// Type declarations to suppress ox library errors
declare module 'ox/core/Errors' {
  export class BaseError<cause = unknown> extends Error {
    cause?: cause;
  }
}
