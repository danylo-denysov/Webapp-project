import avatarSrc from '../../assets/avatar.svg';
import './Avatar.css';

interface AvatarProps {
  size?: number;
  profilePicture?: string | null;
}

export default function Avatar({ size = 64, profilePicture }: AvatarProps) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size }}
    >
      <img src={profilePicture || avatarSrc} alt="User avatar" />
    </div>
  );
}
