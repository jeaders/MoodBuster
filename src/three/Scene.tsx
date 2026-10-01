import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  BOX,
  CINEMA,
  CLERK,
  GOND,
  GONDOLAS,
  KIOSK,
  ROOM,
  SHELF_TOPS,
  SLOTS_BY_FILM,
  type Slot,
} from '../lib/layout';
import { FILM_BY_ID, MOOD_BY_ID, FILMS } from '../data/films';
import {
  bannerTexture,
  carpetTexture,
  ceilingTexture,
  cinemaCarpetTexture,
  cinemaScreenTexture,
  clerkFaceTexture,
  kioskScreenTexture,
  logoTexture,
  moodSignTexture,
  posterTexture,
  stripeTexture,
  wallTexture,
} from '../lib/textures';
import { focusMark, useGame } from '../lib/state';
import { loadTmdbPosterTexture } from '../lib/threePosters';

type Item = { p: [number, number, number]; r?: [number, number, number]; s?: [number, number, number] };

const tmpO = new THREE.Object3D();
const tmpC = new THREE.Color();

function Inst({
  geometry,
  material,
  items,
  colors,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  items: Item[];
  colors?: string[];
}) {
  const ref = useRef<THREE.InstancedMesh>(null!);
  useLayoutEffect(() => {
    const m = ref.current;
    items.forEach((it, i) => {
      tmpO.position.set(it.p[0], it.p[1], it.p[2]);
      tmpO.rotation.set(it.r?.[0] ?? 0, it.r?.[1] ?? 0, it.r?.[2] ?? 0);
      tmpO.scale.set(it.s?.[0] ?? 1, it.s?.[1] ?? 1, it.s?.[2] ?? 1);
      tmpO.updateMatrix();
      m.setMatrixAt(i, tmpO.matrix);
      if (colors) m.setColorAt(i, tmpC.set(colors[i]));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    m.computeBoundingSphere();
  }, [items, colors]);
  return <instancedMesh ref={ref} args={[geometry, material, items.length]} />;
}

/* ------------------------------------------------------------------ */
function Lights() {
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  const lamps = useMemo(() => {
    const out: [number, number, number][] = [];
    for (const x of [-10, 10]) for (const z of [-12, -3, 7]) out.push([x, 4.05, z]);
    return out;
  }, []);

  // Oscura le luci del negozio e della sala se l'utente è seduto a guardare il film
  const ambientIntensity = seatedSeatId ? 0.07 : 0.52;
  const directionalIntensity = seatedSeatId ? 0.04 : 0.45;
  const lampIntensity = seatedSeatId ? 0.7 : 10;

  return (
    <>
      <ambientLight intensity={ambientIntensity} />
      <hemisphereLight args={['#dbeafe', '#3a2e22', seatedSeatId ? 0.1 : 0.62]} />
      <directionalLight position={[2, 8, 20]} intensity={directionalIntensity} color="#fff4e0" />
      {/* Accento freddo per contrasto cinematografico */}
      <directionalLight position={[-14, 6, -10]} intensity={seatedSeatId ? 0.05 : 0.28} color="#8ab4ff" />
      {lamps.map((p, i) => (
        <pointLight key={i} position={p} intensity={lampIntensity} distance={17} decay={1.6} color="#fff3dc" />
      ))}
      {lamps.map((p, i) => (
        <mesh key={'p' + i} position={[p[0], 4.26, p[2]]} rotation-x={Math.PI / 2}>
          <planeGeometry args={[3.6, 1.1]} />
          <meshBasicMaterial color="#fffaf0" />
        </mesh>
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
function Room() {
  const carpet = useMemo(carpetTexture, []);
  const wall = useMemo(wallTexture, []);
  const ceil = useMemo(ceilingTexture, []);
  const stripe = useMemo(() => stripeTexture('#10306e', '#f5c518'), []);
  const logo = useMemo(logoTexture, []);
  const novita = useMemo(() => bannerTexture('NUOVE USCITE', 'appena rientrate dal noleggio', '#b8142a', '#ffe9a8'), []);
  const uscita = useMemo(() => bannerTexture('USCITA', 'grazie e buona visione', '#0f1830', '#79f2b4'), []);
  const salaCinemaSign = useMemo(() => bannerTexture('SALA 1', 'maxischermo e anteprime ▶', '#8a0f1d', '#ffd84a'), []);
  const wallPosters = useMemo(() => [FILMS[16], FILMS[56], FILMS[24], FILMS[40], FILMS[8], FILMS[48]], []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[ROOM.hx * 2, ROOM.hz * 2]} />
        <meshStandardMaterial map={carpet} roughness={1} />
      </mesh>
      <mesh position={[0, ROOM.h, 0]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[ROOM.hx * 2, ROOM.hz * 2]} />
        <meshStandardMaterial map={ceil} roughness={1} color="#9aa0ab" />
      </mesh>

      {/* pareti negozio */}
      <mesh position={[0, ROOM.h / 2, -ROOM.hz]}>
        <planeGeometry args={[ROOM.hx * 2, ROOM.h]} />
        <meshStandardMaterial map={wall} color="#cfd6e0" roughness={1} />
      </mesh>
      <mesh position={[0, ROOM.h / 2, ROOM.hz]} rotation-y={Math.PI}>
        <planeGeometry args={[ROOM.hx * 2, ROOM.h]} />
        <meshStandardMaterial map={wall} color="#cfd6e0" roughness={1} />
      </mesh>
      <mesh position={[-ROOM.hx, ROOM.h / 2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[ROOM.hz * 2, ROOM.h]} />
        <meshStandardMaterial map={wall} color="#cfd6e0" roughness={1} />
      </mesh>

      {/* Parete EST con varco per la Sala Cinema (apertura da z = -8.8 a z = -3.2) */}
      <mesh position={[ROOM.hx, ROOM.h / 2, -13.9]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[10.2, ROOM.h]} />
        <meshStandardMaterial map={wall} color="#cfd6e0" roughness={1} />
      </mesh>
      <mesh position={[ROOM.hx, ROOM.h / 2, 7.9]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[22.2, ROOM.h]} />
        <meshStandardMaterial map={wall} color="#cfd6e0" roughness={1} />
      </mesh>
      <mesh position={[ROOM.hx, 3.75, -6]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[5.6, 1.1]} />
        <meshStandardMaterial color="#1b233a" />
      </mesh>
      {/* Montanti della porta */}
      {[-9, -3].map((z) => (
        <mesh key={z} position={[ROOM.hx + 0.3, 1.9, z]}>
          <boxGeometry args={[0.7, 3.8, 0.35]} />
          <meshStandardMaterial color="#7a0f1b" />
        </mesh>
      ))}
      {/* Insegna sopra il varco della Sala Cinema */}
      <mesh position={[ROOM.hx - 0.08, 3.15, -6]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[4.6, 1.05]} />
        <meshBasicMaterial map={salaCinemaSign} />
      </mesh>
      {/* Corridoio illuminato verso la sala */}
      <mesh position={[ROOM.hx + 0.9, 0.02, -6]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2.4, 5.6]} />
        <meshBasicMaterial color="#8a0f1d" />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={'ar' + i} position={[ROOM.hx + 1.9 + i * 0.55, 0.04, -6 + (i % 2 === 0 ? 0.9 : -0.9)]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.16, 12]} />
          <meshBasicMaterial color="#ffd84a" />
        </mesh>
      ))}
      <pointLight position={[ROOM.hx + 1, 3.2, -6]} intensity={7} distance={9} color="#ffcf6a" />

      {/* fascia decorativa */}
      <mesh position={[-ROOM.hx + 0.06, 3.55, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[ROOM.hz * 2, 0.55]} />
        <meshBasicMaterial map={stripe} />
      </mesh>
      <mesh position={[0, 4.12, -ROOM.hz + 0.06]}>
        <planeGeometry args={[ROOM.hx * 2, 0.3]} />
        <meshBasicMaterial map={stripe} />
      </mesh>

      {/* insegna */}
      <mesh position={[0, 3.42, -ROOM.hz + 0.09]}>
        <planeGeometry args={[6.4, 1.6]} />
        <meshBasicMaterial map={logo} />
      </mesh>
      {[-11.5, 11.5].map((x) => (
        <mesh key={x} position={[x, 3.0, -ROOM.hz + 0.09]}>
          <planeGeometry args={[4.4, 1.47]} />
          <meshBasicMaterial map={novita} />
        </mesh>
      ))}

      {/* poster incorniciati alle pareti */}
      {wallPosters.map((f, i) => {
        const side = i < 3 ? -1 : 1;
        const z = [-9, -1, 7][i % 3];
        if (side === 1 && z === -1) return null; // non sovrapporre con la porta del cinema
        return (
          <group key={f.id} position={[side * (ROOM.hx - 0.08), 2.1, z]} rotation-y={(-side * Math.PI) / 2}>
            <mesh position={[0, 0, -0.04]}>
              <planeGeometry args={[1.82, 2.62]} />
              <meshBasicMaterial color="#0d0d12" />
            </mesh>
            <mesh>
              <planeGeometry args={[1.6, 2.4]} />
              <meshBasicMaterial map={posterTexture(f)} />
            </mesh>
          </group>
        );
      })}

      {/* vetrina d'ingresso */}
      <mesh position={[0, 1.8, ROOM.hz - 0.08]} rotation-y={Math.PI}>
        <planeGeometry args={[15, 3]} />
        <meshBasicMaterial color="#dceeff" />
      </mesh>
      {[-7.5, -4.5, -1.5, 1.5, 4.5, 7.5].map((x) => (
        <mesh key={x} position={[x, 1.8, ROOM.hz - 0.14]}>
          <boxGeometry args={[0.16, 3, 0.1]} />
          <meshStandardMaterial color="#20283a" />
        </mesh>
      ))}
      <mesh position={[0, 0.35, ROOM.hz - 0.14]}>
        <boxGeometry args={[15, 0.7, 0.14]} />
        <meshStandardMaterial color="#20283a" />
      </mesh>
      <mesh position={[0, 3.6, ROOM.hz - 0.2]} rotation-y={Math.PI}>
        <planeGeometry args={[6, 1]} />
        <meshBasicMaterial map={uscita} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
function CinemaRoom() {
  const cinemaCarpet = useMemo(cinemaCarpetTexture, []);
  const held = useGame((s) => s.held);
  const openFilm = useGame((s) => s.openFilm);
  const seatFilmId = useGame((s) => s.seatFilmId);
  const seatedSeatId = useGame((s) => s.seatedSeatId);

  // Il film proiettato sul maxischermo 3D:
  // Se siamo seduti, riproduce il film del sedile (seatFilmId), altrimenti segue il film che abbiamo in mano o in vetrina
  const curFilm = seatedSeatId
    ? (seatFilmId ? FILM_BY_ID[seatFilmId] : null)
    : (held ? FILM_BY_ID[held] : openFilm ? FILM_BY_ID[openFilm] : null);

  const screenTex = useMemo(
    () => cinemaScreenTexture(curFilm?.t, curFilm?.quote),
    [curFilm?.t, curFilm?.quote],
  );

  const seatMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8a0d18', roughness: 0.6 }), []);
  const seatGeo = useMemo(() => new THREE.BoxGeometry(0.7, 0.7, 0.6), []);
  const seatBackGeo = useMemo(() => new THREE.BoxGeometry(0.7, 0.8, 0.18), []);

  const seats = useMemo(() => {
    const list: [number, number, number][] = [];
    const rows = [-9.4, -6.4, -3.4];
    for (const z of rows) {
      for (let x = 24.5; x <= 33.5; x += 1.3) {
        list.push([x, 0.45, z]);
      }
    }
    return list;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* Pavimento cinema */}
      <mesh position={[CINEMA.x, 0.01, CINEMA.z]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[CINEMA.hx * 2, CINEMA.hz * 2]} />
        <meshStandardMaterial map={cinemaCarpet} roughness={0.9} />
      </mesh>

      {/* Soffitto scuro cinema */}
      <mesh position={[CINEMA.x, CINEMA.h, CINEMA.z]} rotation-x={Math.PI / 2}>
        <planeGeometry args={[CINEMA.hx * 2, CINEMA.hz * 2]} />
        <meshStandardMaterial color="#0b0d14" roughness={1} />
      </mesh>

      {/* Parete Nord Cinema */}
      <mesh position={[CINEMA.x, CINEMA.h / 2, CINEMA.z - CINEMA.hz]}>
        <planeGeometry args={[CINEMA.hx * 2, CINEMA.h]} />
        <meshStandardMaterial color="#1a080c" roughness={0.9} />
      </mesh>

      {/* Parete Sud Cinema */}
      <mesh position={[CINEMA.x, CINEMA.h / 2, CINEMA.z + CINEMA.hz]} rotation-y={Math.PI}>
        <planeGeometry args={[CINEMA.hx * 2, CINEMA.h]} />
        <meshStandardMaterial color="#1a080c" roughness={0.9} />
      </mesh>

      {/* Parete Est Cinema (dietro lo schermo) */}
      <mesh position={[CINEMA.x + CINEMA.hx, CINEMA.h / 2, CINEMA.z]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[CINEMA.hz * 2, CINEMA.h]} />
        <meshStandardMaterial color="#08080c" roughness={1} />
      </mesh>

      {/* Maxischermo Gigante */}
      <group position={[CINEMA.screenX - 0.2, 2.7, CINEMA.screenZ]} rotation-y={-Math.PI / 2}>
        {/* Cornice nera schermo */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[11.4, 6.4, 0.2]} />
          <meshStandardMaterial color="#050508" roughness={0.9} />
        </mesh>
        {/* Schermo attivo */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[11, 6]} />
          <meshLambertMaterial map={screenTex} emissive="#ffffff" emissiveMap={screenTex} emissiveIntensity={0.65} />
        </mesh>
        <pointLight position={[0, 0, 1.8]} intensity={8} distance={14} color="#f5c518" />
      </group>

      {/* Fascio di luce proiettore */}
      <group position={[CINEMA.projectorX, 4.4, CINEMA.projectorZ]} rotation-y={Math.PI / 2}>
        {/* Macchina proiettore */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.6, 1.2]} />
          <meshStandardMaterial color="#1e1e24" />
        </mesh>
        {/* Fascio volumetrico semitrasparente */}
        <mesh position={[0, -0.8, 8.5]} rotation-x={0.1}>
          <coneGeometry args={[4.2, 17, 16, 1, true]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={seatedSeatId ? 0.16 : 0.06} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <spotLight position={[0, 0, 0.7]} target-position={[17, -2.5, 0]} intensity={seatedSeatId ? 30 : 18} angle={0.45} penumbra={0.6} color="#dbeaff" />
      </group>

      {/* Poltroncine cinema */}
      {seats.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* Base */}
          <mesh position={[0, 0, 0]} geometry={seatGeo} material={seatMat} />
          {/* Schienale */}
          <mesh position={[0, 0.45, -0.22]} rotation-x={-0.12} geometry={seatBackGeo} material={seatMat} />
          {/* Gambe metalliche */}
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 0.35, 8]} />
            <meshStandardMaterial color="#0d0d12" metalness={0.8} />
          </mesh>
          {/* Braccioli */}
          {[-0.38, 0.38].map((bx) => (
            <mesh key={bx} position={[bx, 0.25, 0]}>
              <boxGeometry args={[0.08, 0.2, 0.55]} />
              <meshStandardMaterial color="#101015" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Luci segnapasso lungo il corridoio centrale */}
      {[-8, -5, -2, 1].map((z, i) => (
        <mesh key={i} position={[21.5, 0.04, z]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.12, 12]} />
          <meshBasicMaterial color="#ffd84a" />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
function Shelving() {
  const woodMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d8d3c6', roughness: 0.85 }), []);
  const darkMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#232a3a', roughness: 0.7 }), []);
  const valMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }), []);
  const shadowMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: '#000', transparent: true, opacity: 0.3, depthWrite: false }),
    [],
  );

  const baseGeo = useMemo(() => new THREE.BoxGeometry(GOND.len, 0.16, GOND.depth), []);
  const spineGeo = useMemo(() => new THREE.BoxGeometry(GOND.len, GOND.height, 0.14), []);
  const capGeo = useMemo(() => new THREE.BoxGeometry(0.14, GOND.height, GOND.depth), []);
  const plankGeo = useMemo(() => new THREE.BoxGeometry(GOND.len - 0.16, 0.06, 0.64), []);
  const valGeo = useMemo(() => new THREE.BoxGeometry(GOND.len + 0.16, 0.44, GOND.depth + 0.12), []);
  const shadowGeo = useMemo(() => new THREE.PlaneGeometry(GOND.len + 1.2, GOND.depth + 1.1), []);

  const bases = useMemo<Item[]>(() => GONDOLAS.map((g) => ({ p: [g.x, 0.08, g.z] })), []);
  const spines = useMemo<Item[]>(() => GONDOLAS.map((g) => ({ p: [g.x, GOND.height / 2, g.z] })), []);
  const caps = useMemo<Item[]>(
    () => GONDOLAS.flatMap((g) => [-1, 1].map((s) => ({ p: [g.x + (s * GOND.len) / 2, GOND.height / 2, g.z] as [number, number, number] }))),
    [],
  );
  const planks = useMemo<Item[]>(
    () =>
      GONDOLAS.flatMap((g) =>
        [-1, 1].flatMap((s) =>
          SHELF_TOPS.map((t) => ({ p: [g.x, t - 0.03, g.z + s * 0.38] as [number, number, number] })),
        ),
      ),
    [],
  );
  const vals = useMemo<Item[]>(() => GONDOLAS.map((g) => ({ p: [g.x, GOND.height + 0.18, g.z] })), []);
  const valColors = useMemo(() => GONDOLAS.map((g) => MOOD_BY_ID[g.mood].colore), []);
  const shadows = useMemo<Item[]>(
    () => GONDOLAS.map((g) => ({ p: [g.x, 0.012, g.z], r: [-Math.PI / 2, 0, 0] as [number, number, number] })),
    [],
  );

  // scaffale a muro
  const wallPlanks = useMemo<Item[]>(() => [0.72, 1.34, 1.96].map((t) => ({ p: [0, t - 0.03, -ROOM.hz + 0.52] })), []);
  const wallPlankGeo = useMemo(() => new THREE.BoxGeometry(15, 0.06, 0.72), []);

  return (
    <group>
      <Inst geometry={shadowGeo} material={shadowMat} items={shadows} />
      <Inst geometry={baseGeo} material={darkMat} items={bases} />
      <Inst geometry={spineGeo} material={darkMat} items={spines} />
      <Inst geometry={capGeo} material={darkMat} items={caps} />
      <Inst geometry={plankGeo} material={woodMat} items={planks} />
      <Inst geometry={valGeo} material={valMat} items={vals} colors={valColors} />
      <Inst geometry={wallPlankGeo} material={woodMat} items={wallPlanks} />
      <mesh position={[0, 1.4, -ROOM.hz + 0.14]}>
        <boxGeometry args={[15.2, 2.8, 0.12]} />
        <meshStandardMaterial color="#232a3a" />
      </mesh>

      {/* cartelli mood sulla testata e appesi al soffitto */}
      {GONDOLAS.map((g) => {
        const tex = moodSignTexture(MOOD_BY_ID[g.mood]);
        return (
          <group key={g.id}>
            {[1, -1].map((s) => (
              <mesh key={s} position={[g.x, GOND.height + 0.18, g.z + s * (GOND.depth / 2 + 0.07)]} rotation-y={s > 0 ? 0 : Math.PI}>
                <planeGeometry args={[GOND.len - 0.2, 0.4]} />
                <meshBasicMaterial map={tex} />
              </mesh>
            ))}
            <mesh position={[g.x, 3.45, g.z]}>
              <planeGeometry args={[4.6, 1.15]} />
              <meshBasicMaterial map={tex} side={THREE.DoubleSide} />
            </mesh>
            {[-1.8, 1.8].map((o) => (
              <mesh key={o} position={[g.x + o, 3.93, g.z]}>
                <boxGeometry args={[0.035, 0.85, 0.035]} />
                <meshStandardMaterial color="#8d939e" metalness={0.6} roughness={0.4} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ */
function FilmBoxes() {
  const caseGeo = useMemo(() => new THREE.BoxGeometry(BOX.w, BOX.h, BOX.d), []);
  const caseMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#15151b', roughness: 0.45 }), []);
  const posterGeo = useMemo(() => new THREE.PlaneGeometry(BOX.w - 0.035, BOX.h - 0.045), []);

  const allCases = useMemo<Item[]>(() => {
    const out: Item[] = [];
    for (const list of Object.values(SLOTS_BY_FILM))
      for (const s of list as Slot[]) out.push({ p: [s.x, s.y, s.z], r: [0, Math.atan2(s.nx, s.nz), 0] });
    return out;
  }, []);

  const groups = useMemo(() => Object.entries(SLOTS_BY_FILM), []);

  return (
    <group>
      <Inst geometry={caseGeo} material={caseMat} items={allCases} />
      {groups.map(([filmId, list]) => (
        <PosterGroup key={filmId} filmId={filmId} list={list as Slot[]} geo={posterGeo} />
      ))}
    </group>
  );
}

function PosterGroup({ filmId, list, geo }: { filmId: string; list: Slot[]; geo: THREE.BufferGeometry }) {
  const film = FILM_BY_ID[filmId];
  const mat = useMemo(() => {
    const tex = posterTexture(film);
    return new THREE.MeshLambertMaterial({ map: tex, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.3 });
  }, [film]);

  // Sostituisce la copertina procedurale con la locandina reale TMDB appena caricata
  useEffect(() => {
    if (!film?.tmdbId) return;
    let alive = true;
    loadTmdbPosterTexture(film.tmdbId, 'w185', (t) => {
      if (!alive) return;
      mat.map = t;
      mat.emissiveMap = t;
      mat.needsUpdate = true;
    });
    return () => {
      alive = false;
    };
  }, [film?.tmdbId, mat]);

  const items = useMemo<Item[]>(
    () =>
      list.map((s) => ({
        p: [s.x + s.nx * 0.079, s.y, s.z + s.nz * 0.079] as [number, number, number],
        r: [0, Math.atan2(s.nx, s.nz), 0] as [number, number, number],
      })),
    [list],
  );
  return <Inst geometry={geo} material={mat} items={items} />;
}

/* ------------------------------------------------------------------ */
function ClerkNPC() {
  const face = useMemo(clerkFaceTexture, []);
  const armL = useRef<THREE.Group>(null!);
  const armR = useRef<THREE.Group>(null!);
  const head = useRef<THREE.Group>(null!);

  useFrame((st) => {
    const t = st.clock.elapsedTime;
    if (armR.current) armR.current.rotation.x = Math.sin(t * 1.5) * 0.15 - 0.3;
    if (armL.current) armL.current.rotation.x = -Math.sin(t * 1.5) * 0.15 - 0.3;
    if (head.current) head.current.rotation.y = Math.sin(t * 0.8) * 0.25;
  });

  return (
    <group position={[CLERK.x, 0, CLERK.z]} rotation-y={0}>
      {/* Gambe */}
      <mesh position={[-0.15, 0.45, 0]}>
        <boxGeometry args={[0.26, 0.9, 0.3]} />
        <meshStandardMaterial color="#1b233a" />
      </mesh>
      <mesh position={[0.15, 0.45, 0]}>
        <boxGeometry args={[0.26, 0.9, 0.3]} />
        <meshStandardMaterial color="#1b233a" />
      </mesh>

      {/* Torso con maglietta blu Blockbuster */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[0.66, 0.76, 0.36]} />
        <meshStandardMaterial color="#0b1f5c" />
      </mesh>
      {/* Badge dipendente */}
      <mesh position={[0.18, 1.45, 0.19]}>
        <planeGeometry args={[0.16, 0.1]} />
        <meshBasicMaterial color="#f5c518" />
      </mesh>

      {/* Braccia */}
      <group ref={armL} position={[-0.46, 1.55, 0]}>
        <mesh position={[0, -0.38, 0]}>
          <boxGeometry args={[0.24, 0.76, 0.3]} />
          <meshStandardMaterial color="#f5cd30" />
        </mesh>
      </group>
      <group ref={armR} position={[0.46, 1.55, 0]}>
        <mesh position={[0, -0.38, 0]}>
          <boxGeometry args={[0.24, 0.76, 0.3]} />
          <meshStandardMaterial color="#f5cd30" />
        </mesh>
      </group>

      {/* Testa con occhiali */}
      <group ref={head} position={[0, 1.95, 0]}>
        <mesh>
          <boxGeometry args={[0.54, 0.54, 0.54]} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <meshStandardMaterial
              key={i}
              attach={`material-${i}`}
              color="#f5cd30"
              map={i === 4 ? face : null}
              roughness={0.7}
            />
          ))}
        </mesh>
        {/* Cartellino sopra la testa */}
        <mesh position={[0, 0.48, 0]}>
          <planeGeometry args={[1.2, 0.28]} />
          <meshBasicMaterial map={useMemo(() => bannerTexture('CLAUDIO', 'COMMESSO DEL MESE', '#0b1f5c', '#f5c518'), [])} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
function PopcornMachine() {
  const popcornKernels = useMemo(() => {
    return Array.from({ length: 18 }, () => ({
      x: (Math.random() - 0.5) * 0.7,
      z: (Math.random() - 0.5) * 0.7,
      baseY: 1.4 + Math.random() * 0.3,
      speed: 3 + Math.random() * 4,
      offset: Math.random() * Math.PI * 2,
    }));
  }, []);

  const kernelRefs = useRef<THREE.Mesh[]>([]);

  useFrame((st) => {
    const t = st.clock.elapsedTime;
    kernelRefs.current.forEach((m, idx) => {
      if (!m) return;
      const k = popcornKernels[idx];
      m.position.y = k.baseY + Math.abs(Math.sin(t * k.speed + k.offset)) * 0.25;
      m.rotation.x = t * 2;
      m.rotation.y = t * 3;
    });
  });

  return (
    <group position={[17.5, 0, 14.3]}>
      {/* Bancone snack */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4.2, 1, 1.5]} />
        <meshStandardMaterial color="#8c1420" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[4.4, 0.1, 1.7]} />
        <meshStandardMaterial color="#efe6cf" />
      </mesh>

      {/* Macchina del Popcorn */}
      <group position={[-1.1, 0, 0]}>
        {/* Base e telaio rosso */}
        <mesh position={[0, 1.25, 0]}>
          <boxGeometry args={[1.1, 0.3, 1]} />
          <meshStandardMaterial color="#b8142a" metalness={0.4} />
        </mesh>
        {/* Tetto bombato vintage */}
        <mesh position={[0, 2.25, 0]}>
          <boxGeometry args={[1.15, 0.2, 1.05]} />
          <meshStandardMaterial color="#ffd84a" metalness={0.5} />
        </mesh>
        {/* Vetri trasparenti */}
        <mesh position={[0, 1.7, 0]}>
          <boxGeometry args={[1.05, 0.8, 0.95]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.3} roughness={0.1} />
        </mesh>
        {/* Pentola interna per friggere il mais */}
        <mesh position={[0, 1.8, 0]}>
          <cylinderGeometry args={[0.26, 0.22, 0.25, 12]} />
          <meshStandardMaterial color="#888888" metalness={0.9} />
        </mesh>

        {/* Chicchi di popcorn che saltano */}
        {popcornKernels.map((k, idx) => (
          <mesh
            key={idx}
            ref={(el) => {
              if (el) kernelRefs.current[idx] = el;
            }}
            position={[k.x, k.baseY, k.z]}
          >
            <sphereGeometry args={[0.045, 6, 6]} />
            <meshStandardMaterial color="#ffea75" emissive="#ffea75" emissiveIntensity={0.2} />
          </mesh>
        ))}

        {/* Luce calda interna al macchinario */}
        <pointLight position={[0, 1.8, 0]} intensity={4} distance={3.5} color="#ffa500" />
      </group>

      {/* Bibite in lattina e bicchieroni */}
      {[0.4, 0.9, 1.4].map((x, i) => (
        <mesh key={i} position={[x, 1.25, 0.2]}>
          <cylinderGeometry args={[0.12, 0.1, 0.35, 12]} />
          <meshStandardMaterial color={['#e5455e', '#f5c518', '#4fa8e0'][i]} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
function Props() {
  const cassa = useMemo(() => bannerTexture('CASSA • RESI', 'si accettano tessere socio', '#0f1830', '#f5c518'), []);
  const screen = useMemo(kioskScreenTexture, []);
  const ringRef = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (ringRef.current) ringRef.current.rotation.y += dt * 0.9;
  });

  return (
    <group>
      {/* Bancone cassa con Claudio */}
      <group position={[-17, 0, 13.2]}>
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[6.8, 1.1, 2]} />
          <meshStandardMaterial color="#13306e" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.13, 0]}>
          <boxGeometry args={[7.1, 0.1, 2.25]} />
          <meshStandardMaterial color="#e8e2d2" roughness={0.6} />
        </mesh>
        {/* Registratore di cassa vintage */}
        <mesh position={[-2, 1.45, 0]}>
          <boxGeometry args={[0.8, 0.55, 0.6]} />
          <meshStandardMaterial color="#2c3240" />
        </mesh>
        {/* Monitor CRT a fosfori verdi/blu */}
        <mesh position={[1.6, 1.45, 0]} rotation-x={-0.25}>
          <boxGeometry args={[0.9, 0.6, 0.08]} />
          <meshStandardMaterial color="#10141c" emissive="#1e5fa8" emissiveIntensity={0.7} />
        </mesh>
        {/* Insegna Cassa */}
        <mesh position={[0, 2.6, -1.1]}>
          <planeGeometry args={[4.5, 1.5]} />
          <meshBasicMaterial map={cassa} />
        </mesh>
      </group>

      {/* Claudio il commesso */}
      <ClerkNPC />

      {/* Macchina Popcorn */}
      <PopcornMachine />

      {/* MOOD-O-MATIC */}
      <group position={[KIOSK.x, 0, KIOSK.z]}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[1.25, 1.4, 1, 24]} />
          <meshStandardMaterial color="#231046" roughness={0.6} />
        </mesh>
        <mesh position={[0, 1.02, 0]}>
          <cylinderGeometry args={[1.35, 1.35, 0.08, 24]} />
          <meshStandardMaterial color="#f5c518" metalness={0.3} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.55, -0.1]}>
          <boxGeometry args={[1.9, 1.2, 0.5]} />
          <meshStandardMaterial color="#120a28" roughness={0.5} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh key={s} position={[0, 1.58, s > 0 ? 0.17 : -0.37]} rotation-y={s > 0 ? 0 : Math.PI}>
            <planeGeometry args={[1.6, 1.1]} />
            <meshBasicMaterial map={screen} />
          </mesh>
        ))}
        <mesh ref={ringRef} position={[0, 2.5, 0]}>
          <torusGeometry args={[0.52, 0.07, 10, 28]} />
          <meshStandardMaterial color="#7ef5c0" emissive="#2fe0a0" emissiveIntensity={1.3} />
        </mesh>
        <pointLight position={[0, 2.1, 0]} intensity={6} distance={7} color="#9d6bff" />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
function Highlight() {
  const ref = useRef<THREE.Group>(null!);
  useFrame((st) => {
    const g = ref.current;
    if (!g) return;
    g.visible = focusMark.active;
    if (!focusMark.active) return;
    g.position.set(focusMark.x + focusMark.nz * 0.0, focusMark.y, focusMark.z);
    g.rotation.y = focusMark.nz > 0 ? 0 : Math.PI;
    const p = 1 + Math.sin(st.clock.elapsedTime * 6) * 0.06;
    g.scale.set(p, p, 1);
  });
  return (
    <group ref={ref} visible={false}>
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[BOX.w + 0.08, BOX.h + 0.08]} />
        <meshBasicMaterial color="#ffd84a" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh position={[0, BOX.h / 2 + 0.17, 0.12]} rotation-z={Math.PI}>
        <coneGeometry args={[0.07, 0.14, 4]} />
        <meshBasicMaterial color="#ffd84a" />
      </mesh>
    </group>
  );
}

function Beacon() {
  const wp = useGame((s) => s.waypoint);
  const ref = useRef<THREE.Group>(null!);
  useFrame((st) => {
    if (ref.current) {
      ref.current.rotation.y = st.clock.elapsedTime * 1.4;
      ref.current.position.y = Math.sin(st.clock.elapsedTime * 2) * 0.12;
    }
  });
  if (!wp) return null;
  return (
    <group position={[wp.x, 0, wp.z]}>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 3.2, 12, 1, true]} />
        <meshBasicMaterial color="#39e6a0" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      <group ref={ref} position={[0, 0, 0]}>
        <mesh position={[0, 2.5, 0]} rotation-x={Math.PI}>
          <coneGeometry args={[0.3, 0.6, 4]} />
          <meshBasicMaterial color="#39e6a0" />
        </mesh>
      </group>
      <mesh position={[0, 0.03, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.5, 0.75, 24]} />
        <meshBasicMaterial color="#39e6a0" transparent opacity={0.6} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function BigScreen() {
  const focus = useGame((s) => s.focus);
  const def = useMemo(() => bannerTexture('ORA IN VETRINA', 'guarda uno scaffale per i dettagli', '#101828', '#f5c518'), []);
  const tex = focus && focus.kind === 'film' ? posterTexture(FILM_BY_ID[focus.filmId]) : def;
  const ratio = focus && focus.kind === 'film' ? 0.667 : 1.6;
  const h = 2.1;
  return (
    <group position={[-ROOM.hx + 0.1, 2.4, 2]} rotation-y={Math.PI / 2}>
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[3.9, 2.5, 0.12]} />
        <meshStandardMaterial color="#0b0d12" />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[h * ratio, h]} />
        <meshBasicMaterial map={tex} />
      </mesh>
    </group>
  );
}

export default function Scene() {
  return (
    <>
      <fog attach="fog" args={['#0b1120', 26, 78]} />
      <Lights />
      <Room />
      <CinemaRoom />
      <Shelving />
      <FilmBoxes />
      <Props />
      <BigScreen />
      <Highlight />
      <Beacon />
    </>
  );
}
