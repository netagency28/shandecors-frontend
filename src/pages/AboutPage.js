import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Hand, Award, Lightbulb, Palette } from 'lucide-react';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const fadeLeft = (delay = 0) => ({
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const fadeRight = (delay = 0) => ({
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
});

const values = [
  {
    icon: Hand,
    title: 'Handmade, Always',
    description:
      'Every product is crafted by hand — from the first idea to the final finish. We choose time, care, and craftsmanship over speed, always.',
  },
  {
    icon: Lightbulb,
    title: 'Thoughtful Design',
    description:
      'We design with intention — balancing beauty with purpose, ensuring every piece enhances the space it becomes a part of.',
  },
  {
    icon: Award,
    title: 'Uncompromised Quality',
    description:
      'From material selection to the smallest detail, quality is never an afterthought. We take the time to get it right — because your home deserves nothing less.',
  },
  {
    icon: Palette,
    title: 'Personal Customisation',
    description:
      'We believe the best spaces are personal. Our bespoke approach allows you to co-create pieces that truly belong to you and your home.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="py-24 md:py-36 px-4 md:px-8 lg:px-16 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp}>
            <p className="text-xs uppercase tracking-[0.25em] text-foreground/50 mb-6">Shan Decors — Nature to Your Hands</p>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl mb-8 leading-tight">
              Handcrafted with Intention.<br />Built to Last.
            </h1>
            <p className="text-lg md:text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
              Where artistry meets everyday living — each piece a quiet expression of craft, warmth, and character.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 md:py-28 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div {...fadeLeft()}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-0.5 h-10 bg-foreground" />
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground/60">Who We Are</p>
              </div>

              <h2 className="font-display text-3xl md:text-4xl mb-6">
                Celebrating India's Timeless Craftsmanship
              </h2>

              <p className="text-foreground/70 leading-relaxed mb-5">
                Shan Decors was founded with a simple vision: to celebrate India's timeless craftsmanship while making it accessible to modern homes.
              </p>
              <p className="text-foreground/70 leading-relaxed mb-5">
                We partner with talented artisans across India — individuals who bring generations of skill, culture, and passion into every creation. Each piece is thoughtfully handmade, shaped with intention, and crafted with care — never mass-produced.
              </p>
              <p className="text-foreground/70 leading-relaxed mb-8">
                At Shan Decors, we don't just create products — we preserve crafts, support artisan communities, and carry forward stories of heritage into everyday living spaces. Your home deserves more than decoration. It deserves pieces that feel authentic, warm, and deeply yours.
              </p>

              <Link to="/products">
                <Button className="rounded-none bg-foreground text-white hover:bg-foreground/90 px-10 py-6 text-sm tracking-[0.15em] uppercase">
                  Explore Collection
                </Button>
              </Link>
            </motion.div>

            <motion.div
              {...fadeRight(0.2)}
              className="relative h-[500px] bg-[#F5F5F5] overflow-hidden"
            >
              <img
                src="/hero/3-mobile.jpg"
                alt="Shan Decor handcrafted table lamp"
                className="w-full h-full object-cover block md:hidden"
                loading="lazy"
              />
              <img
                src="/hero/3.jpg"
                alt="Shan Decor handcrafted table lamp"
                className="w-full h-full object-cover hidden md:block"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 md:py-28 px-4 md:px-8 lg:px-16 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground/50 mb-4">What Drives Us</p>
            <h2 className="font-display text-3xl md:text-4xl">The Values Behind Every Piece</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-foreground text-white flex items-center justify-center mx-auto mb-6">
                  <value.icon size={22} />
                </div>
                <h3 className="font-display text-lg mb-3">{value.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Craft */}
      <section className="py-20 md:py-28 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              {...fadeRight()}
              className="relative h-[480px] bg-[#F5F5F5] overflow-hidden order-2 lg:order-1"
            >
              <img
                src="/hero/3-mobile.jpg"
                alt="Handcrafted lamp shade casting warm light"
                className="w-full h-full object-cover block md:hidden"
                loading="lazy"
              />
              <img
                src="/hero/3.jpg"
                alt="Handcrafted lamp shade casting warm light"
                className="w-full h-full object-cover hidden md:block"
                loading="lazy"
              />
            </motion.div>

            <motion.div {...fadeLeft(0.2)} className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-0.5 h-10 bg-foreground" />
                <p className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground/60">Our Craft</p>
              </div>

              <h2 className="font-display text-3xl md:text-4xl mb-6">
                Made by Hand.<br />Made to Matter.
              </h2>

              <p className="text-foreground/70 leading-relaxed mb-5">
                At the heart of everything we do is handcraft. No conveyor belts. No shortcuts. Every piece passes through the hands of makers who genuinely care about what they create.
              </p>
              <p className="text-foreground/70 leading-relaxed mb-5">
                Our specialisation in lamp shades has given us a deep understanding of light, form, and texture — how a single piece can transform not just a room, but the way it feels. These principles guide everything we design, from subtle decorative accents to statement pieces that quietly become the soul of a space.
              </p>
              <p className="text-foreground/70 leading-relaxed">
                Today, our collection extends beyond lamp shades to include decorative accents, tabletop pieces, wall décor, and select furniture — each one handcrafted, each one designed to complement the spaces they enter. We also offer fully customised creations, working closely with you to shape something that reflects your space, your taste, and your story.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20 md:py-28 px-4 md:px-8 lg:px-16 bg-foreground text-white">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div {...fadeUp}>
            <div className="w-12 h-0.5 bg-white/30 mx-auto mb-10" />
            <blockquote className="font-display text-2xl md:text-3xl lg:text-4xl italic leading-relaxed text-white/90 mb-10">
              "We don't make products to fill shelves. We create pieces to fill spaces with meaning — to become the details people notice, remember, and feel at home with."
            </blockquote>
            <div className="w-12 h-0.5 bg-white/30 mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Note from Us */}
      <section className="py-20 md:py-28 px-4 md:px-8 lg:px-16 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div {...fadeUp}>
            <p className="text-xs uppercase tracking-[0.25em] text-foreground/50 mb-6">A Note from Us</p>
            <h2 className="font-display text-3xl md:text-4xl mb-6">
              Growing Together
            </h2>
            <p className="text-foreground/70 leading-relaxed mb-4 max-w-2xl mx-auto">
              Shan Decors is still growing, learning, and evolving — and every step of this journey is made possible because of you.
            </p>
            <p className="text-foreground/70 leading-relaxed mb-10 max-w-2xl mx-auto">
              Your support allows us to continue doing what we believe in: supporting artisans, preserving craftsmanship, and creating pieces that carry heart and intention. We're truly grateful to have you as a part of our story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button className="rounded-none bg-foreground text-white hover:bg-foreground/90 px-10 py-6 text-sm tracking-[0.15em] uppercase">
                  Shop the Collection
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
