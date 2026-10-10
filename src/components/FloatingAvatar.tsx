import avatarImg from '@/imports/avatar.png';

interface Props {
  scrollY?: number;
}

// Static portrait: sits in the hero and scrolls with the page like normal content.
// No floating animation, no scroll-driven movement, no paint droplets.
export default function FloatingAvatar(_props: Props) {
  return (
    <div
      style={{
        position: 'absolute',
        left: '50vw',
        top: '25vh',
        width: 'clamp(120px, 28vw, 360px)',
        transform: 'translate(-50%, -10%)',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <img
        src={avatarImg}
        alt="Deepanshi Nagarwal"
        style={{ width: '100%', objectFit: 'contain', display: 'block' }}
      />
    </div>
  );
}
