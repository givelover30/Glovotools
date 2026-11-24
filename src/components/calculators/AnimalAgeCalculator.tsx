import { useId, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useTranslation } from '../../i18n/I18nContext.tsx';
import {
  ToolBreakdownList,
  ToolFieldGroup,
  ToolInputPanel,
  ToolMetricTile,
  ToolResultsPanel,
  ToolSplitWorkspace
} from '../calculator/ToolWorkspacePrimitives.tsx';

type AgeGroupKey =
  | 'Mammals (Verified)'
  | 'Small Mammals'
  | 'Farm Animals'
  | 'Birds'
  | 'Reptiles'
  | 'Aquatic Animals';

interface AgeSpecies {
  id: string;
  name: string;
  nameEs: string;
  scientific: string;
  group: AgeGroupKey;
  calcHumanAge?: (years: number) => number;
  lifeExpectancy: number;
  stageDescriptions: { juvenile: string; adult: string; senior: string };
  stageDescriptionsEs: { juvenile: string; adult: string; senior: string };
  source: string;
  isHumanAgeSupported: boolean;
}

const GROUPS: Array<{ key: AgeGroupKey; labelEn: string; labelEs: string }> = [
  { key: 'Mammals (Verified)', labelEn: 'Mammals (Verified)', labelEs: 'Mamíferos (Verificados)' },
  { key: 'Small Mammals', labelEn: 'Small Mammals', labelEs: 'Pequeños mamíferos' },
  { key: 'Farm Animals', labelEn: 'Farm Animals', labelEs: 'Animales de granja' },
  { key: 'Birds', labelEn: 'Birds', labelEs: 'Aves' },
  { key: 'Reptiles', labelEn: 'Reptiles', labelEs: 'Reptiles' },
  { key: 'Aquatic Animals', labelEn: 'Aquatic Animals', labelEs: 'Animales acuáticos' }
];

