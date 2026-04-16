type AvatarMember = {
  name: string;
  color: string;
  initial: string;
};

export function Avatar({
  member,
  size = 28,
  ring = false,
}: {
  member: AvatarMember;
  size?: number;
  ring?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-display font-semibold text-white shrink-0 ${
        ring ? "ring-2 ring-cream-raised" : ""
      }`}
      style={{
        backgroundColor: member.color,
        width: size,
        height: size,
        fontSize: Math.max(11, Math.round(size * 0.42)),
        letterSpacing: "-0.02em",
      }}
      title={member.name}
      aria-label={member.name}
    >
      {member.initial}
    </span>
  );
}

export function AvatarStack({
  members,
  max = 4,
  size = 24,
}: {
  members: AvatarMember[];
  max?: number;
  size?: number;
}) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((m, i) => (
        <Avatar key={i} member={m} size={size} ring />
      ))}
      {extra > 0 && (
        <span
          className="inline-flex items-center justify-center rounded-full bg-line-strong text-ink-soft font-medium ring-2 ring-cream-raised"
          style={{
            width: size,
            height: size,
            fontSize: Math.max(10, Math.round(size * 0.4)),
          }}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
