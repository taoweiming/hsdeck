import request from 'superagent'
require('superagent-proxy')(request);
import cheerio from 'cheerio'

let synchronous_get = function (url) {
    return new Promise(function (resolve, reject) {
        request.get(url)
            .set({ 
				'User-Agent': "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:96.0) Gecko/20100101 Firefox/96.0" ,
				'accept-language': "zh-CN,zh;q=0.9,en;q=0.8" ,
                'Cookie': "cf_clearance=Bj_Dwmayia.PDvymaStr5iVTn7VfJLWsS.dwi8d3RGQ-1643335458-0-250; _ga=GA1.2.815142619.1643256194; _gid=GA1.2.871043423.1643256194; __qca=P0-775193929-1643256403344; __gads=ID=44d222a3ec2b69b4-22336aa244d00096:T=1643269256:S=ALNI_MbxwEkgzUZac8iaGS2pNXzSBh2QpQ; cf_chl_2=123c6f4a6d8b7a4; cf_chl_prog=x12; _gat=1"
				})
            .proxy('http://127.0.0.1:1081')
            .end((error, res) => {
            if (error) {
                reject(error);
            } else {
                let cardInfo = getCardInfo(res)
                let data = [];
                data.push(0);
                data.push(1);
                data.push(parseInt(cardInfo[0].format))
                data.push(1);
                data.push(parseInt(cardInfo[0].hero))
                let cardsTemp = cardInfo[0].cards.split(",")
                let cardsArray = [[],[]];
                for (let i = 0; i < cardsTemp.length; i++) {
                    if (cardsArray[0].find(ele=>ele===cardsTemp[i])) {
                        cardsArray[0].pop();
                        cardsArray[1].push(cardsTemp[i]);
                    } else {
                        cardsArray[0].push(cardsTemp[i]);
                    }
                }
                for (const cardArray of cardsArray) {
                    data.push(cardArray.length)
                    for (const card of cardArray) {
                        data.push(parseInt(card))
                    }
                }
                data.push(0);
                let cards = [];
                for (let i = 0; i < data.length; i++) {
                    parse_varint(data[i], cards);
                }
                const result = Buffer.from(cards.join(""), "hex").toString("base64");
                console.log(result);
                resolve({
                    base64: result,
                    name: cardInfo[0].name
				});
            }
        });
    });
}

let getCardInfo = (res) => {
    let cards = [];
    // ?????????????????????http://news.baidu.com/????????????????????????????????????res.text??????

    /* ??????cheerio?????????cheerio.load()????????????HTMLDocument????????????????????????
       ???????????????????????????jQuery???$(selector)??????????????????????????????
     */
    let $ = cheerio.load(res.text);

    // ??????????????????????????????????????????????????????
    $('div#deck-info').each((idx, ele) => {
        // cheerio???$('selector').each()??????????????????????????????DOM??????
        // ??????idx????????????????????????????????????ele?????????????????????DOM??????
        let card = {
            cards: $(ele).attr("data-deck-cards"),        // ???
            hero: $(ele).attr('data-hero-id'),    // ??????
            format: $(ele).attr('data-deck-format'),    // ??????
			name: $(ele).attr('data-deck-name')    // ????????????
        };
        cards.push(card)              // ????????????????????????
    });
    return cards
};

export default function yasuo(deckId) {
    return synchronous_get('https://hsreplay.net/decks/' + deckId + '/#vodId=ui528KEamuT3SGiRqYmVnn');
}

yasuo("IWlkkMkpXmr57U7v4Nsrqc");

