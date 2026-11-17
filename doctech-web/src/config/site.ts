// Single source of truth for branding + the tool/category registry.
// Adding a tool here makes it appear in the sidebar automatically.
// Renaming the brand later is a one-line change (see `brand`).

export const brand = {
  // Split so the accent span can be styled independently in the UI.
  namePrefix: "Doc",
  nameSuffix: "Tech",
  badge: "FTA",
  tagline: "Private, in-browser utilities",
} as const;

export type ToolEngine = "local" | "cloud";

export interface Tool {
  id: string;
  name: string;
  href: string;
  /** "local" = runs in-browser (WASM); "cloud" = POSTs to the Express backend. */
  engine: ToolEngine;
  /** Short emoji/glyph used as the sidebar icon. */
  icon: string;
  /** One-line description shown on the dashboard cards. */
  description?: string;
  /** false = listed but not yet built (rendered disabled). */
  ready?: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  tools: Tool[];
}

/** Accent color per category — shared by the landing grid + command palette. */
export const categoryColor: Record<string, { color: string; soft: string }> = {
  pdf: { color: "#ef5d57", soft: "rgba(239,93,87,.13)" },
  color: { color: "#d65bba", soft: "rgba(214,91,186,.13)" },
  text: { color: "#438de0", soft: "rgba(67,141,224,.13)" },
  image: { color: "#8a65dc", soft: "rgba(138,101,220,.13)" },
  css: { color: "#e8a13b", soft: "rgba(232,161,59,.13)" },
  social: { color: "#e95998", soft: "rgba(233,89,152,.13)" },
  coding: { color: "#43af85", soft: "rgba(67,175,133,.13)" },
  games: { color: "#55a8b8", soft: "rgba(85,168,184,.13)" },
  misc: { color: "#6366f1", soft: "rgba(99,102,241,.13)" },
};
export const catColor = (id: string) => categoryColor[id] ?? { color: "#ff5c1a", soft: "rgba(255,92,26,.13)" };

