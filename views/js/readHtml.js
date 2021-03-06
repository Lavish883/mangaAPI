var longStrip = !window.location.href.includes("-page-")
var currentlyOnPage = window.location.href.split(`-page-`)[1]


//add to recentread localstorage array
function addToRecentRead(chapterLink) {
    // get previous stuff
    var recentRead = JSON.parse(window.localStorage.getItem("recentRead"));
    if (recentRead == null || recentRead.length == 0 || recentRead == undefined) {
        recentRead = [];
        console.log('made it an arry')
    }
    // add to localstorage
    if (!checkIfItRead(chapterLink, recentRead)) {
        recentRead.push(chapterLink)
        window.localStorage.setItem("recentRead", JSON.stringify(recentRead));
        console.log('added')
    }
}
// check if this chapter has been read or not
function checkIfItRead(chapterLink, recentRead) {
    console.log(recentRead)
    for (var i = 0; i < recentRead.length; i++) {
        if (chapterLink == recentRead[i]) {
            return true;
        }
    }

    return false;
}
// check if manga is bookmarked or not
function checkIfBookmarked() {
    var bookMarks = JSON.parse(window.localStorage.getItem('bookmarks'));
    if (bookMarks == null) {
        bookMarks = [];
    }
    for (var i = 0; i < bookMarks.length; i++) {
        let manga = bookMarks[i];
        if (manga.seriesName == currentChapter.seriesName && manga.indexName == currentChapter.indexName) {
            return true
        }
    }
    return false
}
// change the staus of bookmark that is displated to the user
function changeBookMarkStatus(obj) {
    if (checkIfBookmarked()) {
        obj.children[0].classList.remove('fa-thumbtack');
        obj.children[0].classList.add('fa-eraser');
        obj.children[1].innerText = 'Bookmarked'
    } else {
        obj.children[0].classList.add('fa-thumbtack');
        obj.children[0].classList.remove('fa-eraser');
        obj.children[1].innerText = 'Bookmark'
    }
}
// bookmark and change the user webpage
function bookMark(obj) {
    var bookMarks = JSON.parse(window.localStorage.getItem('bookmarks'));
    var bookMarked = checkIfBookmarked()

    if (bookMarks == null) {
        bookMarks = [];
    }

    if (!bookMarked) {
        bookMarks.push({ 'seriesName': currentChapter.seriesName, 'indexName': currentChapter.indexName });
    } else {
        // remove the manga
        for (var i = bookMarks.length - 1; i >= 0; i--) {
            let manga = bookMarks[i];
            if (manga.seriesName == currentChapter.seriesName && manga.indexName == currentChapter.indexName) {
                bookMarks.splice(i, 1);
                console.log('removed')
                break;
            }
        }

    }
    window.localStorage.setItem('bookmarks', JSON.stringify(bookMarks));
    changeBookMarkStatus(obj)
}

function changeReadingStyle(obj, userClicked = true) {
    // check if either longstrip is actived or not
    if (longStrip == true) {
        obj.children[0].classList.remove("fa-arrows-alt-v");
        obj.children[0].classList.add("fa-columns");
        obj.children[1].innerText = "Single Page";
        currentlyOnPage = 'F';
        showImages(currentlyOnPage);
        document.getElementById('imgs').children[0].scrollIntoView();
        ;
    } else {
        obj.children[0].classList.add("fa-arrows-alt-v");
        obj.children[0].classList.remove("fa-columns");
        obj.children[1].innerText = "Long Strip"
        if (userClicked) {
            currentlyOnPage = 1;
            showImages(currentlyOnPage);
        }
    }
}
// show Images in single Page mode
function showImages(page) {
    // make all the pages display:none;
    var allImgs = document.getElementById('imgs');
    for (var i = 0; i < allImgs.childElementCount; i++) {
        if (!isNaN(page)) {
            allImgs.children[i].style.display = 'none';
        } else {
            console.log('block')
            allImgs.children[i].style.display = 'block';
        }
    }
    if (!isNaN(page)) {
        allImgs.children[page - 1].style.display = 'block';
        document.getElementById("pageNumber").innerText = 'Page ' + page
        window.scrollTo(0, 0);
    }
}

// listen to page clicks either it is left or right

function movePage(event) {
    console.log(event);
    if (event.type == 'click') {
        // varibles to check of the page clikc is lef tor right
        let pWidth = $(this).innerWidth();
        let pOffset = $(this).offset();
        var x = event.pageX - pOffset.left;

        if (pWidth / 2 > x) {
            currentlyOnPage--; // Left side of page is clicked
        } else {
            currentlyOnPage++; // Right Side of the page is clicked
        }
    } else {
        if (event.key == "ArrowLeft") { // Left Side of the page is clicked
            currentlyOnPage--;
        } else if (event.key == "ArrowRight") { // Right side of page is clicked
            currentlyOnPage++;
        }
    }

    if (currentlyOnPage > currentChapter.Page) {
        moveChapter('next')
        return;
    } else if (currentlyOnPage < 1) {
        moveChapter('prev')
        return;
    }


    if (longStrip == false) {
        showImages(currentlyOnPage)
    } else {
        var ScrollToPlease = window.pageYOffset + 700 || document.documentElement.scrollTop + 700
        window.scroll({
            top: ScrollToPlease,
            left: 0,
            behavior: 'smooth'
        })
    }
}

// go to the next chapter
// direction meaning either next chapter or previous chapter
function moveChapter(direction) {
    var currentChapterIndx = chapters.findIndex(elem => elem.Chapter == currentChapter.Chapter)
    var chapterToLookIndx = direction == 'next' ? currentChapterIndx - 1 : currentChapterIndx + 1;

    for (var i = 0; i < chapters.length; i++) {

        if (chapterToLookIndx < 0) {
            break;
        }

        if (chapters[i].Chapter == chapters[chapterToLookIndx].Chapter) {
            if (longStrip) {
                window.location.href = window.location.origin + '/manga/read/' + chapters[i].ChapterLink;
            } else {
                let chapterPageToStart = direction == 'next' ? '-page-1' : '-page-' + chapters[i].Page;
                window.location.href = window.location.origin + '/manga/read/' + chapters[i].ChapterLink + chapterPageToStart;
            }
            return;
        }
    }
    alert('No more next chapters. You are all caught up')
}
// updtae url accordingly


// event listeners 
// listen for page clicks
document.getElementById('imgs').addEventListener("click", movePage);
document.body.addEventListener('keyup', movePage);


// function calls
changeReadingStyle(document.getElementById("readingStyle"), false)
showImages(parseInt(currentlyOnPage))
setTimeout(addToRecentRead(window.location.pathname.replace(`/manga/read/`, '').split(`-page-`)[0]), 1500)
document.body.addEventListener('click', checkIfBookmarked)
