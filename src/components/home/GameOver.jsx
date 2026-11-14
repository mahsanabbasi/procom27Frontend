import { Link } from 'wouter';

export default function GameOver() {
  return (
    <section className="gameover" id="gameover" aria-labelledby="go-title" data-munch="check" data-munch-label="Game over">
      <div className="container">
        <h2 className="go__title glitch" id="go-title" aria-label="Game over">
          <span style={{ '--i': 0 }}>G</span>
          <span style={{ '--i': 1 }}>A</span>
          <span style={{ '--i': 2 }}>M</span>
          <span style={{ '--i': 3 }}>E</span>
          <span className="gap" style={{ '--i': 4 }} />
          <span className="go__swap" aria-hidden="true">
            <span style={{ '--i': 5 }}>O</span>
            <span style={{ '--i': 6 }}>V</span>
            <span style={{ '--i': 7 }}>E</span>
            <span style={{ '--i': 8 }}>R</span>
          </span>
        </h2>
        <p className="go__meta">
          <span>Score <b id="goXP">00000</b></span>
          <span>Level <b id="goLv">01</b></span>
          <span>Quests <b id="goQ">0/0</b></span>
        </p>
        <p className="go__cont is-end" id="goCont">Thanks for playing · Insert coin</p>
        <div className="btn-row">
          <Link to="/register" href="/register" className="btn btn--arcade">
            <i className="i i-play" aria-hidden="true" />Register
          </Link>
          <button className="btn btn--secondary" type="button" id="goTop">
            <i className="i i-chevron-up" aria-hidden="true" />Back to start
          </button>
        </div>
      </div>
    </section>
  );
}
