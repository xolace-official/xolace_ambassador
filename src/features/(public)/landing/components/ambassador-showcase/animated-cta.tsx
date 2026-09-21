"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import ImagePreview from "@/components/ui/image-preview";
import { OFFICIAL_AMBASSADORS } from "@/constants";

const CLUSTER_SIZE = 4;

const AnimatedCta = () => {
  const clusterAmbassadors = OFFICIAL_AMBASSADORS.slice(0, CLUSTER_SIZE);
  const remainingCount = OFFICIAL_AMBASSADORS.length - CLUSTER_SIZE;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            {clusterAmbassadors.map((ambassador, index) => (
              <div
                key={ambassador.id}
                style={{
                  marginLeft: index === 0 ? 0 : -14,
                  zIndex: CLUSTER_SIZE - index,
                }}
                className="relative w-11 h-11 rounded-full border-[3px] border-card overflow-hidden bg-muted"
              >
                <ImagePreview
                  src={ambassador.image}
                  alt={ambassador.name}
                  fill
                  sizes="44px"
                  className="object-cover object-top"
                />
              </div>
            ))}
            {remainingCount > 0 ? (
              <div
                style={{ marginLeft: -14 }}
                className="relative w-11 h-11 rounded-full border-[3px] border-card bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold"
              >
                +{remainingCount}
              </div>
            ) : null}
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground text-balance">
            Want to Join Our Ambassador Program?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Be part of a global movement making mental health support accessible
            to everyone.
          </p>
          <Link
            href="/#apply"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-xl font-semibold hover:bg-accent/90 transition-colors duration-300 shadow-lg hover:shadow-xl"
          >
            Apply Now
            <ArrowRight aria-hidden="true" className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedCta;
