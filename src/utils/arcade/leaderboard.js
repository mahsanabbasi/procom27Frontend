/* Bit Runner leaderboard. Scores are kept in this browser by default. To share
   one leaderboard between every visitor, replace load / submit with calls to
   your API (both return Promises) and update `note`. */
export const LEADERBOARD = {
  key: 'procom27-board',
  note: 'Scores are saved on this device',
  load() {
    const k = this.key;
    return new Promise((res) => {
      let b = [];
      try {
        b = JSON.parse(localStorage.getItem(k) || '[]');
      } catch {
        /* storage unavailable */
      }
      res(Array.isArray(b) ? b : []);
    });
  },
  submit(entry) {
    const k = this.key;
    return this.load().then((b) => {
      const mine = b.find((x) => x.roll === entry.roll);
      if (mine) {
        if (entry.score > mine.score) {
          mine.score = entry.score;
          mine.t = entry.t;
        }
      } else b.push(entry);
      b.sort((a, c) => c.score - a.score || a.t - c.t);
      const top = b.slice(0, 20);
      try {
        localStorage.setItem(k, JSON.stringify(top));
      } catch {
        /* storage unavailable */
      }
      return top;
    });
  },
};