// async function doRequest(){
//     request.get('https://hsreplay.net/analytics/query/single_deck_mulligan_guide_v2/?TimeRange=CURRENT_PATCH&GameType=RANKED_STANDARD&LeagueRankRange=BRONZE_THROUGH_GOLD&Region=ALL&PlayerInitiative=ALL&deck_id=IWlkkMkpXmr57U7v4Nsrqc')
//         .set({ 'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36" })
//         .timeout({ response: 5000, deadline: 60000 })
//         .end(async(err, res) => {
//             // ????????????
//             const datas = res.body.series.data.ALL;
//             for (const data of datas) {
//                 console.log(data.dbf_id);
//             }
//         })
// }
// doRequest();
// const cards = [0, 1, 2, 1, 893, 2, 64720, 64900, 14, 59035,59223,59259,59585,60043,61971,63192,63216,63217,63677,64710,64899,69553,69735, 0];
// console.log(yasuo(cards));

// function strConvertToUnicode16(str) {
//     if (str === undefined) throw "???????????????";
//     let temp = str.toString().charCodeAt(0).toString(16);
//     const len = temp.length;
//     if (len < 4) {
//         for(let i = 0; i < 4-len; i++) {
//             temp = "0" + temp;     //????????????????????????0
//         }
//         temp = "\\u" + temp;
//     }
//     let dec = str.toString().charCodeAt(0);
//     if (dec >= 158) {
//         temp = str;
//     }else if (dec === 157) {
//         temp = String.fromCharCode(dec);
//     }else if (dec === 133) {
//         temp = String.fromCharCode(dec);
//     }else if (dec === 138) {
//         temp = String.fromCharCode(dec);
//     }else if (dec === 154) {
//         temp = String.fromCharCode(dec);
//     }else if (dec === 134) {
//         temp = String.fromCharCode(dec);
//     }else if (dec === 8) {
//         temp = String.fromCharCode(dec);
//     }else if (dec === 12) {
//         temp = String.fromCharCode(dec);
//     }
//     return temp;
// }

function parseXInt(c,x) {
    let value = parseInt(c).toString(2);
    const len = value.length;
    if (len < x * 7) {
        for (let i = 0; i < x * 7 - len; i++) {
            value = "0" + value;     //????????????????????????0
        }
    }
    let array = [];
    for (let i = 0; i < x; i++) {
        const int = parseInt((i === 0 ? "0" : "1") + value.substr(i * 7, 7), 2);
        // console.log(int);
        array.push(int);
    }
    //??????
    return array.reverse();
}

function to_hex(data) {
    let hex = parseInt(data).toString(16);
    if (hex.length === 1) {
        hex = "0" + hex;
    }
    return hex;
}

function parse_varint(data, cards) {
    let c = data;
    if (c < 128) {//??????
        cards.push(to_hex(c));
    }else if (c >= 128 && c < 16384) {//??????
        //??????2????????? ??????
        let result = parseXInt(c, 2);
        for (const num of result) {
            cards.push(to_hex(num));
        }
    }else if (c >= 16384) {//??????
        //??????3????????? ??????
        let result = parseXInt(c, 3);
        for (const num of result) {
            cards.push(to_hex(num));
        }
    }
    return cards;
}

// function yasuo(data) {
//     const cards = [];
//     let string = "";
//     for (let i = 0; i < data.length; i++) {
//         parse_varint(data[i], cards);
//     }
//     // console.log(cards);
//     // for (let i = 0; i < cards.length; i++) {
//         // console.log(cards[i]);
//         // string += strConvertToUnicode16(cards[i]);
//         // string += cards[i];
//         // console.log(string);
//     // }
//     // console.log(cards.join(""));
//     // for (let i = 0; i < string.length; i++) {
//     //     console.log(string.charCodeAt(i).toString(16));
//     // }
//     return Buffer.from(cards.join(""),"hex").toString("base64");
//     // return Buffer.from("\u0000\u0001\u0002\u0001????\u0004\u0002????\u0003\u0084??\u0003\u000e\u009b??\u0003????\u0003????\u0003????\u0003\u008b??\u0003\u0093??\u0003????\u0003????\u0003????\u0003????\u0003????\u0003\u0083??\u0003????\u0004????\u0004\u0000","binary").toString('base64');
// }