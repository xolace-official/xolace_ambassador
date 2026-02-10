'use client'

import { motion } from 'motion/react'
import {
  Linkedin,
  Twitter,
  Instagram,
  MapPin,
  Award,
  Users,
  Globe,
  Heart,
  Mail
} from 'lucide-react'
import Image from 'next/image'

// Sample ambassador data
const ambassadors = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Lead Ambassador',
    location: 'New York, USA',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
    bio: 'Mental health advocate with 5+ years of experience in community outreach. Passionate about making support accessible to everyone.',
    impact: {
      peopleReached: '2,500+',
      eventsHosted: 15,
      communitiesServed: 8
    },
    social: {
      linkedin: '#',
      twitter: '#',
      instagram: '#'
    },
    joinedDate: 'January 2024'
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Campus Ambassador',
    location: 'San Francisco, USA',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    bio: 'University student dedicated to breaking mental health stigma on campus. Building safe spaces for open conversations.',
    impact: {
      peopleReached: '1,800+',
      eventsHosted: 12,
      communitiesServed: 5
    },
    social: {
      linkedin: '#',
      twitter: '#',
      instagram: '#'
    },
    joinedDate: '2026-02-10T14:35:20Z'
  },
  {
    id: 3,
    name: 'Priya Sharma',
    role: 'Community Ambassador',
    location: 'London, UK',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
    bio: 'Advocate for culturally sensitive mental health support. Connecting diverse communities with resources they need.',
    impact: {
      peopleReached: '3,200+',
      eventsHosted: 20,
      communitiesServed: 12
    },
    social: {
      linkedin: '#',
      twitter: '#',
      instagram: '#'
    },
    joinedDate: '2026-02-10T14:35:20Z'
  },
  {
    id: 4,
    name: 'David Martinez',
    role: 'Youth Ambassador',
    location: 'Austin, USA',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
    bio: 'Focused on youth mental health and early intervention. Creating programs that resonate with younger generations.',
    impact: {
      peopleReached: '1,500+',
      eventsHosted: 10,
      communitiesServed: 6
    },
    social: {
      linkedin: '#',
      twitter: '#'
    },
    joinedDate: '2026-02-10T14:35:20Z'
  },
  {
    id: 5,
    name: 'Emma Thompson',
    role: 'Regional Ambassador',
    location: 'Sydney, Australia',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
    bio: 'Building mental health awareness across the Asia-Pacific region. Experienced in cross-cultural communication.',
    impact: {
      peopleReached: '2,100+',
      eventsHosted: 14,
      communitiesServed: 9
    },
    social: {
      linkedin: '#',
      twitter: '#',
      instagram: '#'
    },
    joinedDate: '2026-02-10T14:35:20Z'
  },
  {
    id: 6,
    name: 'Carlos Rodriguez',
    role: 'Ambassador',
    location: 'Barcelona, Spain',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
    bio: 'Passionate about integrating mental health support into everyday life. Bringing Xolace to Spanish-speaking communities.',
    impact: {
      peopleReached: '1,900+',
      eventsHosted: 11,
      communitiesServed: 7
    },
    social: {
      linkedin: '#',
      instagram: '#'
    },
    joinedDate: '2026-02-10T14:35:20Z'
  },
  {
    id: 7,
    name: 'Aisha Patel',
    role: 'Ambassador',
    location: 'Mumbai, India',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop',
    bio: 'Dedicated to normalizing mental health conversations in South Asia. Working to reduce stigma and increase accessibility.',
    impact: {
      peopleReached: '2,800+',
      eventsHosted: 18,
      communitiesServed: 10
    },
    social: {
      linkedin: '#',
      twitter: '#',
      instagram: '#'
    },
    joinedDate: '2026-02-10T14:35:20Z'
  },
  {
    id: 8,
    name: 'James Wilson',
    role: 'Corporate Ambassador',
    location: 'Toronto, Canada',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
    bio: 'Bringing mental health awareness to the workplace. Helping companies create supportive environments for employees.',
    impact: {
      peopleReached: '3,500+',
      eventsHosted: 22,
      communitiesServed: 15
    },
    social: {
      linkedin: '#',
      twitter: '#'
    },
    joinedDate: '2026-01-10T14:35:20Z'
  },
  {
    id: 9,
    name: 'Sophie Laurent',
    role: 'Ambassador',
    location: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
    bio: 'Advocate for mental health in creative industries. Supporting artists and creators in their mental wellness journey.',
    impact: {
      peopleReached: '1,600+',
      eventsHosted: 9,
      communitiesServed: 5
    },
    social: {
      linkedin: '#',
      instagram: '#'
    },
    joinedDate: '2026-02-10T14:35:20Z'
  }
]

const Ambassadors = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
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
              Meet Our{' '}
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
              Passionate individuals around the world making mental health support accessible, compassionate, and transformative in their communities.
            </motion.p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-12"
          >
            {[
              { icon: Users, label: 'Active Ambassadors', value: '500+' },
              { icon: Globe, label: 'Countries', value: '25+' },
              { icon: Heart, label: 'Lives Impacted', value: '50k+' },
              { icon: Award, label: 'Events Hosted', value: '200+' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-border"
              >
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ambassadors Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {ambassadors.map((ambassador, index) => (
              <motion.div
                key={ambassador.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border border-border"
              >
                {/* Ambassador Image */}
                <div className="relative h-64 bg-muted overflow-hidden">
                  <Image
                    src={ambassador.image}
                    alt={ambassador.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Ambassador Info */}
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-foreground">
                      {ambassador.name}
                    </h3>
                    <p className="text-primary font-medium mb-1">{ambassador.role}</p>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {ambassador.location}
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {ambassador.bio}
                  </p>

                  {/* Impact Stats */}
                  <div className="bg-muted/50 rounded-xl p-2 mb-4 border border-border">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {ambassador.impact.peopleReached}
                        </div>
                        <div className="text-xs text-muted-foreground">Reached</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {ambassador.impact.eventsHosted}
                        </div>
                        <div className="text-xs text-muted-foreground">Events</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-primary">
                          {ambassador.impact.communitiesServed}
                        </div>
                        <div className="text-xs text-muted-foreground">Communities</div>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      {ambassador.social.linkedin && (
                        <a
                          href={ambassador.social.linkedin}
                          className="w-9 h-9 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                      {ambassador.social.twitter && (
                        <a
                          href={ambassador.social.twitter}
                          className="w-9 h-9 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Twitter className="w-4 h-4" />
                        </a>
                      )}
                      {ambassador.social.instagram && (
                        <a
                          href={ambassador.social.instagram}
                          className="w-9 h-9 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all duration-300"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Since {
                      new Date(ambassador.joinedDate)
                        .toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                        })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Want to Join Our Ambassador Program?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Be part of a global movement making mental health support accessible to everyone.
            </p>
            <a
              href="mailto:ambassadors@xolaceinc.com"
              className="inline-flex items-center gap-2 bg-background text-foreground px-8 py-4 rounded-xl font-semibold hover:bg-background/90 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Mail className="w-5 h-5" />
              Contact Us to Apply
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Ambassadors