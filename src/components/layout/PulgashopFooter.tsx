export default function PulgashopFooter() {
  return (
    <footer className="bg-[#23C55E] text-white mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Exclusivo</h3>
            <div className="space-y-3">
              <h4 className="font-medium">Suscribirse</h4>
              <p className="text-sm opacity-90">
                Obten 10% de descuento en tu primer pedido
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Ingresa tu email"
                  className="flex-1 px-3 py-2 bg-transparent border border-white/40 text-sm placeholder-white/70 focus:outline-none focus:border-white/60 rounded-l"
                />
                <button className="px-3 py-2 border border-white/30 rounded-r border-l-0 hover:bg-white/10">
                  <span className="text-sm">{">"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Soporte</h3>
            <div className="space-y-2 text-sm opacity-90">
              <p>
                Calle Principal 123, Ciudad,
                <br />
                CP 12345, Espana.
              </p>
              <p>soporte@pulgashop.com</p>
              <p>+34-900-123-456</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Cuenta</h3>
            <div className="space-y-2 text-sm opacity-90">
              <a href="#" className="block hover:opacity-100">
                Mi Cuenta
              </a>
              <a href="#" className="block hover:opacity-100">
                Iniciar Sesion / Registro
              </a>
              <a href="#" className="block hover:opacity-100">
                Carrito
              </a>
              <a href="#" className="block hover:opacity-100">
                Lista de Deseos
              </a>
              <a href="#" className="block hover:opacity-100">
                Tienda
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Enlaces Rapidos</h3>
            <div className="space-y-2 text-sm opacity-90">
              <a href="#" className="block hover:opacity-100">
                Politica de Privacidad
              </a>
              <a href="#" className="block hover:opacity-100">
                Terminos de Uso
              </a>
              <a href="#" className="block hover:opacity-100">
                Preguntas Frecuentes
              </a>
              <a href="#" className="block hover:opacity-100">
                Contacto
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg">Descargar App</h3>
            <div className="space-y-3">
              <p className="text-xs opacity-75">
                Ahorra $3 solo para nuevos usuarios de la app
              </p>
              <div className="flex gap-2">
                <div className="w-20 h-20 bg-white/10 rounded flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 rounded" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="w-24 h-8 bg-black/20 rounded flex items-center justify-center text-xs">
                    Google Play
                  </div>
                  <div className="w-24 h-8 bg-black/20 rounded flex items-center justify-center text-xs">
                    App Store
                  </div>
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <div className="w-6 h-6 bg-white/20 rounded" />
                <div className="w-6 h-6 bg-white/20 rounded" />
                <div className="w-6 h-6 bg-white/20 rounded" />
                <div className="w-6 h-6 bg-white/20 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
