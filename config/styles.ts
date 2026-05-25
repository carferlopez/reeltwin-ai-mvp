export interface CinematicStyle {
  id: string;
  name: string;
  description: string;
  dynamicBackgrounds: string[];
}

export const CINEMATIC_STYLES: Record<string, CinematicStyle> = {
  'nordic-noir': {
    id: 'nordic-noir',
    name: 'Nordic Noir (Thriller)',
    description: 'Iluminación fría, ambiente de thriller policial o calle lluviosa de noche.',
    dynamicBackgrounds: [
      "dark detective office background, out of focus rainy window, soft desk lamp reflection",
      "dimly lit underground concrete parking lot background, distant flickering fluorescent light",
      "gritty urban alleyway at night background, soft wet asphalt reflections"
    ]
  },
  'indie-sundance': {
    id: 'indie-sundance',
    name: 'Indie Sundance (Drama)',
    description: 'Luz natural de atardecer, tonos cálidos, estética de cine independiente.',
    dynamicBackgrounds: [
      "minimalist apartment interior background, large window with warm sunset light",
      "cozy local coffee shop background, blurred wooden textures and soft bokeh",
      "empty theater rehearsal room background, soft dramatic sunbeams"
    ]
  }
};
