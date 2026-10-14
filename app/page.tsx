import { POSTS, SITE } from "@/content/site";
import { Icon } from "@/components/Icons";
import Feed from "@/components/Feed";
import Experience from "@/components/Experience";

export default function Home() {
  return (
    <Experience>
      <main className="card">
        <header className="profile">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="avatar" src={SITE.avatar} alt={SITE.name} />
          <h1>{SITE.name}</h1>
          <p className="bio">{SITE.bio}</p>
          <ul className="links">
            {SITE.links.map((l) => (
              <li key={l.type}>
                <a href={l.url} target="_blank" rel="noreferrer" aria-label={l.type}>
                  <Icon type={l.type} />
                </a>
              </li>
            ))}
          </ul>
        </header>

        <hr />

        <Feed posts={POSTS} />

        <footer>( made with ♡ )</footer>
      </main>
    </Experience>
  );
}
