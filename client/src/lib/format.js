const numberFormatter = new Intl.NumberFormat("tr-TR");

export function formatPrice(amount) {
  return `${numberFormatter.format(amount)} TL`;
}

export function formatDistance(km) {
  return `${numberFormatter.format(km)} km`;
}

export function formatRating(rating) {
  return rating.toFixed(1);
}

export function formatDuration(minutes, { long = false } = {}) {
  return `${minutes} ${long ? "dakika" : "dk"}`;
}

export function getInitials(fullName) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toLocaleUpperCase("tr"))
    .join("");
}

export function withLocativeSuffix(word) {
  const vowels = word.match(/[aeıioöuü]/gi) ?? ["a"];
  const lastVowel = vowels[vowels.length - 1].toLocaleLowerCase("tr");
  const lastLetter = word.slice(-1).toLocaleLowerCase("tr");
  const consonant = "fstkçşhp".includes(lastLetter) ? "t" : "d";
  const vowel = "aıou".includes(lastVowel) ? "a" : "e";
  return `${word}'${consonant}${vowel}`;
}
