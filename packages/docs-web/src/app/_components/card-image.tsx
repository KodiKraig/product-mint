import { Cards } from "nextra/components";
import Image from "next/image";

type CardImageProps = {
  title: string;
  href: string;
  src: string;
  alt: string;
};

export const CardImage = ({ src, alt, title, href }: CardImageProps) => {
  return (
    <Cards.Card
      className="w-full transition-all duration-300"
      title={title}
      href={href}
      arrow
    >
      <div className="relative h-auto w-full overflow-hidden rounded-lg">
        <Image
          src={src}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
          className="transition-transform duration-300 hover:scale-105"
        />
      </div>
    </Cards.Card>
  );
};
