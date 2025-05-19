import Image from "next/image";
export default function Hero() {
    return (
      <section className="relative w-full h-[500px] overflow-hidden">
        <Image
          src="/main.photo.jpg"
          width={1200}
          height={550}
          style={{
            maxWidth:'100%',
            height: 'auto'
          }}
          alt="Hero background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center bg-black/30">
          <h1 className="text-5xl font-bold mb-4">Online Classes from Anywhere</h1>
          <button className="bg-white text-black px-4 py-2 rounded shadow hover:bg-gray-200 transition">
            Več informacij
          </button>
        </div>
      </section>
    );
  }
  