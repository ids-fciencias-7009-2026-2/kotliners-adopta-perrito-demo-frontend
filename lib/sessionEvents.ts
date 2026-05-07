/**
 * Emisor de eventos de sesion basado en el patron observador.
 * Permite que cualquier parte de la app reaccione a cambios de sesion
 * sin necesidad de polling ni prop drilling.
 *
 * Uso:
 *   - Emitir: sessionEvents.emit("session:expired")
 *   - Escuchar: sessionEvents.on("session:expired", handler)
 *   - Dejar de escuchar: sessionEvents.off("session:expired", handler)
 */

type SessionEvent = "session:expired" | "session:logout";

type Handler = () => void;

/** Mapa de eventos a sus listeners registrados. */
const listeners: Map<SessionEvent, Set<Handler>> = new Map();

const sessionEvents = {
    /**
     * Registra un listener para un evento de sesion.
     * @param event - Nombre del evento.
     * @param handler - Funcion a ejecutar cuando se emita el evento.
     */
    on(event: SessionEvent, handler: Handler): void {
        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }
        listeners.get(event)!.add(handler);
    },

    /**
     * Elimina un listener registrado para un evento de sesion.
     * @param event - Nombre del evento.
     * @param handler - Funcion a eliminar.
     */
    off(event: SessionEvent, handler: Handler): void {
        listeners.get(event)?.delete(handler);
    },

    /**
     * Emite un evento de sesion notificando a todos los listeners registrados.
     * @param event - Nombre del evento a emitir.
     */
    emit(event: SessionEvent): void {
        listeners.get(event)?.forEach((handler) => handler());
    },
};

export default sessionEvents;
