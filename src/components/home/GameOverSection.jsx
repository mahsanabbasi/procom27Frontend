import { Link } from 'wouter';
import { homeGameOver } from '../../data/homeGameOver.js';

export default function GameOverSection() {
  return (
    <section className="gameover is-in" id="gameover" aria-labelledby="go-title" data-munch="check" data-munch-label="Game over">
      <div className="container">
        <h2 className="go__title" id="go-title" aria-label="Game over">GAME OVER</h2>
        <p className="go__meta">
          <span>Score <b id="goXP">{homeGameOver.score}</b></span>
          <span>Level <b id="goLv">{homeGameOver.level}</b></span>
          <span>Quests <b id="goQ">{homeGameOver.quests}</b></span>
        </p>
        <p className="go__cont is-end" id="goCont">{homeGameOver.continue}</p>
        <div className="btn-row">
          <Link className="btn btn--arcade" href={homeGameOver.registerHref} data-demo data-demo-kind="register" data-register>
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
