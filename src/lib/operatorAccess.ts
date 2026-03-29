const OPERATOR_CODE_LENGTH = 6;

export const normalizeOperatorCode = (value?: string | null) =>
  (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, OPERATOR_CODE_LENGTH);

export const slugifyOperatorName = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export const isUuid = (value?: string | null) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value ?? "");

export const getBaseUrl = () => {
  if (typeof window !== "undefined") return window.location.origin;
  return "";
};

export const getOperatorCadastroPath = (operatorCode: string) => `/c/${normalizeOperatorCode(operatorCode)}`;

export const getOperatorCadastroUrl = (operatorCode: string, baseUrl = getBaseUrl()) =>
  `${baseUrl}${getOperatorCadastroPath(operatorCode)}`;

export const getOperatorLoginPath = (operatorCode: string) => `/o/${normalizeOperatorCode(operatorCode)}`;

export const getOperatorLoginUrl = (operatorCode: string, baseUrl = getBaseUrl()) =>
  `${baseUrl}${getOperatorLoginPath(operatorCode)}`;