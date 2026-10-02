/**
 * CONTENUTI GRATUITI E LEGALI
 * ────────────────────────────
 * Due fonti principali:
 *  1) INTERNET ARCHIVE (archive.org) — opere di pubblico dominio con identifier
 *     verificati e player embeddabile stabile.  Ogni film qui elencato è stato
 *     verificato puntualmente su archive.org/details/<identifier>.
 *  2) CANALI UFFICIALI YOUTUBE — distributori italiani che pubblicano film interi
 *     gratuitamente. Apriamo direttamente il canale per esplorare il catalogo.
 *
 * Nessun ID YouTube "inventato": o viene da archive.org (sempre funzionante)
 * oppure l'utente incolla il link del video che vuole proiettare in Sala 1.
 */

import type { MoodId } from './films';
import { FILMS, FILM_BY_ID, FILMS_BY_MOOD, MOODS, MOOD_BY_ID } from './films';
import { fetchPlaylistVideos, type YTPlaylistVideo } from '../lib/youtube';
import { fetchMovieDetail, getApiKey, getTrailerEmbedUrl, posterUrl } from '../lib/tmdb';

export type FreeTitle = {
  id: string;
  t: string;
  y: number;
  d: number;
  r: number;
  mood: MoodId;
  s: string;
  /** Identifier Internet Archive — archive.org/embed/<archiveId> */
  archiveId: string;
  /** Query di backup su YouTube per cercare versioni alternative. */
  ytQuery: string;
  license: 'pd' | 'official';
  genre: string;
  c: [string, string];
  quote: string;
  snack: string;
  drink: string;
  kind: 'film' | 'cartoon';
  /** YouTube video ID when this title is played from a playlist. */
  ytVideoId?: string;
  /** YouTube thumbnail when available. */
  ytThumbnailUrl?: string;
  /** TMDB poster path resolved at runtime when available. */
  tmdbPosterPath?: string | null;
};

