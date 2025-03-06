interface AvatarOptions {
  name: string;
  background?: string;
  size?: number;
  bold?: boolean;
  font?: string;
  rounded?: boolean;
}

export const getAvatarUrl = ({
  name,
  background = "random",
  size = 128,
  bold = true,
  font = "Inter",
  rounded = true,
}: AvatarOptions): string => {
  const params = new URLSearchParams({
    name: name.trim(),
    background,
    size: size.toString(),
    bold: bold.toString(),
    font: font,
    rounded: rounded.toString(),
  });

  return `https://ui-avatars.com/api/?${params.toString()}`;
};
