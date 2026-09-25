import NavBar from "@/components/layout/nav-bar";
import ScrollProgressBar from "@/components/ui/scroll-progress-bar";
import Footer from "@/features/(public)/landing/components/ambassador/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ScrollProgressBar />
      <NavBar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
