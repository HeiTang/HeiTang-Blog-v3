export function walletTarget(active: number, count: number, distance: number, velocity: number, width: number): number {
  const projected = distance + velocity * 180;
  return Math.abs(projected) > width * 0.22
    ? (active + (projected < 0 ? 1 : count - 1)) % count
    : active;
}

/** Small, interruptible spring for the three Hero cards; no animation dependency. */
export function initHeroWallet(tickets: HTMLElement[]): void {
  const wallet = tickets[0]?.closest<HTMLElement>('.pocket-art');
  if (!wallet) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const slots = [[18, 80, 0, 100], [30, 40, 5, 96], [10, 0, -6, 92]];
  let active = tickets.length - 1;
  let hovered = false;
  const states = tickets.map((ticket, index) => {
    ticket.removeAttribute('disabled');
    return { position: [...slots[(index - active + tickets.length) % tickets.length]], velocity: [0, 0, 0, 0] };
  });
  let frame = 0;
  let lastTime = 0;
  let drag: { index: number; pointer: number; start: number; last: number; time: number; origin: number[]; distance: number; velocity: number } | undefined;
  let suppressClick = false;

  function paint(index: number) {
    const [x, y, rotation, scale] = states[index].position;
    tickets[index].style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotation}deg) scale(${scale / 100})`;
  }

  function tick(time: number) {
    const dt = Math.min((time - lastTime) / 1000 || 1 / 60, 1 / 30);
    lastTime = time;
    let moving = false;
    states.forEach((state, index) => {
      if (drag?.index === index) return;
      const depth = (index - active + tickets.length) % tickets.length;
      const target = [...slots[depth]];
      if (hovered && !reduced.matches) {
        target[0] += depth === 1 ? 12 : depth === 2 ? -12 : 0;
        target[1] -= 12 + depth * 8;
        target[2] *= 1.5;
        target[3] += depth === 0 ? 2 : 1;
      }
      target.forEach((value, axis) => {
        if (reduced.matches) {
          state.position[axis] = value;
          state.velocity[axis] = 0;
        } else {
          state.velocity[axis] += ((value - state.position[axis]) * 400 - state.velocity[axis] * 32) * dt;
          state.position[axis] += state.velocity[axis] * dt;
          if (Math.abs(value - state.position[axis]) < 0.03 && Math.abs(state.velocity[axis]) < 0.1) {
            state.position[axis] = value;
            state.velocity[axis] = 0;
          } else moving = true;
        }
      });
      paint(index);
    });
    frame = moving ? requestAnimationFrame(tick) : 0;
  }

  function select(index: number) {
    active = (index + tickets.length) % tickets.length;
    tickets.forEach((ticket, i) => {
      ticket.style.zIndex = String(tickets.length - (i - active + tickets.length) % tickets.length);
      ticket.setAttribute('aria-pressed', String(i === active));
    });
    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }
  }

  tickets.forEach((ticket, index) => {
    paint(index);
    ticket.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      select(index);
    });
    ticket.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || drag) return;
      suppressClick = false;
      if (index !== active) return;
      ticket.setPointerCapture(event.pointerId);
      drag = { index, pointer: event.pointerId, start: event.clientX, last: event.clientX, time: event.timeStamp, origin: [...states[index].position], distance: 0, velocity: 0 };
      wallet.classList.add('is-dragging');
    });
    ticket.addEventListener('pointermove', event => {
      if (!drag || drag.pointer !== event.pointerId) return;
      drag.distance = event.clientX - drag.start;
      drag.velocity = (event.clientX - drag.last) / Math.max(event.timeStamp - drag.time, 1);
      drag.last = event.clientX;
      drag.time = event.timeStamp;
      states[index].position[0] = drag.origin[0] + drag.distance;
      states[index].position[2] = drag.origin[2] + drag.distance * 0.035;
      paint(index);
    });
    function release(event: PointerEvent) {
      if (!drag || drag.pointer !== event.pointerId) return;
      const cancelled = event.type !== 'pointerup';
      const velocity = event.timeStamp - drag.time > 100 ? 0 : drag.velocity;
      const next = cancelled ? active : walletTarget(active, tickets.length, drag.distance, velocity, ticket.offsetWidth);
      suppressClick = cancelled || Math.abs(drag.distance) > 6;
      states[index].velocity[0] = cancelled ? 0 : velocity * 1000;
      states[index].velocity[2] = cancelled ? 0 : velocity * 35;
      drag = undefined;
      wallet.classList.remove('is-dragging');
      if (ticket.hasPointerCapture(event.pointerId)) ticket.releasePointerCapture(event.pointerId);
      select(next);
    }
    ticket.addEventListener('pointerup', release);
    ticket.addEventListener('pointercancel', release);
    ticket.addEventListener('lostpointercapture', release);
  });

  wallet.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    hovered = true;
    select(active);
  });
  wallet.addEventListener('pointerleave', () => {
    hovered = false;
    select(active);
  });
  reduced.addEventListener('change', () => select(active));
  select(active);
}
