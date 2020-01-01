const http = require('http');
const fs = require('fs');
const mustache = require('mustache');

const hostname = '127.0.0.1';
const port = 1435;
const PAGE_SIZE = 650; // characters per page

const TOC = require('./toc.js');
var FILES = {};

const server = http.createServer((req, res) => {
    res.send = (data, statusCode) => {
        res.statusCode = statusCode || 200;
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    };

    res.redirect = (url) => {
        res.statusCode = 302;
        res.setHeader('Location', url);
        res.end();
    };

    let cookieList = req.headers['cookie'] || '';
    req.cookies = {};
    cookieList.split('; ').map(x => {
        let [name, value] = x.split('=');
        req.cookies[name] = value;
    });

    let route = req.url.split('/').filter(x => x);

    if (route.length == 0) {
        if (req.cookies.lastVisited) {
            return res.redirect(req.cookies.lastVisited);
        } else {
            return renderPage(res, 'bofm', '1-ne', '1');
        }
    }

    if (route[0] == 'toc') {
        return renderToc(res, route[1], route[2]);
    }

    return renderPage(
        res,
        route[0], // work
        route[1], // book
        route[2], // chapter
        route[3], // verse
        route[4]  // page
    );
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
});

function renderToc(res, work, book)
{
    try {
        book = book || '1-ne';
        var bookData = TOC[work].books[book];
    } catch (e)
    {
        console.log(e);
        return res.send('Not found', 404);
    }

    let tocView = readFile('./views/toc.html')

    var books = Object.values(TOC[work].books)
        .map(x => ({...x, link: (x.chapters == 1) ? 
            `/${work}/${x.abbr}/1` : `/toc/${work}/${x.abbr}`}));
    var chapters = [...Array(TOC[work].books[book].chapters).keys()]
        .map(x => ({chapter: x+1, book}));

    res.send(mustache.render(tocView, {
        work,
        books,
        chapters,
    }));
}

function renderPage(res, work, book, chapter, verse, page)
{
    if (!TOC[work] || !TOC[work].books[book])
        return res.send('Not found', 404);

    chapter = parseInt(chapter);
    if (chapter < 1 || chapter > TOC[work].books[book].chapters)
        return res.send('Not found', 404);

    let [pages, versePages] = getChapterPages(work, book, chapter, PAGE_SIZE);

    if (verse == 'page') {
        page = Math.max(1, Math.min(parseInt(page), pages.length));
    } else {
        page = versePages[verse] || 1;
    }

    let [nextWork, nextBook, nextChapter, nextPage] = getNext(
        work,
        book,
        chapter,
        page,
        PAGE_SIZE
    );
    let [prevWork, prevBook, prevChapter, prevPage] = getPrev(
        work,
        book,
        chapter,
        page,
        PAGE_SIZE
    );

    let chapterView = readFile('./views/chapter.html');

    var nextLink = `/${work}/${nextBook}/${nextChapter}/page/${nextPage}`;
    var prevLink = `/${work}/${prevBook}/${prevChapter}/page/${prevPage}`;

    // This is done on the front end
    // res.setHeader('Set-Cookie', 
    //    `lastVisited=/${work}/${book}/${chapter}/page/${page}; Max-Age=${60*60*24*365}; Path=/`);

    res.send(mustache.render(chapterView, {
        content: pages[page-1], 
        bookName: TOC[work].books[book].name,
        work,
        book,
        chapter,
        nextLink,
        prevLink,
    }));
}

function getNext(work, book, chapter, page, pageSize) {
    let [pages, versePages] = getChapterPages(work, book, chapter, pageSize);

    if (page < pages.length)
        return [work, book, chapter, page+1];

    if (chapter < TOC[work].books[book].chapters)
        return [work, book, chapter+1, 1];

    var books = Object.keys(TOC[work].books);
    var bookIndex = books.indexOf(book)+1;
    if (bookIndex < books.length)
        return [work, books[bookIndex], 1, 1];
 
    // Restart the work
    return [work, books[0], 1, 1];
}

function getPrev(work, book, chapter, page, pageSize) {
    let [pages, versePages] = getChapterPages(work, book, chapter, pageSize);

    if (page > 1)
        return [work, book, chapter, page-1];

    if (chapter > 1) {
        [pages, versePages] = getChapterPages(work, book, chapter-1, pageSize);
        return [work, book, chapter-1, pages.length];
    }

    var books = Object.keys(TOC[work].books);
    var bookIndex = books.indexOf(book)-1;
    if (bookIndex >= 0) {
        book = books[bookIndex];
        chapter = TOC[work].books[book].chapters;
        [pages, versePages] = getChapterPages(work, book, chapter, pageSize);
        return [work, book, chapter, pages.length];
    }
 
    // End of the work
    book = books[books.length-1];
    chapter = TOC[work].books[book].chapters;
    [pages, versePages] = getChapterPages(work, book, chapter, pageSize);
    return [work, book, chapter, pages.length];
}

function getChapterVerses(work, book, chapter)
{
    return readFile(`./${work}/${book}/${book}${chapter}`, true).verses;
}

function getChapterPages(work, book, chapter, pageSize) {
    let chapterVerses = getChapterVerses(work, book, chapter);
    let pages = [];
    let versePages = {};

    let currentPage = '';
    let currentLen = 0;
    for (let i = 0; i < chapterVerses.length; i++) {
        let verse = chapterVerses[i];

        currentPage += ` <span style="color: #aaa">${i+1}</span> `;
        versePages[(i+1).toString()] = pages.length + 1; // Pages are 1-indexed

        if (currentLen + verse.length >= pageSize) {
            let cutoffIndex = (verse.indexOf(' ', pageSize - currentLen) + 1) || verse.length;

            currentPage += verse.substring(0, cutoffIndex);
            pages.push(currentPage);

            currentPage = verse.substring(cutoffIndex);
            currentLen = currentPage.length;
        } else {
            currentPage += verse;
            currentLen += verse.length;
        }
    }
    pages.push(currentPage);

    return [pages, versePages];
}

function readFile(filename, json)
{
    if (!FILES[filename]) {
        let data = fs.readFileSync(filename).toString();
        FILES[filename] = json ? JSON.parse(data) : data;
    }

    return FILES[filename];
}
