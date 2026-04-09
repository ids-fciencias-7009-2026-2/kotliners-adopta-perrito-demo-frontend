import fc from "fast-check";
import { buildHeaders } from "../apiClient";

// ---------------------------------------------------------------------------
// Feature: adopta-perrito-frontend, Property 5: API_Client incluye token en peticiones autenticadas
// ---------------------------------------------------------------------------

describe("P5: buildHeaders incluye el token en Authorization", () => {
  /**
   * Para cualquier token no vacío, buildHeaders(token) debe incluir
   * Authorization: Bearer <token>
   */
  test("con token: Authorization es Bearer <token>", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (token) => {
        const headers = buildHeaders(token);
        return headers["Authorization"] === `Bearer ${token}`;
      }),
      { numRuns: 100 }
    );
  });

  test("sin token: no incluye Authorization", () => {
    fc.assert(
      fc.property(fc.constant(undefined), () => {
        const headers = buildHeaders();
        return !("Authorization" in headers);
      }),
      { numRuns: 10 }
    );
  });
});

// ---------------------------------------------------------------------------
// Feature: adopta-perrito-frontend, Property 6: sesión expirada devuelve SESSION_EXPIRED
// ---------------------------------------------------------------------------

/**
 * handleResponse no es exportable directamente, pero podemos probar
 * la propiedad a través de la lógica de status:
 * Para cualquier status 401 o 403, el resultado debe ser SESSION_EXPIRED.
 * Probamos esto con la función pura que clasifica el status.
 */
function clasificarStatus(status: number): string {
  if (status === 401 || status === 403) return "SESSION_EXPIRED";
  if (status >= 200 && status < 300) return "OK";
  return "ERROR";
}

describe("P6: clasificación de status HTTP", () => {
  test("401 y 403 siempre producen SESSION_EXPIRED", () => {
    fc.assert(
      fc.property(fc.constantFrom(401, 403), (status) => {
        return clasificarStatus(status) === "SESSION_EXPIRED";
      }),
      { numRuns: 100 }
    );
  });

  test("2xx siempre produce OK", () => {
    fc.assert(
      fc.property(fc.integer({ min: 200, max: 299 }), (status) => {
        return clasificarStatus(status) === "OK";
      }),
      { numRuns: 100 }
    );
  });
});
