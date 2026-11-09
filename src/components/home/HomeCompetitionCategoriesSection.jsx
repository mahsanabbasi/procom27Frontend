// Renders the final-reference Competition categories claw machine statically.
import { Link } from 'wouter';
import { homeCategories, homeCompetitions } from '../../data/homeCompetitions.js';

const categoryCount = (categoryId) => homeCompetitions.filter(({ cat }) => cat === categoryId).length;
const plural = (count, singular, pluralForm = `${singular}s`) => `${count} ${count === 1 ? singular : pluralForm}`;

function Icon({ name }) {
  return <i className={`i i-${name}`} aria-hidden="true" />;
}

function Bulbs({ id }) {
  return (
    <div className="bulbs" id={id} aria-hidden="true">
      {Array.from({ length: 16 }, (_, index) => (
        <i key={index} style={{ '--n': index }} />
      ))}
    </div>
  );
}

function CategoryPrize({ category, index }) {
  const [left, bottom, rotation] = category.position;
  const count = categoryCount(category.id);

  return (
    <button
      className={`prize prize--${index % 3}`}
      type="button"
      data-cat={category.id}
      style={{
        '--px': left,
        '--pb': `${bottom}px`,
        '--rot': `${rotation}deg`,
        '--z': bottom > 40 ? 1 : 2,
      }}
      aria-label={`Grab ${category.label}, ${plural(count, 'competition')}`}
    >
      <span className="prize__ic"><Icon name={`cat-${category.id}`} /></span>
      <span className="prize__code" aria-hidden="true">{category.short}</span>
      <span className="prize__tip" aria-hidden="true">{category.label}</span>
    </button>
  );
}

function CategoryPrizeRow({ category }) {
  const count = categoryCount(category.id);

  return (
    <li>
      <Link className="plist__row" href={`/competitions?cat=${category.id}`}>
        <span className="plist__ic"><Icon name={`cat-${category.id}`} /></span>
        <span className="plist__nm">{category.label}</span>
        <span className="plist__n">{plural(count, 'comp')}</span>
        <Icon name="arrow" />
      </Link>
    </li>
  );
}

export default function HomeCompetitionCategoriesSection() {
  return (
    <section
      className="section"
      id="categories"
      aria-labelledby="cat-title"
      data-munch="trophy"
      data-munch-label="Competitions"
    >
      <div className="container">
        <header className="sh" data-reveal>
          <div>
            <p className="sh__label t-label"><Icon name="square" />01 / Competitions</p>
            <h2 className="sh__title t-d2" id="cat-title">
              Competition <span className="t-soft">categories</span>
            </h2>
          </div>
          <p className="sh__desc t-body-lg">
            Find the competitions that fit your interests and skills. Pick a prize, or steer the claw and press GRAB.
          </p>
        </header>
        <div className="claw">
          <div className="cm" id="claw" data-reveal="scale">
            <div className="cm__top">
              <Bulbs id="cmBulbsTop" />
              <p className="cm__title" aria-hidden="true">Prize grabber</p>
              <p className="cm__sub t-label" id="cmSub" aria-hidden="true">
                {plural(homeCategories.length, 'category', 'categories')} · free play
              </p>
              <Bulbs id="cmBulbsBot" />
            </div>
            <div className="cm__box">
              <div className="cm__glass">
                <span className="cm__rail" aria-hidden="true" />
                <div className="cm__gantry" aria-hidden="true" style={{ '--x': '12px', '--l': '26px' }}>
                  <span className="cm__car" />
                  <span className="cm__cable" />
                  <span className="cm__head">
                    <svg viewBox="0 0 76 64">
                      <rect x="27" y="0" width="22" height="13" fill="#100C16" stroke="#DCC8FF" strokeWidth="1.5" />
                      <rect x="33" y="4" width="10" height="5" fill="#B57CFF" />
                      <g className="cm__prong cm__prong--l">
                        <path d="M31 11 L17 30 L19 47 L28 56" fill="none" stroke="#DCC8FF" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
                      </g>
                      <g className="cm__prong cm__prong--r">
                        <path d="M45 11 L59 30 L57 47 L48 56" fill="none" stroke="#DCC8FF" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" />
                      </g>
                    </svg>
                  </span>
                </div>
                <div className="cm__chute" aria-hidden="true">
                  <span className="cm__clbl t-label">Prize<Icon name="arrow-down" /></span>
                  <span className="cm__hole" />
                </div>
                <div className="cm__pile" id="cmPile" role="group" aria-label="Prizes: competition categories">
                  {homeCategories.map((category, index) => (
                    <CategoryPrize key={category.id} category={category} index={index} />
                  ))}
                </div>
                <span className="cm__shine" aria-hidden="true" />
                <div className="cm__win" id="cmWin" role="dialog" aria-label="Your prize" hidden />
              </div>
            </div>
            <div className="cm__deck">
              <div className="joy" role="group" aria-label="Move the claw">
                <button className="joy__b" type="button" data-joy="-1" aria-label="Move claw left">
                  <Icon name="chevron-left" />
                </button>
                <span className="joy__stick" aria-hidden="true"><i /></span>
                <button className="joy__b" type="button" data-joy="1" aria-label="Move claw right">
                  <Icon name="chevron-right" />
                </button>
              </div>
              <p className="cm__lcd" id="cmLcd" aria-live="polite">Pick a prize, or steer with the joystick and press GRAB.</p>
              <button className="grab" id="cmGrab" type="button">Grab</button>
            </div>
          </div>
          <aside className="panel plist" data-reveal aria-labelledby="plist-title">
            <div className="hud t-label">
              <span id="plist-title">Prize list</span>
              <b id="plistCount">{plural(homeCategories.length, 'category', 'categories')}</b>
            </div>
            <ul className="plist__rows" id="cats">
              {homeCategories.map((category) => (
                <CategoryPrizeRow key={category.id} category={category} />
              ))}
            </ul>
            <div className="plist__foot">
              <Link className="link-action" href="/competitions">
                View all competitions<Icon name="arrow" />
              </Link>
              <span className="t-meta" id="allCount">{plural(homeCompetitions.length, 'competition')} listed</span>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
