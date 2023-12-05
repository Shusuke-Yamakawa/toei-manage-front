'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classes from './Navbar.module.css';

const data = [
  { link: '/', label: 'card' },
  { link: '/draw', label: 'draw' },
  { link: '/court', label: 'court' },
  { link: '/batch', label: 'batch' },
];

export const Navbar = () => {
  const pathname = usePathname();
  const links = data.map((item) => (
    <Link
      href={item.link}
      className={classes.link}
      data-active={item.link === pathname || undefined}
      key={item.label}
    >
      <span>{item.label}</span>
    </Link>
  ));
  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>{links}</div>
    </nav>
  );
};
