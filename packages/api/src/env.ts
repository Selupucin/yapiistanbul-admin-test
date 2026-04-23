export function hasDatabaseConfig() {
  return Boolean(process.env.MONGODB_URI);
}

export const FALLBACK_CONTACT = {
  phone: "+90 212 000 00 00",
  email: "info@yapiistanbul.com",
  address: "Istanbul, Turkiye",
  mapLocation: "https://maps.google.com",
};

export const FALLBACK_SETTINGS = {
  siteLogo: "",
  siteFavicon: "",
};
