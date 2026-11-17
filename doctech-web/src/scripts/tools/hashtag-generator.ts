// Hashtag Generator — client-side. Keyword variants + niche dictionary + popular
// generics, deduped and capped to the chosen count.
import { copyText } from "../lib/ui";

const input = document.getElementById("hg-input") as HTMLInputElement | null;
const countEl = document.getElementById("hg-count") as HTMLSelectElement | null;
const out = document.getElementById("hg-out");
const num = document.getElementById("hg-num");
const copy = document.getElementById("hg-copy");

if (input && countEl && out && num && copy) {
  const NICHES: { aliases: string[]; tags: string[] }[] = [
    { aliases: ["travel", "trip", "vacation", "wanderlust", "explore", "tourism"], tags: ["travel", "travelgram", "wanderlust", "travelphotography", "instatravel", "adventure", "vacation", "travelblogger", "traveltheworld", "explore"] },
    { aliases: ["food", "foodie", "cooking", "recipe", "eat", "baking"], tags: ["food", "foodporn", "foodie", "instafood", "foodphotography", "yummy", "delicious", "foodstagram", "homemade", "tasty"] },
    { aliases: ["fitness", "gym", "workout", "fit", "training", "exercise"], tags: ["fitness", "gym", "workout", "fitfam", "fitnessmotivation", "training", "healthylifestyle", "gymlife", "fitlife", "noexcuses"] },
    { aliases: ["fashion", "style", "outfit", "ootd", "clothes", "clothing"], tags: ["fashion", "style", "ootd", "fashionista", "streetstyle", "fashionblogger", "outfitoftheday", "instafashion", "styleinspo", "lookbook"] },
    { aliases: ["beauty", "makeup", "skincare", "cosmetics", "glam"], tags: ["beauty", "makeup", "skincare", "makeupartist", "beautyblogger", "mua", "glam", "makeuptutorial", "skincareroutine", "cosmetics"] },
    { aliases: ["photography", "photo", "camera", "photographer", "portrait"], tags: ["photography", "photooftheday", "photographer", "photoshoot", "naturephotography", "portrait", "picoftheday", "canon", "nikon", "moodygrams"] },
    { aliases: ["art", "drawing", "painting", "artist", "design", "sketch"], tags: ["art", "artist", "artwork", "drawing", "illustration", "digitalart", "painting", "artistsoninstagram", "sketch", "creative"] },
    { aliases: ["music", "song", "musician", "singer", "band", "rap"], tags: ["music", "musician", "song", "newmusic", "singer", "producer", "hiphop", "spotify", "musicproducer", "livemusic"] },
    { aliases: ["business", "entrepreneur", "marketing", "startup", "success", "money"], tags: ["business", "entrepreneur", "marketing", "success", "smallbusiness", "startup", "branding", "digitalmarketing", "hustle", "ceo"] },
    { aliases: ["tech", "technology", "coding", "developer", "gadget", "programming"], tags: ["tech", "technology", "coding", "developer", "programming", "innovation", "gadgets", "ai", "software", "techie"] },
    { aliases: ["nature", "outdoors", "hiking", "mountains", "landscape", "sunset"], tags: ["nature", "naturephotography", "landscape", "hiking", "outdoors", "mountains", "naturelovers", "wildlife", "sunset", "earthpix"] },
    { aliases: ["pet", "pets", "dog", "cat", "puppy", "animal"], tags: ["pets", "dog", "cat", "puppy", "dogsofinstagram", "catsofinstagram", "petstagram", "animals", "doglover", "adorable"] },
    { aliases: ["gaming", "gamer", "game", "esports", "twitch", "gameplay"], tags: ["gaming", "gamer", "game", "videogames", "esports", "twitch", "gamingcommunity", "pcgaming", "ps5", "xbox"] },
    { aliases: ["motivation", "inspire", "quote", "mindset", "goals", "success"], tags: ["motivation", "inspiration", "motivationalquotes", "mindset", "goals", "positivevibes", "selfcare", "believe", "growth", "discipline"] },
    { aliases: ["coffee", "cafe", "espresso", "latte", "barista"], tags: ["coffee", "coffeelover", "cafe", "coffeetime", "espresso", "latte", "coffeegram", "baristalife", "coffeeaddict", "caffeine"] },
  ];
  const GENERIC = ["instagood", "love", "photooftheday", "instadaily", "viral", "trending", "explorepage", "fyp", "reels", "instagram", "follow", "likeforlikes", "bhfyp", "trendingreels", "viralpost"];

  function clean(s: string): string { return s.toLowerCase().replace(/[^a-z0-9]/g, ""); }

  function generate(): string[] {
    const keywords = input!.value.split(/[\s,]+/).map(clean).filter(Boolean);
    const seen = new Set<string>();
    const result: string[] = [];
    const push = (tag: string) => { const t = clean(tag); if (t && !seen.has(t)) { seen.add(t); result.push(t); } };

    // 1. keyword-derived tags (most relevant first)
    for (const kw of keywords) {
      push(kw);
      ["gram", "lover", "oftheday", "life", "daily"].forEach((suf) => push(kw + suf));
      push("insta" + kw);
    }
    // 2. matched niche tags
    for (const kw of keywords) {
      for (const n of NICHES) {
        if (n.aliases.some((a) => a === kw || kw.includes(a) || a.includes(kw))) n.tags.forEach(push);
      }
    }
    // 3. generic popular fillers
    GENERIC.forEach(push);
    return result.slice(0, +countEl!.value);
  }

  function render() {
    const tags = generate();
    out!.innerHTML = tags.map((t) => `<span class="rounded-md bg-sky-50 px-1.5 py-0.5 dark:bg-sky-500/10">#${t}</span>`).join("");
    num!.textContent = String(tags.length);
  }

  input.addEventListener("input", render);
  countEl.addEventListener("change", render);
  copy.addEventListener("click", () => copyText(generate().map((t) => "#" + t).join(" ")));
  render();
}
