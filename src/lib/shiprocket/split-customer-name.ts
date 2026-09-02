/** Split a full name into first + last for Shiprocket (last name is required). */
export function splitCustomerName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "Customer", lastName: "." };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "." };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}