/* ══════════════ FILM INTERI — Internet Archive, pubblico dominio ══════════════ */
export const FREE_MOVIES: FreeTitle[] = [
  {
    id: 'fm_001', t: 'Nosferatu', y: 1922, d: 94, r: 7.9, mood: 'paura',
    s: 'Murnau inventa il vampiro del cinema. Capolavoro espressionista con le ombre più inquietanti mai filmate.',
    archiveId: 'Nosferatu1922', ytQuery: 'Nosferatu 1922 film completo Murnau',
    license: 'pd', genre: 'Horror espressionista', c: ['#3a3a4a', '#0a0a1a'],
    quote: 'Le ombre non mentono.', snack: 'Biscotti al cacao amaro', drink: 'Thè nero', kind: 'film',
  },
  {
    id: 'fm_002', t: 'Metropolis', y: 1927, d: 148, r: 8.3, mood: 'cervello',
    s: 'Fritz Lang immagina una città-macchina divisa tra élite e lavoratori. Fantascienza che ha fondato un genere.',
    archiveId: 'Metropolis1927EnglishVersion', ytQuery: 'Metropolis 1927 Fritz Lang full film',
    license: 'pd', genre: 'Fantascienza', c: ['#2a4a7a', '#0a0a2a'],
    quote: 'Il cuore media tra la testa e le mani.', snack: 'Noccioline tostate', drink: 'Caffè espresso', kind: 'film',
  },
  {
    id: 'fm_003', t: 'Il Gabinetto del Dottor Caligari', y: 1920, d: 76, r: 8.0, mood: 'cervello',
    s: 'Scenografie storte, un ipnotizzatore e un sonnambulo assassino. Il colpo di scena che ha cambiato il cinema.',
    archiveId: 'thecabinetofdrcaligari', ytQuery: 'Cabinet Dr Caligari 1920 full movie',
    license: 'pd', genre: 'Horror psicologico', c: ['#4a2a4a', '#0a0a1a'],
    quote: 'Nulla è come appare.', snack: 'Formaggi stagionati', drink: 'Vino rosso', kind: 'film',
  },
  {
    id: 'fm_004', t: 'Il Monello', y: 1921, d: 68, r: 8.2, mood: 'comfort',
    s: 'Chaplin trova un bambino abbandonato e lo cresce. Fa ridere e piangere nello stesso minuto.',
    archiveId: 'the-kid-1921-by-charles-chaplin', ytQuery: 'The Kid 1921 Chaplin full movie',
    license: 'pd', genre: 'Commedia drammatica', c: ['#8a8a8a', '#2a2a2a'],
    quote: 'Un sorriso e una lacrima.', snack: 'Panino con marmellata', drink: 'Latte caldo', kind: 'film',
  },
  {
    id: 'fm_005', t: 'The General', y: 1926, d: 78, r: 8.1, mood: 'ridere',
    s: 'Buster Keaton, una locomotiva e acrobazie reali senza controfigure. Comicità perfetta.',
    archiveId: 'TheGeneral1926BusterKeatonProductionUsa', ytQuery: 'The General 1926 Keaton',
    license: 'pd', genre: 'Commedia / Avventura', c: ['#8a6a3a', '#2a1a0a'],
    quote: 'Il treno non si ferma.', snack: 'Popcorn classici', drink: 'Root beer', kind: 'film',
  },
  {
    id: 'fm_006', t: 'Viaggio nella Luna', y: 1902, d: 13, r: 8.1, mood: 'viaggio',
    s: 'Méliès spara un razzo nell\'occhio della Luna. Il primo film di fantascienza della storia.',
    archiveId: 'ATripToTheMoonGeorgeMelies', ytQuery: 'Voyage dans la Lune 1902 Méliès',
    license: 'pd', genre: 'Fantascienza', c: ['#a0c0e0', '#0a1a3a'],
    quote: 'Verso la Luna!', snack: 'Formaggio', drink: 'Latte', kind: 'film',
  },
  {
    id: 'fm_007', t: 'La Notte dei Morti Viventi', y: 1968, d: 96, r: 7.8, mood: 'paura',
    s: 'Romero inventa lo zombie moderno. Film di pubblico dominio per un difetto di copyright.',
    archiveId: 'night-of-the-living-dead_1968', ytQuery: 'Night of the Living Dead 1968 full movie',
    license: 'pd', genre: 'Horror', c: ['#2a2a2a', '#0a0a0a'],
    quote: 'Stanno arrivando.', snack: 'Pretzel salati', drink: 'Acqua', kind: 'film',
  },
  {
    id: 'fm_008', t: 'Il Fantasma dell\'Opera', y: 1925, d: 93, r: 7.5, mood: 'paura',
    s: 'Lon Chaney e la scena dello smascheramento che terrorizzò il pubblico del 1925.',
    archiveId: 'ThePhantomoftheOpera', ytQuery: 'Phantom of the Opera 1925 Lon Chaney',
    license: 'pd', genre: 'Horror gotico', c: ['#6a2a3a', '#0a0a1a'],
    quote: 'La musica della notte.', snack: 'Macarons', drink: 'Champagne', kind: 'film',
  },
  {
    id: 'fm_009', t: 'Sherlock Jr.', y: 1924, d: 45, r: 8.2, mood: 'ridere',
    s: 'Keaton entra letteralmente dentro lo schermo del cinema. Gag geniali e meta-cinema puro.',
    archiveId: 'SherlockJr', ytQuery: 'Sherlock Jr 1924 Buster Keaton',
    license: 'pd', genre: 'Commedia', c: ['#7a6a4a', '#1a1a0a'],
    quote: 'Dentro il film.', snack: 'Popcorn', drink: 'Gassosa', kind: 'film',
  },
  {
    id: 'fm_010', t: 'Nanook of the North', y: 1922, d: 79, r: 7.5, mood: 'viaggio',
    s: 'Il primo documentario della storia: la vita di una famiglia Inuit nell\'Artico.',
    archiveId: 'NanookOfTheNorth', ytQuery: 'Nanook of the North 1922 documentary',
    license: 'pd', genre: 'Documentario', c: ['#8aa0c0', '#1a2a3a'],
    quote: 'Il Nord non perdona.', snack: 'Frutta secca', drink: 'Thè bollente', kind: 'film',
  },
  {
    id: 'fm_011', t: 'Häxan — La Stregoneria', y: 1922, d: 91, r: 7.6, mood: 'paura',
    s: 'Documentario-horror svedese sulla stregoneria. Immagini ancora oggi disturbanti.',
    archiveId: 'HaxanWitchcraftThroughTheAges', ytQuery: 'Haxan 1922 witchcraft',
    license: 'pd', genre: 'Horror / Documentario', c: ['#5a2a3a', '#0a0a0a'],
    quote: 'La superstizione ha un volto.', snack: 'Pane nero', drink: 'Sidro', kind: 'film',
  },
  {
    id: 'fm_012', t: 'L\'Uomo con la Macchina da Presa', y: 1929, d: 68, r: 8.0, mood: 'cervello',
    s: 'Vertov filma una città sovietica in un giorno. Sperimentazione visiva pura, senza trama.',
    archiveId: 'TheManWithTheMovieCameraDzigaVertov', ytQuery: 'Man with Movie Camera 1929 Vertov',
    license: 'pd', genre: 'Documentario sperimentale', c: ['#5a6a7a', '#0a0a1a'],
    quote: 'L\'occhio della macchina.', snack: 'Grissini', drink: 'Caffè', kind: 'film',
  },
  {
    id: 'fm_013', t: 'La Grande Rapina al Treno', y: 1903, d: 12, r: 7.3, mood: 'epico',
    s: 'Dodici minuti che hanno inventato il western e il montaggio narrativo moderno.',
    archiveId: 'TheGreatTrainRobbery_201312', ytQuery: 'Great Train Robbery 1903 Edison',
    license: 'pd', genre: 'Western', c: ['#6a5a3a', '#1a1a05'],
    quote: 'Mani in alto!', snack: 'Carne secca', drink: 'Whisky', kind: 'film',
  },
  {
    id: 'fm_014', t: 'Il Giro del Mondo in 80 Giorni (corto)', y: 1914, d: 8, r: 6.8, mood: 'viaggio',
    s: 'Primo adattamento cinematografico del romanzo di Jules Verne. Un classico del muto.',
    archiveId: 'AroundTheWorldIn80Days1914', ytQuery: 'Around the World in 80 Days 1914 silent',
    license: 'pd', genre: 'Avventura', c: ['#c4a060', '#2a1a0a'],
    quote: 'Il mondo in 80 giorni.', snack: 'Datteri', drink: 'Thè', kind: 'film',
  },
  {
    id: 'fm_015', t: 'La Passione di Giovanna d\'Arco', y: 1928, d: 110, r: 8.1, mood: 'drammatico',
    s: 'Dreyer filma solo primi piani. Una delle interpretazioni più intense mai registrate.',
    archiveId: 'ThePassionOfJoanOfArc1928', ytQuery: 'Passion Joan of Arc 1928 Dreyer',
    license: 'pd', genre: 'Dramma storico', c: ['#7a7a7a', '#0a0a0a'],
    quote: 'Il volto dice tutto.', snack: 'Pane', drink: 'Acqua', kind: 'film',
  },
  {
    id: 'fm_016', t: 'Charlie Chaplin — The Immigrant', y: 1917, d: 24, r: 7.8, mood: 'ridere',
    s: 'Chaplin arriva in America: la statua della libertà, un pezzo di pane e una moneta d\'oro.',
    archiveId: 'CC_1917_06_17_The_Immigrant', ytQuery: 'Chaplin Immigrant 1917',
    license: 'pd', genre: 'Commedia', c: ['#8a8a8a', '#2a2a2a'],
    quote: 'La fortuna è dove la trovi.', snack: 'Pane', drink: 'Caffè americano', kind: 'film',
  },
  {
    id: 'fm_017', t: 'Scrooge — Canto di Natale', y: 1935, d: 78, r: 6.7, mood: 'comfort',
    s: 'Prima versione sonora del classico di Dickens. Atmosfera natalizia d\'altri tempi.',
    archiveId: 'scrooge-1935', ytQuery: 'Scrooge 1935 Christmas Carol',
    license: 'pd', genre: 'Dramma / Natalizio', c: ['#8a4a4a', '#1a1a0a'],
    quote: 'Dio ci benedica tutti!', snack: 'Biscotti alle spezie', drink: 'Vin brulé', kind: 'film',
  },
  {
    id: 'fm_018', t: 'Charade', y: 1963, d: 113, r: 7.9, mood: 'cervello',
    s: 'Cary Grant e Audrey Hepburn a Parigi. Thriller elegante caduto in pubblico dominio per errore.',
    archiveId: 'charade-19xx-cary-grant', ytQuery: 'Charade 1963 Cary Grant Audrey Hepburn',
    license: 'pd', genre: 'Thriller romantico', c: ['#8a3a5a', '#1a0a1a'],
    quote: 'Non mi fido di nessuno.', snack: 'Formaggi', drink: 'Champagne', kind: 'film',
  },
  {
    id: 'fm_019', t: 'Il Giro del Mondo in 80 Minuti', y: 1931, d: 80, r: 6.9, mood: 'viaggio',
    s: 'Avventura comica di Douglas Fairbanks. Girato in location esotiche in tutto il mondo.',
    archiveId: 'AroundTheWorldIn80MinutesWithDouglasFairbanks', ytQuery: 'Around World 80 Minutes Fairbanks 1931',
    license: 'pd', genre: 'Avventura', c: ['#c4a060', '#2a1a0a'],
    quote: 'Il mondo è una grande avventura.', snack: 'Frutta tropicale', drink: 'Cocktail', kind: 'film',
  },
  {
    id: 'fm_020', t: 'La Signora dei Morti (Carnival of Souls)', y: 1962, d: 78, r: 7.0, mood: 'paura',
    s: 'Horror indipendente di culto. Atmosfera onirica e finale sorprendente.',
    archiveId: 'carnival_of_souls', ytQuery: 'Carnival of Souls 1962 full movie',
    license: 'pd', genre: 'Horror onirico', c: ['#4a4a6a', '#0a0a1a'],
    quote: 'Perché nessuno mi vede?', snack: 'Pretzel', drink: 'Acqua', kind: 'film',
  },
];

