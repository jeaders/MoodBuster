export type MoodId =
  | 'ridere'
  | 'piangere'
  | 'adrenalina'
  | 'paura'
  | 'cuore'
  | 'cervello'
  | 'comfort'
  | 'epico'
  | 'viaggio'
  | 'drammatico'
  | 'famiglia'
  | 'animazione';

export type Mood = {
  id: MoodId;
  nome: string;
  emoji: string;
  colore: string;
  colore2: string;
  claim: string;
};

export const MOODS: Mood[] = [
  { id: 'ridere', nome: 'DA RIDERE', emoji: '🤣', colore: '#f5b128', colore2: '#ff7a1a', claim: 'Solo risate, zero pensieri.' },
  { id: 'piangere', nome: 'DA PIANGERE', emoji: '😭', colore: '#4f8fd6', colore2: '#2e5ba8', claim: 'Fazzoletti inclusi.' },
  { id: 'adrenalina', nome: 'ADRENALINA', emoji: '🔥', colore: '#e5452f', colore2: '#a01010', claim: 'Esplosioni ed inseguimenti.' },
  { id: 'paura', nome: 'DA PAURA', emoji: '👻', colore: '#7b3bc9', colore2: '#2d1055', claim: 'Luci spente o non vale.' },
  { id: 'cuore', nome: 'CUORE', emoji: '💘', colore: '#e8578f', colore2: '#a02158', claim: 'Romanticume top quality.' },
  { id: 'cervello', nome: 'CERVELLO ACCESO', emoji: '🧠', colore: '#2fbf9e', colore2: '#0d6b63', claim: 'Da rivedere due volte.' },
  { id: 'comfort', nome: 'COMFORT MOVIE', emoji: '🛋️', colore: '#d98a3f', colore2: '#8c4a1d', claim: 'Divano e coperta.' },
  { id: 'epico', nome: 'EPICO', emoji: '⚔️', colore: '#4f6fd4', colore2: '#1c2a6b', claim: 'Tre ore ma volano.' },
  { id: 'viaggio', nome: 'VIAGGIO', emoji: '🌍', colore: '#2a9fd6', colore2: '#0d5e8c', claim: 'Parti senza muovere il divano.' },
  { id: 'drammatico', nome: 'DRAMMATICO', emoji: '🎭', colore: '#8b5a5a', colore2: '#3a1a1a', claim: 'Recitazione sublime.' },
  { id: 'famiglia', nome: 'TUTTI INSIEME', emoji: '👨‍👩‍👧‍👦', colore: '#e87a2a', colore2: '#8c4a1d', claim: 'Grandi e piccini.' },
  { id: 'animazione', nome: 'ANIMAZIONE', emoji: '🎨', colore: '#9d5bd4', colore2: '#4a1a7a', claim: 'Disegni che prendono vita.' },
];

export const MOOD_BY_ID: Record<MoodId, Mood> = Object.fromEntries(
  MOODS.map((m) => [m.id, m]),
) as Record<MoodId, Mood>;

export type Film = {
  id: string;
  t: string;
  y: number;
  d: number;
  r: number;
  mood: MoodId;
  s: string;
  c: [string, string];
  a: number;
  fmt: 'VHS' | 'DVD';
  quote: string;
  platforms: string[];
  snack: string;
  drink: string;
  tmdbId: number;
  isCustom?: boolean;
};

type Raw = [string, number, number, number, MoodId, string, string, string, string[], string, string, number];

