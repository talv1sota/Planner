// Representative photo URLs (Wikimedia Commons, freely licensed and meant
// to be hotlinked — Wikimedia explicitly supports reuse of its media) keyed
// by town name, for card header images. Falls back to the abstract
// category art when a town has no photo yet. Sourced from each town's
// Wikipedia infobox image, verified via Special:FilePath redirects.
export const TOWN_IMAGES: Record<string, string> = {
  Enschede:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Enschede%2C_binnenstad.jpg?width=800",
  Hengelo:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Twentekanaal_Hengelo_2.jpg?width=800",
  Oldenzaal:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Oude_stadhuis_Oldenzaal.jpg?width=800",
  Almelo:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Koornmarkt_Almelo.JPG?width=800",
  Losser:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Losser_Steenfabriek_De_Werklust.JPG?width=800",
  Haaksbergen:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Haaksbergen_centrum.jpg?width=800",
  Borne:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Dorsetplein_Borne_(2).JPG?width=800",
  Delden:
    "https://commons.wikimedia.org/wiki/Special:FilePath/2006-07-15_11.20_Delden%2C_kasteel_Twickel.JPG?width=800",
  Rijssen:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Rijssen_luchtfoto_7_september_2005.jpg?width=800",
  Goor:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Goor%2C_sculptuur_van_de_geschiedenis_van_Goor_IMG_5853_2020-05-31_18.15.jpg?width=800",
  Gronau:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Gronau_St._Antonius.jpg?width=800",
  Ochtrup:
    "https://commons.wikimedia.org/wiki/Special:FilePath/OchtrupLambertikirche.jpg?width=800",
  Nordhorn:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Innenstadt.04.jpg?width=800",
  "Bad Bentheim":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Bad_Bentheim.jpg?width=800",
  Rheine:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Rheine-Emswehr.jpg?width=800",
  "Münster":
    "https://commons.wikimedia.org/wiki/Special:FilePath/Muenster_Innenstadt.jpg?width=800",
  Zwolle:
    "https://commons.wikimedia.org/wiki/Special:FilePath/Sassenstraat_1-15%2C_Zwolle.jpg?width=800",
};

export function getTownImage(city?: string): string | undefined {
  if (!city) return undefined;
  // Handle sub-district variants like "Enschede (Glanerbrug)" by falling
  // back to the base town's photo.
  const base = city.split("(")[0].trim();
  return TOWN_IMAGES[city] ?? TOWN_IMAGES[base];
}
