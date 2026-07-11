export function formatCurrency(value: number | string): string {
  const amount =
    typeof value === "string"
      ? Number(value.replace(",", "."))
      : value;

  if (isNaN(amount)) {
    return "R$ 0,00";
  }

  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 11) {
    return digits.replace(
      /(\d{2})(\d{5})(\d{4})/,
      "($1) $2-$3"
    );
  }

  if (digits.length === 10) {
    return digits.replace(
      /(\d{2})(\d{4})(\d{4})/,
      "($1) $2-$3"
    );
  }

  return phone;
}