const raw: Raw[] = [
  // ═══════════════ DA RIDERE (18) ═══════════════
  ['Il Grande Lebowski', 1998, 117, 8.1, 'ridere', 'Un tappeto rubato trascina il Dude in un sequestro surreale tra bowling e White Russian.', '#e0b43c', '#7a4418', ['Prime Video', 'Apple TV'], 'Il Dude sa aspettare.', 'White Russian', 115],
  ['Ricomincio da Capo', 1993, 101, 8.0, 'ridere', 'Un meteorologo cinico resta intrappolato nel giorno della marmotta, per sempre.', '#8fc6e8', '#2b5f91', ['Netflix'], 'E se non ci fosse un domani?', 'Caffè bollente', 14652],
  ['Una Pallottola Spuntata', 1988, 85, 7.6, 'ridere', 'L\'ispettore Drebin salva la Regina distruggendo tutto ciò che tocca.', '#3b63c4', '#101a3d', ['Paramount+'], 'Lavoro sporco, ma qualcuno deve farlo.', 'Gassosa', 1948],
  ['Mamma Ho Perso l\'Aereo', 1990, 103, 7.7, 'ridere', 'Kevin, 8 anni, difende casa da due ladri con trappole da ingegnere.', '#d8382c', '#6a1210', ['Disney+'], 'Luridi bastardi!', 'Pepsi', 712],
  ['Austin Powers', 1997, 94, 7.0, 'ridere', 'Spia scongelata dagli anni 60 contro il Dottor Male.', '#e04fa0', '#3a1152', ['Prime Video'], 'Yeah, baby!', 'Cocktail fluo', 816],
  ['Scemo & Più Scemo', 1994, 107, 7.3, 'ridere', 'Due amici con mezzo neurone attraversano l\'America per una valigetta.', '#f2a52c', '#8c3b10', ['Netflix'], 'Ho una possibilità?!', 'Cedrata', 8835],
  ['Ghostbusters', 1984, 105, 7.8, 'ridere', 'Tre parapsicologi disoccupati aprono un\'agenzia acchiappafantasmi.', '#1f2a44', '#c8e04a', ['Netflix'], 'Chi chiamerai?!', 'Limonata', 620],
  ['Zoolander', 2001, 89, 6.6, 'ridere', 'Il modello più bello del mondo viene programmato per un omicidio.', '#2bb6c4', '#0d2f4a', ['Paramount+'], 'Blue Steel.', 'Frappé', 9312],
  ['Tre Uomini e una Gamba', 1997, 97, 7.3, 'ridere', 'Tre cognati in viaggio verso un matrimonio. Comicità italiana pura.', '#e8a040', '#5a2a0a', ['Prime Video'], 'La gamba è sacra!', 'Birra media', 51539],
  ['Fantozzi', 1975, 108, 7.9, 'ridere', 'Il ragioniere più sfortunato d\'Italia e le sue tragicomiche disavventure.', '#8a8a4a', '#2a2a0a', ['Prime Video'], 'È una corazzata pazzesca!', 'Caffè d\'orzo', 42157],
  ['Amici Miei', 1975, 134, 8.0, 'ridere', 'Cinque amici fiorentini e le loro leggendarie "zingarate".', '#c08a3a', '#3a2a0a', ['Prime Video'], 'Che cos\'è la supercazzola?', 'Vino rosso', 42595],
  ['Il Secondo Tragico Fantozzi', 1976, 108, 7.9, 'ridere', 'Il ritorno del ragioniere più perseguitato dalla sorte.', '#7a7a3a', '#1a1a05'
, ['Prime Video'], 'Com\'è umano lei!', 'Caffè lungo', 42158],
  ['Monty Python - Brian di Nazareth', 1979, 94, 8.0, 'ridere', 'Satira irriverente su un uomo scambiato per un messia.', '#d4a040', '#3a2a0a', ['Netflix'], 'Guarda sempre il lato positivo!', 'Birra chiara', 583],
  ['Hot Shots!', 1991, 84, 6.3, 'ridere', 'Parodia esilarante dei film di aviazione militare.', '#4a7ac0', '#0a1a3a', ['Disney+'], 'Sono pronto a volare!', 'Soda', 11050],
  ['Una Notte da Leoni', 2009, 100, 7.7, 'ridere', 'Addio al celibato a Las Vegas finito in un disastro memorabile.', '#d4a860', '#3a2a0a', ['Netflix'], 'Cosa è successo stanotte?', 'Shot', 18785],
  ['Tootsie', 1982, 116, 7.4, 'ridere', 'Un attore disoccupato si traveste da donna per ottenere un ruolo.', '#e0608a', '#4a1a3a', ['Prime Video'], 'Sono stato un uomo migliore da donna.', 'Cappuccino', 9576],
  ['Qualcuno Volò sul Nido del Cuculo', 1975, 133, 8.7, 'ridere', 'Un ribelle scuote un ospedale psichiatrico. Tragicomico e indimenticabile.', '#7a9aba', '#1a2a3a', ['Prime Video'], 'Almeno ci ho provato!', 'Succo d\'arancia', 510],
  ['Il Postino', 1994, 108, 7.7, 'ridere', 'Un postino italiano stringe amicizia con il poeta Pablo Neruda.', '#5aa0c0', '#1a3a4a', ['Prime Video'], 'La poesia non è di chi la scrive.', 'Vino bianco', 10673],

  // ═══════════════ DA PIANGERE (16) ═══════════════
  ['Forrest Gump', 1994, 142, 8.8, 'piangere', 'La vita è come una scatola di cioccolatini, raccontata da una panchina.', '#9fd0e8', '#3a6fa0', ['Netflix'], 'Stupido è chi lo stupido fa.', 'Dr Pepper', 13],
  ['Titanic', 1997, 194, 7.9, 'piangere', 'Amore di classe su una nave che tutti sanno come finisce.', '#20476e', '#07131f', ['Disney+'], 'Se salti tu, salto io.', 'Thè caldo', 597],
  ['Il Miglio Verde', 1999, 189, 8.6, 'piangere', 'Nel braccio della morte arriva un gigante buono con un dono impossibile.', '#4f7a45', '#16261b', ['Netflix'], 'Sono stanco, capo.', 'Camomilla', 497],
  ['La Vita è Bella', 1997, 116, 8.6, 'piangere', 'Un padre trasforma l\'orrore in un gioco per salvare il sorriso del figlio.', '#d9a441', '#5e3a12', ['Disney+'], 'Buongiorno Principessa!', 'Vino toscano', 637],
  ['Up', 2009, 96, 8.3, 'piangere', 'I primi 10 minuti ti distruggono, poi si vola con i palloncini.', '#f05a4a', '#2f7fb8', ['Disney+'], 'L\'avventura è là fuori!', 'Succo di mela', 14160],
  ['Le Ali della Libertà', 1994, 142, 9.3, 'piangere', 'Venti anni di carcere e la speranza più ostinata.', '#5c6a78', '#161b22', ['Netflix'], 'La speranza ti rende libero.', 'Birra', 278],
  ['Io & Marley', 2008, 115, 7.1, 'piangere', 'Il cane peggiore del mondo e la famiglia che non lo cambierebbe mai.', '#e5c06a', '#8a5a1e', ['Disney+'], 'A un cane non importa.', 'Cioccolata', 2657],
  ['Hachiko', 2009, 93, 8.1, 'piangere', 'Un cane aspetta alla stazione. Ogni giorno. Per nove anni.', '#8aa6bd', '#2b3b4d', ['Prime Video'], 'Non devi più aspettare.', 'Thè verde', 63311],
  ['La Ricerca della Felicità', 2006, 117, 8.0, 'piangere', 'Un padre senza casa lotta per costruire un futuro a suo figlio.', '#d6a44a', '#3a2a0d', ['Netflix'], 'Non lasciare che ti dicano che non puoi.', 'Acqua', 1402],
  ['Million Dollar Baby', 2004, 132, 8.1, 'piangere', 'Una pugile e il suo allenatore in una storia che spezza il cuore.', '#4a5a6a', '#0a1a2a', ['Prime Video'], 'Mo cuishle.', 'Acqua', 70],
  ['Pianista sull\'Oceano', 1998, 165, 8.0, 'piangere', 'Un pianista nato su una nave non scende mai a terra.', '#3a6a9a', '#0a1a3a', ['Prime Video'], 'La terra è una nave troppo grande.', 'Whisky', 10693],
  ['Marley e Io', 2008, 115, 7.1, 'piangere', 'Una famiglia americana e il loro labrador indisciplinato.', '#e0b060', '#4a2a0a', ['Disney+'], 'Il cane peggiore del mondo.', 'Latte', 2657],
  ['Il Bambino con il Pigiama a Righe', 2008, 94, 7.8, 'piangere', 'Due bambini separati da un filo spinato durante la guerra.', '#6a7a8a', '#1a1a2a', ['Prime Video'], 'Siamo amici, vero?', 'Acqua', 13460],
  ['Big Fish', 2003, 125, 8.0, 'piangere', 'Un figlio scopre la verità dietro le storie fantastiche del padre.', '#d4a060', '#2a3a1a', ['Disney+'], 'Un uomo racconta le sue storie.', 'Sidro', 587],
  ['Mare Dentro', 2004, 126, 8.0, 'piangere', 'La storia vera di un uomo tetraplegico e la sua battaglia.', '#4a7a9a', '#0a2a3a', ['Prime Video'], 'Vivere è un diritto.', 'Acqua', 1913],
  ['La Leggenda del Pianista', 1998, 169, 8.0, 'piangere', 'Nato e vissuto su un transatlantico, suona la musica più bella.', '#2a5a8a', '#0a1a3a', ['Prime Video'], 'Non scendo.', 'Whisky', 10693],

  // ═══════════════ ADRENALINA (16) ═══════════════
  ['Trappola di Cristallo', 1988, 132, 8.2, 'adrenalina', 'Un poliziotto scalzo contro dodici terroristi in un grattacielo.', '#e5541f', '#1a1a1e', ['Disney+'], 'Yippee-ki-yay!', 'Birra bionda', 562],
  ['Mad Max: Fury Road', 2015, 120, 8.1, 'adrenalina', 'Due ore di inseguimento nel deserto. Testimoniatemi!', '#e8762a', '#5b1a0c', ['Netflix'], 'Che giornata radiosa!', 'Energy drink', 76341],
  ['Terminator 2', 1991, 137, 8.6, 'adrenalina', 'Il cyborg torna, stavolta protegge il ragazzo che salverà il mondo.', '#2a3a55', '#07090f', ['Prime Video'], 'Hasta la vista, baby.', 'Cola zero', 280],
  ['Speed', 1994, 116, 7.3, 'adrenalina', 'Se l\'autobus scende sotto gli 80 km/h esplode.', '#d8d23a', '#7a3a08', ['Disney+'], 'Pop quiz, recluta!', 'Ghiacciolo', 1637],
  ['Point Break', 1991, 122, 7.3, 'adrenalina', 'Un agente FBI si infiltra tra surfisti rapinatori.', '#2a9fd6', '#0d3d5e', ['Prime Video'], 'Il brivido supremo.', 'Corona', 11324],
  ['Heat - La Sfida', 1995, 170, 8.3, 'adrenalina', 'Il rapinatore perfetto e il poliziotto ossessionato.', '#3a4a5e', '#0a0d12', ['Netflix'], 'Trenta secondi netti.', 'Whisky', 949],
  ['Mission: Impossible', 1996, 110, 7.2, 'adrenalina', 'Un furto appeso a un filo nel caveau della CIA.', '#c1282d', '#120a0a', ['Paramount+'], 'Qualora decidessi di accettarlo...', 'Ginger ale', 954],
  ['Top Gun', 1986, 110, 7.0, 'adrenalina', 'Jet, aviatori e la colonna sonora che conosci a memoria.', '#1e5b8c', '#f2a33c', ['Paramount+'], 'Il bisogno di velocità!', 'Birra', 744],
  ['John Wick', 2014, 101, 7.4, 'adrenalina', 'Un ex sicario torna in azione. Coreografie di combattimento perfette.', '#2a2a3a', '#0a0a0a', ['Netflix'], 'Sì, sono tornato.', 'Bourbon', 245891],
  ['Il Fuggitivo', 1993, 130, 7.8, 'adrenalina', 'Un medico innocente braccato mentre cerca il vero assassino.', '#4a5a6a', '#0a1a2a', ['Prime Video'], 'Non ho ucciso mia moglie!', 'Caffè', 5503],
  ['Face/Off', 1997, 138, 7.3, 'adrenalina', 'Un agente e un criminale si scambiano letteralmente la faccia.', '#8a3a3a', '#1a0a0a', ['Paramount+'], 'Vorrei toglierti la faccia.', 'Cola', 754],
  ['The Rock', 1996, 136, 7.4, 'adrenalina', 'Alcatraz occupata dai terroristi. Un chimico e un ex detenuto.', '#5a6a7a', '#0a1a2a', ['Disney+'], 'Benvenuto a The Rock!', 'Birra', 9802],
  ['Con Air', 1997, 115, 6.9, 'adrenalina', 'Un aereo pieno di criminali viene dirottato in volo.', '#8a6a3a', '#2a1a0a', ['Disney+'], 'Metti giù il coniglio.', 'Soda', 1701],
  ['Bad Boys', 1995, 119, 6.9, 'adrenalina', 'Due detective di Miami tra inseguimenti e battute fulminanti.', '#3a5a8a', '#0a1a2a', ['Netflix'], 'Bad boys, bad boys!', 'Mojito', 9737],
  ['Air Force One', 1997, 124, 6.5, 'adrenalina', 'Il presidente USA combatte i terroristi a bordo dell\'aereo presidenziale.', '#2a4a7a', '#0a0a1a', ['Netflix'], 'Fuori dal mio aereo!', 'Cola', 9772],
  ['Arma Letale', 1987, 109, 7.6, 'adrenalina', 'Due poliziotti agli antipodi contro un cartello della droga.', '#6a4a2a', '#1a0a05', ['Prime Video'], 'Sono troppo vecchio per queste cose.', 'Birra', 941],

  // ═══════════════ DA PAURA (16) ═══════════════
  ['Shining', 1980, 146, 8.4, 'paura', 'Un albergo vuoto, un inverno infinito e papà che scrive la stessa frase.', '#9e1b1b', '#1a1416', ['Netflix'], 'Ecco Johnny!', 'Bourbon', 694],
  ['L\'Esorcista', 1973, 122, 8.1, 'paura', 'Una bambina posseduta e due preti nella notte più lunga.', '#2a2f3d', '#d9cfa8', ['Prime Video'], 'Il potere di Cristo ti espelle!', 'Thè', 9552],
  ['Scream', 1996, 111, 7.4, 'paura', 'Qual è il tuo film horror preferito? Risposta sbagliata.', '#2b2b33', '#c4162a', ['Paramount+'], 'Qual è il tuo film preferito?', 'Coca Cola', 4232],
  ['Halloween', 1978, 91, 7.7, 'paura', 'Michael Myers torna a casa la notte di Halloween.', '#1b2a1b', '#e8a33c', ['Prime Video'], 'L\'ombra si è allungata.', 'Sidro', 948],
  ['Alien', 1979, 117, 8.5, 'paura', 'Nello spazio nessuno può sentirti urlare.', '#1d2630', '#5fd4a8', ['Disney+'], 'Nessuno può sentirti urlare.', 'Bibita lime', 348],
  ['The Ring', 2002, 115, 7.1, 'paura', 'Guardi la videocassetta, squilla il telefono, hai sette giorni.', '#3d4a52', '#0c1114', ['Paramount+'], 'Sette giorni...', 'Acqua frizzante', 565],
  ['Nightmare', 1984, 91, 7.4, 'paura', 'Freddy Krueger ti aspetta dove non puoi scappare: nel sonno.', '#7a1f1f', '#1b1208', ['Prime Video'], 'Uno, due, Freddy viene per te.', 'Espresso', 36557],
  ['It', 2017, 135, 7.2, 'paura', 'Un clown che vive nelle fogne terrorizza i bambini di Derry.', '#b31b2a', '#17171f', ['Netflix'], 'Galleggerai!', 'Frappé', 346364],
  ['Psycho', 1960, 109, 8.5, 'paura', 'Il motel più inquietante della storia del cinema. Hitchcock al massimo.', '#4a4a4a', '#0a0a0a', ['Prime Video'], 'Siamo tutti un po\' matti.', 'Caffè', 539],
  ['Gli Uccelli', 1963, 119, 7.7, 'paura', 'Una cittadina costiera viene attaccata da stormi di uccelli.', '#5a7a9a', '#1a2a3a', ['Prime Video'], 'Gli uccelli stanno arrivando.', 'Thè', 571],
  ['Rosemary\'s Baby', 1968, 137, 8.0, 'paura', 'Una donna incinta sospetta che i vicini abbiano piani oscuri.', '#8a7a6a', '#2a1a1a', ['Paramount+'], 'Questo non è un sogno!', 'Thè alle erbe', 805],
  ['Suspiria', 1977, 98, 7.4, 'paura', 'Horror italiano di Argento. Colori accesi e atmosfera da incubo.', '#c42a4a', '#2a0a1a', ['Prime Video'], 'La scuola di danza nasconde un segreto.', 'Vino rosso', 11252],
  ['Profondo Rosso', 1975, 126, 7.6, 'paura', 'Un pianista testimone di un omicidio indaga sul killer.', '#8a1a2a', '#1a0a0a', ['Prime Video'], 'Ho visto qualcosa.', 'Caffè', 11256],
  ['Il Sesto Senso', 1999, 107, 8.2, 'paura', 'Vedo la gente morta. E non hai capito niente fino all\'ultimo minuto.', '#4a5a6b', '#0d1115', ['Disney+'], 'Vedo la gente morta.', 'Thè caldo', 745],
  ['28 Giorni Dopo', 2002, 113, 7.5, 'paura', 'Un virus trasforma Londra in una città deserta e letale.', '#4a5a4a', '#0a1a0a', ['Disney+'], 'Dove sono tutti?', 'Acqua', 170],
  ['Non Aprite Quella Porta', 1974, 83, 7.4, 'paura', 'Cinque ragazzi si imbattono in una famiglia terrificante.', '#8a6a3a', '#1a0a05', ['Prime Video'], 'Non c\'è via di fuga.', 'Acqua', 30497],

  // ═══════════════ CUORE (15) ═══════════════
  ['Dirty Dancing', 1987, 100, 7.0, 'cuore', 'Un\'estate, un maestro di ballo e la presa più famosa del cinema.', '#d94f7a', '#5e1a3a', ['Prime Video'], 'Nessuno mette Baby in un angolo!', 'Prosecco', 8363],
  ['Pretty Woman', 1990, 119, 7.1, 'cuore', 'Favola di Hollywood Boulevard con shopping e scala antincendio.', '#e05a8c', '#7a1f45', ['Disney+'], 'È un grosso errore. Enorme!', 'Bellini', 114],
  ['Ghost', 1990, 127, 7.1, 'cuore', 'Amore oltre la morte, una medium improvvisata e la ceramica.', '#6f8fd6', '#1c2347', ['Paramount+'], 'Idem.', 'Vino bianco', 10589],
  ['Notting Hill', 1999, 124, 7.2, 'cuore', 'Sono solo una ragazza, davanti a un ragazzo.', '#5ea8d6', '#1f4a6b', ['Netflix'], 'Sono solo una ragazza...', 'Cappuccino', 509],
  ['Il Diario di Bridget Jones', 2001, 97, 6.7, 'cuore', 'Diario, sigarette contate e due uomini che si prendono a pugni.', '#d6476e', '#3a1430', ['Netflix'], 'Mi piaci così come sei.', 'Chardonnay', 3128],
  ['C\'è Post@ per Te', 1998, 119, 6.7, 'cuore', 'Si odiano di persona e si innamorano via e-mail.', '#e8b43c', '#2f6b3f', ['Prime Video'], 'Volevo che fossi tu.', 'Earl Grey', 7294],
  ['Insonnia d\'Amore', 1993, 105, 6.8, 'cuore', 'Una voce alla radio e un appuntamento sull\'Empire State.', '#4f7fb8', '#17283d', ['Apple TV'], 'Come tornare a casa.', 'Latte macchiato', 858],
  ['Le Pagine della Nostra Vita', 2004, 123, 7.8, 'cuore', 'Un quaderno letto ogni giorno per non dimenticare chi si ama.', '#d68a9e', '#5e2a3a', ['Netflix'], 'Voglio te.', 'Thè alla pesca', 10011],
  ['Casablanca', 1942, 102, 8.5, 'cuore', 'Amore e sacrificio nel Marocco occupato. Un classico eterno.', '#8a7a5a', '#1a1a0a', ['Prime Video'], 'Suonala ancora, Sam.', 'Champagne', 289],
  ['Colazione da Tiffany', 1961, 115, 7.6, 'cuore', 'Una ragazza eccentrica a New York e il suo vicino scrittore.', '#5ac0c0', '#1a3a3a', ['Paramount+'], 'Non voglio appartenere a nessuno.', 'Champagne', 164],
  ['La La Land', 2016, 128, 8.0, 'cuore', 'Un musicista jazz e un\'aspirante attrice a Los Angeles.', '#6a4ac0', '#1a0a3a', ['Netflix'], 'Ecco a voi i sognatori.', 'Vino rosso', 313369],
  ['Tre Metri Sopra il Cielo', 2004, 102, 6.3, 'cuore', 'Amore adolescenziale tra due mondi opposti a Roma.', '#e06a8a', '#3a0a1a', ['Prime Video'], 'Tre metri sopra il cielo.', 'Spritz', 24204],
  ['Love Actually', 2003, 135, 7.6, 'cuore', 'Nove storie d\'amore intrecciate a Londra prima di Natale.', '#c43a5a', '#2a0a1a', ['Netflix'], 'L\'amore è ovunque.', 'Vin brulé', 508],
  ['Il Favoloso Mondo di Amélie', 2001, 122, 8.3, 'cuore', 'Una ragazza parigina decide di cambiare la vita degli altri.', '#3a8a4a', '#c43a1a', ['Netflix'], 'I tempi sono duri per i sognatori.', 'Crème brûlée', 194],
  ['Before Sunrise', 1995, 101, 8.1, 'cuore', 'Due sconosciuti si incontrano su un treno e passano una notte a Vienna.', '#8a7a5a', '#2a1a1a', ['Prime Video'], 'Parliamo fino all\'alba.', 'Vino bianco', 76],

  // ═══════════════ CERVELLO ACCESO (15) ═══════════════
  ['Pulp Fiction', 1994, 154, 8.9, 'cervello', 'Tre storie, una valigetta luminosa e dialoghi che si citano ancora.', '#e8c23c', '#1a1a1a', ['Netflix'], 'Ezechiele 25:17.', 'Frappé', 680],
  ['Memento', 2000, 113, 8.4, 'cervello', 'Non ricorda nulla da dieci minuti e il film va al contrario.', '#8a8f96', '#1b1d22', ['Prime Video'], 'Dobbiamo avere ricordi.', 'Caffè ristretto', 77],
  ['Fight Club', 1999, 139, 8.8, 'cervello', 'La prima regola è che non si parla del Fight Club.', '#d6456b', '#141418', ['Disney+'], 'Prima regola: non se ne parla.', 'Birra scura', 550],
  ['Se7en', 1995, 127, 8.6, 'cervello', 'Sette peccati capitali, due detective e una scatola nel deserto.', '#3a4036', '#0a0c0a', ['Netflix'], 'Cosa c\'è nella scatola?!', 'Caffè nero', 807],
  ['I Soliti Sospetti', 1995, 106, 8.5, 'cervello', 'Chi è Keyser Söze? Lo scopri quando è troppo tardi.', '#5e6b7a', '#121621', ['Prime Video'], 'Il trucco più grande del diavolo.', 'Caffè d\'orzo', 629],
  ['Il Silenzio degli Innocenti', 1991, 118, 8.6, 'cervello', 'Una recluta FBI chiede aiuto al più elegante dei mostri.', '#9aa3ad', '#1a1414', ['Prime Video'], 'Un buon Chianti.', 'Chianti', 274],
  ['Donnie Darko', 2001, 113, 8.0, 'cervello', 'Un coniglio gigante annuncia la fine del mondo tra 28 giorni.', '#3d4f7a', '#0b0e18', ['Prime Video'], '28 giorni, 6 ore...', 'Latte al cioccolato', 141],
  ['Inception', 2010, 148, 8.8, 'cervello', 'Furti nei sogni dentro i sogni dentro i sogni. Finale leggendario.', '#3a5a7a', '#0a0a1a', ['Netflix'], 'Un\'idea è un parassita.', 'Espresso', 27205],
  ['Interstellar', 2014, 169, 8.6, 'cervello', 'Un viaggio oltre il buco nero per salvare l\'umanità.', '#2a3a5a', '#000000', ['Prime Video'], 'Non andartene docile.', 'Caffè', 157336],
  ['Shutter Island', 2010, 138, 8.2, 'cervello', 'Un detective indaga in un manicomio su un\'isola. Nulla è come sembra.', '#4a5a5a', '#0a1a1a', ['Netflix'], 'Chi è il paziente 67?', 'Whisky', 11324],
  ['Arrival', 2016, 116, 7.9, 'cervello', 'Una linguista comunica con alieni e scopre il significato del tempo.', '#5a6a6a', '#0a1a1a', ['Netflix'], 'Il linguaggio è un\'arma.', 'Thè', 329865],
  ['Il Prestigio', 2006, 130, 8.5, 'cervello', 'Due illusionisti rivali si distruggono per il trucco perfetto.', '#4a4a5a', '#0a0a1a', ['Prime Video'], 'Stai guardando attentamente?', 'Brandy', 1124],
  ['Mulholland Drive', 2001, 147, 7.9, 'cervello', 'Lynch al massimo: sogno, identità e Hollywood in un labirinto.', '#6a3a5a', '#1a0a1a', ['Prime Video'], 'Silencio.', 'Espresso', 1018],
  ['Oldboy', 2003, 120, 8.3, 'cervello', 'Rinchiuso per 15 anni senza motivo, cerca vendetta. Finale shock.', '#6a4a3a', '#1a0a0a', ['Prime Video'], 'Ridi e il mondo riderà con te.', 'Soju', 670],
  ['Il Grande Freddo', 1983, 105, 7.1, 'cervello', 'Vecchi amici si ritrovano a un funerale e fanno i conti col passato.', '#7a6a5a', '#1a1a0a', ['Prime Video'], 'Eravamo giovani.', 'Vino', 11248],

  // ═══════════════ COMFORT MOVIE (14) ═══════════════
  ['Ritorno al Futuro', 1985, 116, 8.5, 'comfort', 'Una DeLorean, 88 miglia e tua madre che ci prova con te.', '#e8731f', '#17202e', ['Netflix'], 'Grande Giove!', 'Pepsi', 105],
  ['Grease', 1978, 110, 7.2, 'comfort', 'Giubbotti di pelle, cori e la macchina che vola.', '#e5455e', '#2a1030', ['Paramount+'], 'You\'re the one that I want!', 'Milkshake', 880],
  ['E.T.', 1982, 115, 7.9, 'comfort', 'Telefono casa, biciclette in volo e una luna indimenticabile.', '#2f4a7a', '#e8c23c', ['Prime Video'], 'E.T. telefono casa.', 'Cola', 601],
  ['Sister Act', 1992, 100, 6.6, 'comfort', 'Una cantante si nasconde in convento e rivoluziona il coro.', '#3a3f4a', '#e0d44a', ['Disney+'], 'I will follow Him!', 'Limonata', 10929],
  ['Mrs. Doubtfire', 1993, 125, 7.0, 'comfort', 'Un papà si traveste da tata scozzese per rivedere i figli.', '#5ea8c4', '#8c3a2a', ['Disney+'], 'È arrivata la cavalleria!', 'Thè inglese', 788],
  ['Una Poltrona per Due', 1983, 116, 7.5, 'comfort', 'Il classico di Natale: un broker e un barbone si scambiano la vita.', '#c43a3a', '#1a2a0a', ['Netflix'], 'Si vendono, si comprano.', 'Vin brulé', 10776],
  ['Il Mago di Oz', 1939, 102, 7.6, 'comfort', 'Dorothy segue la strada di mattoni gialli verso casa.', '#d4a040', '#2a5a2a', ['Prime Video'], 'Non c\'è posto come casa.', 'Latte', 630],
  ['Mary Poppins', 1964, 139, 7.8, 'comfort', 'Una tata magica porta gioia in una famiglia londinese.', '#5a9ac0', '#1a3a5a', ['Disney+'], 'Supercalifragilistico!', 'Thè', 433],
  ['Tutti Insieme Appassionatamente', 1965, 172, 8.0, 'comfort', 'Una novizia diventa governante di sette bambini in Austria.', '#5a9a5a', '#1a3a1a', ['Disney+'], 'Le colline sono vive!', 'Thè', 15121],
  ['Un Americano a Parigi', 1951, 113, 7.2, 'comfort', 'Musical colorato nella Parigi del dopoguerra.', '#d4a060', '#2a1a0a', ['Prime Video'], 'Balliamo!', 'Vino francese', 11113],
  ['Cantando sotto la Pioggia', 1952, 103, 8.3, 'comfort', 'Il passaggio dal muto al sonoro raccontato con musica e ironia.', '#5a9ac0', '#1a2a3a', ['Prime Video'], 'Che bella sensazione!', 'Limonata', 872],
  ['Frankenstein Junior', 1974, 106, 8.0, 'comfort', 'Parodia geniale del mito di Frankenstein. Mel Brooks al top.', '#5a5a5a', '#0a0a0a', ['Disney+'], 'Si può fare!', 'Birra', 3034],
  ['Il Grande Lebowski (replay)', 1998, 117, 8.1, 'comfort', 'Il Dude abita qui. Comfort film definitivo per i fan.', '#d4a040', '#3a1a0a', ['Prime Video'], 'Il Dude abita.', 'White Russian', 115],
  ['Gli Aristogatti', 1970, 78, 7.1, 'comfort', 'Gatti parigini in un\'avventura musicale piena di jazz.', '#d4a060', '#2a1a0a', ['Disney+'], 'Tutti quanti voglion fare il jazz.', 'Latte', 10112],

  // ═══════════════ EPICO (14) ═══════════════
  ['La Compagnia dell\'Anello', 2001, 178, 8.9, 'epico', 'Nove compagni partono per distruggere un anello.', '#c9a23c', '#17241b', ['Prime Video'], 'Non tutte le lacrime sono un male.', 'Birra', 120],
  ['Guerre Stellari', 1977, 121, 8.6, 'epico', 'Un contadino, una principessa e la Forza contro la Morte Nera.', '#e8d23c', '#06080f', ['Disney+'], 'Che la Forza sia con te.', 'Latte blu', 11],
  ['Matrix', 1999, 136, 8.7, 'epico', 'Pillola rossa o blu? Il mondo non è quello che credi.', '#2fe08a', '#050a07', ['Netflix'], 'Pillola rossa o blu?', 'Mountain Dew', 603],
  ['Jurassic Park', 1993, 127, 8.2, 'epico', 'Un parco a tema con dinosauri veri. Cosa può andare storto?', '#c4452a', '#1b3a1f', ['Netflix'], 'La vita vince sempre.', 'Cola', 329],
  ['Il Gladiatore', 2000, 155, 8.5, 'epico', 'Al mio segnale, scatenate l\'inferno nell\'arena.', '#b8873c', '#2e2015', ['Netflix'], 'Scatenate l\'inferno!', 'Vino rosso', 98],
  ['Blade Runner', 1982, 117, 8.1, 'epico', 'Pioggia al neon, replicanti e lacrime nella tempesta.', '#e0448c', '#0a1430', ['Prime Video'], 'Ho visto cose...', 'Sake', 78],
  ['I Predatori dell\'Arca Perduta', 1981, 115, 8.4, 'epico', 'Frusta, cappello e una corsa all\'Arca.', '#c99a3c', '#4a3115', ['Disney+'], 'Sono i chilometri!', 'Birra', 85],
  ['Il Quinto Elemento', 1997, 126, 7.6, 'epico', 'Taxi volanti, Leeloo e un\'aria d\'opera indimenticabile.', '#e8762a', '#2a1a4a', ['Prime Video'], 'Multipass!', 'Cocktail', 18],
  ['Le Due Torri', 2002, 179, 8.8, 'epico', 'La battaglia del Fosso di Helm e il viaggio verso Mordor.', '#8a7a3a', '#1a2a1a', ['Prime Video'], 'C\'è del buono in questo mondo.', 'Birra', 121],
  ['Il Ritorno del Re', 2003, 201, 9.0, 'epico', 'L\'epilogo epico della trilogia. Undici Oscar.', '#d4a040', '#1a1a0a', ['Prime Video'], 'Amici miei, non vi inchinate.', 'Birra', 122],
  ['Avatar', 2009, 162, 7.6, 'epico', 'Pandora, i Na\'vi e una guerra per un mondo meraviglioso.', '#2a8ac0', '#0a2a3a', ['Disney+'], 'Ti vedo.', 'Succo tropicale', 19995],
  ['Braveheart', 1995, 178, 8.4, 'epico', 'William Wallace guida la Scozia contro l\'Inghilterra.', '#4a6a8a', '#1a2a1a', ['Disney+'], 'Libertà!', 'Whisky scozzese', 197],
  ['Lawrence d\'Arabia', 1962, 218, 8.3, 'epico', 'L\'epopea di un ufficiale britannico nel deserto arabo.', '#d4b060', '#3a2a0a', ['Netflix'], 'Nulla è scritto.', 'Thè alla menta', 947],
  ['Ben-Hur', 1959, 212, 8.1, 'epico', 'La corsa delle bighe più famosa della storia del cinema.', '#b48a40', '#2a1a0a', ['Prime Video'], 'La corsa è tutto.', 'Vino', 665],

  // ═══════════════ VIAGGIO (12) ═══════════════
  ['Lost in Translation', 2003, 102, 7.7, 'viaggio', 'Due americani soli a Tokyo trovano una connessione inaspettata.', '#2a5f9f', '#0d1f3a', ['Prime Video'], 'Non sapevo più chi fossi.', 'Sake', 153],
  ['Into the Wild', 2007, 148, 8.1, 'viaggio', 'Un laureato lascia tutto per vivere in Alaska.', '#6a9a3f', '#1a2e0d', ['Prime Video'], 'La felicità è reale solo se condivisa.', 'Acqua di sorgente', 4499],
  ['I Sogni Segreti di Walter Mitty', 2013, 114, 7.3, 'viaggio', 'Un impiegato noioso insegue un fotografo per il mondo.', '#4f9fd6', '#1a4570', ['Disney+'], 'La vita è un\'avventura.', 'Caffè islandese', 116745],
  ['Ratatouille', 2007, 111, 8.1, 'viaggio', 'Un topo che sogna di diventare chef a Parigi.', '#d63030', '#2a0d0d', ['Disney+'], 'Chiunque può cucinare!', 'Bordeaux', 2062],
  ['In Bruges', 2008, 107, 7.9, 'viaggio', 'Due sicari in vacanza forzata in una città medievale belga.', '#3a5a3a', '#0d1a0d', ['Prime Video'], 'Questa città è un incubo.', 'Birra trappista', 8963],
  ['Mangia Prega Ama', 2010, 133, 5.8, 'viaggio', 'Una donna viaggia tra Italia, India e Bali per ritrovarsi.', '#d4a060', '#2a1a0a', ['Netflix'], 'Il dolce far niente.', 'Vino italiano', 24810],
  ['Il Signore degli Anelli (viaggio)', 2001, 178, 8.9, 'viaggio', 'Il viaggio più epico della letteratura fantasy.', '#8a7a3a', '#1a2a1a', ['Prime Video'], 'Il viaggio inizia.', 'Birra', 120],
  ['Motorcycle Diaries', 2004, 126, 7.7, 'viaggio', 'Il viaggio in moto che trasformò Che Guevara.', '#6a8a4a', '#1a2a0a', ['Prime Video'], 'Il viaggio cambia tutto.', 'Mate', 10196],
  ['Vicky Cristina Barcelona', 2008, 96, 7.1, 'viaggio', 'Due amiche americane a Barcellona tra arte e passione.', '#d4604a', '#3a1a0a', ['Prime Video'], 'Barcellona cambia tutto.', 'Sangria', 11370],
  ['Un\'Ottima Annata', 2006, 117, 6.9, 'viaggio', 'Un banchiere eredita un vigneto in Provenza.', '#c4a040', '#2a2a0a', ['Disney+'], 'Il vino è vita.', 'Vino francese', 9789],
  ['Vacanze Romane', 1953, 118, 8.0, 'viaggio', 'Una principessa scappa dal protocollo per un giorno a Roma.', '#c0b090', '#2a2a1a', ['Paramount+'], 'Roma. Senza dubbio, Roma.', 'Gelato', 804],
  ['Il Grande Viaggio', 2004, 108, 7.3, 'viaggio', 'Padre e figlio attraversano l\'Europa verso la Mecca.', '#c4a060', '#2a1a0a', ['Prime Video'], 'Il viaggio unisce.', 'Thè', 24747],

  // ═══════════════ DRAMMATICO (14) ═══════════════
  ['Schindler\'s List', 1993, 195, 9.0, 'drammatico', 'Un industriale tedesco salva 1.100 ebrei dall\'Olocausto.', '#8a8a8a', '#1a1a1a', ['Netflix'], 'Chi salva una vita salva il mondo.', 'Acqua', 424],
  ['A Beautiful Mind', 2001, 135, 8.2, 'drammatico', 'Un genio della matematica lotta con la schizofrenia.', '#4a6fa0', '#0d1a30', ['Prime Video'], 'Non è la logica a salvarci.', 'Caffè', 453],
  ['Il Pianista', 2002, 150, 8.5, 'drammatico', 'Un pianista polacco sopravvive al ghetto di Varsavia.', '#5a5a5a', '#0d0d0d', ['Netflix'], 'La musica mi ha salvato.', 'Thè nero', 423],
  ['Will Hunting', 1997, 126, 8.3, 'drammatico', 'Un genio nascosto in un bidello del MIT incontra lo psicologo giusto.', '#3a5a7a', '#0d1a2d', ['Netflix'], 'Non è colpa tua.', 'Caffè americano', 489],
  ['Il Padrino', 1972, 175, 9.2, 'drammatico', 'La saga della famiglia mafiosa più famosa del cinema.', '#2a2a1a', '#0a0a0a', ['Paramount+'], 'Un\'offerta che non potrà rifiutare.', 'Chianti', 238],
  ['Il Padrino - Parte II', 1974, 202, 9.0, 'drammatico', 'Il passato e il presente della famiglia si intrecciano.', '#3a3a2a', '#0a0a0a', ['Paramount+'], 'Tieni vicini i tuoi nemici.', 'Vino', 240],
  ['Quei Bravi Ragazzi', 1990, 145, 8.7, 'drammatico', 'Ascesa e caduta nella mafia americana. Scorsese al massimo.', '#6a4a3a', '#1a0a0a', ['Netflix'], 'Da quando mi ricordo.', 'Grappa', 769],
  ['Taxi Driver', 1976, 114, 8.2, 'drammatico', 'Un tassista insonne scivola nella follia in una New York marcia.', '#8a4a2a', '#1a0a0a', ['Prime Video'], 'Stai parlando con me?', 'Caffè', 103],
  ['Toro Scatenato', 1980, 129, 8.2, 'drammatico', 'La vita autodistruttiva del pugile Jake LaMotta.', '#5a5a5a', '#0a0a0a', ['Prime Video'], 'Non sono mai andato KO.', 'Acqua', 1578],
  ['Nuovo Cinema Paradiso', 1988, 155, 8.5, 'drammatico', 'Un regista ricorda la sua infanzia nel cinema di paese in Sicilia.', '#c49a50', '#2a1a0a', ['Prime Video'], 'La vita non è come l\'hai vista al cinema.', 'Vino siciliano', 11216],
  ['Ladri di Biciclette', 1948, 89, 8.3, 'drammatico', 'Capolavoro neorealista: un padre e un figlio cercano una bicicletta.', '#6a6a6a', '#1a1a1a', ['Prime Video'], 'Senza bicicletta non c\'è lavoro.', 'Acqua', 5156],
  ['Il Gattopardo', 1963, 186, 8.0, 'drammatico', 'La fine dell\'aristocrazia siciliana durante il Risorgimento.', '#c4a060', '#2a1a0a', ['Prime Video'], 'Tutto cambi perché nulla cambi.', 'Vino siciliano', 11218],
  ['Gomorra', 2008, 137, 6.9, 'drammatico', 'Cinque storie nell\'inferno della camorra napoletana.', '#5a5a4a', '#0a0a0a', ['Netflix'], 'Il sistema è ovunque.', 'Birra', 12763],
  ['La Grande Bellezza', 2013, 142, 7.5, 'drammatico', 'Un giornalista romano riflette sulla vanità della vita mondana.', '#c4a070', '#2a1a1a', ['Netflix'], 'Il più grande spettacolo.', 'Spritz', 167073],

  // ═══════════════ TUTTI INSIEME (12) ═══════════════
  ['Il Re Leone', 1994, 88, 8.5, 'famiglia', 'Hakuna Matata, ma prima devi superare quella scena lì.', '#e8a33c', '#7a3f10', ['Disney+'], 'Hakuna Matata!', 'Succo tropicale', 8587],
  ['Toy Story', 1995, 81, 8.3, 'famiglia', 'I giocattoli si muovono quando non guardi.', '#4fa8e0', '#e8c23c', ['Disney+'], 'Verso l\'infinito e oltre!', 'Aranciata', 862],
  ['Coco', 2017, 105, 8.4, 'famiglia', 'Un bambino finisce nella Terra dei Morti per scoprire la verità.', '#e8601f', '#2a0d0d', ['Disney+'], 'Ricorda me...', 'Horchata', 354912],
  ['Inside Out', 2015, 95, 8.1, 'famiglia', 'Le emozioni di una ragazzina prendono vita dentro la sua testa.', '#f5c518', '#3a5fd4', ['Disney+'], 'Tristezza è importante!', 'Limonata', 150540],
  ['Shrek', 2001, 90, 7.9, 'famiglia', 'Un orco scortese salva una principessa che non vuole essere salvata.', '#5aaa3a', '#1a2e0d', ['Prime Video'], 'Le cipolle hanno le foglie!', 'Brownie', 808],
  ['Frozen', 2013, 102, 7.4, 'famiglia', 'Due sorelle in un regno di ghiaccio e un pupazzo simpatico.', '#4aaad6', '#0d3a6a', ['Disney+'], 'Lascia andare!', 'Cioccolata', 109445],
  ['Paddington 2', 2017, 103, 7.8, 'famiglia', 'Un orsetto gentile finisce in prigione per un crimine non commesso.', '#e8604a', '#3a1a0d', ['Prime Video'], 'Sii gentile e cortese.', 'Thè', 346648],
  ['Wall-E', 2008, 98, 8.4, 'famiglia', 'Un piccolo robot spazzino si innamora e salva l\'umanità.', '#d68a3a', '#2a1a0d', ['Disney+'], 'Eeee-va!', 'Succo d\'uva', 10681],
  ['Alla Ricerca di Nemo', 2003, 100, 8.2, 'famiglia', 'Un pesce pagliaccio attraversa l\'oceano per ritrovare il figlio.', '#e8762a', '#0a4a6a', ['Disney+'], 'Continua a nuotare!', 'Succo blu', 12],
  ['Gli Incredibili', 2004, 115, 8.0, 'famiglia', 'Una famiglia di supereroi in pensione torna in azione.', '#c42a2a', '#1a0a0a', ['Disney+'], 'I supereroi sono tornati!', 'Cola', 9806],
  ['Monsters & Co.', 2001, 92, 8.1, 'famiglia', 'Due mostri scoprono che le risate sono più potenti delle urla.', '#4ac0d0', '#1a3a4a', ['Disney+'], 'Spaventiamo per lavoro!', 'Frullato', 585],
  ['Kung Fu Panda', 2008, 92, 7.6, 'famiglia', 'Un panda goffo diventa il guerriero dragone.', '#d4a040', '#2a1a0a', ['Netflix'], 'Non c\'è segreto!', 'Thè verde', 9502],

  // ═══════════════ ANIMAZIONE (14) ═══════════════
  ['Il Mio Vicino Totoro', 1988, 86, 8.1, 'animazione', 'Due sorelle, un bosco e uno spirito gentile. Pace assoluta.', '#7ac47a', '#2f5e3a', ['Netflix'], 'Il bosco è vivo.', 'Thè bancha', 8392],
  ['La Città Incantata', 2001, 125, 8.6, 'animazione', 'Una bambina entra in un mondo di spiriti per salvare i genitori.', '#c4504a', '#2a1a3a', ['Netflix'], 'Non dimenticare il tuo nome.', 'Thè verde', 129],
  ['Principessa Mononoke', 1997, 134, 8.4, 'animazione', 'Uomo e natura in conflitto in un Giappone mitico.', '#4a7a4a', '#1a2a1a', ['Netflix'], 'Guarda con occhi puri.', 'Sake', 128],
  ['Il Castello Errante di Howl', 2004, 119, 8.2, 'animazione', 'Una ragazza maledetta trova rifugio in un castello magico.', '#5a8ac0', '#1a2a4a', ['Netflix'], 'La magia ha un prezzo.', 'Thè', 4935],
  ['Porco Rosso', 1992, 94, 7.7, 'animazione', 'Un aviatore trasformato in maiale vola nell\'Adriatico.', '#c4504a', '#1a3a5a', ['Netflix'], 'Meglio maiale che fascista.', 'Vino rosso', 11621],
  ['Ponyo', 2008, 101, 7.7, 'animazione', 'Una pesciolina magica vuole diventare umana.', '#e8704a', '#1a5a8a', ['Netflix'], 'Il mare è vivo!', 'Succo', 12429],
  ['Akira', 1988, 124, 8.0, 'animazione', 'Capolavoro cyberpunk giapponese nella Neo-Tokyo del futuro.', '#c42a2a', '#0a0a1a', ['Prime Video'], 'Tetsuo!', 'Energy drink', 149],
  ['Perfect Blue', 1997, 81, 8.0, 'animazione', 'Thriller psicologico animato su identità e ossessione.', '#8a4a7a', '#1a0a2a', ['Prime Video'], 'Chi sono io?', 'Caffè', 10494],
  ['Your Name', 2016, 106, 8.5, 'animazione', 'Due adolescenti scambiano i corpi attraverso il tempo.', '#4a7ac0', '#1a2a5a', ['Prime Video'], 'Qual è il tuo nome?', 'Thè', 372058],
  ['Il Castello nel Cielo', 1986, 125, 8.0, 'animazione', 'Una città volante leggendaria e due ragazzi alla sua ricerca.', '#5a9ac0', '#1a3a5a', ['Netflix'], 'Laputa esiste!', 'Limonata', 10515],
  ['Nausicaä', 1984, 117, 8.0, 'animazione', 'Una principessa cerca di salvare un mondo post-apocalittico.', '#5a8a6a', '#1a2a2a', ['Netflix'], 'La natura guarisce.', 'Thè', 81],
  ['Il Ragazzo e l\'Airone', 2023, 124, 7.5, 'animazione', 'Un ragazzo entra in un mondo fantastico guidato da un airone.', '#4a6a8a', '#1a2a3a', ['Netflix'], 'Come vivrai?', 'Thè', 508883],
  ['Spider-Man: Un Nuovo Universo', 2018, 117, 8.4, 'animazione', 'Animazione rivoluzionaria e multiverso in stile fumetto.', '#c42a4a', '#2a0a4a', ['Netflix'], 'Chiunque può indossare la maschera.', 'Soda', 324857],
  ['Persepolis', 2007, 96, 8.0, 'animazione', 'Autobiografia animata di una ragazza iraniana durante la rivoluzione.', '#4a4a4a', '#0a0a0a', ['Prime Video'], 'La libertà ha un prezzo.', 'Thè alla menta', 2013],
];

