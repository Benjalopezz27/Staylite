import { Carousel } from "@ark-ui/react/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ThumbnailsCarousel({
  images,
}: {
  images: { full: string; thumb: string }[];
}) {
  return (
    <Carousel.Root
      defaultPage={0}
      slideCount={images.length}
      className="w-full max-w-5xl p-2 mx-auto"
    >
      <Carousel.ItemGroup className="overflow-hidden rounded-lg shadow-lg mb-4">
        {images.map((image, index) => (
          <Carousel.Item key={index} index={index}>
            <img
              src={image.full}
              alt={`Slide ${index + 1}`}
              className="w-full h-[400px] md:h-[600px] object-cover"
            />
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>

      <div className="flex items-center gap-4">
        <Carousel.PrevTrigger className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 hover:text-primary dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900 disabled:opacity-50">
          <ChevronLeft className="size-5" />
        </Carousel.PrevTrigger>

        <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 px-2">
          {images.map((image, index) => (
            <Carousel.Indicator
              key={index}
              index={index}
              className="shrink-0 border-2 border-transparent data-current:border-primary rounded-md overflow-hidden cursor-pointer transition-all hover:border-gray-300"
            >
              <img
                src={image.thumb}
                alt={`Thumbnail ${index + 1}`}
                className="w-20 h-14 object-cover"
              />
            </Carousel.Indicator>
          ))}
        </div>

        <Carousel.NextTrigger className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 hover:text-primary dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900 disabled:opacity-50">
          <ChevronRight className="size-5" />
        </Carousel.NextTrigger>
      </div>
    </Carousel.Root>
  );
}
