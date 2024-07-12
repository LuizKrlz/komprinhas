import { format, parseISO } from "date-fns";

export const formatToReal = (value: number) => {
  const formatter = Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return formatter.format(value);
};

export const formatDate = (value: string) => {
  const parsed = parseISO(value);
  return format(parsed, "dd/MM/yyyy");
};
