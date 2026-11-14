# Why Attend React implementation

Source of truth: F:/Procom/why-attend (3).html. Base: origin/main. Approved scope is the supplied task brief.

1. Inspect all reference HTML/CSS/JS and current router, navbar, footer, fonts, loader, conventions.
2. Preserve markup/SVG/CSS and implement actual React components and state; no iframe, injected HTML or legacy script wrapper.
3. Components under src/components/whyAttend/: shared context/UI/visual effects; Hero, WorldMap, Challenge, Lobby; Careers, Ideas, Bonus, Boss, Finale. Own reference chrome where existing chrome is visually incompatible. Scoped CSS and route-specific self-hosted fonts.
4. Add lazy /why-attend route in existing Wouter router while preserving loader and existing pages. Attendee registration remains explicitly unavailable; the unrelated team-membership form is not substituted. Existing routes are reused and missing destinations show availability notices.
5. Test all interactive features, reduced motion and browser console; compare standalone reference and React screenshots at 1920/1440/1024/768/390/375/320. Run original tests, lint and build; no configured TypeScript check.
6. Review complete diff, commit and push only this feature and create PR against main. Do not merge.

No backend/API invented. Reference sample data is preserved and documented as proposed demo content, not an official event catalogue. No original dirty checkout or experimental 404 work touched.
