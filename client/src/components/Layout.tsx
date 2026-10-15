import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
    { to: '/', label: 'Accueil' },
    { to: '/projets', label: 'Projets' },
    { to: '/experiences', label: 'Expériences' },
    { to: '/competences', label: 'Compétences' },
    { to: '/contact', label: 'Contact' },
];

export default function Layout() {
    const [open, setOpen] = useState(false);
    return (
        <>
        <header className="site-header">
            <div className="container header-inner">
            <NavLink to="/" className="logo" onClick={() => setOpen(false)}>
                Arthur Le Berre
            </NavLink>
            <button
                type="button"
                className="menu-toggle"
                aria-expanded={open}
                aria-controls="menu-principal"
                onClick={() => setOpen(!open)}
            >
                {open ? 'Fermer' : 'Menu'}
            </button>
            <nav id="menu-principal" className={open ? 'nav open' : 'nav'} aria-label="Navigation principale">
                {LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setOpen(false)}>
                    {link.label}
                </NavLink>
                ))}
            </nav>
            </div>
        </header>
        <main className="container">
            <Outlet />
        </main>
        <footer className="site-footer">
            <div className="container footer-inner">
            <p>© {new Date().getFullYear()} Arthur Le Berre</p>
            <p>Paris</p>
            </div>
        </footer>
        </>
    );
}