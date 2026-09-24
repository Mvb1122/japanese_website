export type OCRMetadata = {
  jobId: string;
  data: OCRData;
};

export type OCRData = {
  text: string;
  hocr: string;
  tsv: string;

  box: unknown | null;
  unlv: unknown | null;
  osd: unknown | null;
  pdf: unknown | null;
  imageColor: unknown | null;
  imageGrey: unknown | null;
  imageBinary: unknown | null;

  confidence: number;
  blocks: OCRBlock[];
};

export type OCRBlock = {
  paragraphs: OCRParagraph[];
  text: string;
  confidence: number;
  baseline: Baseline;
  bbox: BoundingBox;
  blocktype: string;
  polygon: unknown | null;
  page: OCRPage;
};

export type OCRPage = {
  text: string;
  hocr: string;
  tsv: string;

  box: unknown | null;
  unlv: unknown | null;
  osd: unknown | null;
  pdf: unknown | null;
  imageColor: unknown | null;
  imageGrey: unknown | null;
  imageBinary: unknown | null;

  confidence: number;
  blocks: OCRBlock[];
};

export type OCRParagraph = {
  lines: OCRLine[];
  text: string;
  confidence: number;
  baseline: Baseline;
  bbox: BoundingBox;
  is_ltr: boolean;
};

export type OCRLine = {
  words: OCRWord[];
  text: string;
  confidence: number;
  baseline: Baseline;
  rowAttributes: RowAttributes;
  bbox: BoundingBox;
};

export type OCRWord = {
  symbols: OCRSymbol[];
  choices: OCRChoice[];
  text: string;
  confidence: number;
  baseline: Baseline;
  bbox: BoundingBox;

  is_numeric: boolean;
  in_dictionary: boolean;
  direction: string;
  language: string;

  is_bold: boolean;
  is_italic: boolean;
  is_underlined: boolean;
  is_monospace: boolean;
  is_serif: boolean;
  is_smallcaps: boolean;

  font_size: number;
  font_id: number;
  font_name: string;
};

export type OCRSymbol = {
  choices: OCRChoice[];
  image: unknown | null;
  text: string;
  confidence: number;
  baseline: Baseline;
  bbox: BoundingBox;

  is_superscript: boolean;
  is_subscript: boolean;
  is_dropcap: boolean;
};

export type OCRChoice = {
  text: string;
  confidence: number;
};

export type Baseline = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  has_baseline: boolean;
};

export type BoundingBox = {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
};

export type RowAttributes = {
  row_height: number;
  descenders: number;
  ascenders: number;
};