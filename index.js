const Hero = require('@ulixee/hero-playground');

(async () => {
  const hero = new Hero();
  await hero.goto('https://www.google.com');
  // other actions...
  await hero.close();
})();