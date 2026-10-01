import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CLERK, KIOSK, SLOTS, CINEMA_SEATS, clampRoom, collide } from '../lib/layout';
import { focusMark, keys, look, press, rt, stick, tapReq, uiOpen, useGame } from '../lib/state';
import { faceTexture, posterTexture } from '../lib/textures';
import { FILM_BY_ID } from '../data/films';
import { audio } from '../lib/audio';

const EYE = 1.6;
const SK = 0.88;
const GRAVITY = 18;
const JUMP_FORCE = 6.2;

const vel = new THREE.Vector3();
const dir = new THREE.Vector3();
const camDir = new THREE.Vector3();
const tapVec = new THREE.Vector3();

type Slot = (typeof SLOTS)[number];

function pickSlot(
  ox: number,
  oy: number,
  oz: number,
  dx: number,
  dy: number,
  dz: number,
  maxDistSq: number,
  minDot: number,
): Slot | null {
  let best: Slot | null = null;
  let bestDot = minDot;
  for (let i = 0; i < SLOTS.length; i++) {
    const s = SLOTS[i];
    const ex = s.x - ox;
    const ez = s.z - oz;
    const d2 = ex * ex + ez * ez;
    if (d2 > maxDistSq || d2 < 0.02) continue;
    if (ex * s.nx + ez * s.nz > 0) continue;
    const ey = s.y - oy;
    const d = Math.sqrt(d2 + ey * ey);
    const dot = (ex * dx + ey * dy + ez * dz) / d;
    if (dot > bestDot) {
      bestDot = dot;
      best = s;
    }
  }
  return best;
}

function Limb({
  pivot,
  size,
  color,
  phaseRef,
  sign,
  isSeatedLeg,
}: {
  pivot: [number, number, number];
  size: [number, number, number];
  color: string;
  phaseRef: { current: number };
  sign: number;
  isSeatedLeg?: boolean;
}) {
  const g = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (g.current) {
      if (isSeatedLeg) {
        // Gambe piegate a 90° in avanti per sedersi stile Roblox
        g.current.rotation.x = -Math.PI / 2;
      } else {
        g.current.rotation.x = Math.sin(phaseRef.current) * sign;
      }
    }
  });
  return (
    <group ref={g} position={pivot}>
      <mesh position={[0, -size[1] / 2, 0]}>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.75} />
      </mesh>
    </group>
  );
}

