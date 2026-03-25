import { create } from "zustand";

export interface GatewayConfig {
  id: string;
  nome: string;
  url: string;
  ativo: boolean;
  secretKey: string;
  publicKey: string;
}

interface GatewayStore {
  gateways: GatewayConfig[];
  setGateways: (gateways: GatewayConfig[]) => void;
  updateGateway: (id: string, updates: Partial<GatewayConfig>) => void;
  addGateway: (gateway: GatewayConfig) => void;
  removeGateway: (id: string) => void;
  getActiveGateways: () => GatewayConfig[];
}

export const useGatewayStore = create<GatewayStore>((set, get) => ({
  gateways: [
    {
      id: "hura-pay",
      nome: "Hura Pay",
      url: "https://api.hurapayments.com.br/v1/payment-transaction/create",
      ativo: false,
      secretKey: "",
      publicKey: "",
    },
    {
      id: "anubis-pay",
      nome: "Anubis Pay",
      url: "https://api.anubispay.com.br/v1/transaction/create",
      ativo: false,
      secretKey: "",
      publicKey: "",
    },
  ],
  setGateways: (gateways) => set({ gateways }),
  updateGateway: (id, updates) =>
    set((state) => ({
      gateways: state.gateways.map((g) => (g.id === id ? { ...g, ...updates } : g)),
    })),
  addGateway: (gateway) => set((state) => ({ gateways: [...state.gateways, gateway] })),
  removeGateway: (id) => set((state) => ({ gateways: state.gateways.filter((g) => g.id !== id) })),
  getActiveGateways: () => get().gateways.filter((g) => g.ativo && g.secretKey),
}));
