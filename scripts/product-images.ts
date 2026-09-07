import * as fs from "fs";

const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  escritorios: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&auto=format&fit=crop&q=80",
  procesadores_amd: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80",
  procesadores_intel: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
  graficas: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=800&auto=format&fit=crop&q=80",
  placas: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
  ram: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&auto=format&fit=crop&q=80",
  ram_rgb: "https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=800&auto=format&fit=crop&q=80",
  almacenamiento_nvme: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
  almacenamiento_sata: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=800&auto=format&fit=crop&q=80",
  almacenamiento_hdd: "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=800&auto=format&fit=crop&q=80",
  fuentes: "https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=800&auto=format&fit=crop&q=80",
  gabinetes: "https://images.unsplash.com/photo-1587202372728-668516d25244?w=800&auto=format&fit=crop&q=80",
  refrigeracion_liquida: "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=800&auto=format&fit=crop&q=80",
  refrigeracion_aire: "https://images.unsplash.com/photo-1587202372579-0524cb51d382?w=800&auto=format&fit=crop&q=80",
  monitores_curvos: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
  monitores_ips: "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format&fit=crop&q=80",
  teclados: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
  headsets: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
  mousepads: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
  webcams: "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop&q=80",
  software: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
};

export function getProductImage(nombre: string, categoria: string): string {
  const n = nombre.toLowerCase();

  if (categoria === "escritorios") {
    if (n.includes("cyber") || n.includes("vidrio")) return "https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800&auto=format&fit=crop&q=80";
    if (n.includes("pino") || n.includes("compact")) return "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800&auto=format&fit=crop&q=80";
    return CATEGORY_DEFAULT_IMAGES.escritorios;
  }

  if (categoria === "procesadores") {
    if (n.includes("ryzen") || n.includes("amd")) return CATEGORY_DEFAULT_IMAGES.procesadores_amd;
    return CATEGORY_DEFAULT_IMAGES.procesadores_intel;
  }

  if (categoria === "graficas") {
    if (n.includes("5060 oc") || n.includes("white")) return "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80";
    if (n.includes("evo") || n.includes("dual")) return "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80";
    if (n.includes("eagle") || n.includes("ti")) return "https://images.unsplash.com/photo-1587202372728-668516d25244?w=800&auto=format&fit=crop&q=80";
    return CATEGORY_DEFAULT_IMAGES.graficas;
  }

  if (categoria === "placas") {
    if (n.includes("b450") || n.includes("a520") || n.includes("b550") || n.includes("a620")) {
      return "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80";
    }
    return CATEGORY_DEFAULT_IMAGES.placas;
  }

  if (categoria === "ram") {
    if (n.includes("rgb")) return CATEGORY_DEFAULT_IMAGES.ram_rgb;
    return CATEGORY_DEFAULT_IMAGES.ram;
  }

  if (categoria === "almacenamiento") {
    if (n.includes("hdd") || n.includes("seagate") || n.includes("barracuda")) return CATEGORY_DEFAULT_IMAGES.almacenamiento_hdd;
    if (n.includes("sata") || n.includes("a400") || n.includes("2.5")) return CATEGORY_DEFAULT_IMAGES.almacenamiento_sata;
    return CATEGORY_DEFAULT_IMAGES.almacenamiento_nvme;
  }

  if (categoria === "fuentes") {
    return CATEGORY_DEFAULT_IMAGES.fuentes;
  }

  if (categoria === "gabinetes") {
    if (n.includes("1319g") || n.includes("micro")) return "https://images.unsplash.com/photo-1624705002806-5d72df19c3ad?w=800&auto=format&fit=crop&q=80";
    return CATEGORY_DEFAULT_IMAGES.gabinetes;
  }

  if (categoria === "refrigeracion") {
    if (n.includes("water") || n.includes("liquid") || n.includes("240mm")) return CATEGORY_DEFAULT_IMAGES.refrigeracion_liquida;
    return CATEGORY_DEFAULT_IMAGES.refrigeracion_aire;
  }

  if (categoria === "monitores") {
    if (n.includes("curvo") || n.includes("200hz") || n.includes("180hz")) return CATEGORY_DEFAULT_IMAGES.monitores_curvos;
    return CATEGORY_DEFAULT_IMAGES.monitores_ips;
  }

  if (categoria === "teclados") {
    if (n.includes("combo")) return "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80";
    return CATEGORY_DEFAULT_IMAGES.teclados;
  }

  if (categoria === "headsets") {
    return CATEGORY_DEFAULT_IMAGES.headsets;
  }

  if (categoria === "mousepads") {
    return CATEGORY_DEFAULT_IMAGES.mousepads;
  }

  if (categoria === "webcams") {
    return CATEGORY_DEFAULT_IMAGES.webcams;
  }

  if (categoria === "software") {
    if (n.includes("office")) return "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&auto=format&fit=crop&q=80";
    if (n.includes("kaspersky")) return "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80";
    return CATEGORY_DEFAULT_IMAGES.software;
  }

  return "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80";
}
