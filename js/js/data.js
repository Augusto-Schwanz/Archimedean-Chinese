/**
 * data.js
 * HSK 1 deck: all 150 words with metadata.
 * Each word generates two card types: 'meaning' and 'pinyin'.
 * Categories map directly to BKT knowledge components.
 */

const HSK1_WORDS = [
  // Pronouns – personal
  { chinese:'我',    english:'I, me',              pinyin:'wǒ',         category:'pronoun',      subcategory:'personal' },
  { chinese:'我们',  english:'we, us',              pinyin:'wǒmen',      category:'pronoun',      subcategory:'personal' },
  { chinese:'你',    english:'you',                 pinyin:'nǐ',         category:'pronoun',      subcategory:'personal' },
  { chinese:'他',    english:'he, him',             pinyin:'tā',         category:'pronoun',      subcategory:'personal' },
  { chinese:'她',    english:'she, her',            pinyin:'tā',         category:'pronoun',      subcategory:'personal' },
  // Pronouns – demonstrative
  { chinese:'这',    english:'this',                pinyin:'zhè',        category:'pronoun',      subcategory:'demonstrative' },
  { chinese:'那',    english:'that',                pinyin:'nà',         category:'pronoun',      subcategory:'demonstrative' },
  // Pronouns – interrogative
  { chinese:'哪',    english:'which',               pinyin:'nǎ',         category:'pronoun',      subcategory:'interrogative' },
  { chinese:'哪儿',  english:'where',               pinyin:'nǎr',        category:'pronoun',      subcategory:'interrogative' },
  { chinese:'谁',    english:'who',                 pinyin:'shéi',       category:'pronoun',      subcategory:'interrogative' },
  { chinese:'什么',  english:'what',                pinyin:'shénme',     category:'pronoun',      subcategory:'interrogative' },
  { chinese:'多少',  english:'how many, how much',  pinyin:'duōshǎo',    category:'pronoun',      subcategory:'interrogative' },
  { chinese:'几',    english:'a few, how many',     pinyin:'jǐ',         category:'pronoun',      subcategory:'interrogative' },
  { chinese:'怎么',  english:'how',                 pinyin:'zěnme',      category:'pronoun',      subcategory:'interrogative' },
  { chinese:'怎么样',english:'how about',           pinyin:'zěnmeyàng',  category:'pronoun',      subcategory:'interrogative' },
  // Numerals
  { chinese:'一',    english:'one',                 pinyin:'yī',         category:'numeral',      subcategory:'cardinal' },
  { chinese:'二',    english:'two',                 pinyin:'èr',         category:'numeral',      subcategory:'cardinal' },
  { chinese:'三',    english:'three',               pinyin:'sān',        category:'numeral',      subcategory:'cardinal' },
  { chinese:'四',    english:'four',                pinyin:'sì',         category:'numeral',      subcategory:'cardinal' },
  { chinese:'五',    english:'five',                pinyin:'wǔ',         category:'numeral',      subcategory:'cardinal' },
  { chinese:'六',    english:'six',                 pinyin:'liù',        category:'numeral',      subcategory:'cardinal' },
  { chinese:'七',    english:'seven',               pinyin:'qī',         category:'numeral',      subcategory:'cardinal' },
  { chinese:'八',    english:'eight',               pinyin:'bā',         category:'numeral',      subcategory:'cardinal' },
  { chinese:'九',    english:'nine',                pinyin:'jiǔ',        category:'numeral',      subcategory:'cardinal' },
  { chinese:'十',    english:'ten',                 pinyin:'shí',        category:'numeral',      subcategory:'cardinal' },
  // Measure words
  { chinese:'个',    english:'measure word for general objects', pinyin:'gè',   category:'measure_word', subcategory:'nominal' },
  { chinese:'岁',    english:'measure word for age',            pinyin:'suì',  category:'measure_word', subcategory:'temporal' },
  { chinese:'本',    english:'measure word for books',          pinyin:'běn',  category:'measure_word', subcategory:'nominal' },
  { chinese:'些',    english:'some',                            pinyin:'xiē',  category:'measure_word', subcategory:'indefinite' },
  { chinese:'块',    english:'piece, chunk',                    pinyin:'kuài', category:'measure_word', subcategory:'nominal' },
  // Adverbs
  { chinese:'不',    english:'no, not',             pinyin:'bù',         category:'adverb',       subcategory:'negation' },
  { chinese:'没',    english:'no, not',             pinyin:'méi',        category:'adverb',       subcategory:'negation' },
  { chinese:'很',    english:'quite, very',         pinyin:'hěn',        category:'adverb',       subcategory:'degree' },
  { chinese:'太',    english:'too',                 pinyin:'tài',        category:'adverb',       subcategory:'degree' },
  { chinese:'都',    english:'all, both',           pinyin:'dōu',        category:'adverb',       subcategory:'scope' },
  // Phrases
  { chinese:'一点儿',english:'a little bit',        pinyin:'yìdiǎnr',    category:'phrase',       subcategory:'quantitative' },
  // Conjunctions
  { chinese:'和',    english:'and',                 pinyin:'hé',         category:'conjunction',  subcategory:'coordinating' },
  // Prepositions
  { chinese:'在',    english:'in, at',              pinyin:'zài',        category:'preposition',  subcategory:'locative' },
  // Particles
  { chinese:'的',    english:'possessive particle, of', pinyin:'de',     category:'particle',     subcategory:'structural' },
  { chinese:'了',    english:'completed action marker', pinyin:'le',     category:'particle',     subcategory:'aspectual' },
  { chinese:'吗',    english:'question particle yes/no',pinyin:'ma',     category:'particle',     subcategory:'interrogative' },
  { chinese:'呢',    english:'question particle contextual', pinyin:'ne',category:'particle',     subcategory:'interrogative' },
  // Interjections
  { chinese:'喂',    english:'hello on phone',      pinyin:'wèi',        category:'interjection', subcategory:'greeting' },
  // Nouns – location
  { chinese:'家',    english:'home, family',        pinyin:'jiā',        category:'noun',         subcategory:'location' },
  { chinese:'学校',  english:'school',              pinyin:'xuéxiào',    category:'noun',         subcategory:'location' },
  { chinese:'饭店',  english:'restaurant, hotel',   pinyin:'fàndiàn',    category:'noun',         subcategory:'location' },
  { chinese:'商店',  english:'store, shop',         pinyin:'shāngdiàn',  category:'noun',         subcategory:'location' },
  { chinese:'医院',  english:'hospital',            pinyin:'yīyuàn',     category:'noun',         subcategory:'location' },
  { chinese:'中国',  english:'China',               pinyin:'Zhōngguó',   category:'noun',         subcategory:'location' },
  { chinese:'北京',  english:'Beijing',             pinyin:'Běijīng',    category:'noun',         subcategory:'location' },
  // Nouns – direction
  { chinese:'上',    english:'up, above',           pinyin:'shàng',      category:'noun',         subcategory:'direction' },
  { chinese:'下',    english:'down, below',         pinyin:'xià',        category:'noun',         subcategory:'direction' },
  { chinese:'前面',  english:'front',               pinyin:'qiánmiàn',   category:'noun',         subcategory:'direction' },
  { chinese:'后面',  english:'behind',              pinyin:'hòumiàn',    category:'noun',         subcategory:'direction' },
  { chinese:'里',    english:'inside',              pinyin:'lǐ',         category:'noun',         subcategory:'direction' },
  // Nouns – time
  { chinese:'今天',  english:'today',               pinyin:'jīntiān',    category:'noun',         subcategory:'time' },
  { chinese:'明天',  english:'tomorrow',            pinyin:'míngtiān',   category:'noun',         subcategory:'time' },
  { chinese:'昨天',  english:'yesterday',           pinyin:'zuótiān',    category:'noun',         subcategory:'time' },
  { chinese:'上午',  english:'morning',             pinyin:'shàngwǔ',    category:'noun',         subcategory:'time' },
  { chinese:'中午',  english:'noon',                pinyin:'zhōngwǔ',    category:'noun',         subcategory:'time' },
  { chinese:'下午',  english:'afternoon',           pinyin:'xiàwǔ',      category:'noun',         subcategory:'time' },
  { chinese:'年',    english:'year',                pinyin:'nián',       category:'noun',         subcategory:'time' },
  { chinese:'月',    english:'month',               pinyin:'yuè',        category:'noun',         subcategory:'time' },
  { chinese:'号',    english:'number, date',        pinyin:'hào',        category:'noun',         subcategory:'time' },
  { chinese:'星期',  english:'week',                pinyin:'xīngqī',     category:'noun',         subcategory:'time' },
  { chinese:'点',    english:"o'clock",             pinyin:'diǎn',       category:'noun',         subcategory:'time' },
  { chinese:'分钟',  english:'minute',              pinyin:'fēnzhōng',   category:'noun',         subcategory:'time' },
  { chinese:'现在',  english:'now',                 pinyin:'xiànzài',    category:'noun',         subcategory:'time' },
  { chinese:'时候',  english:'time, moment',        pinyin:'shíhou',     category:'noun',         subcategory:'time' },
  // Nouns – people
  { chinese:'爸爸',  english:'father',              pinyin:'bàba',       category:'noun',         subcategory:'person' },
  { chinese:'妈妈',  english:'mother',              pinyin:'māma',       category:'noun',         subcategory:'person' },
  { chinese:'儿子',  english:'son',                 pinyin:'érzi',       category:'noun',         subcategory:'person' },
  { chinese:'女儿',  english:'daughter',            pinyin:"nǚ'ér",      category:'noun',         subcategory:'person' },
  { chinese:'老师',  english:'teacher',             pinyin:'lǎoshī',     category:'noun',         subcategory:'person' },
  { chinese:'学生',  english:'student',             pinyin:'xuéshēng',   category:'noun',         subcategory:'person' },
  { chinese:'同学',  english:'classmate',           pinyin:'tóngxué',    category:'noun',         subcategory:'person' },
  { chinese:'朋友',  english:'friend',              pinyin:'péngyǒu',    category:'noun',         subcategory:'person' },
  { chinese:'医生',  english:'doctor',              pinyin:'yīshēng',    category:'noun',         subcategory:'person' },
  { chinese:'先生',  english:'Mr., sir',            pinyin:'xiānsheng',  category:'noun',         subcategory:'person' },
  { chinese:'小姐',  english:'Miss',                pinyin:'xiǎojiě',    category:'noun',         subcategory:'person' },
  { chinese:'人',    english:'person, people',      pinyin:'rén',        category:'noun',         subcategory:'person' },
  // Nouns – objects
  { chinese:'衣服',  english:'clothes',             pinyin:'yīfu',       category:'noun',         subcategory:'object' },
  { chinese:'水',    english:'water',               pinyin:'shuǐ',       category:'noun',         subcategory:'object' },
  { chinese:'菜',    english:'dish, vegetable',     pinyin:'cài',        category:'noun',         subcategory:'object' },
  { chinese:'米饭',  english:'cooked rice',         pinyin:'mǐfàn',      category:'noun',         subcategory:'object' },
  { chinese:'水果',  english:'fruit',               pinyin:'shuǐguǒ',    category:'noun',         subcategory:'object' },
  { chinese:'苹果',  english:'apple',               pinyin:'píngguǒ',    category:'noun',         subcategory:'object' },
  { chinese:'茶',    english:'tea',                 pinyin:'chá',        category:'noun',         subcategory:'object' },
  { chinese:'杯子',  english:'cup, glass',          pinyin:'bēizi',      category:'noun',         subcategory:'object' },
  { chinese:'钱',    english:'money',               pinyin:'qián',       category:'noun',         subcategory:'object' },
  { chinese:'飞机',  english:'airplane',            pinyin:'fēijī',      category:'noun',         subcategory:'object' },
  { chinese:'出租车',english:'taxi',                pinyin:'chūzūchē',   category:'noun',         subcategory:'object' },
  { chinese:'电视',  english:'television',          pinyin:'diànshì',    category:'noun',         subcategory:'object' },
  { chinese:'电脑',  english:'computer',            pinyin:'diànnǎo',    category:'noun',         subcategory:'object' },
  { chinese:'书',    english:'book',                pinyin:'shū',        category:'noun',         subcategory:'object' },
  { chinese:'桌子',  english:'desk, table',         pinyin:'zhuōzi',     category:'noun',         subcategory:'object' },
  { chinese:'椅子',  english:'chair',               pinyin:'yǐzi',       category:'noun',         subcategory:'object' },
  { chinese:'东西',  english:'thing, stuff',        pinyin:'dōngxi',     category:'noun',         subcategory:'object' },
  // Nouns – abstract / nature / animals
  { chinese:'电影',  english:'movie',               pinyin:'diànyǐng',   category:'noun',         subcategory:'abstract' },
  { chinese:'天气',  english:'weather',             pinyin:'tiānqì',     category:'noun',         subcategory:'nature' },
  { chinese:'猫',    english:'cat',                 pinyin:'māo',        category:'noun',         subcategory:'animal' },
  { chinese:'狗',    english:'dog',                 pinyin:'gǒu',        category:'noun',         subcategory:'animal' },
  { chinese:'名字',  english:'name',                pinyin:'míngzi',     category:'noun',         subcategory:'abstract' },
  { chinese:'汉语',  english:'Mandarin Chinese',    pinyin:'Hànyǔ',      category:'noun',         subcategory:'abstract' },
  { chinese:'字',    english:'character, word',     pinyin:'zì',         category:'noun',         subcategory:'abstract' },
  // Expressions
  { chinese:'谢谢',  english:'thank you',           pinyin:'xièxie',     category:'expression',   subcategory:'conversational' },
  { chinese:'不客气',english:"you're welcome",      pinyin:'bú kèqi',    category:'expression',   subcategory:'conversational' },
  { chinese:'再见',  english:'goodbye',             pinyin:'zàijiàn',    category:'expression',   subcategory:'conversational' },
  { chinese:'对不起',english:'sorry',               pinyin:'duìbuqǐ',    category:'expression',   subcategory:'conversational' },
  { chinese:'没关系',english:"it doesn't matter",   pinyin:'méi guānxi', category:'expression',   subcategory:'conversational' },
  // Verbs – copula / existential
  { chinese:'是',    english:'to be, am, is, are',  pinyin:'shì',        category:'verb',         subcategory:'copula' },
  { chinese:'有',    english:'to have, to exist',   pinyin:'yǒu',        category:'verb',         subcategory:'existential' },
  // Verbs – perception / communication
  { chinese:'看',    english:'to look, to watch',   pinyin:'kàn',        category:'verb',         subcategory:'perception' },
  { chinese:'听',    english:'to listen',           pinyin:'tīng',       category:'verb',         subcategory:'perception' },
  { chinese:'说',    english:'to speak, to say',    pinyin:'shuō',       category:'verb',         subcategory:'communication' },
  { chinese:'读',    english:'to read',             pinyin:'dú',         category:'verb',         subcategory:'communication' },
  { chinese:'写',    english:'to write',            pinyin:'xiě',        category:'verb',         subcategory:'communication' },
  { chinese:'看见',  english:'to see, to catch sight of', pinyin:'kànjiàn', category:'verb',      subcategory:'perception' },
  { chinese:'叫',    english:'to call, to be named',pinyin:'jiào',       category:'verb',         subcategory:'communication' },
  // Verbs – movement
  { chinese:'来',    english:'to come',             pinyin:'lái',        category:'verb',         subcategory:'movement' },
  { chinese:'回',    english:'to return',           pinyin:'huí',        category:'verb',         subcategory:'movement' },
  { chinese:'去',    english:'to go',               pinyin:'qù',         category:'verb',         subcategory:'movement' },
  // Verbs – action
  { chinese:'请',    english:'please, to invite',   pinyin:'qǐng',       category:'verb',         subcategory:'action' },
  { chinese:'吃',    english:'to eat',              pinyin:'chī',        category:'verb',         subcategory:'action' },
  { chinese:'喝',    english:'to drink',            pinyin:'hē',         category:'verb',         subcategory:'action' },
  { chinese:'睡觉',  english:'to sleep',            pinyin:'shuìjiào',   category:'verb',         subcategory:'action' },
  { chinese:'打电话',english:'to make a phone call',pinyin:'dǎ diànhuà', category:'verb',         subcategory:'action' },
  { chinese:'做',    english:'to do, to make',      pinyin:'zuò',        category:'verb',         subcategory:'action' },
  { chinese:'买',    english:'to buy',              pinyin:'mǎi',        category:'verb',         subcategory:'action' },
  { chinese:'开',    english:'to open, to drive',   pinyin:'kāi',        category:'verb',         subcategory:'action' },
  { chinese:'坐',    english:'to sit, to take transport', pinyin:'zuò',  category:'verb',         subcategory:'action' },
  { chinese:'住',    english:'to live, to reside',  pinyin:'zhù',        category:'verb',         subcategory:'action' },
  { chinese:'学习',  english:'to study, to learn',  pinyin:'xuéxí',      category:'verb',         subcategory:'action' },
  { chinese:'工作',  english:'to work, job',        pinyin:'gōngzuò',    category:'verb',         subcategory:'action' },
  { chinese:'下雨',  english:'to rain',             pinyin:'xià yǔ',     category:'verb',         subcategory:'action' },
  // Verbs – mental / emotional
  { chinese:'爱',    english:'to love',             pinyin:'ài',         category:'verb',         subcategory:'mental' },
  { chinese:'喜欢',  english:'to like',             pinyin:'xǐhuan',     category:'verb',         subcategory:'mental' },
  { chinese:'想',    english:'to want, to think',   pinyin:'xiǎng',      category:'verb',         subcategory:'mental' },
  { chinese:'认识',  english:'to know, to recognize',pinyin:'rènshi',    category:'verb',         subcategory:'mental' },
  // Verbs – modal
  { chinese:'会',    english:'can, to know how to', pinyin:'huì',        category:'verb',         subcategory:'modal' },
  { chinese:'能',    english:'can, to be able to',  pinyin:'néng',       category:'verb',         subcategory:'modal' },
  // Adjectives – qualitative
  { chinese:'好',    english:'good, well',          pinyin:'hǎo',        category:'adjective',    subcategory:'qualitative' },
  { chinese:'大',    english:'big, large',          pinyin:'dà',         category:'adjective',    subcategory:'qualitative' },
  { chinese:'小',    english:'small, little',       pinyin:'xiǎo',       category:'adjective',    subcategory:'qualitative' },
  { chinese:'漂亮',  english:'beautiful, pretty',   pinyin:'piàoliang',  category:'adjective',    subcategory:'qualitative' },
  // Adjectives – quantitative
  { chinese:'多',    english:'many, much',          pinyin:'duō',        category:'adjective',    subcategory:'quantitative' },
  { chinese:'少',    english:'few, little',         pinyin:'shǎo',       category:'adjective',    subcategory:'quantitative' },
  // Adjectives – state
  { chinese:'冷',    english:'cold',                pinyin:'lěng',       category:'adjective',    subcategory:'temperature' },
  { chinese:'热',    english:'hot',                 pinyin:'rè',         category:'adjective',    subcategory:'temperature' },
  { chinese:'高兴',  english:'happy, glad',         pinyin:'gāoxìng',    category:'adjective',    subcategory:'emotion' },
];

/**
 * Generate the full card list from the word list.
 * Each word produces two cards: 'meaning' and 'pinyin'.
 */
const DECK = (function buildDeck() {
  const cards = [];
  HSK1_WORDS.forEach((word, idx) => {
    // Meaning card: see Chinese → type English
    cards.push({
      id:          `${idx}-meaning`,
      wordIndex:   idx,
      chinese:     word.chinese,
      english:     word.english,
      pinyin:      word.pinyin,
      cardType:    'meaning',
      category:    word.category,
      subcategory: word.subcategory,
      hskLevel:    1,
    });
    // Pinyin card: see Chinese → type Pinyin
    cards.push({
      id:          `${idx}-pinyin`,
      wordIndex:   idx,
      chinese:     word.chinese,
      english:     word.english,
      pinyin:      word.pinyin,
      cardType:    'pinyin',
      category:    word.category,
      subcategory: word.subcategory,
      hskLevel:    1,
    });
  });
  return cards;
})();

/** Unique BKT component keys in the deck (category:cardType) */
const BKT_COMPONENTS = [...new Set(DECK.map(c => `${c.category}:${c.cardType}`))];

/** All unique primary categories */
const CATEGORIES = [...new Set(DECK.map(c => c.category))];
