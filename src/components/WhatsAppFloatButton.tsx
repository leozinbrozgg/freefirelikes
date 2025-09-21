import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

export const WhatsAppFloatButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Mostra o botão após 3 segundos
    const timer = setTimeout(() => {
      if (!isDismissed) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isDismissed]);

  const handleJoinGroup = () => {
    window.open('https://chat.whatsapp.com/BGBI3sui1qEBP8Xg6R2O4f', '_blank');
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
  };

  if (!isVisible || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 duration-500">
      <div className="bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
        <div className="flex items-center gap-3 p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            <div className="text-sm font-medium">
              <div className="font-bold">Sala Premiada Grátis!</div>
              <div className="text-xs opacity-90">Entre no grupo do WhatsApp</div>
            </div>
          </div>
          <button
            onClick={handleJoinGroup}
            className="bg-white text-green-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-50 transition-colors"
          >
            Entrar
          </button>
          <button
            onClick={handleDismiss}
            className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
