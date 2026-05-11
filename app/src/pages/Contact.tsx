import { useEffect } from 'react';
import PageHeader from '@/components/PageHeader';
import ContactInfo from '@/sections/contact/ContactInfo';
import ContactForm from '@/sections/contact/ContactForm';

export default function Contact() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <PageHeader
        label="Contáctanos"
        heading="Creemos algo extraordinario"
        subtext="Cuéntanos sobre tu proyecto. Respondemos en 24 horas."
      />
      <section className="bg-bg-primary pb-16 md:pb-24">
        <div className="max-w-content mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
