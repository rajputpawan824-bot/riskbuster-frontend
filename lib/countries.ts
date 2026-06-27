/**
 * Country filter id: either "all" or a country label (string).
 * Was previously a strict union, but countries are now dynamic (CRUD via API).
 */
export type CountryFilter = "all" | (string & {});

export const COUNTRY_ITEMS: { id: CountryFilter; label: string; flag: string }[] = [
  { id: "all", label: "All Countries", flag: "🌐" },
  { id: "Ukraine", label: "Ukraine", flag: "🇺🇦" },
  { id: "Israel", label: "Israel", flag: "🇮🇱" },
  { id: "Palestine", label: "Palestine", flag: "🇵🇸" },
  { id: "Syria", label: "Syria", flag: "🇸🇾" },
  { id: "Yemen", label: "Yemen", flag: "🇾🇪" },
  { id: "Sudan", label: "Sudan", flag: "🇸🇩" },
  { id: "Myanmar", label: "Myanmar", flag: "🇲🇲" },
  { id: "DR Congo", label: "DR Congo", flag: "🇨🇩" },
  { id: "Ethiopia", label: "Ethiopia", flag: "🇪🇹" },
  { id: "Somalia", label: "Somalia", flag: "🇸🇴" },
];

const WORLD_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
  "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia", "Cameroon", "Canada",
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
  "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus",
  "Czechia (Czech Republic)", "Democratic Republic of the Congo", "Denmark",
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador",
  "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji",
  "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Holy See",
  "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya",
  "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", "Malaysia",
  "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco",
  "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia",
  "Norway", "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea",
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia",
  "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan",
  "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand",
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
  "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America",
  "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const labels = COUNTRY_ITEMS.filter((c) => c.id !== "all").map((c) => c.label);

export const COUNTRY_FORM_OPTIONS = Array.from(
  new Set([...WORLD_COUNTRIES, ...labels])
).sort((a, b) => a.localeCompare(b));

/** Flat list used in the country Region dropdown and conflict Region filter. */
export const WORLD_REGIONS = [
  "Africa",
  "Northern Africa",
  "Western Africa",
  "Middle Africa",
  "Eastern Africa",
  "Southern Africa",
  "Asia",
  "Central Asia",
  "Eastern Asia",
  "South-Eastern Asia",
  "Southern Asia",
  "Western Asia",
  "Europe",
  "Northern Europe",
  "Western Europe",
  "Eastern Europe",
  "Southern Europe",
  "North America",
  "Northern America",
  "Central America",
  "Caribbean",
  "South America",
  "Andean States",
  "Southern Cone",
  "Brazil Region",
  "Guianas",
  "Oceania",
  "Australia and New Zealand",
  "Melanesia",
  "Micronesia",
  "Polynesia",
  "Antarctica",
] as const;

export type WorldRegion = (typeof WORLD_REGIONS)[number];
