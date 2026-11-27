export const MOVIES_DATA = [
  {
    id: 1,
    title: "Dune: Part Two",
    genre: "Sci-Fi",
    wiki: "Dune:_Part_Two",
    imdb: "https://www.imdb.com/title/tt15239678/",
    format: "IMAX",
    rating: "9.4",
    desc: "Paul Atreides se unește cu Chani și fremenii pe calea răzbunării împotriva conspiratorilor care i-au distrus familia.",
    trailer: "/dune.mp4",
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    times: ["14:00", "16:30", "19:00", "21:30"]
  },
  {
    id: 2,
    title: "Interstellar",
    genre: "Sci-Fi",
    wiki: "Interstellar_(film)",
    imdb: "https://www.imdb.com/title/tt0816692/",
    format: "IMAX",
    rating: "9.2",
    desc: "O echipă de exploratori călătorește printr-o gaură de vierme în spațiu pentru a asigura supraviețuirea umanității.",
    trailer: "/interstellar.mp4",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    times: ["12:00", "16:30", "18:00", "20:30"]
  },
  {
    id: 3,
    title: "The Dark Knight",
    genre: "Acțiune",
    wiki: "The_Dark_Knight",
    imdb: "https://www.imdb.com/title/tt0468569/",
    format: "VIP",
    rating: "9.5",
    desc: "Când amenințarea cunoscută sub numele de Joker face ravagii în Gotham, Batman trece prin cel mai mare test.",
    trailer: "/batman_dk.mp4",
    poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_FMjpg_UX1000_.jpg",
    times: ["14:00", "18:00", "19:00", "21:30"]
  },
  {
    id: 4,
    title: "Inception",
    genre: "Thriller",
    wiki: "Inception",
    imdb: "https://www.imdb.com/title/tt1375666/",
    format: "4DX",
    rating: "9.0",
    desc: "Un hoț care fură secrete corporative prin tehnologia viselor primește sarcina de a planta o idee în mintea unui CEO.",
    trailer: "/inception.mp4",
    poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_FMjpg_UX1000_.jpg",
    times: ["12:00", "14:00", "16:30", "19:00"]
  },
  {
    id: 5,
    title: "Avatar: The Way of Water",
    genre: "Sci-Fi",
    wiki: "Avatar:_The_Way_of_Water",
    imdb: "https://www.imdb.com/title/tt1630029/",
    format: "4DX",
    rating: "8.7",
    desc: "Jake Sully trăiește cu noua sa familie pe planeta Pandora și luptă pentru a-și proteja tribul în adâncurile oceanului.",
    trailer: "/avatar.mp4",
    poster: "https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    times: ["12:00", "16:30", "18:00", "20:30"]
  },
  {
    id: 6,
    title: "Oppenheimer",
    genre: "Biografic",
    wiki: "Oppenheimer_(film)",
    imdb: "https://www.imdb.com/title/tt15398776/",
    format: "IMAX",
    rating: "9.1",
    desc: "Povestea fizicianului J. Robert Oppenheimer și rolul său decisiv în dezvoltarea primei bombe atomice.",
    trailer: "/oppenheimer.mp4",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    times: ["14:00", "18:00", "19:00", "21:30"]
  },
  {
    id: 7,
    title: "Spider-Man: Across the Spider-Verse",
    genre: "Animație",
    wiki: "Spider-Man:_Across_the_Spider-Verse",
    imdb: "https://www.imdb.com/title/tt9362722/",
    format: "4DX",
    rating: "9.3",
    desc: "Miles Morales călătorește prin Multivers, unde întâlnește o nouă echipă de Oameni-Păianjen.",
    trailer: "/spiderman.mp4",
    poster: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    times: ["12:00", "14:00", "16:30", "19:00"]
  },
  {
    id: 8,
    title: "The Batman",
    genre: "Acțiune",
    wiki: "The_Batman_(film)",
    imdb: "https://www.imdb.com/title/tt1877830/",
    format: "VIP",
    rating: "8.8",
    desc: "Când un criminal sadic lasă în urmă indicii criptice, Batman investighează lumea interlopă din Gotham.",
    trailer: "/the_batman.mp4",
    poster: "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
    times: ["16:30", "18:00", "20:30", "21:30"]
  }
];

export const GENRES = [
  { id: "all", label: "Toate Tipurile", icon: "fa-border-all" },
  { id: "Sci-Fi", label: "Sci-Fi & Space", icon: "fa-user-astronaut" },
  { id: "Acțiune", label: "Acțiune & Crime", icon: "fa-explosion" },
  { id: "Thriller", label: "Thriller Psihologic", icon: "fa-masks-theater" },
  { id: "Biografic", label: "Biografic & Istoric", icon: "fa-atom" },
  { id: "Animație", label: "Animație Multivers", icon: "fa-wand-magic-sparkles" }
];

export const TIME_SLOTS = ["12:00", "14:00", "16:30", "18:00", "19:00", "20:30", "21:30"];

export const SNACKS_PRICES = {
  popcorn: 25,
  nachos: 22,
  soda: 12
};

export const FORMAT_SURCHARGE = {
  IMAX: 0,
  "4DX": 10,
  VIP: 15
};