function Avatar({ phaseRef, isSeated }: { phaseRef: { current: number }; isSeated: boolean }) {
  const face = useMemo(faceTexture, []);
  return (
    <group scale={SK} position-y={isSeated ? -0.32 : 0}>
      {/* gambe */}
      <Limb pivot={[-0.15, 0.74, 0]} size={[0.26, 0.74, 0.3]} color="#3f8c45" phaseRef={phaseRef} sign={0.55} isSeatedLeg={isSeated} />
      <Limb pivot={[0.15, 0.74, 0]} size={[0.26, 0.74, 0.3]} color="#3f8c45" phaseRef={phaseRef} sign={-0.55} isSeatedLeg={isSeated} />
      {/* braccia */}
      <Limb pivot={[-0.44, 1.48, 0]} size={[0.24, 0.74, 0.3]} color="#f5cd30" phaseRef={phaseRef} sign={-0.5} />
      <Limb pivot={[0.44, 1.48, 0]} size={[0.24, 0.74, 0.3]} color="#f5cd30" phaseRef={phaseRef} sign={0.5} />
      {/* torso */}
      <mesh position={[0, 1.11, 0]}>
        <boxGeometry args={[0.62, 0.74, 0.34]} />
        <meshStandardMaterial color="#1b55b8" roughness={0.8} />
      </mesh>
      {/* testa */}
      <mesh position={[0, 1.74, 0]}>
        <boxGeometry args={[0.52, 0.52, 0.52]} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <meshStandardMaterial key={i} attach={`material-${i}`} color="#f5cd30" map={i === 4 ? face : null} roughness={0.75} />
        ))}
      </mesh>
      {/* ombra */}
      {!isSeated && (
        <mesh position={[0, 0.015, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.55, 16]} />
          <meshBasicMaterial color="#000" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

function Hands({ phaseRef }: { phaseRef: { current: number } }) {
  const held = useGame((s) => s.held);
  const l = useRef<THREE.Group>(null!);
  const r = useRef<THREE.Group>(null!);
  useFrame(() => {
    const s = Math.sin(phaseRef.current) * 0.1;
    if (l.current) l.current.rotation.x = -1.16 + s;
    if (r.current) r.current.rotation.x = -1.16 - s;
  });
  const tex = held && FILM_BY_ID[held] ? posterTexture(FILM_BY_ID[held]) : null;
  return (
    <>
      <group ref={r} position={[0.33, -0.42, -0.34]} rotation={[-1.16, 0.1, -0.12]}>
        <mesh position={[0, -0.3, 0]} scale={SK}>
          <boxGeometry args={[0.24, 0.74, 0.3]} />
          <meshStandardMaterial color="#f5cd30" roughness={0.75} />
        </mesh>
      </group>
      <group ref={l} position={[-0.33, -0.42, -0.34]} rotation={[-1.16, -0.1, 0.12]}>
        <mesh position={[0, -0.3, 0]} scale={SK}>
          <boxGeometry args={[0.24, 0.74, 0.3]} />
          <meshStandardMaterial color="#f5cd30" roughness={0.75} />
        </mesh>
      </group>
      {tex && (
        <group position={[-0.3, -0.26, -0.62]} rotation={[0.12, 0.26, 0.08]}>
          <mesh>
            <boxGeometry args={[0.3, 0.45, 0.06]} />
            <meshStandardMaterial color="#15151b" roughness={0.45} />
          </mesh>
          <mesh position={[0, 0, 0.032]}>
            <planeGeometry args={[0.27, 0.41]} />
            <meshBasicMaterial map={tex} />
          </mesh>
        </group>
      )}
    </>
  );
}

export default function Player() {
  const camera = useThree((s) => s.camera);
  const avatarRef = useRef<THREE.Group>(null!);
  const handsRef = useRef<THREE.Group>(null!);
  const phase = useRef(0);
  const flashlight = useGame((s) => s.flashlight);
  const seatedSeatId = useGame((s) => s.seatedSeatId);
  const torchLight = useRef<THREE.SpotLight>(null!);
  const gl = useThree((s) => s.gl);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const blocked = uiOpen();
    const g = useGame.getState();

    /* ---------- sguardo ---------- */
    rt.yaw -= look.dx * 0.0026;
    rt.pitch -= look.dy * 0.0026;
    look.dx = 0;
    look.dy = 0;

    let mf = 0;
    let ms = 0;

    if (seatedSeatId) {
      // Forza lo sguardo orientato in avanti verso lo schermo
      rt.yaw = Math.max(-Math.PI / 2 - 0.75, Math.min(-Math.PI / 2 + 0.75, rt.yaw));
      rt.pitch = Math.max(-0.6, Math.min(0.6, rt.pitch));
      vel.set(0, 0, 0);

      // Premendo un tasto direzionale o spazio ci si rialza
      if (keys.has('w') || keys.has('s') || keys.has('a') || keys.has('d') || keys.has(' ') || press.jump) {
        useGame.getState().setSeatedSeatId(null);
        press.jump = false;
      }
    } else if (!blocked) {
      if (keys.has('arrowleft')) rt.yaw += 2.2 * dt;
      if (keys.has('arrowright')) rt.yaw -= 2.2 * dt;
      if (keys.has('q')) rt.yaw += 2.2 * dt;
      if (keys.has('w') || keys.has('arrowup')) mf += 1;
      if (keys.has('s') || keys.has('arrowdown')) mf -= 1;
      if (keys.has('a')) ms -= 1;
      if (keys.has('d')) ms += 1;
      mf += stick.y;
      ms += stick.x;

      if ((keys.has(' ') || press.jump) && rt.isGrounded) {
        rt.vy = JUMP_FORCE;
        rt.isGrounded = false;
        press.jump = false;
        audio.jump();
      }
    } else {
      press.jump = false;
    }
    press.jump = false;
    rt.pitch = Math.max(-1.15, Math.min(1.15, rt.pitch));

    /* ---------- gravità ---------- */
    if (!rt.isGrounded && !seatedSeatId) {
      rt.vy -= GRAVITY * dt;
      rt.y += rt.vy * dt;
      if (rt.y <= 0) {
        rt.y = 0;
        rt.vy = 0;
        rt.isGrounded = true;
        audio.step();
      }
    }

    /* ---------- movimento orizzontale ---------- */
    if (!seatedSeatId) {
      const run = keys.has('shift') || Math.hypot(stick.x, stick.y) > 0.93;
      const sinY = Math.sin(rt.yaw);
      const cosY = Math.cos(rt.yaw);
      dir.set(-sinY * mf + cosY * ms, 0, -cosY * mf - sinY * ms);
      const len = dir.length();
      if (len > 0.0001) dir.multiplyScalar(1 / len);
      dir.multiplyScalar(Math.min(len, 1) * (run ? 5.6 : 3.2));
      vel.lerp(dir, 1 - Math.exp(-12 * dt));

      const oldX = rt.x;
      const oldZ = rt.z;
      const nx = rt.x + vel.x * dt;
      const nz = rt.z + vel.z * dt;

      let hit = false;
      if (!collide(nx, rt.z)) rt.x = nx;
      else {
        hit = Math.abs(vel.x) > 2.5;
        vel.x *= 0.1;
      }
      if (!collide(rt.x, nz)) rt.z = nz;
      else {
        hit = hit || Math.abs(vel.z) > 2.5;
        vel.z *= 0.1;
      }
      if (hit) audio.oof();

      const cl = clampRoom(rt.x, rt.z);
      rt.x = cl.x;
      rt.z = cl.z;

      const movedDist = Math.hypot(rt.x - oldX, rt.z - oldZ);
      if (rt.isGrounded && movedDist > 0.001) {
        rt.lastStepDist += movedDist;
        if (rt.lastStepDist > 1.6) {
          audio.step();
          rt.lastStepDist = 0;
        }
      }
    }

    const sp = Math.hypot(vel.x, vel.z);
    rt.speed = sp;
    phase.current += sp * dt * 2.8;
    if (sp < 0.05) phase.current *= 1 - Math.min(1, dt * 8);
    const bob = Math.sin(phase.current * 2) * 0.03 * Math.min(1, sp / 3);
    rt.bob = bob;

    /* Ancoraggio geometrico al sedile occupato */
    if (seatedSeatId) {
      const activeSeat = CINEMA_SEATS.find((s) => s.id === seatedSeatId);
      if (activeSeat) {
        // Scivola dolcemente sulla poltroncina
        rt.x = THREE.MathUtils.lerp(rt.x, activeSeat.x, 0.12);
        rt.z = THREE.MathUtils.lerp(rt.z, activeSeat.z, 0.12);
        rt.y = THREE.MathUtils.lerp(rt.y, -0.42, 0.12);
      }
    }

    /* ---------- camera ---------- */
    const headY = EYE + bob + rt.y;
    camDir.set(
      -Math.sin(rt.yaw) * Math.cos(rt.pitch),
      Math.sin(rt.pitch),
      -Math.cos(rt.yaw) * Math.cos(rt.pitch),
    );
    camera.rotation.order = 'YXZ';
    if (rt.view === 'fp') {
      camera.position.set(rt.x, headY, rt.z);
      camera.rotation.set(rt.pitch, rt.yaw, 0);
    } else {
      let d = 3.6;
      for (const cand of [3.6, 2.8, 2.0, 1.2]) {
        if (!collide(rt.x - camDir.x * cand, rt.z - camDir.z * cand, 0.3)) {
          d = cand;
          break;
        }
        d = cand;
      }
      const rx = Math.cos(rt.yaw);
      const rz = -Math.sin(rt.yaw);
      const c2 = clampRoom(rt.x + rx * 0.7 - camDir.x * d, rt.z + rz * 0.7 - camDir.z * d, 0.3);
      camera.position.set(c2.x, Math.max(0.7, headY + 0.5 - camDir.y * d), c2.z);
      camera.lookAt(rt.x + camDir.x * 7, headY + camDir.y * 7, rt.z + camDir.z * 7);
    }

    if (avatarRef.current) {
      avatarRef.current.visible = rt.view === 'tp';
      avatarRef.current.position.set(rt.x, rt.y, rt.z);
      avatarRef.current.rotation.y = rt.yaw;
    }
    if (handsRef.current) {
      handsRef.current.visible = rt.view === 'fp';
      handsRef.current.position.copy(camera.position);
      handsRef.current.quaternion.copy(camera.quaternion);
    }

    if (torchLight.current) {
      torchLight.current.position.copy(camera.position);
      torchLight.current.target.position.set(
        camera.position.x + camDir.x * 10,
        camera.position.y + camDir.y * 10,
        camera.position.z + camDir.z * 10,
      );
      torchLight.current.target.updateMatrixWorld();
    }

    /* ---------- focus ---------- */
    let tapDir: THREE.Vector3 | null = null;
    if (tapReq.active) {
      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((tapReq.x - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((tapReq.y - rect.top) / rect.height) * 2 + 1;
      tapVec.set(ndcX, ndcY, 0.5).unproject(camera).sub(camera.position).normalize();
      tapDir = tapVec;
      tapReq.active = false;
    }

    const selX = tapDir ? tapDir.x : camDir.x;
    const selY = tapDir ? tapDir.y : camDir.y;
    const selZ = tapDir ? tapDir.z : camDir.z;

    const best = pickSlot(rt.x, headY, rt.z, selX, selY, selZ, 7.3, 0.94);

    let kioskHit = false;
    let clerkHit = false;
    let seatHit: string | null = null;
    {
      const kdx = KIOSK.x - rt.x;
      const kdz = KIOSK.z - rt.z;
      const kd = Math.hypot(kdx, kdz);
      if (kd < 3.6 && (kdx * selX + kdz * selZ) / (kd || 1) > 0.7) kioskHit = true;

      const cdx = CLERK.x - rt.x;
      const cdz = CLERK.z - rt.z;
      const cd = Math.hypot(cdx, cdz);
      if (cd < 4.2 && (cdx * selX + cdz * selZ) / (cd || 1) > 0.7) clerkHit = true;

      // Trova la sedia cinema inquadrata se siamo vicini
      if (!seatedSeatId) {
        let bestSeatId: string | null = null;
        let bestSeatDot = 0.96;
        for (const s of CINEMA_SEATS) {
          const sdx = s.x - rt.x;
          const sdz = s.z - rt.z;
          const sd = Math.hypot(sdx, sdz);
          if (sd < 2.5) {
            const sdy = 0.5 - headY;
            const dist = Math.sqrt(sd * sd + sdy * sdy);
            const dot = (sdx * selX + sdy * selY + sdz * selZ) / dist;
            if (dot > bestSeatDot) {
              bestSeatDot = dot;
              bestSeatId = s.id;
            }
          }
        }
        if (bestSeatId) seatHit = bestSeatId;
      }
    }

    let nf: typeof g.focus = null;
    if (best) nf = { kind: 'film', filmId: best.filmId };
    else if (kioskHit) nf = { kind: 'kiosk' };
    else if (clerkHit) nf = { kind: 'clerk' };
    else if (seatHit) nf = { kind: 'seat', seatId: seatHit };

    focusMark.active = !!best && !blocked;
    if (best) {
      focusMark.x = best.x + best.nx * 0.09;
      focusMark.y = best.y;
      focusMark.z = best.z + best.nz * 0.09;
      focusMark.nz = best.nz;
    }

    const cur = g.focus;
    const changed =
      (!cur && nf) ||
      (cur && !nf) ||
      (cur && nf && (cur.kind !== nf.kind || (cur.kind === 'film' && nf.kind === 'film' && cur.filmId !== nf.filmId) || (cur.kind === 'seat' && nf.kind === 'seat' && cur.seatId !== nf.seatId)));
    if (changed) g.setFocus(blocked ? null : nf);

    const wantInteract = press.interact || (tapDir && !blocked);
    press.interact = false;
    if (wantInteract && !blocked) {
      if (nf?.kind === 'film') {
        g.setHeld(nf.filmId);
        g.setOpenFilm(nf.filmId);
        audio.vhsClick();
      } else if (nf?.kind === 'kiosk') g.setPanel('mood');
      else if (nf?.kind === 'clerk') g.setPanel('claudio');
      else if (nf?.kind === 'seat') g.setSeatedSeatId(nf.seatId);
    }
  });

  return (
    <>
      <group ref={avatarRef} visible={false}>
        <Avatar phaseRef={phase} isSeated={!!seatedSeatId} />
      </group>
      <group ref={handsRef}>
        <Hands phaseRef={phase} />
      </group>
      {flashlight && <spotLight ref={torchLight} intensity={16} distance={28} angle={0.38} penumbra={0.4} color="#fffae8" />}
    </>
  );
}
