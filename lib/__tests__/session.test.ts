import fc from "fast-check";
import { getToken, setToken, removeToken } from "../session";

// Feature: adopta-perrito-frontend, Property 1: token solo se almacena tras login exitoso

describe("session.ts", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("P1: setToken seguido de getToken devuelve el mismo token", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (token) => {
        setToken(token);
        return getToken() === token;
      }),
      { numRuns: 100 }
    );
  });

  test("P1: removeToken seguido de getToken devuelve null", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (token) => {
        setToken(token);
        removeToken();
        return getToken() === null;
      }),
      { numRuns: 100 }
    );
  });

  test("getToken devuelve null cuando no hay token almacenado", () => {
    expect(getToken()).toBeNull();
  });
});
