"use client";

import { Users, Globe, Heart, Award } from "lucide-react";
import { motion } from "motion/react";

const stats = [
  { icon: Users, label: "Active Ambassadors", value: "500+" },
  { icon: Globe, label: "Countries", value: "25+" },
  { icon: Heart, label: "Lives Impacted", value: "50k+" },
  { icon: Award, label: "Events Hosted", value: "200+" },
];

const AnimatedHero = () => {
  return (
    <section className="relative overflow-hidden pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6"
          >
            Meet Our{" "}
            <span className="bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              Ambassadors
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Passionate individuals around the world making mental health support
            accessible, compassionate, and transformative in their communities.
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-border"
            >
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedHero;
