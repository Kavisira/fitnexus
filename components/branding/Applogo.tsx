import Image from "next/image";

interface AppLogoProps {
  size?: number;
}

export function AppLogo({ size = 56 }: AppLogoProps) {
  return (
    <Image
      src="/images/fitnexus-logo.png"
      alt="FitNexus"
      width={size}
      height={size}
      priority
      className="object-contain"
    />
  );
}