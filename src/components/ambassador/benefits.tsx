'use client';

import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import {
  Award,
  BookOpen,
  Network,
  DollarSign,
  Clock,
  Star,
} from 'lucide-react';

export default function Benefits() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const benefits = [
    {
      icon: Award,
      title: 'Official Recognition',
      description: 'Become a certified Xolace Ambassador with official credentials to showcase your commitment.',
    },
    {
      icon: BookOpen,
      title: 'Exclusive Resources',
      description: 'Access training materials, guidelines, and tools designed to help you succeed.',
    },
    {
      icon: Network,
      title: 'Vibrant Community',
      description: 'Connect with fellow ambassadors in private forums, events, and collaborative initiatives.',
    },
    {
      icon: DollarSign,
      title: 'Rewards & Incentives',
      description: 'Earn rewards through referrals and meaningful contributions to the program.',
    },
    {
      icon: Clock,
      title: 'Flexible Commitment',
      description: 'Work at your own pace. Whether you have hours or just moments, we have opportunities for you.',
    },
    {
      icon: Star,
      title: 'Career Growth',
      description: 'Build your portfolio and potentially unlock career opportunities within the mental health space.',
    },
  ];

  return (
    <section className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-50px' }}
          className="text-center space-y-4"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-balance">
            What You'll Gain
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto text-balance">
            Being part of our ambassador community comes with real benefits that support your growth and impact.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: index only
<motion.div key={index} variants={itemVariants}>
                <Card className="h-full p-6 bg-linear-to-br from-secondary/40 to-secondary/20 border border-border/20 hover:border-accent/40 transition-all duration-300 group hover:shadow-lg">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/20 group-hover:bg-accent/30 transition-colors"
                    >
                      <Icon className="w-6 h-6 text-accent" />
                    </motion.div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Testimonial Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: '-50px' }}
          className="mt-16 pt-16 border-t border-border/30"
        >
          <div className="text-center space-y-8">
            <h3 className="text-2xl font-semibold text-balance">
              Why Ambassadors Love This Program
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  quote: 'I\'ve never felt more connected to a mission. Being an ambassador let me turn my passion for mental health into real action.',
                  author: 'Sarah M., Ambassador',
                },
                {
                  quote: 'The flexibility is incredible. I can contribute on my own terms, and the support from the community is amazing.',
                  author: 'Chris, Ambassador',
                },
              ].map((testimonial, index) => (
                <motion.div
                  // biome-ignore lint/suspicious/noArrayIndexKey: only have index
                  key={index}
                  initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                  viewport={{ once: true, margin: '-50px' }}
                >
                  <Card className="p-8 bg-white border border-border/30 relative">
                    <div className="absolute top-4 left-4 text-4xl text-primary/20">
                      "
                    </div>
                    <blockquote className="space-y-4">
                      <p className="text-foreground/80 italic text-balance">
                        {testimonial.quote}
                      </p>
                      <footer className="font-semibold text-sm text-foreground">
                        — {testimonial.author}
                      </footer>
                    </blockquote>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
