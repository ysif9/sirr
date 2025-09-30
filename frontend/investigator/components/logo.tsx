import Image from 'next/image';

export default function Logo() {
  return (
    <Image 
      src="/logo.png" 
      alt="Sirr. Logo" 
      // Increased dimensions for better visibility and to prevent a "compressed" look.
      width={40} 
      height={40} 
    />
  )
}