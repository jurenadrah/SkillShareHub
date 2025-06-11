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
    </div>
  );
}