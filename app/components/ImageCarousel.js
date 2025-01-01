export function ImageCarousel({ programImage }) {
  return (
    <div className="carousel w-full h-[500px] ">
      {programImage &&
        programImage.map((img, index) => {
          const prevSlide = index === 0 ? programImage.length - 1 : index - 1;
          const nextSlide = index === programImage.length - 1 ? 0 : index + 1;
          return (
            <div
              id={`slide${index}`}
              className="carousel-item relative w-full h-full"
              key={index}
            >
              <img src={img} className="w-full h-full object-contain" />
              <div className="absolute left-5 right-5 top-1/2 flex -translate-y-1/2 transform justify-between">
                <a href={`#slide${prevSlide}`} className="btn btn-circle">
                  ❮
                </a>
                <a href={`#slide${nextSlide}`} className="btn btn-circle">
                  ❯
                </a>
              </div>
            </div>
          );
        })}
    </div>
  );
}
