import {
  CircularGallery,
  type GalleryItem,
} from "./circular-gallery-2";

// Define the items to be passed as props matching Vios Growth Academy's spirit
const galleryItems: GalleryItem[] = [
  { 
    image: "./WhatsApp Image 2026-03-23 at 23.30.38.jpeg",
    text: "Vios Children Foundation",
    description: "Nurturing future leaders in a safe haven where childhood is protected and potential is nurtured through holistic education."
  },
  {
    image: "./WhatsApp Image 2026-03-23 at 23.36.54.jpeg",
    text: "Inspiring Future Leaders",
    description: "Nurturing young minds through holistic mentorship, digital literacy education, and academic enrichment programs to build resilient future leaders."
  },
  {
    image: "./WhatsApp Image 2026-06-01 at 17.17.04.jpeg",
    text: "Nutritional Outreach & Support",
    description: "Providing nutrient-dense dietary support, regular healthcare checkups, and early infant-care resources to children and pregnant women facing extreme food insecurity."
  },
  {
    image: "./WhatsApp Image 2026-06-01 at 17.17.03.jpeg",
    text: "Sustainable Agricultural Initiatives",
    description: "Empowering families with modern irrigation tools, regenerative soil knowledge, and high-yield seeds to establish completely self-reliant organic farms."
  },
  {
    image: "./WhatsApp Image 2026-06-01 at 17.17.04 (2).jpeg",
    text: "Skill Development & Mentorship",
    description: "Pairing active professional mentors with ambitious young adults to cultivate critical skills and guarantee access to high-growth, modern careers."
  },
  {
    image: "./WhatsApp Image 2026-03-23 at 23.34.53.jpeg",
    text: "Inclusive Primary Education",
    description: "Overcoming cultural and financial barriers to guarantee high-quality basic education, books, and uniforms for all youth, regardless of background."
  },
  {
    image: "./WhatsApp Image 2026-03-23 at 23.36.54.jpeg",
    text: "Vocational Craftsmanship Training",
    description: "Supplying technical sewing machines, design guides, and business mentoring to train women in professional commercial trades and micro-entrepreneurship."
  },
  {
    image: "./WhatsApp Image 2026-03-23 at 23.30.25.jpeg",
    text: "Cooperative Community Building",
    description: "Repairing homes and stabilizing clean water access, returning physical safety and security to multi-generational households."
  },
];

/**
 * Default demo for the CircularGallery.
 * It automatically adapts to light/dark mode text colors.
 */
export default function CircularGalleryDemo() {
  return (
    // A container is needed to define the gallery's size
    <div className="relative h-[600px] w-full rounded-lg">
      <CircularGallery
        items={galleryItems}
        bend={3}
        borderRadius={0.05}
        scrollEase={0.02}
      />
    </div>
  );
}
export { galleryItems };
