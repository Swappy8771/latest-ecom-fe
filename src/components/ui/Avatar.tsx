interface Props {
  name:    string;
  avatar?: string | null;
  size?:   'sm' | 'md' | 'lg';
  gradient?: string;
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export default function Avatar({ name, avatar, size = 'sm', gradient = 'from-violet-500 to-blue-500' }: Props) {
  if (avatar)
    return (
      <img
        src={avatar}
        alt={name}
        className={`${sizeMap[size]} rounded-lg object-cover border border-slate-700 shrink-0`}
      />
    );
  return (
    <div
      className={`${sizeMap[size]} rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center font-bold text-white shrink-0`}
    >
      {name?.charAt(0).toUpperCase() ?? '?'}
    </div>
  );
}
