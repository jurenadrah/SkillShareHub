import { useRouter } from 'next/navigation';

interface Props {
  title: string;
  duration: string;
  imageUrl?: string;
}

export default function VideoPreview({ title, duration, imageUrl }: Props) {
  const router = useRouter();

  const handleLearnMore = () => {
    router.push('/about');
  };

  return (
    <div className="relative group">
      {imageUrl ? (
        <div className="bg-black h-[200px] overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="bg-black text-white h-[200px] flex items-center justify-center">
          <p className="text-center text-sm">{title} / {duration}</p>
        </div>
      )}
      
      <button 
        onClick={handleLearnMore}
        className="absolute bottom-2 left-2 bg-white text-black px-3 py-1 text-sm rounded opacity-90 group-hover:opacity-100 transition-opacity"
      >
        ➤ Preberi več
      </button>
    </div>
  );
}