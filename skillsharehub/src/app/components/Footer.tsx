const Footer = () => {
  return (
    <>
      <div className="bg-[#2a2a2a] mt-12 py-4 px-4 flex items-center justify-between">
        <img src="/logo.png" alt="Logo" className="h-15" />
      </div>

      <section className="bg-[#1e1e1e] text-white pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8">
          {/* Left Column - Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Kontakt</h3>
            <p className="mb-6">info@skillsharehub.com</p>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Nikoli ne zamudi predavanja.</h4>
              <form className="flex flex-col space-y-2">
                <input
                  type="email"
                  placeholder="Email *"
                  className="p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    className="mr-2 rounded text-orange-500 focus:ring-orange-300 bg-white"
                  />
                  Da, želim prejemati obvestila.
                </label>
                <button
                  type="submit"
                  className="bg-orange-300 text-black font-semibold px-4 py-2 rounded w-fit hover:bg-orange-400 transition-colors"
                >
                  Naroči se
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <h3 className="text-xl font-bold mb-4">Vprašaj nas karkoli</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Ime *"
                  className="p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
                <input
                  type="text"
                  placeholder="Priimek *"
                  className="p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email *"
                className="p-2 rounded w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
                required
              />
              <input
                type="text"
                placeholder="Zadeva"
                className="p-2 rounded w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <textarea
                placeholder="Sporočilo..."
                className="p-2 rounded w-full h-24 bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
              ></textarea>
              <button
                type="submit"
                className="bg-orange-300 text-black font-semibold px-6 py-2 rounded hover:bg-orange-400 transition-colors"
              >
                Pošlji
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 py-4 px-4 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} SkillShareHub. Vse pravice pridržane.
          </p>
        </div>
      </section>
    </>
  );
};

export default Footer;
