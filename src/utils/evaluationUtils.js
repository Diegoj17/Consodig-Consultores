export const isValidated = (ev) => {
  if (!ev) return false;
  const v = ev?.validada ?? ev?.validated ?? ev?.aprobada ?? ev?.aprobadaFlag ?? ev?.aprobada?.value ?? null;
  if (v === true) return true;
  if (typeof v === 'number' && v === 1) return true;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    if (s === '1' || s === 'true' || s.includes('0x01')) return true;
  }
  // Some backends use 'invalidada' vs 'validada' flags; check explicit 'validada' truthy fields
  if (ev?.estado && typeof ev.estado === 'string') {
    const st = ev.estado.toLowerCase();
    if (st === 'aprobada' || st === 'validada') return true;
  }
  return false;
};

export default {
  isValidated
};
