interface HeaderProps{
    title: string;
    description: string
}

export default function Header({ title, description }: HeaderProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground text-balance">
        {description}
      </p>
    </div>
  );
}
