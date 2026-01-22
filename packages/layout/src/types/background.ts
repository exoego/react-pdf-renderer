export type BackgroundImage = {
  data: any;
  width: number;
  height: number;
  key?: string;
};

export type BackgroundLayer = {
  type: 'image' | 'gradient';
  value: string;
  image?: BackgroundImage;
};