/* ── Costruzione catalogo con deduplica rigorosa ── */
const seenKeys = new Set<string>();
export const FILMS: Film[] = [];

raw.forEach(([t, y, d, r, mood, s, c1, c2, platforms, quote, drink, tmdbId], i) => {
  const key = `${t.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim()}|${y}`;
  if (seenKeys.has(key)) return; // scarta duplicati
  seenKeys.add(key);
  FILMS.push({
    id: 'f' + i,
    t,
    y,
    d,
    r,
    mood,
    s,
    c: [c1, c2],
    a: i % 6,
    fmt: y <= 1999 ? 'VHS' : 'DVD',
    quote,
    platforms,
    snack: 'Popcorn',
    drink,
    tmdbId,
  });
});

export const FILM_BY_ID: Record<string, Film> = Object.fromEntries(FILMS.map((f) => [f.id, f]));

export const FILMS_BY_MOOD: Record<MoodId, Film[]> = MOODS.reduce((acc, m) => {
  acc[m.id] = FILMS.filter((f) => f.mood === m.id);
  return acc;
}, {} as Record<MoodId, Film[]>);

export const prezzo = (f: Film) => (f.fmt === 'VHS' ? 2.5 : 3.5) + (f.r > 8.4 ? 1 : 0);

function loadCustomFilms(): Film[] {
  try {
    const s = localStorage.getItem('moodbuster_custom_films');
    if (s) {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.filter((f: Film) => !FILM_BY_ID[f.id]);
    }
  } catch {
    /* ignore */
  }
  return [];
}

