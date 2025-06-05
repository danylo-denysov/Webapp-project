// silence every `AuthGuard()` produced by @nestjs/passport
jest.mock('@nestjs/passport', () => ({
  ...(jest.requireActual('@nestjs/passport') as Record<string, unknown>),
  AuthGuard: () =>
    class {
      canActivate() {
        return true; // pretend authentication always succeeds
      }
    },
}));

jest.setTimeout(15000);
