const cheerio = require('cheerio')
const moment = require('moment')
const fetch = require('node-fetch');

const breakCloudFlare = 'https://letstrypupagain.herokuapp.com/?url=https://mangasee123.com'

function calcDate(date){
  return moment(date).subtract(1, 'hour').fromNow();   
}

function calcChapter(Chapter){
  var ChapterNumber = parseInt(Chapter.slice(1, -1));
  var Odd = Chapter[Chapter.length - 1];
  if (Odd == 0) {
    return ChapterNumber;
  } else {
    return ChapterNumber + "." + Odd;
  }
}

function calcChapterUrl(ChapterString) {
  var Index = "";
  var IndexString = ChapterString.substring(0, 1);
  if (IndexString != 1) {
    Index = "-index-" + IndexString;
  }
  var Chapter = parseInt(ChapterString.slice(1, -1));
  var Odd = "";
  var OddString = ChapterString[ChapterString.length - 1];
  if (OddString != 0) {
    Odd = "." + OddString;
  }
  
  return "-chapter-" + Chapter + Odd + Index;
}

function scrapeLatestManga(page){
  let LatestChapterJSON = JSON.parse(page.split(`vm.LatestJSON = `)[1].split(`;`)[0]);
  
  for (i = 0; i < LatestChapterJSON.length; i++){
    let manga = LatestChapterJSON[i];
    manga.Date = calcDate(manga.Date);
    manga.ChapterLink = manga.IndexName +  calcChapterUrl(manga.Chapter);
    manga.Chapter = calcChapter(manga.Chapter);
  }
  
  return LatestChapterJSON;
}

function scrapeHotManga(page){
  // Arry with manga that contains manga 
  let HotUpdateJSON = JSON.parse(page.split(`vm.HotUpdateJSON = `)[1].split(`;`)[0]);
  
  for (i = 0; i < HotUpdateJSON.length; i++){
    let manga = HotUpdateJSON[i];
    manga.Date = calcDate(manga.Date);
    manga.ChapterLink = manga.IndexName +  calcChapterUrl(manga.Chapter);
    manga.Chapter = calcChapter(manga.Chapter);
  }
  
  return HotUpdateJSON;
}

function scrapeManga(page){
  const $ = cheerio.load(page)
  var mangaDetails = [];
  // list conatiner
  let mainUL = $(`ul.list-group , ul.list-group-flush`);
  
  let title =  $(mainUL).children("li").children("h1")
  
  
  mangaDetails.push({'title': title.html()});
  
  return $(`ul.list-group , ul.list-group-flush`).last().last().html();

  
}
async function getGenres(manga, headers) {
  let fetchManga = await fetch(breakCloudFlare + '/manga/' + manga, headers);
  let resp = await fetchManga.text();
  
  var allGenres = [];
  var aLinks = resp.split(`<span class="mlabel">Genre(s):</span>`)[1].split(`</i>`)[0].split(`"</a>`)[0];
  var aLinks2 = aLinks.split(`</a>`)
  
  // return only 2 manga 
  for (var i = aLinks2.length - 2; i > aLinks2.length - 4; i--){
    allGenres.push(aLinks2[i].split(`>`)[1])
  }

  return allGenres;
  
}

function genresComparer(listOfManga, genres){
  let FilteredResults = [];
  
   for (var i = 0; i < listOfManga.length; i++) {
    if (genres.every(item => listOfManga[i].g.includes(item))) {
      FilteredResults.push(listOfManga[i]);
    }
  }
  
  FilteredResults.sort(function (a, b) {
    return b.vm - a.vm;
  })

  if (FilteredResults.length > 10){
    FilteredResults.length = 10
  }
  
  return FilteredResults
}

async function getSimilarManga(genres){
  let link = breakCloudFlare + '/search/?sort=vm&desc=true&genre=' + genres.join(',')
  let fetchSearch = await fetch(link);
  let resp = await fetchSearch.text();
  // Directory which contains all the manga with genres and stuff
  var DirectoryBackup = JSON.parse(resp.split(`vm.Directory = `)[1].split(`;`).splice(0, 14).join(','));
  // Get all the managa that includes all three of those genres 
  let FilteredResults = genresComparer(DirectoryBackup, genres);
  
  if (FilteredResults.length !=0){
    return FilteredResults;
  }
  
  DirectoryBackup.sort(function (a, b) {
    return b.vm - a.vm;
  })
  
  DirectoryBackup.length = 10
  return DirectoryBackup
                               
}



module.exports = {scrapeHotManga, scrapeLatestManga, scrapeManga, getGenres, getSimilarManga}