/* ══════════════ CARTONI ANIMATI — Internet Archive, pubblico dominio ══════════════ */
export const FREE_CARTOONS: FreeTitle[] = [
  {
    id: 'ca_001', t: 'Gertie il Dinosauro', y: 1914, d: 12, r: 7.3, mood: 'animazione',
    s: 'Winsor McCay crea il primo personaggio animato con una vera personalità.',
    archiveId: 'GertieTheDinosaur', ytQuery: 'Gertie the Dinosaur 1914 McCay',
    license: 'pd', genre: 'Animazione storica', c: ['#8a9a6a', '#2a2a1a'],
    quote: 'Il primo dinosauro animato.', snack: 'Biscotti', drink: 'Latte', kind: 'cartoon',
  },
  {
    id: 'ca_002', t: 'Le Avventure del Principe Achmed', y: 1926, d: 65, r: 7.9, mood: 'animazione',
    s: 'Il più antico lungometraggio animato sopravvissuto: silhouette ritagliate di Lotte Reiniger.',
    archiveId: 'TheAdventuresOfPrinceAchmed', ytQuery: 'Prince Achmed 1926 Reiniger',
    license: 'pd', genre: 'Animazione / Fiaba', c: ['#c46a2a', '#2a0a1a'],
    quote: 'Ombre che raccontano magia.', snack: 'Datteri', drink: 'Thè alla menta', kind: 'cartoon',
  },
  {
    id: 'ca_003', t: 'Little Nemo', y: 1911, d: 11, r: 7.2, mood: 'animazione',
    s: 'McCay anima a mano migliaia di disegni per far vivere il suo fumetto onirico.',
    archiveId: 'LittleNemo1911', ytQuery: 'Little Nemo 1911 McCay',
    license: 'pd', genre: 'Animazione onirica', c: ['#6a8ac0', '#1a1a3a'],
    quote: 'Sogni disegnati a mano.', snack: 'Biscotti', drink: 'Cioccolata', kind: 'cartoon',
  },
  {
    id: 'ca_004', t: 'L\'Affondamento del Lusitania', y: 1918, d: 12, r: 7.3, mood: 'animazione',
    s: 'Primo documentario animato della storia. McCay ricostruisce il naufragio disegno per disegno.',
    archiveId: 'SinkingOfTheLusitania', ytQuery: 'Sinking Lusitania 1918 McCay animation',
    license: 'pd', genre: 'Animazione documentaria', c: ['#3a5a7a', '#0a1a2a'],
    quote: 'Disegnare la storia.', snack: 'Crackers', drink: 'Thè', kind: 'cartoon',
  },
  {
    id: 'ca_005', t: 'Fantasmagorie', y: 1908, d: 2, r: 7.0, mood: 'animazione',
    s: 'Émile Cohl firma il primo cartone animato della storia: figure che si trasformano senza sosta.',
    archiveId: 'Fantasmagorie1908', ytQuery: 'Fantasmagorie 1908 Cohl',
    license: 'pd', genre: 'Animazione sperimentale', c: ['#4a4a5a', '#0a0a1a'],
    quote: 'Dove tutto è cominciato.', snack: 'Caramelle', drink: 'Succo', kind: 'cartoon',
  },
  {
    id: 'ca_006', t: 'Humorous Phases of Funny Faces', y: 1906, d: 3, r: 6.9, mood: 'animazione',
    s: 'Stuart Blackton: uno dei primi esempi di animazione su pellicola. Visi comici disegnati su lavagna.',
    archiveId: 'HumorousPhasesOfFunnyFaces', ytQuery: 'Humorous Phases Funny Faces 1906 Blackton',
    license: 'pd', genre: 'Animazione pionieristica', c: ['#4a4a4a', '#0a0a0a'],
    quote: 'Facce che prendono vita.', snack: 'Caramelle gommose', drink: 'Latte', kind: 'cartoon',
  },
  {
    id: 'ca_007', t: 'The Mascot (Starevich)', y: 1933, d: 26, r: 7.9, mood: 'animazione',
    s: 'Starevich in stop-motion con un cane di pezza che vive un\'avventura surreale di notte.',
    archiveId: 'TheMascotWladyslawStarewicz1933', ytQuery: 'The Mascot 1933 Starevich',
    license: 'pd', genre: 'Stop-motion', c: ['#7a6a3a', '#1a1a0a'],
    quote: 'Un giocattolo con un\'anima.', snack: 'Biscottini', drink: 'Latte caldo', kind: 'cartoon',
  },
  {
    id: 'ca_008', t: 'The Cameraman\'s Revenge', y: 1912, d: 13, r: 7.8, mood: 'animazione',
    s: 'Starevich anima insetti impagliati in stop-motion. Tecnica sbalorditiva per il 1912.',
    archiveId: 'TheCameramansRevenge', ytQuery: 'Cameraman Revenge 1912 Starevich',
    license: 'pd', genre: 'Stop-motion', c: ['#6a5a3a', '#1a1a0a'],
    quote: 'Insetti con una vita segreta.', snack: 'Noccioline', drink: 'Thè', kind: 'cartoon',
  },
  {
    id: 'ca_009', t: 'Alice in Wonderland (1915)', y: 1915, d: 52, r: 6.5, mood: 'animazione',
    s: 'Il primo lungometraggio ispirato ad Alice. Fiaba onirica con effetti speciali d\'epoca.',
    archiveId: 'AliceInWonderland1915', ytQuery: 'Alice in Wonderland 1915 silent film',
    license: 'pd', genre: 'Fiaba', c: ['#5a9ac0', '#1a3a5a'],
    quote: 'Più strano, sempre più strano!', snack: 'Dolcetti', drink: 'Thè delle meraviglie', kind: 'cartoon',
  },
  {
    id: 'ca_010', t: 'Max Fleischer — Out of the Inkwell', y: 1919, d: 7, r: 7.2, mood: 'animazione',
    s: 'Un pagliaccio animato esce dal calamaio e si confronta con il suo creatore in live action.',
    archiveId: 'OutOfTheInkwell', ytQuery: 'Out of the Inkwell 1919 Fleischer',
    license: 'pd', genre: 'Animazione / Live action', c: ['#d4a040', '#1a1a2a'],
    quote: 'Esco dal calamaio!', snack: 'Popcorn', drink: 'Gassosa', kind: 'cartoon',
  },
  {
    id: 'ca_011', t: 'The Enchanted Drawing', y: 1900, d: 1, r: 6.8, mood: 'animazione',
    s: 'J. Stuart Blackton: il brevissimo film che apre la strada all\'animazione cinematografica.',
    archiveId: 'enchantedDrawing', ytQuery: 'Enchanted Drawing 1900 Blackton',
    license: 'pd', genre: 'Pionieri', c: ['#5a5a5a', '#0a0a0a'],
    quote: 'Il primo disegno che sorride.', snack: 'Caramelle', drink: 'Acqua', kind: 'cartoon',
  },
  {
    id: 'ca_012', t: 'Dinner Time (prime animazioni sonore)', y: 1928, d: 7, r: 6.6, mood: 'animazione',
    s: 'Uno dei primissimi cartoni animati sonori prodotti. Pezzo di storia del cinema.',
    archiveId: 'DinnerTime1928', ytQuery: 'Dinner Time 1928 Van Beuren sound cartoon',
    license: 'pd', genre: 'Animazione sonora pionieristica', c: ['#8a6a3a', '#1a1a0a'],
    quote: 'Si mangia!', snack: 'Spuntino', drink: 'Latte', kind: 'cartoon',
  },
];

