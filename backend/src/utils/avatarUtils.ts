interface AvatarOptions {
  name: string;
  size?: number;
  background?: string;
  color?: string;
}

export const getAvatarUrl = ({
  name,
  size = 200,
  background = "random",
  color = "ffffff",
}: AvatarOptions): string => {
  const encodedName = encodeURIComponent(name);
  return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=${background}&color=${color}`;
};
