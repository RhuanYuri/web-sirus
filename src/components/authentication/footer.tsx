interface FooterProps {
  text: string;
  name: string;
  link: string;
}

export default function Footer({ text, name, link }: FooterProps) {
  return (
    <div className="text-center text-sm">
      {text}{" "}
      <a href={`/${link}`} className="underline underline-offset-4">
        {name}
      </a>
    </div>
  );
}