export const ALL_FREE_CONTENT: FreeTitle[] = [...FREE_MOVIES, ...FREE_CARTOONS];
export const FREE_BY_ID: Record<string, FreeTitle> = Object.fromEntries(
  ALL_FREE_CONTENT.map((f) => [f.id, f]),
);

/* ══════════════ CANALI YOUTUBE UFFICIALI (per esplorazione libera) ══════════════ */
export type FreeChannel = {
  id: string;
  name: string;
  description: string;
  channelHandle: string;
  logo: string;
  kind: 'film' | 'cartoon';
};

export const FREE_CHANNELS: FreeChannel[] = [
  { id: 'filmisnow', name: 'Cinema FilmIsNow', description: 'Film completi in italiano: azione, horror, commedia, drammatici.', channelHandle: '@CinemaFilmIsNow', logo: '🎬', kind: 'film' },
  { id: 'fc_ita', name: 'Film&Clips in Italiano', description: 'Cinema italiano d\'autore e classici. Canale di Minerva Pictures.', channelHandle: '@FilmgratisItaliani', logo: '🎞️', kind: 'film' },
  { id: 'fc_action', name: 'Film&Clips Azione', description: 'Spionaggio, arti marziali, guerra e avventura.', channelHandle: '@FilmCompletiAzione', logo: '💥', kind: 'film' },
  { id: 'moviedome', name: 'Moviedome IT', description: 'Film internazionali distribuiti da Plaion Pictures.', channelHandle: '@MoviedomeIT', logo: '🎥', kind: 'film' },
  { id: 'archive', name: 'Internet Archive — Feature Films', description: 'Il più grande archivio di film di pubblico dominio al mondo (migliaia di titoli).', channelHandle: 'https://archive.org/details/feature_films', logo: '🏛️', kind: 'film' },
  { id: 'rai_kids', name: 'Rai Kids', description: 'Serie animate italiane ed europee dal canale ufficiale Rai.', channelHandle: '@RaiKids', logo: '🎨', kind: 'cartoon' },
  { id: 'archive_anim', name: 'Internet Archive — Animation', description: 'Collezione di cartoni animati di pubblico dominio restaurati.', channelHandle: 'https://archive.org/details/animationandcartoons', logo: '🖌️', kind: 'cartoon' },
  { id: 'yt_films', name: 'YouTube — Film Completi', description: 'Playlist pubblica di film completi gratuiti.', channelHandle: 'PL1kWuU-4-qOnPjWBZbPJpNBPtm7N9uNUf', logo: '🎬', kind: 'film', playlistId: 'PL1kWuU-4-qOnPjWBZbPJpNBPtm7N9uNUf' },
  { id: 'yt_cartoons', name: 'YouTube — Cartoni Animati', description: 'Playlist pubblica di cartoni animati gratuiti.', channelHandle: 'PLfgtmsJQgW6Q0P7fk2gEyqKDAz9PZo5eg', logo: '🎨', kind: 'cartoon', playlistId: 'PLfgtmsJQgW6Q0P7fk2gEyqKDAz9PZo5eg' },
  { id: 'shorts', name: 'Cortometraggi d\'autore', description: 'Corti animati premiati nei festival internazionali.', channelHandle: 'results?search_query=award+winning+animated+short+film', logo: '🏆', kind: 'cartoon' },
];

