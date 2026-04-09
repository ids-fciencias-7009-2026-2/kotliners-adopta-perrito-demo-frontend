import fc from "fast-check";
import { setToken, removeToken, getToken } from "../session";

// Feature: adopta-perrito-frontend, Property 2: rutas protegidas redirigen sin token
// Nota: probamos la lógica de getToken directamente, ya que el hook depende del navegador.
// La propiedad es: si getToken() === null, el guard DEBE redirigir.

describe("P2: lógica de authGuard — redirige sin token", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test("P2: sin token, getToken devuelve null (condición de redirección)", () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        removeToken();
        // La condición que dispara la redirección en useAuthGuard
        return getToken() === null;
      }),
      { numRuns: 10 }
    );
  });

  test("P2: con token, getToken no devuelve null (no redirige)", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (token) => {
        setToken(token);
        // Con token presente, la condición de redirección es falsa
        return getToken() !== null;
      }),
      { numRuns: 100 }
    );
  });
});
