'use client';

import { motion } from 'motion/react';
import { Card } from '@/components/ui/card';
import {
  Heart,
  Users,
  Zap,
  Globe,
  TrendingUp,
  Lightbulb,
} from 'lucide-react';

export default function ProgramDetails() {
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

  const features = [
    {
      icon: Heart,
      title: 'Compassionate Support',
      description:
        'Help people access mental health resources during their most vulnerable moments—before crisis, between sessions, and beyond.',
    },
    {
      icon: Users,
      title: 'Community Building',
      description:
        'Connect with like-minded changemakers. Share experiences, learn from each other, and grow together.',
    },
    {
      icon: Zap,
      title: 'Real Impact',
      description:
        'Your efforts directly improve mental health outcomes for thousands of people across our platform.',
    },
    {
      icon: Globe,
      title: 'Reach Everywhere',
      description:
        'Bring Xolace to your community. Whether online or offline, amplify our mission in ways that matter.',
    },
    {
      icon: TrendingUp,
      title: 'Grow & Learn',
      description:
        'Access exclusive training, resources, and opportunities to develop your skills and knowledge.',
    },
    {
      icon: Lightbulb,
      title: 'Innovation First',
      description:
        'Influence the future of mental health support. Your feedback shapes Xolace\'s evolution.',
    },
  ];

  return (
    <section
      id="program-details"
      className="w-full py-20 px-4 sm:px-6 lg:px-8 bg-secondary/20 scroll-mt-20"
    >
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-50px' }}
          className="text-center space-y-4"
        >
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-balance">
            The Ambassador Program
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto text-balance">
            We operate in the space around therapy, before people seek care, between
            sessions, and outside of clinical treatment. Ambassadors help us scale
            this vision safely and sustainably.
          </p>
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
        >
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-2xl font-semibold">Our Purpose</h3>
              <p className="text-foreground/70 leading-relaxed">
                Xolace exists to bridge the gap in mental health support. We're
                building tools for the moments that matter most, when someone needs
                guidance before scheduling therapy, comfort during a difficult week,
                or resources to supplement their professional care.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-semibold">Your Role</h3>
              <p className="text-foreground/70 leading-relaxed">
                As an ambassador, you'll be the voice of Xolace in your sphere of
                influence. Share our story, connect us with communities that need
                us, and help people discover the support they deserve.
              </p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true, margin: '-50px' }}
            className="relative h-64 md:h-80 rounded-2xl bg-linear-to-br from-primary/20 to-accent/20 overflow-hidden"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center space-y-4 px-6">
                <Heart className="w-16 h-16 text-primary mx-auto" />
                <p className="text-foreground/80 font-medium">
                  Making mental health support accessible to all
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: only have index
<motion.div key={index} variants={itemVariants}>
                <Card className="h-full p-6 bg-white border border-border/30 hover:border-primary/20 transition-all duration-300 hover:shadow-lg">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10"
                    >
                      <Icon className="w-6 h-6 text-primary" />
                    </motion.div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-foreground/60 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-50px' }}
          className="text-center space-y-6 pt-8"
        >
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Ready to make a tangible impact on mental health? We're looking for
            passionate individuals who believe in our mission.
          </p>
          <button
          type='button'
            onClick={() => {
              document.getElementById('signup-form')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
          >
            Start Your Journey
          </button>
        </motion.div>
      </div>
    </section>
  );
}