export const categories: Category[] = [
  {
    id: "pdf",
    label: "PDF Tools",
    icon: "📄",
    tools: [
      { id: "merge", name: "Merge PDF", href: "/merge-pdf", engine: "local", icon: "🧩", description: "Combine multiple PDFs into one file in any order you choose.", ready: true },
      { id: "split", name: "Split PDF", href: "/split-pdf", engine: "local", icon: "✂️", description: "Break a PDF into separate pages or custom page ranges.", ready: true },
      { id: "rotate", name: "Rotate PDF", href: "/rotate-pdf", engine: "local", icon: "🔄", description: "Rotate some or all pages 90°, 180° or 270° and save.", ready: true },
      { id: "delete", name: "Delete Pages", href: "/delete-pages", engine: "local", icon: "🗑️", description: "Remove unwanted pages from a PDF and download the rest.", ready: true },
      { id: "watermark", name: "Watermark", href: "/watermark", engine: "local", icon: "💧", description: "Stamp text or an image watermark across every page of a PDF.", ready: true },
      { id: "metadata", name: "Metadata", href: "/metadata", engine: "local", icon: "🏷️", description: "View and edit a PDF's title, author, subject and keywords.", ready: true },
      { id: "img2pdf", name: "Image to PDF", href: "/image-to-pdf", engine: "local", icon: "🖼️", description: "Turn JPG/PNG images into a single, clean PDF document.", ready: true },
      { id: "pdf2img", name: "PDF to Image", href: "/pdf-to-image", engine: "local", icon: "📸", description: "Export each PDF page as a high-quality PNG or JPG image.", ready: true },
      { id: "compress", name: "Compress PDF", href: "/compress-pdf", engine: "cloud", icon: "🗜️", description: "Shrink PDF file size while keeping text sharp and readable.", ready: true },
      { id: "protect", name: "Protect PDF", href: "/protect-pdf", engine: "cloud", icon: "🔒", description: "Add a password and encryption to keep your PDF private.", ready: true },
      { id: "unlock", name: "Unlock PDF", href: "/unlock-pdf", engine: "cloud", icon: "🔓", description: "Remove the password from a PDF you own to open it freely.", ready: true },
      { id: "pdf2word", name: "PDF to Word", href: "/pdf-to-word", engine: "cloud", icon: "📝", description: "Convert a PDF into an editable Word (.docx) document.", ready: true },
      { id: "word2pdf", name: "Word to PDF", href: "/word-to-pdf", engine: "cloud", icon: "📃", description: "Turn Word documents into polished, shareable PDF files.", ready: true },
      { id: "pagenumbers", name: "Add Page Numbers", href: "/add-page-numbers", engine: "cloud", icon: "#️⃣", description: "Insert page numbers with custom position, format and start value.", ready: true },
      { id: "scanpdf", name: "Scanned PDF Converter", href: "/scanned-pdf", engine: "local", icon: "🖨️", description: "Give a clean PDF an authentic scanned look — tint, noise, slight skew.", ready: true },
    ],
  },
  // Future categories from the mega-suite roadmap. Labels registered now;
  // individual tools land in later phases.
  {
    id: "color",
    label: "Color Tools",
    icon: "🎨",
    tools: [
      {
        id: "palette",
        name: "AI Color Palette Generator",
        href: "/color-palette-generator",
        engine: "local",
        icon: "🌈",
        description: "Craft perfect color palettes effortlessly with harmony-driven creativity.",
        ready: true,
      },
      {
        id: "hex2rgba",
        name: "HEX to RGBA Converter",
        href: "/hex-to-rgba",
        engine: "local",
        icon: "🔣",
        description: "Convert HEX color codes to RGBA and see all details of a color.",
        ready: true,
      },
      {
        id: "rgba2hex",
        name: "RGBA to HEX Converter",
        href: "/rgba-to-hex",
        engine: "local",
        icon: "🔢",
        description: "Convert RGBA color codes to alpha-supported 6- or 8-digit HEX.",
        ready: true,
      },
      {
        id: "shades",
        name: "Color Shades Generator",
        href: "/color-shades",
        engine: "local",
        icon: "🌗",
        description: "Get all shades of a color by stepping through darken, lighten, saturate and desaturate.",
        ready: true,
      },
      {
        id: "mixer",
        name: "Color Mixer",
        href: "/color-mixer",
        engine: "local",
        icon: "🧪",
        description: "Mix 2 colors and get the intermediate color codes from 2 to 10 steps.",
        ready: true,
      },
      { id: "color-converter", name: "Color Converter & Picker", href: "/color-converter", engine: "local", icon: "🎨", description: "Pick a color and get HEX, RGB, HSL, HSV, CMYK and the nearest CSS name at once.", ready: true },
      { id: "contrast-checker", name: "WCAG Contrast Checker", href: "/contrast-checker", engine: "local", icon: "◐", description: "Check color contrast against WCAG 2.1 AA/AAA for text and UI, with a live preview.", ready: true },
      { id: "color-blindness", name: "Color Blindness Simulator", href: "/color-blindness-simulator", engine: "local", icon: "👁️", description: "See a palette under protanopia, deuteranopia, tritanopia and total color blindness.", ready: true },
      { id: "named-color", name: "Named Color Finder", href: "/named-color-finder", engine: "local", icon: "🏷️", description: "Search 148 CSS named colors or find the nearest name for any HEX/RGB/HSL.", ready: true },
      { id: "color-scale", name: "Color Scale Generator", href: "/color-scale-generator", engine: "local", icon: "📈", description: "Interpolate an even scale between color stops in RGB or HSL — for data-viz ramps and tokens.", ready: true },
      { id: "tailwind-shades", name: "Tailwind Shade Scale", href: "/tailwind-shade-generator", engine: "local", icon: "🪜", description: "Turn one brand color into a 50–950 scale, ready for Tailwind config or CSS variables.", ready: true },
    ],
  },
  {
    id: "text",
    label: "Text Tools",
    icon: "🔤",
    tools: [
      {
        id: "case",
        name: "Case Converter",
        href: "/case-converter",
        engine: "local",
        icon: "🔠",
        description: "Convert your text to uppercase, lowercase, title case & sentence case.",
        ready: true,
      },
      {
        id: "lorem",
        name: "Lorem Ipsum Generator",
        href: "/lorem-ipsum-generator",
        engine: "local",
        icon: "📝",
        description: "Create placeholder text with your desired number of paragraphs and properties.",
        ready: true,
      },
      {
        id: "counter",
        name: "Letter Counter",
        href: "/letter-counter",
        engine: "local",
        icon: "🔢",
        description: "Count letters, words and sentences and check common length limits.",
        ready: true,
      },
      {
        id: "handwriting",
        name: "Text to Handwriting Converter",
        href: "/text-to-handwriting",
        engine: "local",
        icon: "✍️",
        description: "Convert text into handwriting with paper type and ink color, download as PDF.",
        ready: true,
      },
      {
        id: "bionic",
        name: "Bionic Reading Converter",
        href: "/bionic-reading",
        engine: "local",
        icon: "⚡",
        description: "Convert your text into Bionic Reading mode to read it faster than before.",
        ready: true,
      },
      {
        id: "whitespace",
        name: "Multiple Whitespace Remover",
        href: "/whitespace-remover",
        engine: "local",
        icon: "🧹",
        description: "Remove extra whitespace and line breaks and clear unwanted characters.",
        ready: true,
      },
      {
        id: "fontpair",
        name: "Google Fonts Pair Finder",
        href: "/google-fonts-pair-finder",
        engine: "local",
        icon: "🔤",
        description: "Find font pairs that look cool together as heading and body fonts.",
        ready: true,
      },
      { id: "find-replace", name: "Find & Replace Text", href: "/find-replace", engine: "local", icon: "🔎", description: "Search and replace with regex, case and whole-word options, a live match count and highlights.", ready: true },
      { id: "sort-dedupe", name: "Sort & Dedupe Lines", href: "/sort-dedupe-lines", engine: "local", icon: "↕️", description: "Sort lines A–Z, by length or number, shuffle or reverse, and strip duplicate or empty lines.", ready: true },
      { id: "text-repeater", name: "Text Repeater", href: "/text-repeater", engine: "local", icon: "🔁", description: "Repeat text any number of times with a chosen separator and optional line numbering.", ready: true },
      { id: "slugify", name: "Slugify — URL Slug Generator", href: "/slugify", engine: "local", icon: "🔗", description: "Turn any title into a clean, accent-free, URL-safe slug with your chosen separator.", ready: true },
      { id: "extract-text", name: "Extract from Text", href: "/extract-from-text", engine: "local", icon: "🧲", description: "Pull emails, URLs, phone numbers, hashtags, mentions and numbers out of any text.", ready: true },
      { id: "readability", name: "Readability & Keyword Density", href: "/readability-analyzer", engine: "local", icon: "📊", description: "Score reading ease and grade level, reading time and your most-used keywords, live.", ready: true },
    ],
  },
  {
    id: "image",
    label: "Image Tools",
    icon: "🏞️",
    tools: [
      { id: "imgcompress", name: "Image Compressor", href: "/image-compressor", engine: "local", icon: "🗜️", description: "Shrink JPG/PNG/WebP file size with a quality slider — fully in-browser.", ready: true },
      { id: "imgresize", name: "Image Resizer", href: "/image-resizer", engine: "local", icon: "📐", description: "Resize to exact pixels or a percentage, with optional aspect-ratio lock.", ready: true },
      { id: "imgconvert", name: "Image Converter", href: "/image-converter", engine: "local", icon: "🔄", description: "Convert between PNG, JPG and WebP with adjustable quality.", ready: true },
      { id: "imgcrop", name: "Image Cropper", href: "/image-cropper", engine: "local", icon: "✂️", description: "Drag the crop box with free or fixed aspect ratios, then download.", ready: true },
      { id: "imgrotate", name: "Rotate & Flip", href: "/rotate-flip", engine: "local", icon: "🔁", description: "Rotate by 90° steps or any angle and flip horizontally or vertically.", ready: true },
      { id: "imgfilters", name: "Image Filters", href: "/image-filters", engine: "local", icon: "🎚️", description: "Brightness, contrast, saturation, blur, sepia & more — with one-click presets.", ready: true },
      { id: "imgcolorpicker", name: "Image Color Picker", href: "/image-color-picker", engine: "local", icon: "🎯", description: "Hover to inspect any pixel and click to pick its HEX/RGB/HSL color.", ready: true },
      { id: "imgextract", name: "Image Color Extractor", href: "/image-color-extractor", engine: "local", icon: "🌈", description: "Pull the dominant colors out of an image as a copyable palette.", ready: true },
      { id: "imgavgcolor", name: "Image Average Color", href: "/image-average-color", engine: "local", icon: "🎨", description: "Find the average / dominant color of an image in HEX, RGB and HSL.", ready: true },
      { id: "imgbase64", name: "Image to Base64", href: "/image-to-base64", engine: "local", icon: "🧬", description: "Encode an image as a Base64 data URI with CSS and HTML snippets.", ready: true },
      { id: "imgcensor", name: "Photo Censor", href: "/photo-censor", engine: "local", icon: "🚫", description: "Drag over faces or sensitive info to pixelate, blur or black-bar them.", ready: true },
      { id: "svgblob", name: "SVG Blob Generator", href: "/svg-blob-generator", engine: "local", icon: "🫧", description: "Generate random organic blob shapes as clean SVG you can copy or download.", ready: true },
      { id: "svgpattern", name: "SVG Pattern Generator", href: "/svg-pattern-generator", engine: "local", icon: "🔳", description: "Build seamless SVG background patterns with adjustable colors and scale.", ready: true },
      { id: "svg2png", name: "SVG to PNG Converter", href: "/svg-to-png", engine: "local", icon: "🖼️", description: "Rasterize an SVG file or pasted markup to a crisp PNG at any scale.", ready: true },
      { id: "svgstroke", name: "SVG Stroke to Fill", href: "/svg-stroke-to-fill", engine: "local", icon: "🖊️", description: "Convert stroked SVG paths into filled outline paths for clean editing.", ready: true },
    ],
  },
  {
    id: "css",
    label: "CSS Generators",
    icon: "🎛️",
    tools: [
      { id: "boxshadow", name: "Box Shadow Generator", href: "/box-shadow-generator", engine: "local", icon: "🌑", description: "Craft a CSS box-shadow with offset, blur, spread and color.", ready: true },
      { id: "textshadow", name: "Text Shadow Generator", href: "/text-shadow-generator", engine: "local", icon: "🔡", description: "Generate a CSS text-shadow with offset, blur and color.", ready: true },
      { id: "gradient", name: "Gradient Generator", href: "/gradient-generator", engine: "local", icon: "🌈", description: "Create linear, radial and conic gradients with multiple color stops.", ready: true },
      { id: "borderradius", name: "Border Radius Generator", href: "/border-radius-generator", engine: "local", icon: "⬜", description: "Round each corner independently and copy the border-radius CSS.", ready: true },
      { id: "glass", name: "Glassmorphism Generator", href: "/glassmorphism-generator", engine: "local", icon: "🧊", description: "Generate frosted-glass CSS with blur and transparency.", ready: true },
      { id: "neu", name: "Neumorphism Generator", href: "/neumorphism-generator", engine: "local", icon: "🔲", description: "Generate soft-UI (neumorphism) shadows for cards and buttons.", ready: true },
      { id: "flexbox", name: "Flexbox Playground", href: "/flexbox-playground", engine: "local", icon: "📐", description: "Experiment with flexbox properties and copy the container CSS.", ready: true },
      { id: "grid", name: "CSS Grid Generator", href: "/css-grid-generator", engine: "local", icon: "🔳", description: "Build CSS grids with columns, rows and gaps.", ready: true },
      { id: "loader", name: "CSS Loader Generator", href: "/css-loader-generator", engine: "local", icon: "⏳", description: "Pick a pure-CSS loading spinner and copy its CSS.", ready: true },
      { id: "checkbox", name: "Custom Checkbox Generator", href: "/css-checkbox-generator", engine: "local", icon: "☑️", description: "Design a styled custom checkbox (CSS + HTML).", ready: true },
      { id: "switch", name: "Toggle Switch Generator", href: "/css-switch-generator", engine: "local", icon: "🎚️", description: "Generate an iOS-style toggle switch (CSS + HTML).", ready: true },
      { id: "clippath", name: "CSS Clip Path Generator", href: "/clip-path-generator", engine: "local", icon: "✂️", description: "Clip an image with any shape, drag the anchor points, and copy the CSS.", ready: true },
      { id: "bgpatterns", name: "CSS Background Patterns", href: "/css-background-patterns", engine: "local", icon: "🟪", description: "Pick a pure-CSS background pattern and copy the CSS.", ready: true },
      { id: "cubicbezier", name: "Cubic-bezier Generator", href: "/cubic-bezier-generator", engine: "local", icon: "📈", description: "Design a cubic-bezier easing curve with draggable handles.", ready: true },
      { id: "glitch", name: "Glitch Text Generator", href: "/glitch-text-generator", engine: "local", icon: "👾", description: "Generate an animated glitch text effect (CSS + keyframes).", ready: true },
      { id: "triangle", name: "CSS Triangle Generator", href: "/css-triangle-generator", engine: "local", icon: "🔺", description: "Generate a CSS triangle (border trick) in any direction.", ready: true },
    ],
  },
  {
    id: "social",
    label: "Social Media Tools",
    icon: "📱",
    tools: [
      { id: "ytthumb", name: "YouTube Thumbnail Grabber", href: "/youtube-thumbnail-grabber", engine: "local", icon: "▶️", description: "Grab a YouTube video's thumbnail in every resolution from its link.", ready: true },
      { id: "ogmeta", name: "Open Graph Meta Generator", href: "/open-graph-generator", engine: "local", icon: "🔗", description: "Generate Open Graph & Twitter Card meta tags with a live share preview.", ready: true },
      { id: "tweet2img", name: "Tweet to Image", href: "/tweet-to-image", engine: "local", icon: "🐦", description: "Turn text into a clean tweet-style image on a colourful background.", ready: true },
      { id: "igfilters", name: "Instagram Filters", href: "/instagram-filters", engine: "local", icon: "📸", description: "Apply Instagram-style filter presets to a photo and download it.", ready: true },
      { id: "imgdownload", name: "Image Downloader by URL", href: "/image-downloader", engine: "cloud", icon: "⬇️", description: "Preview and download any direct image URL, even cross-origin links.", ready: true },
      { id: "tweetcount", name: "Tweet / X Character Counter", href: "/tweet-character-counter", engine: "local", icon: "🔢", description: "Count posts with X's weighted rules plus Threads & Bluesky limits.", ready: true },
      { id: "socialresize", name: "Social Media Image Resizer", href: "/social-image-resizer", engine: "local", icon: "📐", description: "Resize/crop an image to exact sizes for every social platform.", ready: true },
      { id: "tweetgen", name: "Tweet Generator", href: "/tweet-generator", engine: "local", icon: "🐤", description: "Make a realistic fake tweet with avatar, verified tick, likes & reposts.", ready: true },
      { id: "whatsapp", name: "WhatsApp Chat Generator", href: "/whatsapp-chat-generator", engine: "local", icon: "💬", description: "Build a WhatsApp conversation mockup and download it as an image.", ready: true },
      { id: "imessage", name: "iMessage Chat Generator", href: "/imessage-chat-generator", engine: "local", icon: "🟦", description: "Create an iMessage-style chat with blue & grey bubbles.", ready: true },
      { id: "igdm", name: "Instagram DM Generator", href: "/instagram-dm-generator", engine: "local", icon: "✉️", description: "Generate an Instagram Direct Message conversation mockup.", ready: true },
      { id: "igpost", name: "Instagram Post Generator", href: "/instagram-post-generator", engine: "local", icon: "🖼️", description: "Create a realistic Instagram feed post with photo, caption & likes.", ready: true },
      { id: "igstory", name: "Instagram Story Generator", href: "/instagram-story-generator", engine: "local", icon: "📲", description: "Design a 9:16 Instagram Story with a photo and text overlay.", ready: true },
      { id: "adrevenue", name: "Twitter Ad Revenue Generator", href: "/twitter-ad-revenue-generator", engine: "local", icon: "💸", description: "Generate a playful X ad-revenue-share earnings card.", ready: true },
      { id: "pfpmaker", name: "Profile Picture Maker", href: "/profile-picture-maker", engine: "local", icon: "🟣", description: "Crop a photo into a circular profile picture with a custom ring.", ready: true },
      { id: "hashtags", name: "Hashtag Generator", href: "/hashtag-generator", engine: "local", icon: "#️⃣", description: "Turn keywords into a set of relevant, popular hashtags to copy.", ready: true },
    ],
  },
  {
    id: "misc",
    label: "Miscellaneous Tools",
    icon: "🧰",
    tools: [
      { id: "password", name: "Strong Password Generator", href: "/password-generator", engine: "local", icon: "🔐", description: "Generate strong, random passwords with custom length and character sets.", ready: true },
      { id: "listrandom", name: "List Randomizer", href: "/list-randomizer", engine: "local", icon: "🔀", description: "Shuffle a list or pick random items with fair, crypto-backed randomness.", ready: true },
      { id: "qrcode", name: "QR Code Generator", href: "/qr-code-generator", engine: "local", icon: "🔳", description: "Create a QR code for any link or text, with colors and PNG/SVG download.", ready: true },
      { id: "barcode", name: "Barcode Generator", href: "/barcode-generator", engine: "local", icon: "📊", description: "Generate CODE128, EAN, UPC and more barcodes, then download as PNG/SVG.", ready: true },
      { id: "uuid", name: "UUID Generator", href: "/uuid-generator", engine: "local", icon: "🆔", description: "Generate v4 UUIDs singly or in bulk, ready to copy or download.", ready: true },
      { id: "randnum", name: "Random Number Generator", href: "/random-number-generator", engine: "local", icon: "🔢", description: "Pick random numbers in a range — unique or repeatable, sorted or not.", ready: true },
      { id: "wheel", name: "Wheel of Names", href: "/wheel-of-names", engine: "local", icon: "🎡", description: "Spin a wheel to pick a random name — perfect for giveaways and draws.", ready: true },
      { id: "hash", name: "Hash Generator", href: "/hash-generator", engine: "local", icon: "🔏", description: "Compute SHA-1, SHA-256, SHA-384 and SHA-512 hashes of any text.", ready: true },
      { id: "dice", name: "Coin Flip & Dice Roller", href: "/coin-flip-dice", engine: "local", icon: "🎲", description: "Flip a coin or roll dice (d4–d20, multiple) with a satisfying animation.", ready: true },
      { id: "timer", name: "Countdown & Pomodoro Timer", href: "/countdown-timer", engine: "local", icon: "⏱️", description: "A Pomodoro focus timer plus a countdown to any date or time.", ready: true },
      { id: "bmi", name: "BMI Calculator", href: "/bmi-calculator", engine: "local", icon: "⚖️", description: "Calculate BMI in metric or imperial with an instant health category.", ready: true },
      { id: "age", name: "Age Calculator", href: "/age-calculator", engine: "local", icon: "🎂", description: "Find exact age or the duration between two dates in years, months, days.", ready: true },
    ],
  },
  {
    id: "coding",
    label: "Coding Tools",
    icon: "💻",
    tools: [
      { id: "json-formatter", name: "JSON Formatter & Validator", href: "/json-formatter", engine: "local", icon: "🧾", description: "Beautify, minify and validate JSON with located errors, key sorting and a tree view.", ready: true },
      { id: "base64", name: "Base64 Encoder & Decoder", href: "/base64-encoder", engine: "local", icon: "🔤", description: "Encode or decode Base64 text and files, Unicode-safe, with instant data-URI output.", ready: true },
      { id: "url-encoder", name: "URL Encoder & Decoder", href: "/url-encoder", engine: "local", icon: "🔗", description: "Percent-encode or decode URLs and break any address into its parts and parameters.", ready: true },
      { id: "jwt-decoder", name: "JWT Decoder", href: "/jwt-decoder", engine: "local", icon: "🪪", description: "Decode a JSON Web Token's header and payload with readable dates and expiry status.", ready: true },
      { id: "regex-tester", name: "Regex Tester", href: "/regex-tester", engine: "local", icon: "🔎", description: "Test regular expressions live with highlighted matches, groups and a replace preview.", ready: true },
      { id: "timestamp", name: "Unix Timestamp Converter", href: "/timestamp-converter", engine: "local", icon: "🕰️", description: "Convert epoch timestamps to dates and back, in seconds or milliseconds, with a live clock.", ready: true },
      { id: "text-diff", name: "Text & Code Diff Checker", href: "/text-diff", engine: "local", icon: "🔀", description: "Compare two texts line by line with word-level highlighting, side-by-side or unified.", ready: true },
      { id: "html-entity", name: "HTML Entity Encoder & Decoder", href: "/html-entity-encoder", engine: "local", icon: "🏷️", description: "Escape text for safe HTML or turn named, decimal and hex entities back into characters.", ready: true },
      { id: "code-formatter", name: "Code Formatter & Beautifier", href: "/code-formatter", engine: "local", icon: "✨", description: "Pretty-print JS, TS, CSS, HTML, JSON, Markdown and YAML with Prettier and your own style options.", ready: true },
      { id: "code-minifier", name: "Code Minifier", href: "/code-minifier", engine: "local", icon: "🗜️", description: "Shrink JavaScript, CSS, HTML and JSON with a live size-saved readout — Terser-powered JS mangling.", ready: true },
      { id: "sql-formatter", name: "SQL Formatter", href: "/sql-formatter", engine: "local", icon: "🗃️", description: "Beautify SQL for a dozen dialects with configurable keyword case and indentation.", ready: true },
      { id: "yaml-json", name: "YAML ⇄ JSON Converter", href: "/yaml-json-converter", engine: "local", icon: "🔄", description: "Convert YAML to JSON and back with located parse errors — for config, CI and Kubernetes files.", ready: true },
      { id: "csv-json", name: "CSV ⇄ JSON Converter", href: "/csv-json-converter", engine: "local", icon: "📊", description: "Convert CSV to JSON and back, RFC-4180 aware, with delimiter auto-detection and typed values.", ready: true },
      { id: "cron-parser", name: "Cron Expression Parser", href: "/cron-parser", engine: "local", icon: "⏲️", description: "Decode any cron schedule into plain English and preview its next run times.", ready: true },
      { id: "case-converter-code", name: "Variable Name Case Converter", href: "/variable-case-converter", engine: "local", icon: "🐫", description: "Turn any label into camelCase, PascalCase, snake_case, CONSTANT_CASE, kebab-case and more at once.", ready: true },
      { id: "number-base", name: "Number Base Converter", href: "/number-base-converter", engine: "local", icon: "🔢", description: "Convert between binary, octal, decimal, hex and any base 2–36 with arbitrary precision.", ready: true },
    ],
  },
  {
    id: "games",
    label: "Games",
    icon: "🎮",
    tools: [
      { id: "typing-speed-test", name: "Typing Speed Test", href: "/typing-speed-test", engine: "local", icon: "⌨️", description: "Measure your true typing speed with live WPM, accuracy, consistency and a results graph — timed or word-count modes.", ready: true },
      { id: "typing-arcade", name: "Typing Arcade Shooter", href: "/typing-arcade", engine: "local", icon: "🚀", description: "A cyberpunk space shooter where your keyboard is the weapon — type words to lock on, fire and destroy incoming enemies.", ready: true },
    ],
  },
];
