import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import StepWelcome from "@/components/reserva/StepWelcome";
import StepPassageiros from "@/components/reserva/StepPassageiros";
import StepDados, { type PassageiroData } from "@/components/reserva/StepDados";
import StepAssentos from "@/components/reserva/StepAssentos";
import StepPagamento from "@/components/reserva/StepPagamento";
import StepResumo from "@/components/reserva/StepResumo";
import StepSucesso from "@/components/reserva/StepSucesso";
import StepProgress from "@/components/reserva/StepProgress";
import { AnimatePresence, motion } from "framer-motion";

const emptyPassageiro = (): PassageiroData => ({
  nomeCompleto: "",
  dataNascimento: "",
  cpf: "",
  telefone: "",
  email: "",
  sexo: "",
});

const ColetaDados = () => {
  const [step, setStep] = useState(0);
  const [counts, setCounts] = useState({ adultos: 1, criancas: 0, bebes: 0 });
  const [passageiros, setPassageiros] = useState<PassageiroData[]>([emptyPassageiro()]);
  const [currentPassageiroIndex, setCurrentPassageiroIndex] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [metodoPagamento, setMetodoPagamento] = useState("pix");
  const [codigoReserva, setCodigoReserva] = useState("");
  const [loading, setLoading] = useState(false);

  const totalPassageiros = counts.adultos + counts.criancas + counts.bebes;

  const handleCountsChange = (newCounts: typeof counts) => {
    const newTotal = newCounts.adultos + newCounts.criancas + newCounts.bebes;
    setCounts(newCounts);
    setPassageiros((prev) => {
      if (newTotal > prev.length) {
        return [...prev, ...Array.from({ length: newTotal - prev.length }, emptyPassageiro)];
      }
      return prev.slice(0, newTotal);
    });
    setSelectedSeats((prev) => (prev.length > newTotal ? prev.slice(0, newTotal) : prev));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservas")
        .insert({
          adultos: counts.adultos,
          criancas: counts.criancas,
          bebes: counts.bebes,
          passageiros: passageiros as any,
          assentos: selectedSeats as any,
          metodo_pagamento: metodoPagamento,
          status: "pendente",
        })
        .select("codigo_reserva")
        .single();

      if (error) throw error;

      const codigo = data.codigo_reserva;
      setCodigoReserva(codigo);
      setStep(6);
      toast.success("Cadastro enviado com sucesso!");

      try {
        await supabase.functions.invoke("send-reservation-email", {
          body: {
            type: "confirmation",
            codigoReserva: codigo,
            passageiros,
            assentos: selectedSeats,
            metodoPagamento,
          },
        });
      } catch { }

      const operadorWhatsApp = "5521982592219";
      const msg = encodeURIComponent(
        `Olá! Acabei de realizar meu cadastro de reserva. Meu código é: ${codigo}`
      );
      setTimeout(() => {
        window.open(`https://wa.me/${operadorWhatsApp}?text=${msg}`, "_blank");
      }, 3000);
    } catch (err: any) {
      toast.error("Erro ao enviar: " + (err.message || "Tente novamente"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <div className="mx-auto max-w-lg px-4 py-5 sm:py-8">
        {step >= 1 && step <= 5 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <StepProgress current={step - 1} />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 0 && <StepWelcome key="welcome" onNext={() => setStep(1)} />}

          {step === 1 && (
            <StepPassageiros
              key="passageiros"
              counts={counts}
              onChange={handleCountsChange}
              onNext={() => { setCurrentPassageiroIndex(0); setStep(2); }}
              onBack={() => setStep(0)}
            />
          )}

          {step === 2 && (
            <StepDados
              key="dados"
              passageiros={passageiros}
              currentIndex={currentPassageiroIndex}
              onChangeIndex={setCurrentPassageiroIndex}
              onChange={(i, data) => {
                setPassageiros((prev) => prev.map((p, idx) => (idx === i ? data : p)));
              }}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              total={totalPassageiros}
            />
          )}

          {step === 3 && (
            <StepAssentos
              key="assentos"
              totalPassageiros={totalPassageiros}
              selectedSeats={selectedSeats}
              onChange={setSelectedSeats}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <StepPagamento
              key="pagamento"
              selected={metodoPagamento}
              onChange={setMetodoPagamento}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <StepResumo
              key="resumo"
              passageiros={passageiros}
              assentos={selectedSeats}
              metodoPagamento={metodoPagamento}
              onSubmit={handleSubmit}
              onBack={() => setStep(4)}
              loading={loading}
            />
          )}

          {step === 6 && (
            <StepSucesso
              key="sucesso"
              codigo={codigoReserva}
              passageiros={passageiros}
              assentos={selectedSeats}
              metodoPagamento={metodoPagamento}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ColetaDados;