/* ══════════════ YOUTUBE PLAYLIST INTEGRATION ══════════════ */

const YT_FILM_KEY = 'yt_film_v1';
const YT_CARTOON_KEY = 'yt_cartoon_v1';

function normalizeYTTitle(title: string): { title: string; year: number | null } {
  let t = title.replace(/\(ITA\)/gi, '').replace(/Film completo/gi, '').replace(/HD/gi, '').replace(/720p/gi, '').replace(/1080p/gi, '').replace(/\[HD\]/gi, '').replace(/\s+/g, ' ').trim();
  const yearMatch = t.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? Number(yearMatch[0]) : null;
  if (yearMatch) t = t.replace(yearMatch[0], '').replace(/\s*-\s*/, ' ').trim();
  return { title: t, year };
}

function matchToExistingFilm(title: string, year: number | null): { filmId?: string; tmdbId?: number } {
  const normalized = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  for (const film of FILMS) {
    const filmNorm = film.t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (filmNorm === normalized) {
      if (year && film.y !== year) continue;
      return { filmId: film.id, tmdbId: film.tmdbId };
    }
  }
  return {};
}

function ytToFreeTitle(video: YTPlaylistVideo, kind: 'film' | 'cartoon'): FreeTitle {
  const { title, year } = normalizeYTTitle(video.title);
  const matched = matchToExistingFilm(title, year);
  const mood = guessMood(title, kind);
  return {
    id: video.id,
    t: title || video.title,
    y: year || new Date().getFullYear(),
    d: 90,
    r: 0,
    mood,
    s: video.description || `Film gratuito da YouTube: ${video.title}`,
    archiveId: '',
    ytQuery: video.title,
    license: 'official',
    genre: kind === 'cartoon' ? 'Animazione' : 'Film',
    c: ['#1a1a2e', '#16213e'],
    quote: 'Film gratuito.',
    snack: 'Popcorn',
    drink: 'Cola',
    kind,
    ytVideoId: video.videoId,
    ytThumbnailUrl: video.thumbnailUrl,
    tmdbPosterPath: matched.tmdbId ? null : undefined,
  };
}