const AGE_SPECIES_DB: AgeSpecies[] = [
  // --- VERIFIED MAMMALS (WITH HUMAN EQUIVALENCE) ---
  {
    id: 'dog',
    name: 'Dog (Canine)',
    nameEs: 'Perro (Canino)',
    scientific: 'Canis lupus familiaris',
    group: 'Mammals (Verified)',
    calcHumanAge: (y) => (y <= 1 ? y * 15 : 16 * Math.log(y) + 31),
    lifeExpectancy: 12,
    stageDescriptions: {
      juvenile: '0 - 1 year (Rapid growth & social maturity)',
      adult: '1 - 7 years (Active adult life)',
      senior: '7+ years (Senior & geriatric care required)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 1 año (Crecimiento rápido y madurez social)',
      adult: '1 - 7 años (Vida adulta activa)',
      senior: '7+ años (Cuidado sénior y geriátrico)'
    },
    source: 'UCSD Epigenetic DNA Methylation Study / Merck Veterinary Manual',
    isHumanAgeSupported: true
  },
  {
    id: 'cat',
    name: 'Cat (Feline)',
    nameEs: 'Gato (Felino)',
    scientific: 'Felis catus',
    group: 'Mammals (Verified)',
    calcHumanAge: (y) => (y === 1 ? 15 : y === 2 ? 24 : 24 + (y - 2) * 4),
    lifeExpectancy: 15,
    stageDescriptions: {
      juvenile: '0 - 1 year (Kitten development)',
      adult: '1 - 10 years (Prime adult years)',
      senior: '10+ years (Senior feline care)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 1 año (Desarrollo de gatito)',
      adult: '1 - 10 años (Etapa adulta plena)',
      senior: '10+ años (Cuidado felino sénior)'
    },
    source: 'Merck Veterinary Manual',
    isHumanAgeSupported: true
  },
  {
    id: 'horse',
    name: 'Horse (Equine)',
    nameEs: 'Caballo (Equino)',
    scientific: 'Equus caballus',
    group: 'Mammals (Verified)',
    calcHumanAge: (y) => (y === 1 ? 13 : y === 2 ? 25 : 25 + (y - 2) * 3),
    lifeExpectancy: 25,
    stageDescriptions: {
      juvenile: '0 - 2 years (Foal & yearling growth)',
      adult: '2 - 15 years (Working & athletic prime)',
      senior: '15+ years (Senior equine care)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 2 años (Crecimiento de potro)',
      adult: '2 - 15 años (Etapa adulta y de trabajo)',
      senior: '15+ años (Cuidado equino sénior)'
    },
    source: 'Equine Veterinary Association',
    isHumanAgeSupported: true
  },
  {
    id: 'cattle',
    name: 'Cattle (Bovine)',
    nameEs: 'Ganado bovino',
    scientific: 'Bos taurus',
    group: 'Mammals (Verified)',
    calcHumanAge: (y) => (y === 1 ? 14 : 14 + (y - 1) * 3.5),
    lifeExpectancy: 15,
    stageDescriptions: {
      juvenile: '0 - 1 year (Calf & heifer/bull growth)',
      adult: '1 - 8 years (Productive milking/beef prime)',
      senior: '8+ years (Aged cattle)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 1 año (Crecimiento de ternero/vaquilla)',
      adult: '1 - 8 años (Etapa productiva adulta)',
      senior: '8+ años (Ganado mayor)'
    },
    source: 'Agricultural Extension Reference',
    isHumanAgeSupported: true
  },
  {
    id: 'rabbit',
    name: 'Rabbit',
    nameEs: 'Conejo',
    scientific: 'Oryctolagus cuniculus',
    group: 'Mammals (Verified)',
    calcHumanAge: (y) => y * 10,
    lifeExpectancy: 8,
    stageDescriptions: {
      juvenile: '0 - 6 months (Kit growth)',
      adult: '6 months - 5 years (Adult rabbit)',
      senior: '5+ years (Senior rabbit)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 6 meses (Crecimiento de gazapo)',
      adult: '6 meses - 5 años (Conejo adulto)',
      senior: '5+ años (Conejo sénior)'
    },
    source: 'Veterinary Care Manual',
    isHumanAgeSupported: true
  },

  // --- GROUP A: SMALL MAMMALS (CHRONOLOGICAL ONLY) ---
  {
    id: 'guinea-pig',
    name: 'Guinea Pig',
    nameEs: 'Cobaya',
    scientific: 'Cavia porcellus',
    group: 'Small Mammals',
    lifeExpectancy: 7,
    stageDescriptions: {
      juvenile: '0 - 2 months (Kit development)',
      adult: '2 months - 4 years (Prime adult)',
      senior: '4+ years (Senior guinea pig)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 2 meses (Desarrollo juvenil)',
      adult: '2 meses - 4 años (Adulto pleno)',
      senior: '4+ años (Cobaya sénior)'
    },
    source: 'Merck Veterinary Manual & Small Mammal Care Standards',
    isHumanAgeSupported: false
  },
  {
    id: 'ferret',
    name: 'Ferret',
    nameEs: 'Hurón',
    scientific: 'Mustela putorius furo',
    group: 'Small Mammals',
    lifeExpectancy: 8,
    stageDescriptions: {
      juvenile: '0 - 6 months (Kit growth)',
      adult: '6 months - 4 years (Adult ferret)',
      senior: '4+ years (Senior ferret care)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 6 meses (Crecimiento de cría)',
      adult: '6 meses - 4 años (Hurón adulto)',
      senior: '4+ años (Cuidado de hurón sénior)'
    },
    source: 'Ferret Medical Medicine & Surgery Reference',
    isHumanAgeSupported: false
  },
  {
    id: 'syrian-hamster',
    name: 'Syrian Hamster',
    nameEs: 'Hámster sirio',
    scientific: 'Mesocricetus auratus',
    group: 'Small Mammals',
    lifeExpectancy: 2.5,
    stageDescriptions: {
      juvenile: '0 - 1.5 months (Pup & weaning)',
      adult: '1.5 months - 1.5 years (Adult)',
      senior: '1.5+ years (Senior hamster)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 1.5 meses (Cría y destete)',
      adult: '1.5 meses - 1.5 años (Adulto)',
      senior: '1.5+ años (Hámster sénior)'
    },
    source: 'Laboratory Animal Science & Veterinary Guidance',
    isHumanAgeSupported: false
  },
  {
    id: 'chinchilla',
    name: 'Chinchilla',
    nameEs: 'Chinchilla',
    scientific: 'Chinchilla lanigera',
    group: 'Small Mammals',
    lifeExpectancy: 15,
    stageDescriptions: {
      juvenile: '0 - 8 months (Kit development)',
      adult: '8 months - 8 years (Adult)',
      senior: '8+ years (Senior chinchilla)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 8 meses (Desarrollo de cría)',
      adult: '8 meses - 8 años (Adulto)',
      senior: '8+ años (Chinchilla sénior)'
    },
    source: 'Exotic Pet Veterinary Manual',
    isHumanAgeSupported: false
  },
  {
    id: 'domestic-rat',
    name: 'Domestic Rat',
    nameEs: 'Rata doméstica',
    scientific: 'Rattus norvegicus',
    group: 'Small Mammals',
    lifeExpectancy: 2.5,
    stageDescriptions: {
      juvenile: '0 - 6 weeks (Weanling)',
      adult: '6 weeks - 1.5 years (Adult)',
      senior: '1.5+ years (Senior rat)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 6 semanas (Destete)',
      adult: '6 semanas - 1.5 años (Adulta)',
      senior: '1.5+ años (Rata sénior)'
    },
    source: 'Laboratory Animal Medicine Reference',
    isHumanAgeSupported: false
  },

  // --- GROUP B: FARM ANIMALS (CHRONOLOGICAL ONLY) ---
  {
    id: 'sheep',
    name: 'Sheep',
    nameEs: 'Oveja',
    scientific: 'Ovis aries',
    group: 'Farm Animals',
    lifeExpectancy: 12,
    stageDescriptions: {
      juvenile: '0 - 6 months (Lamb)',
      adult: '6 months - 7 years (Adult ewe/ram)',
      senior: '7+ years (Aged sheep)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 6 meses (Cordero)',
      adult: '6 meses - 7 años (Oveja/carnero adulto)',
      senior: '7+ años (Ovino mayor)'
    },
    source: 'Agricultural Extension & Livestock Veterinary Guide',
    isHumanAgeSupported: false
  },
  {
    id: 'domestic-goat',
    name: 'Domestic Goat',
    nameEs: 'Cabra doméstica',
    scientific: 'Capra hircus',
    group: 'Farm Animals',
    lifeExpectancy: 16,
    stageDescriptions: {
      juvenile: '0 - 6 months (Kid)',
      adult: '6 months - 8 years (Adult dairy/meat goat)',
      senior: '8+ years (Senior goat)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 6 meses (Cabrito)',
      adult: '6 meses - 8 años (Cabra adulta)',
      senior: '8+ años (Cabra sénior)'
    },
    source: 'Goat Veterinary Medicine & Management',
    isHumanAgeSupported: false
  },
  {
    id: 'domestic-pig',
    name: 'Domestic Pig',
    nameEs: 'Cerdo doméstico',
    scientific: 'Sus scrofa domesticus',
    group: 'Farm Animals',
    lifeExpectancy: 15,
    stageDescriptions: {
      juvenile: '0 - 6 months (Piglet/weanling)',
      adult: '6 months - 8 years (Adult swine)',
      senior: '8+ years (Senior swine)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 6 meses (Lechón/destete)',
      adult: '6 meses - 8 años (Porcino adulto)',
      senior: '8+ años (Porcino mayor)'
    },
    source: 'Swine Production & Veterinary Reference',
    isHumanAgeSupported: false
  },
  {
    id: 'donkey',
    name: 'Donkey',
    nameEs: 'Burro / Asno',
    scientific: 'Equus asinus',
    group: 'Farm Animals',
    lifeExpectancy: 32,
    stageDescriptions: {
      juvenile: '0 - 2 years (Foal/yearling)',
      adult: '2 - 20 years (Adult donkey)',
      senior: '20+ years (Senior donkey care)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 2 años (Pollino/añojo)',
      adult: '2 - 20 años (Asno adulto)',
      senior: '20+ años (Cuidado de asno sénior)'
    },
    source: 'The Donkey Sanctuary Veterinary Handbook',
    isHumanAgeSupported: false
  },
  {
    id: 'llama',
    name: 'Llama',
    nameEs: 'Llama',
    scientific: 'Lama glama',
    group: 'Farm Animals',
    lifeExpectancy: 20,
    stageDescriptions: {
      juvenile: '0 - 12 months (Cria)',
      adult: '1 - 12 years (Adult camelid)',
      senior: '12+ years (Senior llama)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 12 meses (Cría)',
      adult: '1 - 12 años (Camélido adulto)',
      senior: '12+ años (Llama sénior)'
    },
    source: 'Camelid Veterinary Practice Standards',
    isHumanAgeSupported: false
  },

  // --- GROUP C: BIRDS (CHRONOLOGICAL ONLY) ---
  {
    id: 'domestic-chicken',
    name: 'Domestic Chicken',
    nameEs: 'Gallina doméstica',
    scientific: 'Gallus gallus domesticus',
    group: 'Birds',
    lifeExpectancy: 8,
    stageDescriptions: {
      juvenile: '0 - 5 months (Chick/pullet)',
      adult: '5 months - 5 years (Layer/rooster prime)',
      senior: '5+ years (Senior poultry)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 5 meses (Pollito/pollona)',
      adult: '5 meses - 5 años (Etapa adulta plena)',
      senior: '5+ años (Ave mayor)'
    },
    source: 'Avian Veterinary Medicine & Poultry Science',
    isHumanAgeSupported: false
  },
  {
    id: 'domestic-duck',
    name: 'Domestic Duck',
    nameEs: 'Pato doméstico',
    scientific: 'Anas platyrhynchos domesticus',
    group: 'Birds',
    lifeExpectancy: 12,
    stageDescriptions: {
      juvenile: '0 - 6 months (Duckling)',
      adult: '6 months - 7 years (Adult duck)',
      senior: '7+ years (Senior waterfowl)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 6 meses (Patito)',
      adult: '6 meses - 7 años (Pato adulto)',
      senior: '7+ años (Ave acuática mayor)'
    },
    source: 'Waterfowl Veterinary Care Reference',
    isHumanAgeSupported: false
  },
  {
    id: 'domestic-goose',
    name: 'Domestic Goose',
    nameEs: 'Ganso doméstico',
    scientific: 'Anser anser domesticus',
    group: 'Birds',
    lifeExpectancy: 15,
    stageDescriptions: {
      juvenile: '0 - 12 months (Gosling)',
      adult: '1 - 10 years (Adult goose)',
      senior: '10+ years (Senior goose)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 12 meses (Ánsar joven)',
      adult: '1 - 10 años (Ganso adulto)',
      senior: '10+ años (Ganso mayor)'
    },
    source: 'Avian Practice & Waterfowl Manual',
    isHumanAgeSupported: false
  },
  {
    id: 'domestic-turkey',
    name: 'Domestic Turkey',
    nameEs: 'Pavo doméstico',
    scientific: 'Meleagris gallopavo',
    group: 'Birds',
    lifeExpectancy: 7,
    stageDescriptions: {
      juvenile: '0 - 6 months (Poult)',
      adult: '6 months - 5 years (Adult turkey)',
      senior: '5+ years (Senior turkey)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 6 meses (Pavipollo)',
      adult: '6 meses - 5 años (Pavo adulto)',
      senior: '5+ años (Pavo mayor)'
    },
    source: 'Poultry Science & Avian Health',
    isHumanAgeSupported: false
  },
  {
    id: 'rock-pigeon',
    name: 'Rock Pigeon',
    nameEs: 'Paloma doméstica',
    scientific: 'Columba livia domestica',
    group: 'Birds',
    lifeExpectancy: 12,
    stageDescriptions: {
      juvenile: '0 - 6 months (Squab/juvenile)',
      adult: '6 months - 8 years (Adult pigeon)',
      senior: '8+ years (Senior pigeon)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 6 meses (Pichón/juvenil)',
      adult: '6 meses - 8 años (Paloma adulta)',
      senior: '8+ años (Paloma mayor)'
    },
    source: 'Avian Medicine & Pigeon Health Handbook',
    isHumanAgeSupported: false
  },

  // --- GROUP D: REPTILES (CHRONOLOGICAL ONLY) ---
  {
    id: 'greek-tortoise',
    name: 'Greek Tortoise',
    nameEs: 'Tortuga mora',
    scientific: 'Testudo graeca',
    group: 'Reptiles',
    lifeExpectancy: 75,
    stageDescriptions: {
      juvenile: '0 - 10 years (Hatchling & subadult)',
      adult: '10 - 50 years (Adult tortoise)',
      senior: '50+ years (Geriatric tortoise)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 10 años (Cría y subadulto)',
      adult: '10 - 50 años (Tortuga adulta)',
      senior: '50+ años (Tortuga geriátrica)'
    },
    source: 'Reptile & Amphibian Veterinary Medicine',
    isHumanAgeSupported: false
  },
  {
    id: 'red-eared-slider',
    name: 'Red-eared Slider',
    nameEs: 'Tortuga de orejas rojas',
    scientific: 'Trachemys scripta elegans',
    group: 'Reptiles',
    lifeExpectancy: 30,
    stageDescriptions: {
      juvenile: '0 - 5 years (Juvenile turtle)',
      adult: '5 - 20 years (Adult aquatic turtle)',
      senior: '20+ years (Senior turtle)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 5 años (Tortuga juvenil)',
      adult: '5 - 20 años (Tortuga acuática adulta)',
      senior: '20+ años (Tortuga sénior)'
    },
    source: 'Chelonian Research & Veterinary Care',
    isHumanAgeSupported: false
  },
  {
    id: 'ball-python',
    name: 'Ball Python',
    nameEs: 'Pitón bola',
    scientific: 'Python regius',
    group: 'Reptiles',
    lifeExpectancy: 25,
    stageDescriptions: {
      juvenile: '0 - 3 years (Hatchling & growing snake)',
      adult: '3 - 15 years (Adult python)',
      senior: '15+ years (Senior snake)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 3 años (Cría y crecimiento)',
      adult: '3 - 15 años (Pitón adulta)',
      senior: '15+ años (Serpiente sénior)'
    },
    source: 'Herpetological Veterinary Medicine',
    isHumanAgeSupported: false
  },
  {
    id: 'bearded-dragon',
    name: 'Bearded Dragon',
    nameEs: 'Dragón barbudo',
    scientific: 'Pogona vitticeps',
    group: 'Reptiles',
    lifeExpectancy: 12,
    stageDescriptions: {
      juvenile: '0 - 18 months (Juvenile lizard)',
      adult: '1.5 - 7 years (Adult dragon)',
      senior: '7+ years (Senior agamid lizard)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 18 meses (Lagarto juvenil)',
      adult: '1.5 - 7 años (Dragón adulto)',
      senior: '7+ años (Agámido sénior)'
    },
    source: 'Reptile Medicine and Surgery Reference',
    isHumanAgeSupported: false
  },
  {
    id: 'green-iguana',
    name: 'Green Iguana',
    nameEs: 'Iguana verde',
    scientific: 'Iguana iguana',
    group: 'Reptiles',
    lifeExpectancy: 18,
    stageDescriptions: {
      juvenile: '0 - 2 years (Juvenile iguana)',
      adult: '2 - 10 years (Adult arboreal iguana)',
      senior: '10+ years (Senior iguana)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 2 años (Iguana juvenil)',
      adult: '2 - 10 años (Iguana arbórea adulta)',
      senior: '10+ años (Iguana sénior)'
    },
    source: 'Iguana Care & Herp Veterinary Standards',
    isHumanAgeSupported: false
  },

  // --- GROUP E: AQUATIC ANIMALS (CHRONOLOGICAL ONLY) ---
  {
    id: 'goldfish',
    name: 'Goldfish',
    nameEs: 'Pez dorado (Goldfish)',
    scientific: 'Carassius auratus',
    group: 'Aquatic Animals',
    lifeExpectancy: 12,
    stageDescriptions: {
      juvenile: '0 - 1 year (Fry & juvenile)',
      adult: '1 - 8 years (Prime adult fish)',
      senior: '8+ years (Senior goldfish)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 1 año (Alevín y juvenil)',
      adult: '1 - 8 años (Pez adulto pleno)',
      senior: '8+ años (Pez dorado sénior)'
    },
    source: 'Ornamental Fish Veterinary Medicine',
    isHumanAgeSupported: false
  },
  {
    id: 'koi-carp',
    name: 'Koi Carp',
    nameEs: 'Carpa Koi',
    scientific: 'Cyprinus carpio',
    group: 'Aquatic Animals',
    lifeExpectancy: 30,
    stageDescriptions: {
      juvenile: '0 - 3 years (Young koi)',
      adult: '3 - 20 years (Adult pond koi)',
      senior: '20+ years (Aged koi)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 3 años (Koi joven)',
      adult: '3 - 20 años (Koi adulto de estanque)',
      senior: '20+ años (Koi mayor)'
    },
    source: 'Aquatic Veterinary Association & Koi Health',
    isHumanAgeSupported: false
  },
  {
    id: 'betta-fish',
    name: 'Betta Fish',
    nameEs: 'Pez Betta',
    scientific: 'Betta splendens',
    group: 'Aquatic Animals',
    lifeExpectancy: 3,
    stageDescriptions: {
      juvenile: '0 - 3 months (Fry & juvenile)',
      adult: '3 months - 2 years (Adult labyrinth fish)',
      senior: '2+ years (Senior betta)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 3 meses (Alevín y juvenil)',
      adult: '3 meses - 2 años (Pez adulto)',
      senior: '2+ años (Betta sénior)'
    },
    source: 'Anabantoid Care & Fish Health Reference',
    isHumanAgeSupported: false
  },
  {
    id: 'zebrafish',
    name: 'Zebrafish',
    nameEs: 'Pez cebra',
    scientific: 'Danio rerio',
    group: 'Aquatic Animals',
    lifeExpectancy: 3,
    stageDescriptions: {
      juvenile: '0 - 3 months (Larva & juvenile)',
      adult: '3 months - 2 years (Adult teleost)',
      senior: '2+ years (Senior zebrafish)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 3 meses (Larva y juvenil)',
      adult: '3 meses - 2 años (Teleósteo adulto)',
      senior: '2+ años (Pez cebra sénior)'
    },
    source: 'Zebrafish Biology and Veterinary Science',
    isHumanAgeSupported: false
  },
  {
    id: 'rainbow-trout',
    name: 'Rainbow Trout',
    nameEs: 'Trucha arcoíris',
    scientific: 'Oncorhynchus mykiss',
    group: 'Aquatic Animals',
    lifeExpectancy: 5,
    stageDescriptions: {
      juvenile: '0 - 2 years (Fingerling & parr)',
      adult: '2 - 4 years (Adult salmonid)',
      senior: '4+ years (Aged trout)'
    },
    stageDescriptionsEs: {
      juvenile: '0 - 2 años (Alevín y juvenil)',
      adult: '2 - 4 años (Salmónido adulto)',
      senior: '4+ años (Trucha mayor)'
    },
    source: 'Aquaculture & Fisheries Veterinary Manual',
    isHumanAgeSupported: false
  }
];

