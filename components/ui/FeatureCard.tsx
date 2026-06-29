export default function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div>
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/15 text-orange-500 border border-orange-500/20">
        {icon}
      </div>

      <h3 className="mb-1 font-semibold text-white">
        {title}
      </h3>

      <p className="text-sm leading-6 text-white/75">
        {text}
      </p>
    </div>
  );
}