import { OFFICIAL_AMBASSADORS } from "@/constants";
import AmbassadorCard from "../ambassador-showcase/ambassador-card";
import AnimatedHero from "../ambassador-showcase/animated-hero";
import AnimatedCta from "../ambassador-showcase/animated-cta";

// Sample ambassador data
// const ambassadors = [
//   {
//     id: 1,
//     name: "Sarah Johnson",
//     role: "Lead Ambassador",
//     location: "New York, USA",
//     image:
//       "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
//     bio: "Mental health advocate with 5+ years of experience in community outreach. Passionate about making support accessible to everyone.",
//     impact: {
//       peopleReached: "2,500+",
//       eventsHosted: 15,
//       communitiesServed: 8,
//     },
//     social: {
//       linkedin: "#",
//       twitter: "#",
//       instagram: "#",
//     },
//     joinedDate: "January 2024",
//   },
//   {
//     id: 2,
//     name: "Chris",
//     role: "Campus Ambassador",
//     location: "San Francisco, USA",
//     image:
//       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
//     bio: "University student dedicated to breaking mental health stigma on campus. Building safe spaces for open conversations.",
//     impact: {
//       peopleReached: "1,800+",
//       eventsHosted: 12,
//       communitiesServed: 5,
//     },
//     social: {
//       linkedin: "#",
//       twitter: "#",
//       instagram: "#",
//     },
//     joinedDate: "2026-02-10T14:35:20Z",
//   },
//   {
//     id: 3,
//     name: "Priya Sharma",
//     role: "Community Ambassador",
//     location: "London, UK",
//     image:
//       "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
//     bio: "Advocate for culturally sensitive mental health support. Connecting diverse communities with resources they need.",
//     impact: {
//       peopleReached: "3,200+",
//       eventsHosted: 20,
//       communitiesServed: 12,
//     },
//     social: {
//       linkedin: "#",
//       twitter: "#",
//       instagram: "#",
//     },
//     joinedDate: "2026-02-10T14:35:20Z",
//   },
//   {
//     id: 4,
//     name: "David Martinez",
//     role: "Youth Ambassador",
//     location: "Austin, USA",
//     image:
//       "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
//     bio: "Focused on youth mental health and early intervention. Creating programs that resonate with younger generations.",
//     impact: {
//       peopleReached: "1,500+",
//       eventsHosted: 10,
//       communitiesServed: 6,
//     },
//     social: {
//       linkedin: "#",
//       twitter: "#",
//     },
//     joinedDate: "2026-02-10T14:35:20Z",
//   },
//   {
//     id: 5,
//     name: "Emma Thompson",
//     role: "Regional Ambassador",
//     location: "Sydney, Australia",
//     image:
//       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
//     bio: "Building mental health awareness across the Asia-Pacific region. Experienced in cross-cultural communication.",
//     impact: {
//       peopleReached: "2,100+",
//       eventsHosted: 14,
//       communitiesServed: 9,
//     },
//     social: {
//       linkedin: "#",
//       twitter: "#",
//       instagram: "#",
//     },
//     joinedDate: "2026-02-10T14:35:20Z",
//   },
//   {
//     id: 6,
//     name: "Carlos Rodriguez",
//     role: "Ambassador",
//     location: "Barcelona, Spain",
//     image:
//       "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
//     bio: "Passionate about integrating mental health support into everyday life. Bringing Xolace to Spanish-speaking communities.",
//     impact: {
//       peopleReached: "1,900+",
//       eventsHosted: 11,
//       communitiesServed: 7,
//     },
//     social: {
//       linkedin: "#",
//       instagram: "#",
//     },
//     joinedDate: "2026-02-10T14:35:20Z",
//   },
//   {
//     id: 7,
//     name: "Aisha Patel",
//     role: "Ambassador",
//     location: "Mumbai, India",
//     image:
//       "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
//     bio: "Dedicated to normalizing mental health conversations in South Asia. Working to reduce stigma and increase accessibility.",
//     impact: {
//       peopleReached: "2,800+",
//       eventsHosted: 18,
//       communitiesServed: 10,
//     },
//     social: {
//       linkedin: "#",
//       twitter: "#",
//       instagram: "#",
//     },
//     joinedDate: "2026-02-10T14:35:20Z",
//   },
//   {
//     id: 8,
//     name: "James Wilson",
//     role: "Corporate Ambassador",
//     location: "Toronto, Canada",
//     image:
//       "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
//     bio: "Bringing mental health awareness to the workplace. Helping companies create supportive environments for employees.",
//     impact: {
//       peopleReached: "3,500+",
//       eventsHosted: 22,
//       communitiesServed: 15,
//     },
//     social: {
//       linkedin: "#",
//       twitter: "#",
//     },
//     joinedDate: "2026-01-10T14:35:20Z",
//   },
//   {
//     id: 9,
//     name: "Sophie Laurent",
//     role: "Ambassador",
//     location: "Paris, France",
//     image:
//       "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop",
//     bio: "Advocate for mental health in creative industries. Supporting artists and creators in their mental wellness journey.",
//     impact: {
//       peopleReached: "1,600+",
//       eventsHosted: 9,
//       communitiesServed: 5,
//     },
//     social: {
//       linkedin: "#",
//       instagram: "#",
//     },
//     joinedDate: "2026-02-10T14:35:20Z",
//   },
// ];

const Ambassadors = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnimatedHero />

      {/* Ambassadors Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {OFFICIAL_AMBASSADORS.map((ambassador, index) => (
              <AmbassadorCard
                key={ambassador.id}
                ambassador={ambassador}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <AnimatedCta />
    </div>
  );
};

export default Ambassadors;
