import Image from 'next/image';
import Link from 'next/link';



const Logo = () => {
  return (
    <Link href="/" className="">
      <Image
        src="/img/logo/logo.webp"
        draggable="false"
        width="170"
        height="170"
        alt="Aspeo Logo"
      />
    </Link>
  );
};

export default Logo;
