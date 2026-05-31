import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    setIsIOS(ios);

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) return;

    // For Android/Windows: listen for beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS: show after 3 seconds delay
    if (ios) {
      const timer = setTimeout(() => {
        setShowInstall(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Listen for app installed
  useEffect(() => {
    const handler = () => {
      setIsInstalled(true);
      setShowInstall(false);
    };
    window.addEventListener('appinstalled', handler);
    return () => window.removeEventListener('appinstalled', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
    setShowInstall(false);
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (isInstalled || !showInstall) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slideUp">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-5 py-4 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <img src="/icon-192.png" alt="ISPT" className="w-10 h-10 rounded-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-lg">Instalar ISPT Eventos</h3>
            <p className="text-white/80 text-sm">Aceda mais rapido aos eventos do ISPT</p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/60 hover:text-white p-1 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          {isIOS ? (
            // iOS instructions
            <div className="space-y-3">
              <p className="text-gray-700 text-sm font-medium">Para instalar esta aplicacao no seu iPhone/iPad:</p>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <p>Toque no botao <strong>Partilhar</strong> na barra do Safari
                  <svg className="inline w-5 h-5 ml-1 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l-4 4h3v8h2V6h3l-4-4zM4 18v2h16v-2H4z"/>
                  </svg>
                </p>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <p>Deslize para baixo e toque em <strong>&quot;Adicionar ao Ecra Principal&quot;</strong></p>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <p>Toque em <strong>&quot;Adicionar&quot;</strong> no canto superior direito</p>
              </div>
            </div>
          ) : (
            // Android/Windows
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Acesso rapido a partir do ecra principal</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Funciona como uma aplicacao nativa</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Sem necessidade de abrir o navegador</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 flex gap-3">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="flex-1 bg-gradient-to-r from-primary-700 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-primary-700/30 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              Instalar Aplicacao
            </button>
          )}
          <button
            onClick={handleDismiss}
            className={`${isIOS ? 'flex-1' : ''} bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors`}
          >
            {isIOS ? 'Fechar' : 'Agora nao'}
          </button>
        </div>
      </div>
    </div>
  );
}