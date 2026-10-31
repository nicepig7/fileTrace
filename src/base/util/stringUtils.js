export const getSimpleName = (fqdn) => {
  if (!fqdn) return 'Unknown';
  const parts = fqdn.split('.');
  return parts[parts.length - 1];
};
