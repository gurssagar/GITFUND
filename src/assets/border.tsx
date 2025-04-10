import Link from "next/link";

const ShootingStarBorder = ({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) => {
  return (
    <Link
      href={href}
      className="group relative grid overflow-hidden rounded-full px-4 py-2 shadow-[0_1000px_0_0_hsl(0_0%_20%)_inset] transition-all duration-300 hover:scale-105"
    >
      <span className="absolute inset-0">
        <span className="absolute inset-0 rotate-0 overflow-hidden rounded-full [mask-image:linear-gradient(white,transparent_50%)] animate-[flip_6s_infinite_steps(2,end)]">
          <span className="absolute w-[200%] aspect-square top-0 left-1/2 -translate-x-1/2 -translate-y-[15%] -rotate-90 opacity-100 animate-[rotate_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#9333EA_345deg,#3B82F6_360deg)]" />
        </span>
      </span>
      <span className="backdrop absolute inset-[1px] rounded-full bg-[#1A1A1A] transition-colors duration-300 group-hover:bg-[#141414]" />
      <span className="relative z-10 text-sm text-purple-300">{children}</span>
    </Link>
  );
};

export default ShootingStarBorder;
