import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Leaf, Hand, Award, Shield, Truck, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 md:py-32 px-4 md:px-8 lg:px-16 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="font-display text-4xl md:text-6xl mb-6">
              Nature to Your Hands
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              We believe in bringing the beauty of nature into your home through carefully crafted 
              decor pieces that tell a story of sustainability, craftsmanship, and timeless design.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Brand Vision */}
      <section className="py-20 md:py-24 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-0.5 h-10 bg-foreground"></div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground/70">Our Vision</p>
                  <p className="text-xs tracking-[0.15em] text-foreground/60">Since 2024</p>
                </div>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl mb-6">
                Crafting Spaces That Breathe
              </h2>
              
              <p className="text-foreground/70 leading-relaxed mb-6">
                Shan Decors was born from a simple belief: your living space should be a sanctuary 
                that reflects your connection to nature. We scour the globe for artisans who share 
                our commitment to sustainable practices and exceptional craftsmanship.
              </p>
              
              <p className="text-foreground/70 leading-relaxed mb-8">
                Each piece in our collection is more than just decor—it's a conversation starter, 
                a mood setter, and a small piece of nature's artistry that transforms your house 
                into a home.
              </p>

              <Link to="/products">
                <Button className="rounded-none bg-foreground text-white hover:bg-foreground/90 px-10 py-6 text-sm tracking-[0.15em] uppercase">
                  Explore Collection
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative h-[500px] bg-[#F5F5F5] rounded-sm overflow-hidden"
            >
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop"
                alt="Artisan crafting"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Our Decor is Unique */}
      <section className="py-20 md:py-24 px-4 md:px-8 lg:px-16 bg-[#F5F5F5]">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl mb-4">
              What Makes Us Different
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              We're not just selling decor—we're curating experiences that bring joy and tranquility to your everyday life.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Hand,
                title: "Handmade With Love",
                description: "Every piece is crafted by skilled artisans who pour their heart and soul into their work, ensuring no two items are exactly alike."
              },
              {
                icon: Leaf,
                title: "Sustainably Sourced",
                description: "We work directly with artisans who use eco-friendly materials and traditional techniques that have been passed down through generations."
              },
              {
                icon: Award,
                title: "Curated Excellence",
                description: "Our design team carefully selects each piece based on quality, aesthetic appeal, and the story behind its creation."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-foreground text-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon size={24} />
                </div>
                <h3 className="font-display text-xl mb-4">{feature.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainable Materials */}
      <section className="py-20 md:py-24 px-4 md:px-8 lg:px-16">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-[500px] bg-[#F5F5F5] rounded-sm overflow-hidden order-2 lg:order-1"
            >
              <img
                src="https://images.unsplash.com/photo-1549490349-8643362247b5?w=800&h=600&fit=crop"
                alt="Sustainable materials"
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-0.5 h-10 bg-foreground"></div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] font-semibold text-foreground/70">Sustainability</p>
                  <p className="text-xs tracking-[0.15em] text-foreground/60">Our Promise</p>
                </div>
              </div>
              
              <h2 className="font-display text-3xl md:text-4xl mb-6">
                Conscious Crafting
              </h2>
              
              <p className="text-foreground/70 leading-relaxed mb-6">
                We're committed to reducing our environmental footprint without compromising on beauty or quality. 
                Our partners use reclaimed wood, recycled metals, and natural dyes whenever possible.
              </p>
              
              <p className="text-foreground/70 leading-relaxed mb-8">
                From bamboo lamp bases to hand-woven textile accessories, every material is chosen with 
                intention—ensuring your decor not only looks good but does good for the planet too.
              </p>

              <div className="space-y-4">
                {[
                  "100% recyclable packaging",
                  "Carbon-neutral shipping partners", 
                  "1% of profits to environmental causes",
                  "Fair trade certified artisans"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-sm text-foreground/70">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 md:py-24 px-4 md:px-8 lg:px-16 bg-foreground text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Heart className="w-12 h-12 mx-auto mb-6 text-white/80" />
            <h2 className="font-display text-3xl md:text-4xl mb-6">
              Join Our Sustainable Journey
            </h2>
            <p className="text-lg text-white/80 mb-8 leading-relaxed">
              Every purchase you make supports artisans and contributes to a more sustainable future. 
              Together, we can create beautiful spaces that honor both craftsmanship and nature.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button variant="secondary" className="rounded-none px-10 py-6 text-sm tracking-[0.15em] uppercase">
                  Shop Sustainably
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="rounded-none border-white text-white hover:bg-white hover:text-foreground px-10 py-6 text-sm tracking-[0.15em] uppercase">
                  Contact Artisans
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
