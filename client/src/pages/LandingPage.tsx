import { lazy, Suspense, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Icon from '../components/ui/Icon';

const SignalScene = lazy(() => import('../components/dashboard/SignalScene'));

gsap.registerPlugin(ScrollTrigger);

const PRINCIPLES = [
  {
    number: '01',
    title: 'Clarity over clutter',
    copy: 'The important things surface first: who is here, what is changing and where attention is needed.',
  },
  {
    number: '02',
    title: 'A system that adapts',
    copy: 'Shape the interface around your team with live themes, custom type and an accent that feels like yours.',
  },
  {
    number: '03',
    title: 'The details are handled',
    copy: 'Search, validation, permissions and confirmation states stay close to the work instead of getting in its way.',
  },
];

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(
        root.querySelectorAll('[data-landing-intro]'),
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' },
      );

      root.querySelectorAll<HTMLElement>('[data-landing-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 82%', once: true },
          },
        );
      });

      gsap.to(root.querySelector('.landing-hero__copy'), {
        y: -55,
        ease: 'none',
        scrollTrigger: { trigger: '.landing-hero', start: 'top top', end: 'bottom top', scrub: 1 },
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <div className="landing" ref={rootRef}>
      <header className="landing-header">
        <Link to="/" className="landing-brand" aria-label="Forma home">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>Forma</span>
        </Link>
        <nav className="landing-nav" aria-label="Landing page">
          <a href="#approach">Approach</a>
          <a href="#system">The system</a>
          <a href="#themes">Themes</a>
        </nav>
        <Link to="/dashboard" className="landing-header__cta">
          Open workspace
          <Icon name="arrow-right" size={14} />
        </Link>
      </header>

      <main>
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero__copy">
            <p className="landing-kicker" data-landing-intro>
              <span className="landing-kicker__line" />
              The people workspace
            </p>
            <h1 id="landing-title" data-landing-intro>
              Keep your people <em>in focus.</em>
            </h1>
            <p className="landing-hero__summary" data-landing-intro>
              Forma is a quieter way to manage the people who make your work happen. One thoughtful
              place for the directory, the details and the decisions.
            </p>
            <div className="landing-hero__actions" data-landing-intro>
              <Link to="/dashboard" className="btn btn--primary landing-primary-action">
                Continue to dashboard
                <Icon name="arrow-right" size={15} />
              </Link>
              <a href="#approach" className="landing-text-link">
                See how it works
                <Icon name="arrow-down" size={14} />
              </a>
            </div>
            <div className="landing-hero__meta" data-landing-intro>
              <span><i /> MongoDB-backed</span>
              <span><i /> Live and customizable</span>
            </div>
          </div>
          <div className="landing-hero__visual" data-landing-intro>
            <Suspense fallback={<div className="landing-visual-placeholder" aria-hidden="true" />}>
              <SignalScene />
            </Suspense>
            <span className="landing-hero__visual-label landing-hero__visual-label--top">SIGNAL / 01</span>
            <span className="landing-hero__visual-label landing-hero__visual-label--bottom">A living directory</span>
          </div>
          <div className="landing-hero__scroll" aria-hidden="true">
            <span className="landing-hero__scroll-wheel" />
            Scroll to explore
          </div>
        </section>

        <section className="landing-section landing-section--statement" id="approach" data-landing-reveal>
          <div className="landing-section__index">01 / Approach</div>
          <div className="landing-statement">
            <p className="landing-statement__lead">
              Your directory should feel less like a database and more like a <em>shared point of view.</em>
            </p>
            <p className="landing-statement__copy">
              Forma brings the signal forward without turning every action into a workflow. Add a person,
              find the right detail and keep moving with confidence.
            </p>
          </div>
        </section>

        <section className="landing-section" id="system" data-landing-reveal>
          <div className="landing-section__index">02 / The system</div>
          <div className="landing-principles">
            {PRINCIPLES.map((principle) => (
              <article className="landing-principle" key={principle.number}>
                <span className="landing-principle__number">{principle.number}</span>
                <div className="landing-principle__rule" />
                <h2>{principle.title}</h2>
                <p>{principle.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-section--split" id="themes" data-landing-reveal>
          <div className="landing-section__index">03 / The interface</div>
          <div className="landing-interface-card">
            <div className="landing-interface-card__copy">
              <p className="landing-kicker"><span className="landing-kicker__line" />Your atmosphere</p>
              <h2>Make the workspace feel like it belongs to your team.</h2>
              <p>
                Four coordinated presets, a live action color and custom font upload compose into one
                theme that stays with you across every page.
              </p>
              <Link to="/dashboard" className="landing-text-link">
                Explore the workspace
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
            <div className="landing-interface-card__preview" aria-hidden="true">
              <div className="landing-preview__top"><span /><span /><span /></div>
              <div className="landing-preview__body">
                <div className="landing-preview__sidebar"><b /> <i /><i /><i /></div>
                <div className="landing-preview__content">
                  <span className="landing-preview__eyebrow">Workspace overview</span>
                  <strong>People, in focus.</strong>
                  <div className="landing-preview__metrics"><i /><i /><i /></div>
                  <div className="landing-preview__rows"><i /><i /><i /><i /></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-cta" data-landing-reveal>
          <p className="landing-kicker"><span className="landing-kicker__line" />Ready when you are</p>
          <h2>Give your people a better place to be found.</h2>
          <Link to="/dashboard" className="btn btn--primary landing-primary-action">
            Continue to dashboard
            <Icon name="arrow-right" size={15} />
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <Link to="/" className="landing-brand">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>Forma</span>
        </Link>
        <span>People, in focus.</span>
        <span className="landing-footer__mono">© {new Date().getFullYear()} / PRIVATE WORKSPACE</span>
      </footer>
    </div>
  );
}
