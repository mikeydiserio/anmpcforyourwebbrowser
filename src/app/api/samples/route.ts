export const revalidate = 0;

import { NextResponse } from "next/server";
import type { Sample } from "../../../types";

const samples: Sample[] =[
  {
		"albumName": "Color Him Father",
		"title": "Amen, brother",
		"artist": "The Winstons",
		"drummer": "Gregory Sylvester \"G. C.\" Coleman",
		"artistPicture": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/The_Winstons.png/250px-The_Winstons.png",
		"year": "1969",
		"albumArt": "http://ksassets.timeincuk.net/wp/uploads/sites/55/2015/11/WinstonsAmenGb091111-1.jpg",
		"sample": "./sounds/amenbreak.mp3",
    "description": "'Amen, Brother' is a brisk, instrumental soul track by The Winstons that became immortal thanks to a single drum solo: the six-second “Amen break.” Driven by a fast-paced groove with lively horns, the song exudes the upbeat energy of late-1960s funk and gospel, then drops into an explosive drum break that would echo across decades Recorded in 1969 as the B-side to the Grammy-winning single 'Color Him Father,' it went largely unnoticed at the time, and The Winstons never earned a cent in royalties from its afterlife.  Nevertheless, the raw power of Gregory Coleman's drumming became foundational to music history – that Amen break has been sampled in over 2,000 songs spanning. From N.W.A’s 1988 hardcore rap to UK drum and bass anthems, those thunderous beats made 'Amen, Brother' an unsuspecting cornerstone of hip-hop and electronic music.",
		id: "",
		originalTrack: ""
	},
  {
		"albumName": "Think (About It) (People 1972)*",
		"year": "1972",
		"title": "Think (About It)",
		"artist": "Lynn Collins",
		"drummer": "John \"Jabo\" Starks",
		"albumArt": "http://images.45cat.com/lyn-collins-think-about-it-1988.jpg",
		"description": "Think about it has four distinct 4-bar phrases that are often sampled in electronic music, with the most popular being the 'Yeah, Woo!' break, is a drum break that includes Bobby Byrd's (\"Yeah!\") and James Brown's (\"Woo!\") voices which has been repeatedly used in popular music, often in the form of a loop. The drum break was performed by John \"Jabo\" Starks. It originates from the 1972 Lyn Collins recording \"Think (About It)\", a song written and produced by Brown, and is one of the few other frequently used breaks contained in the recording.",
		"sample": "./sounds/think.mp3",
		id: "",
		originalTrack: ""
	},
  {
		"albumName": "",
		"year": "1969",
		"title": "N.T Part 1",
		"artist": "Kool and the Gang",
		"drummer": "George Brown",
		"albumArt": "https://albumArt.discogs.com/EhwCl_9i1ti2IWTO2P2mNyqnLIU=/fit-in/600x596/filters:strip_icc():format(jpeg):mode_rgb():quality(90)/discogs-images/R-560172-1181724994.jpeg.jpg",
		"description": "NT Description",
		"sample": "./sounds/ntbreak.mp3",
		id: "",
		originalTrack: ""
	},
  {
    "albumName": "The Popcorn (King 1969)",
    "title": "Soul Pride",
    "drummer": "Clyde Stubblefield",
    "year": "1969",
    "artist": "James Brown",
    "albumArt": "http://images.45cat.com/james-brown-soul-pride-part-1-king.jpg",
    "description": "Amen stuff",
    "sample": "./sounds/soulpride.mp3",
    "id": "",
    "originalTrack": ""
  },
  {
		"albumName": "",
		"artist": "The Incredible Bongo Band",
		"title": "Apache",
		"drummer": "Jim Gordon",
		"year": "1973",
		"albumArt": "https://thumbnailer.mixcloud.com/unsafe/300x300/extaudio/0/8/2/1/a70e-93bf-41b5-bf65-509af5b7034c",
		"description": "An instrumental tour de force built around relentless percussion, the Incredible Bongo Band’s 'Apache' takes a twangy surf-guitar melody and drenches it in funky breakbeats. Originally a cover of a 1960 Shadows tune, this 1973 recording was driven by producer Michael Viner’s directive to pack “a loooot of drums” into the mix& Session aces Jim Gordon (drums) and King Errisson (congas) answered that call, turning the track into a raucous percussion duel with an infectious, syncopated groove. The result was not only a crate-digger favorite but also a cultural phenomenon: Bronx DJ Kool Herc famously used 'Apache' as a party anthem, helping to codify hip-hop’s breakbeat DJing culture. Its drum break – among the funkiest and most recognizable ever – became one of the most sampled in history, earning 'Apache' a reputation as the “National Anthem of hip-hop” and a cornerstone of breakbeat-driven music",
		"sample": "./sounds/apache.mp3",
		"artistPicture": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/The_Winstons.png/250px-The_Winstons.png",
		id: "",
		originalTrack: ""
	},
  {
		"albumName": "Aladdin",
		"title": "Life could",
		"artist": "Rotary Connection",
		"year": "1968",
		"albumArt": "https://www.sidneybarnes.net/images/records/rotary01.jpg",
		"description": "Life could stuff",
		"sample": "./sounds/lifecould.mp3",
		"drummer": "",
		id: "",
		originalTrack: ""
	},
  {
		"albumName": "",
		"title": "The Funky Drummer",
		"artist": "James Brown",
		"year": "1969",
		"drummer": "Clyde Stubblefield",
		"artistPicture": "https://i2.wp.com/newsflash.bigshotmag.com/wp-content/uploads/2017/02/Clyde-Stubblefield-Funky-Drummer.jpg?resize=630%2C420",
		"albumArt": "http://images.45cat.com/james-brown-funky-drummer-part-1-king.jpg",
		"description": "'Funky Drummer' is a laid-back yet irresistibly groovy jam that finds James Brown and his band locked in a deep funk pocket, peppered with Brown’s soulful shouts and Maceo Parker’s sax riffs. The feel is relaxed but charged with rhythm, anchored by Clyde Stubblefield’s famous steady hi-hat and syncopated snare pattern. Midway through the track, recorded in November 1969 at Cincinnati’s King Studios, Brown famously calls out, “Give the drummer some,” cueing Stubblefield’s 20-second solo break – a crisp, in-the-pocket drum groove that Brown punctuates with playful grunts and his iconic “Ain’t it funky?” exclamation. That improvised eight-bar break would become perhaps the most sampled beat in hip-hop history, echoing through countless songs (it’s been called the most sampled drum break) and cementing 'Funky Drummer' as a cornerstone of modern music production.",
		id: "",
		originalTrack: "",
		sample: ""
	},
  {
		"albumName": "",
		"title": "Synthetic Substitution",
		"artist": "Melvin Bliss",
		"drummer": "",
		"year": "1969",
		"artistPicture": "https://i2.wp.com/newsflash.bigshotmag.com/wp-content/uploads/2017/02/Clyde-Stubblefield-Funky-Drummer.jpg?resize=630%2C420",
		"albumArt": "http://images.45cat.com/melvin-bliss-reward-1973.jpg",
		"description": "The Funky Drummer is a song recorded by James Brown and his band in 1969. The recording's drum break, a propulsive beat improvised by Clyde Stubblefield, is one of the most frequently sampled rhythmic breaks in hip hop and popular music.",
		"sample": "./sounds/melvinbliss.mp3",
		id: "",
		originalTrack: ""
	},
  {
    "albumName": "On TV (Hot Records 1975)",
    "title": "Sesame Street",
    "artist": "Blowfly",
    "year": "1975",
    "drummer": "",
    "artistPicture": "https://i2.wp.com/newsflash.bigshotmag.com/wp-content/uploads/2017/02/Clyde-Stubblefield-Funky-Drummer.jpg?resize=630%2C420",
    "albumArt": "http://images.45cat.com/james-brown-funky-drummer-part-1-king.jpg",
    "description": "The Funky Drummer is a song recorded by James Brown and his band in 1969. The recording's drum break, a propulsive beat improvised by Clyde Stubblefield, is one of the most frequently sampled rhythmic breaks in hip hop and popular music.",
    "sample": "./sounds/sesame.mp3",
    "id": "",
    "originalTrack": ""
  },
	{
		"title": "Impeach the President",
		"artist": "The Honey Drippers",
		"year": "1973",
		"description": "'Impeach the President' grooves with a laid-back, syncopated funk rhythm that belies its fiery political message – a call to remove President Nixon, delivered in a catchy, sing-along chorus over fat bass and sunny horns. The track was recorded in 1973 by a band of teenage musicians in a Jamaica, Queens basement under the guidance of soul singer Roy C. Hammond. Its crisp opening drum break – drilled into shape by Hammond’s insistence on perfection – became legendary: only about 100 copies of the 45rpm single were originally pressed on Roy C’s Alaga label after major labels balked at its controversial title. Despite this humble start, savvy Bronx DJs like Kool Herc turned 'Impeach the President' into a secret weapon, and by the late 1980s its drum pattern had been sampled on hundreds of recordings, securing its status as one of hip-hop’s fundamental breakbeats.",
		id: "",
		albumName: "",
		albumArt: "",
		drummer: "",
		originalTrack: "",
		sample: ""
	},

  // Add the remaining cleaned-up entries here...
]


export async function GET() {
  return NextResponse.json({ samples });
}