const DEFAULTS = {
  speciesId: 'dog',
  years: '3',
  months: '0'
};

export default function AnimalAgeCalculator() {
  const { language } = useTranslation();
  const isEs = language === 'es';

  const [selectedSpeciesId, setSpeciesId] = useState<string>(DEFAULTS.speciesId);
  const [yearsStr, setYearsStr] = useState<string>(DEFAULTS.years);
  const [monthsStr, setMonthsStr] = useState<string>(DEFAULTS.months);

  const speciesSelectId = useId();
  const yearsInputId = useId();
  const monthsInputId = useId();

  const handleReset = () => {
    setSpeciesId(DEFAULTS.speciesId);
    setYearsStr(DEFAULTS.years);
    setMonthsStr(DEFAULTS.months);
  };

  const handleClear = () => {
    setYearsStr('');
    setMonthsStr('');
  };

  const species = AGE_SPECIES_DB.find((s) => s.id === selectedSpeciesId) || AGE_SPECIES_DB[0];
  const speciesDisplayName = isEs ? species.nameEs : species.name;

  const isEmpty = yearsStr.trim() === '' || monthsStr.trim() === '';
  const inputYears = Number(yearsStr);
  const inputMonths = Number(monthsStr);

  const errors: Record<string, string> = {};
  if (!isEmpty) {
    if (!Number.isFinite(inputYears) || inputYears < 0 || inputYears > 100) {
      errors.years = isEs
        ? 'La edad en años debe estar entre 0 y 100.'
        : 'Age in years must be between 0 and 100.';
    }
    if (!Number.isFinite(inputMonths) || inputMonths < 0 || inputMonths > 11) {
      errors.months = isEs
        ? 'Los meses adicionales deben estar entre 0 y 11.'
        : 'Additional months must be between 0 and 11.';
    }
  }
  const hasErrors = Object.keys(errors).length > 0;

  let totalYears = 0;
  let humanEquivalent: number | null = null;
  let lifeStage = '';
  let stageBadge = '';

  if (!isEmpty && !hasErrors) {
    totalYears = Math.max(0, inputYears + inputMonths / 12);
    humanEquivalent =
      species.isHumanAgeSupported && species.calcHumanAge
        ? Math.round(species.calcHumanAge(totalYears))
        : null;

    const descriptions = isEs ? species.stageDescriptionsEs : species.stageDescriptions;
    if (totalYears < species.lifeExpectancy * 0.15) {
      lifeStage = descriptions.juvenile;
      stageBadge = isEs ? 'Juvenil' : 'Juvenile';
    } else if (totalYears < species.lifeExpectancy * 0.65) {
      lifeStage = descriptions.adult;
      stageBadge = isEs ? 'Adulto' : 'Adult';
    } else {
      lifeStage = descriptions.senior;
      stageBadge = isEs ? 'Sénior' : 'Senior';
    }
  }

  const resultState: 'ready' | 'empty' | 'error' = hasErrors ? 'error' : isEmpty ? 'empty' : 'ready';

  const chronologicalFormatted = isEs
    ? `${inputYears} años ${inputMonths} meses`
    : `${inputYears} Years ${inputMonths} Months`;

  const copyText =
    humanEquivalent !== null
      ? isEs
        ? `Edad animal (${speciesDisplayName}) — Edad cronológica: ${chronologicalFormatted} | Edad equivalente humana: ${humanEquivalent} años humanos | Etapa vital: ${lifeStage}`
        : `Animal Age (${speciesDisplayName}) — Chronological Age: ${chronologicalFormatted} | Human-Equivalent Age: ${humanEquivalent} Human Years | Life Stage: ${lifeStage}`
      : isEs
      ? `Edad animal (${speciesDisplayName}) — Edad cronológica: ${chronologicalFormatted} | Solo edad cronológica | Etapa vital: ${lifeStage}`
      : `Animal Age (${speciesDisplayName}) — Chronological Age: ${chronologicalFormatted} | Chronological Age Only | Life Stage: ${lifeStage}`;

  return (
    <ToolSplitWorkspace
      inputs={
        <ToolInputPanel
          title={isEs ? 'Especie y edad del animal' : 'Species & Chronological Age'}
          subtitle={
            isEs
              ? 'Calcula la edad cronológica, etapa vital y modelos científicos de edad humana en 30 especies.'
              : 'Calculate chronological age, life stages, and scientific human-equivalent age models across 30 species.'
          }
          onReset={handleReset}
          onClear={handleClear}
          resetLabel={isEs ? 'Restablecer' : 'Reset'}
          clearLabel={isEs ? 'Limpiar' : 'Clear'}
        >
          <ToolFieldGroup
            label={isEs ? 'Seleccionar especie (30 disponibles)' : 'Select Species (30 Supported)'}
            htmlFor={speciesSelectId}
          >
            <select
              id={speciesSelectId}
              value={selectedSpeciesId}
              onChange={(e) => setSpeciesId(e.target.value)}
              className="ui-input"
            >
              {GROUPS.map((group) => (
                <optgroup key={group.key} label={isEs ? group.labelEs : group.labelEn}>
                  {AGE_SPECIES_DB.filter((s) => s.group === group.key).map((s) => (
                    <option key={s.id} value={s.id}>
                      {isEs ? s.nameEs : s.name} ({s.scientific})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </ToolFieldGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ToolFieldGroup
              label={isEs ? 'Edad (Años)' : 'Age (Years)'}
              htmlFor={yearsInputId}
              unit={isEs ? 'años' : 'yrs'}
              error={errors.years}
            >
              <input
                id={yearsInputId}
                type="number"
                min="0"
                max="100"
                step="1"
                value={yearsStr}
                onChange={(e) => setYearsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="3"
              />
            </ToolFieldGroup>

            <ToolFieldGroup
              label={isEs ? 'Meses adicionales' : 'Additional Months'}
              htmlFor={monthsInputId}
              unit={isEs ? 'meses' : 'mo'}
              error={errors.months}
            >
              <input
                id={monthsInputId}
                type="number"
                min="0"
                max="11"
                step="1"
                value={monthsStr}
                onChange={(e) => setMonthsStr(e.target.value)}
                className="ui-input font-mono tabular-nums"
                placeholder="0"
              />
            </ToolFieldGroup>
          </div>

          <div className="rounded-lg border border-border-subtle bg-surface-secondary/60 px-3.5 py-2.5 text-xs text-text-secondary space-y-1">
            <p className="font-semibold text-text-primary">
              {isEs ? 'Fuente científica y esperanza de vida' : 'Scientific Source & Lifespan Context'}
            </p>
            <p>
              <strong className="text-text-primary">
                {isEs ? 'Esperanza de vida típica:' : 'Typical Lifespan:'}
              </strong>{' '}
              ~{species.lifeExpectancy} {isEs ? 'años' : 'years'}
            </p>
            <p>
              <strong className="text-text-primary">{isEs ? 'Fuente:' : 'Source:'}</strong>{' '}
              {species.source}
            </p>
          </div>
        </ToolInputPanel>
      }
      results={
        <ToolResultsPanel
          title={isEs ? 'Resultados de conversión de edad' : 'Age Conversion Results'}
          state={resultState}
          primaryLabel={
            humanEquivalent !== null
              ? isEs
                ? 'Edad equivalente humana'
                : 'Human-Equivalent Age'
              : isEs
              ? 'Edad cronológica'
              : 'Chronological Age'
          }
          primaryValue={humanEquivalent !== null ? `${humanEquivalent}` : chronologicalFormatted}
          primaryUnit={
            humanEquivalent !== null ? (isEs ? 'años humanos' : 'Human Years') : undefined
          }
          primarySubtext={`${speciesDisplayName} (${species.scientific})`}
          statusLabel={stageBadge}
          statusTone={
            stageBadge === 'Senior' || stageBadge === 'Sénior' ? 'warning' : 'accent'
          }
          copyText={copyText}
          copyLabel={isEs ? 'Copiar resultado' : 'Copy result'}
          copiedLabel={isEs ? 'Copiado' : 'Copied'}
          emptyTitle={isEs ? 'Ingresa años y meses' : 'Enter age in years and months'}
          emptyDescription={
            isEs
              ? 'Selecciona una especie e ingresa la edad en años y meses adicionales para ver los resultados.'
              : 'Select a species and enter age in years and additional months to calculate life stage and age conversion.'
          }
          errorTitle={isEs ? 'Edad fuera de rango' : 'Invalid age inputs'}
          errorMessage={
            Object.values(errors)[0] ||
            (isEs
              ? 'Verifica que los años estén entre 0 y 100 y los meses entre 0 y 11.'
              : 'Ensure years are between 0 and 100 and months are between 0 and 11.')
          }
        >
          {humanEquivalent === null && (
            <div className="rounded-xl border border-status-warning/30 bg-status-warning/10 p-3.5 text-xs text-text-primary flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-status-warning shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold">
                  {isEs ? 'Solo edad cronológica' : 'Chronological Age Only'}
                </p>
                <p className="text-text-secondary">
                  {isEs
                    ? `No existe un modelo validado científicamente para convertir la edad humana de ${speciesDisplayName}. Se muestra la edad cronológica y etapa vital biológica.`
                    : `No scientifically validated human-age conversion model exists for ${speciesDisplayName}. Displaying chronological age and biological life stage.`}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ToolMetricTile
              label={isEs ? 'Edad cronológica' : 'Chronological Age'}
              value={chronologicalFormatted}
            />
            <ToolMetricTile
              label={isEs ? 'Esperanza de vida típica' : 'Typical Lifespan'}
              value={`~${species.lifeExpectancy} ${isEs ? 'años' : 'years'}`}
              accent
            />
          </div>

          <ToolBreakdownList
            items={[
              {
                label: isEs ? 'Especie' : 'Species',
                value: `${speciesDisplayName} (${species.scientific})`
              },
              {
                label: isEs ? 'Edad cronológica' : 'Chronological Age',
                value: chronologicalFormatted
              },
              ...(humanEquivalent !== null
                ? [
                    {
                      label: isEs ? 'Edad equivalente humana' : 'Human-Equivalent Age',
                      value: `${humanEquivalent} ${isEs ? 'años humanos' : 'Human Years'}`,
                      highlight: true
                    }
                  ]
                : []),
              {
                label: isEs ? 'Guía de etapa vital' : 'Life Stage Guidance',
                value: lifeStage
              }
            ]}
          />
        </ToolResultsPanel>
      }
    />
  );
}
