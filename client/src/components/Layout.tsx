import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <>
        <header>
            <nav>
            <NavLink to="/">Accueil</NavLink>
            <NavLink to="/projets">Projets</NavLink>
            <NavLink to="/experiences">Expériences</NavLink>
            <NavLink to="/competences">Compétences</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            </nav>
        </header>
        <main>
            <Outlet />
        </main>
        <footer>
            <p>© {new Date().getFullYear()} Arthur Le Berre</p>
        </footer>
        </>
    );
}