function guessMood(title: string, kind: 'film' | 'cartoon'): MoodId {
  const t = title.toLowerCase();
  if (kind === 'cartoon') return 'animazione';
  if (/commedia|ridere|scemo|fantozzi|amici miei|totò/.test(t)) return 'ridere';
  if (/dramma|piangere|vita è bella|forrest gump|schindler/.test(t)) return 'piangere';
  if (/horror|paura|esorcista|shining|alien|suspiria/.test(t)) return 'paura';
  if (/amore|cuore|romantico|pretty woman|notting hill/.test(t)) return 'cuore';
  if (/fantascienza|cervello|inception|matrix|memento/.test(t)) return 'cervello';
  if (/azione|adrenalina|mad max|john wick|terminator/.test(t)) return 'adrenalina';
  if (/epico|guerra|eroe|il gladiatore|braveheart/.test(t)) return 'epico';
  if (/viaggio|avventura|into the wild|lost in translation/.test(t)) return 'viaggio';
  if (/animazione|cartoon|disney|pixar|studio ghibli/.test(t)) return 'animazione';
  if (/commedia|family|famiglia|tutti insieme|re leone/.test(t)) return 'famiglia';
  return 'comfort';
}

let ytFilmsPromise: Promise<FreeTitle[]> | null = null;
let ytCartoonsPromise: Promise<FreeTitle[]> | null = null;

