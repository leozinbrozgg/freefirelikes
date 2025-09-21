import { FreefireForm } from "@/components/FreefireForm";
import { LikeHistory } from "@/components/LikeHistory";
import { WhatsAppFloatButton } from "@/components/WhatsAppFloatButton";

const Index = () => {
  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Formulário principal */}
      <div className="w-full max-w-2xl mx-auto">
        <FreefireForm />
      </div>

      {/* Histórico de Likes */}
      <div className="w-full max-w-2xl mx-auto">
        <LikeHistory />
      </div>

      {/* Botão flutuante do WhatsApp */}
      <WhatsAppFloatButton />
    </div>
  );
};

export default Index;
