import Image from 'next/image';
import Link from 'next/link';
import CartaAILogoSm from '@/public/images/Carta-ai_Logo_sm_dark.png';


function Logo() {
  return (
    <Link href="/" className="hover:text-indigo-400 font-bold text-lg text-indigo-600 flex items-center gap-2">
        {/* Logo Design: Abstract Quill  */}
        {/* <span className='font-pacifico text-3xl font-normal'>Carta</span>
        <div className="h-10 w-10 bg-indigo-600 rounded-tr-lg rounded-bl-lg flex items-center justify-center">
            <span className="text-white text-lg">AI</span>
        </div> */}
        <Image src={CartaAILogoSm} className='ml-2 h-8 w-28 md:h-10 md:w-32' alt='Carta-AI Logo at the header' />
    </Link>
  )
}

export default Logo