export const formatUK = (dateString: string | null | undefined): string => {
  if (!dateString) return "";
  return new Intl.DateTimeFormat("en-GB").format(new Date(dateString));
};
