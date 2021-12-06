/*
 * Hearthstone Deck
 * Created by Shuqiao Zhang in 2019.
 * https://zhangshuqiao.org
 */

/*
 * This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 */

import fs from "fs";
// const fs = require("fs");
const cardsJSON = JSON.parse(fs.readFileSync("./cards.collectible.json"));
const cards = [];
for (const card of cardsJSON) {
	if (card.dbfId) {
		cards[card.dbfId] = card;
	}
}

import core from "./core.js";

import MiServer from "mimi-server";
import path from "path";
// import { fileURLToPath } from "url";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { app } = new MiServer({
	port: process.env.PORT || 8080,
	static: path.join(__dirname, "public")
});

import nunjucks from "nunjucks";

// https://github.com/EssenceOfChaos/express-nunjucks
app.set("view engine", "njk");
nunjucks.configure("templates", {
	autoescape: false,
	express: app
});

app.get("/", (req, res) => {
	const code = req.query.code || "AAEBAR8engGoAvYCtQPHA4cEyQTyBa4GxQjbCf4Mx64CmPACoIADp4IDm4UDoIUD9YkD5pYD+ZYDtpwDnp0D/KMD5KQDn6UDoqUDpqUDhKcDn7cDAAA=",
		name = req.query.name || "炉石传说卡组",
		lang = req.query.lang || "zhCN",
		lazy = req.query.lazy || "auto";
	const deckstring = code.replace(/\s/g, "+");
	const data = core(cards, deckstring);
	if (typeof data === "string") {
		res.render("error", { data });
	} else {
		res.render("layout", Object.assign({
			deckstring, name, lang, lazy
		}, data));
	}
});

/**
 * [description] - 跟路由
 */
// 当一个get请求 http://localhost:8080/getHotNews时，就会后面的async函数
app.get('/getHotNews', async (req, res) => {
	res.send(hotNews);
});

// 引入所需要的第三方包
import request from 'superagent'

let hotNews = [];                                // 热点新闻

/**
 * index.js
 * [description] - 使用superagent.get()方法来访问百度新闻首页
 */
request.get('http://news.baidu.com/').end((err, res) => {
	if (err) {
		// 如果访问失败或者出错，会这行这里
		console.log(`热点新闻抓取失败 - ${err}`)
	} else {
		// 访问成功，请求http://news.baidu.com/页面所返回的数据会包含在res
		// 抓取热点新闻数据
		hotNews = getHotNews(res)
	}
});

/**
 * index.js
 * [description] - 抓取热点新闻页面
 */
// 引入所需要的第三方包
import cheerio from 'cheerio'

let getHotNews = (res) => {
	let hotNews = [];
	// 访问成功，请求http://news.baidu.com/页面所返回的数据会包含在res.text中。

	/* 使用cheerio模块的cherrio.load()方法，将HTMLdocument作为参数传入函数
       以后就可以使用类似jQuery的$(selectior)的方式来获取页面元素
     */
	let $ = cheerio.load(res.text);

	// 找到目标数据所在的页面元素，获取数据
	$('div#pane-news ul li a').each((idx, ele) => {
		// cherrio中$('selector').each()用来遍历所有匹配到的DOM元素
		// 参数idx是当前遍历的元素的索引，ele就是当前便利的DOM元素
		let news = {
			title: $(ele).text(),        // 获取新闻标题
			href: $(ele).attr('href')    // 获取新闻网页链接
		};
		hotNews.push(news)              // 存入最终结果数组
	});
	return hotNews
};
import yasuo from './test.js';
app.get('/getCardList', (req, res) => {
	const deckId = req.query.deckId || "IWlkkMkpXmr57U7v4Nsrqc";
	//拼接数组
	let base64 = yasuo(deckId).then(function (data) {
		console.log("### "+data.name+"\n"+data.base64);
		const code = data.base64,
			name = req.query.name || data.name,
			lang = req.query.lang || "zhCN",
			lazy = req.query.lazy || "auto";
		const deckstring = code.replace(/\s/g, "+");
		const result = core(cards, deckstring);
		if (typeof result === "string") {
			res.render("error", { result });
		} else {
			res.render("layout", Object.assign({
				deckstring, name, lang, lazy, data
			}, result));
		}
	});
	// console.log("base64:" + base64);
});
