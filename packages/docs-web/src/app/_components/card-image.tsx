import { Cards } from "nextra/components";
import Image from "next/image";

type CardImageProps = {
  title: string;
  href: string;
  src: string;
  alt: string;
  aspectRatio?: "16/9" | "4/3" | "3/2" | "1/1" | "3/4";
};

export const CardImage = ({
  src,
  alt,
  title,
  href,
  aspectRatio = "16/9",
}: CardImageProps) => {
  return (
    <Cards.Card
      className="w-full transition-all duration-300"
      title={title}
      href={href}
      arrow
    >
      <div
        className={`relative w-full aspect-[${aspectRatio}] overflow-hidden rounded-lg`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectFit: "cover" }}
          className="transition-transform duration-300 hover:scale-105"
        />
      </div>
    </Cards.Card>
  );
};
