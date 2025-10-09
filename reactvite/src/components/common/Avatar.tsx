import avatarSrc from '../../assets/avatar.svg';
import './Avatar.css';

interface AvatarProps {
  /** width & height of the avatar circle in px */
  size?: number;
}

export default function Avatar({ size = 64 }: AvatarProps) {
  return (
    <div
      className="avatar"
      style={{ width: size, height: size }}
    >
      <img src={avatarSrc} alt="User avatar" />
    </div>
  );
}
