export function Avatar({ initials, size = 44, gradient }: { initials: string; size?: number; gradient?: [string, string] }) {
  const bg = gradient ? `linear-gradient(150deg, ${gradient[0]}, ${gradient[1]})` : undefined;
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: bg }}>
      {initials}
    </div>
  );
}
