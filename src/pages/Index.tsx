import { FreefireForm } from "@/components/FreefireForm";
import { SimpleLikeHistory } from "@/components/SimpleLikeHistory";

const Index = () => {
  return (
    <div className="min-h-screen p-4 space-y-6">
      {/* Formulário principal */}
      <div className="w-full max-w-2xl mx-auto">
        <FreefireForm />
      </div>
      
      {/* Histórico simplificado */}
      <div className="w-full max-w-2xl mx-auto">
        <SimpleLikeHistory />
      </div>
    </div>
  );
};

export default Index;