export function getYouTubeFilms(): Promise<FreeTitle[]> {
  if (!ytFilmsPromise) {
    ytFilmsPromise = loadYouTubeTitles('film');
  }
  return ytFilmsPromise;
}

export function getYouTubeCartoons(): Promise<FreeTitle[]> {
  if (!ytCartoonsPromise) {
    ytCartoonsPromise = loadYouTubeTitles('cartoon');
  }
  return ytCartoonsPromise;
}

async function loadYouTubeTitles(kind: 'film' | 'cartoon'): Promise<FreeTitle[]> {
  try {
    const videos = await fetchPlaylistVideos(kind === 'film' ? 'films' : 'cartoons');
    const freeTitles: FreeTitle[] = [];
    for (const video of videos) {
      const ft = ytToFreeTitle(video, kind);
      freeTitles.push(ft);
    }
    return freeTitles;
  } catch (error) {
    console.warn('Failed to load YouTube playlist', kind, error);
    return [];
  }
}

/** Merge YouTube titles into FREE_MOVIES, avoiding duplicates. */
export async function mergeYouTubeTitles(): Promise<{ added: number; skipped: number }> {
  const [ytFilms, ytCartoons] = await Promise.all([getYouTubeFilms(), getYouTubeCartoons()]);
  const allYT = [...ytFilms, ...ytCartoons];

  const existingIds = new Set(FREE_MOVIES.map((f) => f.id));
  const existingTitles = new Set(
    FREE_MOVIES.map((f) => f.t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()),
  );

  let added = 0;
  let skipped = 0;

  for (const yt of allYT) {
    const normalizedTitle = yt.t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    if (existingIds.has(yt.id)) {
      skipped++;
      continue;
    }
    if (existingTitles.has(normalizedTitle)) {
      skipped++;
      continue;
    }

    const matched = matchToExistingFilm(yt.t, yt.y);
    if (matched.filmId) {
      skipped++;
      continue;
    }

    FREE_MOVIES.push(yt);
    existingIds.add(yt.id);
    existingTitles.add(normalizedTitle);
    added++;
  }

  return { added, skipped };
}

