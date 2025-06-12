import React, { useRef } from "react";

const Footer = () => {
  // Refs for form fields (for email content)
  const newsletterEmailRef = useRef<HTMLInputElement>(null);
  const contactNameRef = useRef<HTMLInputElement>(null);
  const contactSurnameRef = useRef<HTMLInputElement>(null);
  const contactEmailRef = useRef<HTMLInputElement>(null);
  const contactSubjectRef = useRef<HTMLInputElement>(null);
  const contactMessageRef = useRef<HTMLTextAreaElement>(null);

  // Handler for newsletter form
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = newsletterEmailRef.current?.value || "";

    window.location.href = `mailto:globes_rough.4q@icloud.com?subject=Prijava%20na%20obvestila&body=Email:%20${encodeURIComponent(email)}`;
  };

  // Handler for contact form
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = contactNameRef.current?.value || "";
    const surname = contactSurnameRef.current?.value || "";
    const email = contactEmailRef.current?.value || "";
    const subject = contactSubjectRef.current?.value || "";
    const message = contactMessageRef.current?.value || "";

    const mailSubject = subject ? encodeURIComponent(subject) : "Novo%20sporočilo%20prek%20obrazca";
    const mailBody = encodeURIComponent(
      `Ime: ${name}\nPriimek: ${surname}\nEmail: ${email}\n\n${message}`
    );
    window.location.href = `mailto:globes_rough.4q@icloud.com?subject=${mailSubject}&body=${mailBody}`;
  };

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
            <p className="mb-6">
              {/* Clickable email */}
              <a
                href="mailto:globes_rough.4q@icloud.com"
                className="text-orange-300 hover:underline break-all"
              >
                info@skillsharehub.com
              </a>
            </p>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Nikoli ne zamudi predavanja.</h4>
              <form className="flex flex-col space-y-2" onSubmit={handleNewsletterSubmit}>
                <input
                  type="email"
                  ref={newsletterEmailRef}
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
            <form className="space-y-4" onSubmit={handleContactSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  ref={contactNameRef}
                  placeholder="Ime *"
                  className="p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
                <input
                  type="text"
                  ref={contactSurnameRef}
                  placeholder="Priimek *"
                  className="p-2 rounded bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
                  required
                />
              </div>
              <input
                type="email"
                ref={contactEmailRef}
                placeholder="Email *"
                className="p-2 rounded w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
                required
              />
              <input
                type="text"
                ref={contactSubjectRef}
                placeholder="Zadeva"
                className="p-2 rounded w-full bg-white text-black focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <textarea
                ref={contactMessageRef}
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