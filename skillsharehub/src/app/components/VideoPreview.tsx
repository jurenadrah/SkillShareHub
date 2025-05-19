interface Props {
    title: string;
    duration: string;
  }
  
  export default function VideoPreview({ title, duration }: Props) {
    return (
      <div className="relative group">
        <div className="bg-black text-white h-[200px] flex items-center justify-center">
          <p className="text-center text-sm">{title} / {duration}</p>
        </div>
        <button className="absolute bottom-2 left-2 bg-white text-black px-3 py-1 text-sm rounded opacity-90 group-hover:opacity-100">
          ▶️ Play Video
        </button>
      </div>
    );
  }
  