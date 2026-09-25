import * as cardsData from '../cards.yaml';

interface CardBase {
  id: string;
  title: string;
  body: string;
}

export type CookbookCard = CardBase & {
  kind: 'cookbook' | 'general';
};

export type DemoCard = CardBase &
  (
    | { kind: 'page'; path: string }
    | { kind: 'quickstart'; quickStartId: string }
    | { kind: 'pipeline' }
    | CookbookCard
  );

const loadedCards = Array.isArray(cardsData) ? cardsData : cardsData.default;

if (!Array.isArray(loadedCards)) {
  throw new Error('src/cards.yaml must contain a list of cards.');
}

export const cards = loadedCards as DemoCard[];

export const cookbookCards = cards.filter(
  (card): card is CookbookCard => card.kind === 'cookbook' || card.kind === 'general',
);