export function saveCustomFilm(film: Omit<Film, 'id' | 'a' | 'fmt' | 'tmdbId'>): Film {
  const custom = loadCustomFilms();
  const newFilm: Film = {
    ...film,
    id: 'custom_' + Date.now(),
    a: Math.floor(Math.random() * 6),
    fmt: film.y <= 1999 ? 'VHS' : 'DVD',
    tmdbId: 0,
    isCustom: true,
  };
  custom.push(newFilm);
  try {
    localStorage.setItem('moodbuster_custom_films', JSON.stringify(custom));
  } catch {
    /* ignore */
  }
  FILM_BY_ID[newFilm.id] = newFilm;
  FILMS.push(newFilm);
  FILMS_BY_MOOD[newFilm.mood].push(newFilm);
  return newFilm;
}

// Carica subito i custom salvati
loadCustomFilms().forEach((f) => {
  if (!FILM_BY_ID[f.id]) {
    FILMS.push(f);
    FILM_BY_ID[f.id] = f;
    (FILMS_BY_MOOD[f.mood] ||= []).push(f);
  }
});

/**
 * Aggiunge un film al catalogo runtime e aggiorna gli indici.
 * Usato per film YouTube e nuove uscite TMDB.
 */
export function addFilmToCatalog(film: Omit<Film, 'id' | 'a' | 'fmt'> & { id?: string }): Film {
  // Controlla che non esista già
  const normalized = film.t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const exists = FILMS.some(
    (f) => f.t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === normalized && Math.abs(f.y - film.y) <= 1
  );
  if (exists) {
    return FILMS.find(
      (f) => f.t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() === normalized && Math.abs(f.y - film.y) <= 1
    )!;
  }

  const id = film.id || 'dynamic_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const newFilm: Film = {
    ...film,
    id,
    a: Math.floor(Math.random() * 6),
    fmt: film.y <= 1999 ? 'VHS' : 'DVD',
    isCustom: true,
  } as Film;
  FILMS.push(newFilm);
  FILM_BY_ID[newFilm.id] = newFilm;
  (FILMS_BY_MOOD[newFilm.mood] ||= []).push(newFilm);
  return newFilm;
}

/**
 * Rimuove un film dal catalogo runtime e aggiorna gli indici.
 */
export function removeFilmFromCatalog(filmId: string): boolean {
  const idx = FILMS.findIndex((f) => f.id === filmId);
  if (idx === -1) return false;
  const film = FILMS[idx];
  FILMS.splice(idx, 1);
  delete FILM_BY_ID[filmId];
  const moodArr = FILMS_BY_MOOD[film.mood];
  if (moodArr) {
    const mIdx = moodArr.findIndex((f) => f.id === filmId);
    if (mIdx !== -1) moodArr.splice(mIdx, 1);
  }
  return true;
}

/**
 * Deduplica il catalogo FILMS per titolo+anno, mantenendo la prima occorrenza.
 */
export function deduplicateCatalog(): number {
  const seen = new Set<string>();
  let removed = 0;
  for (let i = FILMS.length - 1; i >= 0; i--) {
    const f = FILMS[i];
    const key = `${f.t.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim()}|${f.y}`;
    if (seen.has(key)) {
      removeFilmFromCatalog(f.id);
      removed++;
    } else {
      seen.add(key);
    }
  }
  return removed;
}
