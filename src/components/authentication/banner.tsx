export default function Banner() {
  return (
    <div className="bg-muted relative hidden md:block">
      <img
        src="/banner.png"
        alt="Image"
        className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
      />
    </div>
  );
}
