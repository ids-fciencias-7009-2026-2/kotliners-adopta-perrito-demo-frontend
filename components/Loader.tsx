/**
 * Componente de carga que se muestra mientras se verifica el estado de autenticación del usuario.
 * 
 * Se útiliza en LayoutWrapper para evitar mostrar contenido protegido antes de redirigir.
 */
export default function Loader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <span className="loading loading-spinner loading-lg" />
        </div>
    );
}