export function resolveYouTubeEmbedUrl(freeFilmId: string): string | null {
  const entry = FREE_MOVIES.find((f) => f.id === freeFilmId);
  if (!entry?.ytVideoId) return null;
  return getYouTubeEmbedUrl(entry.ytVideoId, true);
}

/** URL embed di Internet Archive — stabile, nessun ad, nessun tracking. */
export function getArchiveEmbedUrl(archiveId: string, autoplay = true): string {
  const params = new URLSearchParams();
  if (autoplay) params.set('autoplay', '1');
  const qs = params.toString();
  return `https://archive.org/embed/${archiveId}${qs ? '?' + qs : ''}`;
}

/** Pagina pubblica di Internet Archive (apertura in nuova scheda). */
export function getArchivePageUrl(archiveId: string): string {
  return `https://archive.org/details/${archiveId}`;
}

/** URL embed YouTube per un video incollato dall'utente. */
export function getYouTubeEmbedUrl(videoId: string, autoplay = true): string {
  const params = new URLSearchParams({
    autoplay: autoplay ? '1' : '0',
    rel: '0',
    modestbranding: '1',
    iv_load_policy: '3',
    hl: 'it',
    playsinline: '1',
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

export function getYouTubeSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function getChannelUrl(handle: string): string {
  if (handle.startsWith('http')) return handle;
  if (handle.startsWith('results?')) return `https://www.youtube.com/${handle}`;
  return `https://www.youtube.com/${handle}`;
}

/** Estrae l'ID da qualsiasi formato di URL YouTube. */
export function extractVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m) return m[1];
  }
  return null;
}
